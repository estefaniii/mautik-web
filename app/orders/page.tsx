"use client"

/*
  "Mis pedidos".

  ⚠️ Esta página leía los pedidos de `localStorage`, no de la base de datos.

  Eso quiere decir que una clienta que compraba de verdad —con PayPal, con su
  pedido guardado y su correo de confirmación— entraba acá y veía "No tienes
  pedidos aún". Y si compraba desde el teléfono y después miraba desde la
  computadora, tampoco. El `localStorage` era un resto del carrito de prueba
  de la plantilla, de cuando la compra no llegaba a ningún servidor.

  Ahora sale de `/api/orders`, que devuelve los pedidos de quien pide y trae
  el producto de cada línea (nombre, foto y categoría).
*/

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { ArrowRight, Box, Loader2, ShoppingBag } from "lucide-react"
import AuthGuard from "@/components/auth-guard"

const ESTADOS: Record<string, { texto: string; clase: string }> = {
  pending: { texto: "Pendiente de pago", clase: "bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200" },
  paid: { texto: "Pagado", clase: "bg-purple-100 text-purple-900 dark:bg-purple-400/15 dark:text-purple-100" },
  processing: { texto: "En preparación", clase: "bg-purple-100 text-purple-900 dark:bg-purple-400/15 dark:text-purple-100" },
  shipped: { texto: "Enviado", clase: "bg-sky-100 text-sky-900 dark:bg-sky-400/15 dark:text-sky-100" },
  delivered: { texto: "Entregado", clase: "bg-emerald-100 text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-100" },
  cancelled: { texto: "Cancelado", clase: "bg-rose-100 text-rose-900 dark:bg-rose-400/15 dark:text-rose-100" },
}

const dinero = (n: number | null | undefined) =>
  typeof n === "number" ? `$${n.toFixed(2)}` : "—"

export default function OrdersPage() {
  const { user } = useAuth()
  const [pedidos, setPedidos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!user) return
    setCargando(true)
    fetch("/api/orders", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setPedidos(Array.isArray(d) ? d : []))
      .catch(() => setPedidos([]))
      .finally(() => setCargando(false))
  }, [user])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-purple-50 py-10 dark:bg-white/5 sm:py-12">
        <div className="container mx-auto max-w-3xl px-4">
          <h1 className="font-display mb-2 text-center text-3xl font-bold text-purple-900 dark:text-purple-50">
            Mis pedidos
          </h1>
          <p className="mb-8 text-center text-gray-600 dark:text-purple-100/70">
            Todo lo que has comprado en Mautik.
          </p>

          {cargando ? (
            <div className="rounded-3xl border border-purple-100 bg-card p-12 text-center dark:border-white/10">
              <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-purple-700 dark:text-purple-300" />
              <p className="text-gray-600 dark:text-purple-100/70">Buscando tus pedidos…</p>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="rounded-3xl border border-purple-100 bg-card p-10 text-center dark:border-white/10 sm:p-14">
              <span className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-purple-100 dark:bg-white/10">
                <ShoppingBag className="h-9 w-9 text-purple-700 dark:text-purple-300" />
              </span>
              <h2 className="mb-2 text-xl font-semibold text-purple-900 dark:text-purple-50">
                Todavía no hay pedidos
              </h2>
              <p className="mx-auto mb-6 max-w-sm text-gray-600 dark:text-purple-100/70">
                Cuando hagas tu primera compra aparecerá acá, con su estado y lo que
                llevaste.
              </p>
              <Button asChild className="rounded-full bg-purple-700 px-7 hover:bg-purple-800">
                <Link href="/shop">
                  Ver la tienda <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {pedidos.map((p) => {
                const estado = ESTADOS[p.status] ?? {
                  texto: p.status,
                  clase: "bg-purple-100 text-purple-900 dark:bg-white/10 dark:text-purple-100",
                }
                return (
                  <article
                    key={p.id}
                    className="overflow-hidden rounded-3xl border border-purple-100 bg-card shadow-sm dark:border-white/10"
                  >
                    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 px-5 py-4 dark:border-white/10">
                      <div>
                        <p className="flex items-center gap-2 font-semibold text-purple-900 dark:text-purple-50">
                          <Box className="h-4 w-4" />
                          Pedido {String(p.id).slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-purple-100/70">
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString("es-PA", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${estado.clase}`}>
                          {estado.texto}
                        </span>
                        <span className="text-lg font-bold text-purple-900 dark:text-purple-50">
                          {dinero(p.totalAmount)}
                        </span>
                      </div>
                    </header>

                    <ul className="divide-y divide-purple-100 dark:divide-white/10">
                      {(p.items ?? []).map((it: any) => {
                        const prod = it.product
                        return (
                          <li key={it.id} className="flex items-center gap-4 px-5 py-4">
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-purple-50 dark:bg-white/5">
                              <Image
                                src={prod?.images?.[0] || "/placeholder.jpg"}
                                alt={prod?.name || "Producto"}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              {prod?.id ? (
                                <Link
                                  href={`/product/${prod.id}`}
                                  className="font-medium text-purple-900 hover:underline dark:text-purple-50"
                                >
                                  {prod.name}
                                </Link>
                              ) : (
                                <span className="font-medium text-purple-900 dark:text-purple-50">
                                  Producto no disponible
                                </span>
                              )}
                              <p className="text-sm text-gray-600 dark:text-purple-100/70">
                                {it.quantity} × {dinero(it.price)}
                              </p>
                            </div>
                            <span className="font-semibold text-purple-900 dark:text-purple-50">
                              {dinero(it.price * it.quantity)}
                            </span>
                          </li>
                        )
                      })}
                    </ul>

                    <footer className="border-t border-purple-100 px-5 py-3 text-right dark:border-white/10">
                      <Link
                        href={`/orders/${p.id}`}
                        className="text-sm font-medium text-purple-800 transition hover:underline dark:text-purple-200"
                      >
                        Ver el detalle
                      </Link>
                    </footer>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
