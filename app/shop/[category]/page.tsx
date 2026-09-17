import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { prisma } from "@/lib/db"
import { grafo, migasDePan } from "@/lib/seo/structured-data"
import type { Product } from "@/types/product"

/**
 * Página de categoría (/shop/crochet, /shop/pulseras, ...).
 *
 * Antes esto pedía los productos a su propia API por HTTP y armaba la URL a
 * mano: en desarrollo apuntaba a `localhost:3001` (el servidor corre en 3000,
 * así que la página salía vacía) y en producción dependía de
 * `NEXT_PUBLIC_SITE_URL`, la misma variable que el `.env` local deja en
 * localhost. Ahora consulta la base directamente: no hay URL que adivinar,
 * es una ida menos y funciona igual en los dos entornos.
 *
 * Además ahora sí tiene título y descripción propios. Son las páginas con más
 * potencial de búsqueda de la tienda ("peluches de crochet en Panamá",
 * "pulseras hechas a mano"), y todas compartían el título genérico del layout.
 */

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

/**
 * Las categorías reales del catálogo, con el texto de cada una.
 *
 * Sirven para tres cosas: rechazar con 404 cualquier categoría inventada (si
 * no, /shop/cualquier-cosa devolvía una página vacía indexable), poner el
 * nombre bien escrito en pantalla, y darle a cada página una descripción
 * distinta en vez de repetir la del sitio.
 */
const CATEGORIAS: Record<
  string,
  { titulo: string; tituloSeo: string; descripcion: string }
> = {
  crochet: {
    titulo: "Crochet",
    tituloSeo: "Crochet hecho a mano en Panamá",
    descripcion:
      "Peluches y figuras tejidas a crochet una por una: animalitos, personajes y muñecos. Hechos a mano en La Chorrera, Panamá.",
  },
  llaveros: {
    titulo: "Llaveros",
    tituloSeo: "Llaveros tejidos a mano en Panamá",
    descripcion:
      "Llaveros tejidos a mano, del tamaño justo para la mochila o las llaves. Se pueden pedir en los colores que quieras.",
  },
  pulseras: {
    titulo: "Pulseras",
    tituloSeo: "Pulseras hechas a mano en Panamá",
    descripcion:
      "Pulseras de hilo y de perlas armadas a mano: con iniciales, ojo turco, dijes o alambre bañado en oro. Cierre ajustable.",
  },
  collares: {
    titulo: "Collares",
    tituloSeo: "Collares hechos a mano en Panamá",
    descripcion:
      "Collares y chockers hechos a mano, con perlas, hilo o inicial dorada. El regalo personalizado más pedido de Mautik.",
  },
  anillos: {
    titulo: "Anillos",
    tituloSeo: "Anillos hechos a mano en Panamá",
    descripcion:
      "Anillos de perlas montados a mano, sencillos o con cuenta de diseño al centro. El detalle más económico del catálogo.",
  },
  aretes: {
    titulo: "Aretes",
    tituloSeo: "Aretes hechos a mano en Panamá",
    descripcion:
      "Aretes hechos a mano, incluidos los tipo piercing para segundos huecos. Ideales para armar tu propia combinación.",
  },
  otros: {
    titulo: "Otros",
    tituloSeo: "Tejidos y accesorios hechos a mano en Panamá",
    descripcion:
      "Piezas tejidas que no entran en ninguna otra categoría: vinchas, tops, bolsos y más, todo hecho a mano.",
  },
}

function categoriaDe(slug: string) {
  return CATEGORIAS[decodeURIComponent(slug).toLowerCase().trim()] ?? null
}

/** Trae la categoría desde la base. La comparación va sin distinguir
 *  mayúsculas porque en la base hay filas guardadas de las dos formas. */
async function traerProductos(slug: string): Promise<Product[]> {
  const nombre = decodeURIComponent(slug).toLowerCase().trim()

  try {
    const filas = await prisma.product.findMany({
      where: { category: { equals: nombre, mode: "insensitive" } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    })

    return filas.map((p): Product => {
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice ?? p.price,
        description: p.description,
        images: p.images?.length ? p.images : ["/placeholder.jpg"],
        category: p.category || "",
        stock: p.stock,
        featured: p.featured,
        isNew: p.isNew,
        discount: p.discount || 0,
        attributes: [],
        details: [],
        sku: p.sku,
      }
    })
  } catch (error) {
    // Neon se suspende por inactividad: si no responde, es mejor mostrar la
    // página vacía que tirar un 500 en la cara de la clienta.
    console.error("[categoría] la base no respondió:", error)
    return []
  }
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params
  const cat = categoriaDe(category)

  if (!cat) {
    return { title: "Categoría no encontrada", robots: { index: false, follow: true } }
  }

  const ruta = `/shop/${decodeURIComponent(category).toLowerCase().trim()}`

  return {
    // Título propio por categoría en vez de una plantilla: con plantilla
    // salía "Crochet hechos a mano" y "Otros hechos a mano".
    title: cat.tituloSeo,
    description: cat.descripcion,
    alternates: { canonical: ruta },
    openGraph: {
      title: `${cat.titulo} · Mautik`,
      description: cat.descripcion,
      url: ruta,
      type: "website",
      siteName: "Mautik",
      locale: "es_PA",
      images: [{ url: "/og-image.jpg", alt: `${cat.tituloSeo} · Mautik` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${cat.titulo} · Mautik`,
      description: cat.descripcion,
      images: ["/og-image.jpg"],
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params
  const cat = categoriaDe(category)

  // Una categoría que no existe es un 404 de verdad, no una página vacía.
  if (!cat) notFound()

  const slug = decodeURIComponent(category).toLowerCase().trim()
  const productos = await traerProductos(slug)

  const datos = grafo(
    migasDePan([
      { nombre: "Inicio", ruta: "/" },
      { nombre: "Tienda", ruta: "/shop" },
      { nombre: cat.titulo, ruta: `/shop/${slug}` },
    ])
  )

  return (
    <div className="min-h-screen bg-background py-12">
      <script
        type="application/ld+json"
        // Lo armamos nosotros a partir de la categoría, no viene del usuario.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datos) }}
      />

      <div className="container mx-auto px-4">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/shop">Tienda</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="font-medium text-purple-800 dark:text-purple-300">
                {cat.titulo}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl font-bold text-purple-900 dark:text-purple-100">
              {cat.titulo}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-purple-100/80">
              {cat.descripcion}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-purple-100/60">
              {productos.length}{" "}
              {productos.length === 1 ? "producto" : "productos"}
            </p>
          </div>

          <Button
              variant="outline"
              className="flex items-center gap-2 border-purple-800 text-purple-800 hover:bg-purple-100 dark:border-purple-400 dark:text-purple-200 dark:hover:bg-purple-900/40"
             asChild>
            <Link href="/shop">
              <ArrowLeft size={16} /> Volver a la Tienda
            </Link>
          </Button>
        </div>

        {productos.length === 0 ? (
          <div className="py-16 text-center text-gray-500 dark:text-purple-100/60">
            <p className="mb-4 text-lg">No hay productos en esta categoría por ahora.</p>
            <p className="text-sm text-gray-400 dark:text-purple-100/50">
              Escríbenos por Instagram y te avisamos cuando entren.
            </p>
          </div>
        ) : (
          // Mismo grid de dos columnas que la tienda, para que no cambie la
          // forma de las tarjetas al entrar a una categoría.
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {productos.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/*
  Las 7 categorías se generan de antemano y NADA más existe.

  Con solo `revalidate` puesto, la ruta era ISR con parámetro libre y el
  `notFound()` salía con status HTTP 200 (verificado en local y en producción:
  se veía la página de 404 pero la respuesta decía 200, así que Google la
  trataba como una página válida y vacía). Declarando los parámetros y
  cerrando la puerta con `dynamicParams = false`, cualquier otra categoría la
  rechaza el router con un 404 real, y de paso las 7 buenas quedan
  prerenderizadas: cargan sin tocar la base.
*/
export function generateStaticParams() {
  return Object.keys(CATEGORIAS).map((category) => ({ category }))
}

export const dynamicParams = false

// Los precios y el stock cambian; cinco minutos es suficiente y evita pegarle
// a la base en cada visita.
export const revalidate = 300
