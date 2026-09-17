import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  producto as productoJsonLd,
  migasDePan,
  grafo,
} from "@/lib/seo/structured-data";

/**
 * Metadata y datos estructurados por producto, del lado del SERVIDOR.
 *
 * Antes esto lo intentaba `components/seo/meta-tags.tsx` con `next/head`, que
 * es API del Pages Router y en el App Router simplemente no hace nada: todas
 * las fichas compartían el mismo <title> genérico y ninguna tenía schema de
 * Product. Verificado en producción: la ficha devolvía un solo bloque JSON-LD,
 * el global del layout.
 *
 * La página de producto es un componente cliente (usa estado y carga los datos
 * con fetch), así que no puede exportar `generateMetadata`. Este layout
 * servidor sí, y además deja el JSON-LD ya en el HTML inicial, que es lo que
 * Google prefiere.
 */

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

/** Trae solo lo que hace falta para el SEO. Si falla, no rompe la página. */
async function traerProducto(id: string) {
  try {
    return await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        images: true,
        category: true,
        sku: true,
        stock: true,
        discount: true,
      },
    });
  } catch {
    return null;
  }
}

const recorta = (s: string, n: number) =>
  s.length <= n ? s : `${s.slice(0, n - 1).trimEnd()}…`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await traerProducto(id);

  if (!p) {
    return {
      title: "Producto no encontrado",
      robots: { index: false, follow: true },
    };
  }

  const precio = p.discount ? p.price * (1 - p.discount / 100) : p.price;
  const imagen = p.images?.[0] || "/placeholder.jpg";
  const url = `/product/${p.id}`;

  return {
    title: p.name,
    description: recorta(p.description, 155),
    alternates: { canonical: url },
    openGraph: {
      title: `${p.name} · Mautik`,
      description: recorta(p.description, 155),
      url,
      type: "website",
      siteName: "Mautik",
      locale: "es_PA",
      images: [{ url: imagen, alt: p.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${p.name} · Mautik`,
      description: recorta(p.description, 155),
      images: [imagen],
    },
    other: {
      "product:price:amount": precio.toFixed(2),
      "product:price:currency": "USD",
      "product:availability": p.stock > 0 ? "in stock" : "out of stock",
    },
  };
}

export default async function ProductLayout({ params, children }: Props) {
  const { id } = await params;
  const p = await traerProducto(id);

  /*
    Un id que no existe tiene que ser un 404 DE VERDAD.

    Antes esto devolvía la página igual y el componente cliente mostraba
    "Producto no encontrado" en pantalla… con status HTTP 200. O sea que para
    Google era una página válida con contenido vacío, y para cualquier
    monitoreo, una página que funciona. El `noindex` del metadata tapaba lo
    peor, pero el status seguía mintiendo.

    `traerProducto` devuelve null también si la base no responde, así que
    distinguimos: si Neon está dormido no queremos tirar 404 sobre productos
    que sí existen.
  */
  if (!p) {
    const baseViva = await prisma.product
      .count()
      .then(() => true)
      .catch(() => false);
    if (baseViva) notFound();
    return <>{children}</>;
  }

  const precio = p.discount ? p.price * (1 - p.discount / 100) : p.price;
  const categoria = (p.category || "").toLowerCase();

  const datos = grafo(
    productoJsonLd({
      id: p.id,
      name: p.name,
      description: p.description,
      price: precio,
      images: p.images,
      category: p.category,
      sku: p.sku,
      stock: p.stock,
    }),
    migasDePan([
      { nombre: "Inicio", ruta: "/" },
      { nombre: "Tienda", ruta: "/shop" },
      ...(categoria
        ? [
            {
              nombre: categoria.charAt(0).toUpperCase() + categoria.slice(1),
              ruta: `/shop?category=${categoria}`,
            },
          ]
        : []),
      { nombre: p.name, ruta: `/product/${p.id}` },
    ])
  );

  return (
    <>
      <script
        type="application/ld+json"
        // El contenido lo armamos nosotros desde la base, no viene del usuario.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datos) }}
      />
      {children}
    </>
  );
}

// Los precios y el stock cambian, así que no cacheamos indefinidamente.
export const revalidate = 300;
