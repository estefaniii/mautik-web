"use client"

/*
  Detalle de un pedido.

  Leía los pedidos de `localStorage`, igual que la lista: con una compra real
  hecha con PayPal esta página SIEMPRE decía "Pedido no encontrado". Ahora
  busca el pedido en `/api/orders`, que devuelve solo los de quien pide.

  "Volver a pedir" añadía `item` tal cual al carrito, y en un OrderItem no hay
  ni nombre ni foto ni id de producto en la forma que espera el carrito: la
  pieza entraba sin nombre y sin imagen. Ahora se arma desde `item.product`.
*/

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, ShoppingCart } from "lucide-react"
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

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [pedido, setPedido] = useState<any | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!user) return
    fetch("/api/orders", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        const lista = Array.isArray(d) ? d : []
        setPedido(lista.find((o: any) => String(o.id) === String(params.id)) || null)
      })
      .catch(() => setPedido(null))
      .finally(() => setCargando(false))
  }, [user, params.id])

  const volverAPedir = () => {
    ;(pedido?.items ?? []).forEach((item: any) => {
      const prod = item.product
      if (!prod) return
      addToCart({
        id: prod.id,
        name: prod.name,
        price: item.price,
        images: prod.images ?? [],
        category: prod.category,
        quantity: item.quantity,
      } as any)
    })
    router.push("/cart")
  }

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-50 dark:bg-white/5">
        <Loader2 className="h-9 w-9 animate-spin text-purple-700 dark:text-purple-300" />
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-purple-50 px-4 dark:bg-white/5">
        <div className="max-w-md rounded-3xl border border-purple-100 bg-card p-10 text-center dark:border-white/10">
          <h1 className="mb-3 text-xl font-semibold text-purple-900 dark:text-purple-50">
            No encontramos ese pedido
          </h1>
          <p className="mb-6 text-gray-600 dark:text-purple-100/70">
            Puede que el enlace esté incompleto o que el pedido sea de otra cuenta.
          </p>
          <Button asChild className="rounded-full bg-purple-700 px-7 hover:bg-purple-800">
            <Link href="/orders">Ver mis pedidos</Link>
          </Button>
        </div>
      </div>
    )
  }

  const estado = ESTADOS[pedido.status] ?? {
    texto: pedido.status,
    clase: "bg-purple-100 text-purple-900 dark:bg-white/10 dark:text-purple-100",
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-purple-50 py-10 dark:bg-white/5 sm:py-12">
        <div className="container mx-auto max-w-3xl px-4">
          <Link
            href="/orders"
            className="mb-6 inline-flex items-center gap-2 text-sm text-purple-800 transition hover:underline dark:text-purple-200"
          >
            <ArrowLeft className="h-4 w-4" /> Mis pedidos
          </Link>

          <div className="overflow-hidden rounded-3xl border border-purple-100 bg-card shadow-sm dark:border-white/10">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 px-5 py-5 dark:border-white/10 sm:px-7">
              <div>
                <h1 className="font-display text-xl font-bold text-purple-900 dark:text-purple-50">
                  Pedido {String(pedido.id).slice(0, 8).toUpperCase()}
                </h1>
                <p className="text-sm text-gray-600 dark:text-purple-100/70">
                  {pedido.createdAt
                    ? new Date(pedido.createdAt).toLocaleDateString("es-PA", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${estado.clase}`}>
                {estado.texto}
              </span>
            </header>

            <ul className="divide-y divide-purple-100 dark:divide-white/10">
              {(pedido.items ?? []).map((it: any) => {
                const prod = it.product
                return (
                  <li key={it.id} className="flex items-center gap-4 px-5 py-4 sm:px-7">
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

            <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-purple-100 px-5 py-5 dark:border-white/10 sm:px-7">
              <span className="text-lg font-bold text-purple-900 dark:text-purple-50">
                Total {dinero(pedido.totalAmount)}
              </span>
              <Button
                onClick={volverAPedir}
                className="rounded-full bg-purple-700 px-6 hover:bg-purple-800"
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Volver a pedir
              </Button>
            </footer>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
