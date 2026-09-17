"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/image-upload";
import { ArrowLeft, ExternalLink, Trash2, Save, ImageIcon, AlertCircle, Pencil } from "lucide-react";
import EditorImagen from "@/components/editor-imagen";

/**
 * Editar producto.
 *
 * Qué estaba mal antes, además del diseño:
 *
 *  · **Guardar no funcionaba nunca.** La ruta `PUT /api/products/[id]` exigía
 *    `sku`, y este formulario no lo manda porque el SKU no se edita. Siempre
 *    respondía "El SKU es obligatorio". Arreglado del lado del servidor: si no
 *    viene, conserva el que ya tiene el producto.
 *  · **Decía "Cambios guardados correctamente" sin haber guardado nada.** El
 *    mensaje salía con `saving === false`, que es el estado inicial: apenas
 *    abrías la ficha ya te felicitaba.
 *  · La descripción era un `<input>` de una línea para textos de tres
 *    renglones, y la categoría un campo libre donde un tipeo la dejaba fuera
 *    de la tienda (el filtro compara contra siete valores fijos).
 */

const CATEGORIAS = [
  { valor: "crochet", texto: "Crochet" },
  { valor: "llaveros", texto: "Llaveros" },
  { valor: "pulseras", texto: "Pulseras" },
  { valor: "collares", texto: "Collares" },
  { valor: "anillos", texto: "Anillos" },
  { valor: "aretes", texto: "Aretes" },
  { valor: "otros", texto: "Otros" },
];

type Estado = {
  name: string; description: string; price: string; category: string;
  images: string[]; stock: string; discount: string;
  isNew: boolean; featured: boolean; sku?: string;
};

export default function EditProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<number | null>(null);
  const [arrastrando, setArrastrando] = useState<number | null>(null);
  const [product, setProduct] = useState<Estado>({
    name: "", description: "", price: "", category: "",
    images: [], stock: "", discount: "0", isNew: false, featured: false,
  });

  useEffect(() => {
    async function traer() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`, { credentials: "include" });
        const data = await res.json();
        const p = data?.product ?? data;
        if (p?.name) {
          setProduct({
            name: p.name ?? "",
            description: p.description ?? "",
            price: p.price?.toString() ?? "",
            category: (p.category ?? "").toLowerCase(),
            images: Array.isArray(p.images) ? p.images : [],
            stock: p.stock?.toString() ?? "",
            discount: p.discount?.toString() ?? "0",
            isNew: !!p.isNew,
            featured: !!p.featured,
            sku: p.sku,
          });
        }
      } catch {
        toast({ title: "Error", description: "No se pudo cargar el producto", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    if (id) traer();
  }, [id, toast]);

  const cambiar = (campo: keyof Estado, valor: any) => {
    setProduct((p) => ({ ...p, [campo]: valor }));
    setGuardado(false);
    setError(null);
  };

  const guardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...product,
          price: product.price === "" ? 0 : Number(product.price),
          stock: product.stock === "" ? 0 : Number(product.stock),
          discount: product.discount === "" ? 0 : Number(product.discount),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "No se pudo guardar.");
        toast({ title: "No se guardó", description: data?.error || "Revisa los campos.", variant: "destructive" });
        return;
      }
      setGuardado(true);
      toast({ title: "Producto actualizado", description: "Los cambios ya están en la tienda." });
    } catch (err: any) {
      setError("Error de conexión.");
      toast({ title: "Error de conexión", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-purple-100/60">Cargando producto…</p>
      </div>
    );
  }

  const Campo = ({ id: cid, label, children, ayuda }: any) => (
    <div>
      <label htmlFor={cid} className="mb-2 block text-sm font-medium text-purple-900 dark:text-purple-100">
        {label}
      </label>
      {children}
      {ayuda && <p className="mt-1.5 text-xs text-gray-500 dark:text-purple-100/50">{ayuda}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Button variant="ghost" className="-ml-3 mb-1 rounded-full" asChild>
              <Link href="/admin/products"><ArrowLeft className="mr-1.5 h-4 w-4" /> Productos</Link>
            </Button>
            <h1 className="font-display text-3xl font-bold text-purple-900 dark:text-purple-100">
              Editar producto
            </h1>
            {product.sku && (
              <p className="mt-1 font-mono text-xs text-gray-500 dark:text-purple-100/50">{product.sku}</p>
            )}
          </div>
          <Button variant="outline" className="rounded-full" asChild>
            <Link href={`/product/${id}`} target="_blank" rel="noopener noreferrer">
              Ver en la tienda <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-400/25 dark:bg-red-400/10 dark:text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={guardar} className="grid gap-6 lg:grid-cols-3">
          {/* ── Datos ─────────────────────────────────────────────── */}
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-3xl border border-purple-100 bg-card p-6 dark:border-white/10">
              <h2 className="mb-5 text-lg font-semibold text-purple-900 dark:text-purple-100">
                Información
              </h2>
              <div className="space-y-5">
                <Campo id="name" label="Nombre">
                  <Input id="name" value={product.name} required className="h-11 rounded-xl"
                    onChange={(e) => cambiar("name", e.target.value)} />
                </Campo>
                <Campo id="description" label="Descripción"
                  ayuda="Es lo que lee la clienta en la tarjeta y en la ficha. Mínimo 10 caracteres.">
                  <Textarea id="description" value={product.description} required rows={5}
                    className="min-h-[120px] rounded-2xl"
                    onChange={(e) => cambiar("description", e.target.value)} />
                </Campo>
                <Campo id="category" label="Categoría"
                  ayuda="Tiene que ser una de estas siete: la tienda filtra por este valor exacto.">
                  <select id="category" value={product.category} required
                    onChange={(e) => cambiar("category", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="" disabled>Elige una categoría</option>
                    {CATEGORIAS.map((c) => (
                      <option key={c.valor} value={c.valor}>{c.texto}</option>
                    ))}
                  </select>
                </Campo>
              </div>
            </section>

            <section className="rounded-3xl border border-purple-100 bg-card p-6 dark:border-white/10">
              <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Fotos</h2>
              <p className="mb-5 mt-1 text-sm text-gray-600 dark:text-purple-100/60">
                Arrastra una foto para cambiarla de lugar. La primera es la que se
                ve en la tienda.
              </p>
              {product.images.length === 0 ? (
                <div className="mb-4 flex flex-col items-center rounded-2xl bg-purple-50 py-10 text-center dark:bg-white/5">
                  <ImageIcon className="mb-2 h-8 w-8 text-purple-400" />
                  <p className="text-sm text-gray-600 dark:text-purple-100/70">
                    Sin fotos. Hace falta al menos una para guardar.
                  </p>
                </div>
              ) : (
                <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {product.images.map((img, idx) => (
                    <div
                      key={img + idx}
                      draggable
                      onDragStart={() => setArrastrando(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (arrastrando === null || arrastrando === idx) return;
                        const a = [...product.images];
                        const [movida] = a.splice(arrastrando, 1);
                        a.splice(idx, 0, movida);
                        cambiar("images", a);
                        setArrastrando(null);
                      }}
                      onDragEnd={() => setArrastrando(null)}
                      className={`group relative aspect-[3/4] cursor-grab overflow-hidden rounded-2xl bg-purple-50 transition-opacity active:cursor-grabbing dark:bg-white/5 ${
                        arrastrando === idx ? "opacity-40" : ""
                      }`}
                    >
                      <img src={img} alt={`Foto ${idx + 1}`} draggable={false} className="h-full w-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-purple-900/85 px-2 py-0.5 text-[10px] font-semibold text-white">
                          Principal
                        </span>
                      )}
                      {/*
                        Solo el lápiz. Eliminar vive dentro del editor: tener un
                        botón de borrar permanente sobre cada miniatura es fácil
                        de tocar sin querer, sobre todo en el celular.
                        El orden se cambia arrastrando la foto, no con flechas.
                      */}
                      <button type="button" aria-label={`Editar foto ${idx + 1}`}
                        onClick={() => setEditando(idx)}
                        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-purple-800 shadow-sm transition-transform hover:scale-105 dark:bg-black/70 dark:text-purple-200">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <ImageUpload onImageUpload={(url: string) => cambiar("images", [...product.images, url])} />
            </section>
          </div>

          {/* ── Precio, stock y visibilidad ───────────────────────── */}
          <div className="space-y-6">
            <section className="rounded-3xl border border-purple-100 bg-card p-6 dark:border-white/10">
              <h2 className="mb-5 text-lg font-semibold text-purple-900 dark:text-purple-100">
                Precio y stock
              </h2>
              <div className="space-y-5">
                <Campo id="price" label="Precio (USD)">
                  <Input id="price" type="number" min="0" step="0.01" required value={product.price}
                    className="h-11 rounded-xl" onChange={(e) => cambiar("price", e.target.value)} />
                </Campo>
                <Campo id="stock" label="Unidades disponibles">
                  <Input id="stock" type="number" min="0" required value={product.stock}
                    className="h-11 rounded-xl" onChange={(e) => cambiar("stock", e.target.value)} />
                </Campo>
                <Campo id="discount" label="Descuento (%)" ayuda="Dejalo en 0 si no hay rebaja.">
                  <Input id="discount" type="number" min="0" max="100" value={product.discount}
                    className="h-11 rounded-xl" onChange={(e) => cambiar("discount", e.target.value)} />
                </Campo>
              </div>
            </section>

            <section className="rounded-3xl border border-purple-100 bg-card p-6 dark:border-white/10">
              <h2 className="mb-4 text-lg font-semibold text-purple-900 dark:text-purple-100">
                En la tienda
              </h2>
              <div className="space-y-3">
                {[
                  { campo: "isNew" as const, texto: "Marcar como nuevo", detalle: "Le pone la etiqueta «Nuevo»." },
                  { campo: "featured" as const, texto: "Destacado", detalle: "Aparece primero en la portada." },
                ].map((o) => (
                  <label key={o.campo}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl bg-purple-50 p-3 transition-colors hover:bg-purple-100 dark:bg-white/5 dark:hover:bg-white/10">
                    <input type="checkbox" checked={!!product[o.campo]}
                      onChange={(e) => cambiar(o.campo, e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-purple-700" />
                    <span>
                      <span className="block text-sm font-medium text-purple-900 dark:text-purple-100">{o.texto}</span>
                      <span className="block text-xs text-gray-600 dark:text-purple-100/60">{o.detalle}</span>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <div className="sticky bottom-4 space-y-3 rounded-3xl border border-purple-100 bg-card p-4 shadow-[0_8px_30px_rgba(24,10,48,0.10)] dark:border-white/10">
              <Button type="submit" disabled={saving} className="h-12 w-full rounded-full text-base">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Guardando…" : "Guardar cambios"}
              </Button>
              {/* Este aviso solo sale DESPUÉS de un guardado real. */}
              {guardado && !saving && (
                <p className="text-center text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Cambios guardados ✓
                </p>
              )}
              <Button type="button" variant="ghost" className="w-full rounded-full"
                onClick={() => router.push("/admin/products")}>
                Volver sin guardar
              </Button>
            </div>
          </div>
        </form>
      </div>

      <EditorImagen
        src={editando !== null ? product.images[editando] : ""}
        abierto={editando !== null}
        onCerrar={() => setEditando(null)}
        onGuardado={(url) => {
          if (editando === null) return;
          const a = [...product.images];
          a[editando] = url;
          cambiar("images", a);
        }}
        onEliminar={() => {
          if (editando === null) return;
          cambiar("images", product.images.filter((_, i) => i !== editando));
        }}
      />
    </div>
  );
}
