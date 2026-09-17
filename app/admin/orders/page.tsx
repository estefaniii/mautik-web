"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Trash2,
} from "lucide-react"

/**
 * Pedidos del panel.
 *
 * Antes el admin solo listaba y editaba productos: los pedidos no se veían
 * desde ningún lado, así que no había forma de saber qué hay que enviar ni de
 * marcar nada como enviado. Esta pantalla es justamente eso, y nada más:
 * quién compró, qué, cuánto, y un botón para pasar el pedido al siguiente
 * estado.
 */

type Estado = "pending" | "paid" | "shipped" | "delivered" | "cancelled"

const ETIQUETAS: Record<Estado, { texto: string; clase: string; Icono: any }> = {
  pending:   { texto: "Sin pagar",  clase: "bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200", Icono: Clock },
  paid:      { texto: "Por enviar", clase: "bg-purple-100 text-purple-900 dark:bg-purple-400/15 dark:text-purple-200", Icono: Package },
  shipped:   { texto: "Enviado",    clase: "bg-sky-100 text-sky-900 dark:bg-sky-400/15 dark:text-sky-200", Icono: Truck },
  delivered: { texto: "Entregado",  clase: "bg-emerald-100 text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-200", Icono: CheckCircle2 },
  cancelled: { texto: "Cancelado",  clase: "bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-white/70", Icono: XCircle },
}

const FILTROS: Array<{ valor: string; texto: string }> = [
  { valor: "porEnviar", texto: "Por enviar" },
  { valor: "todos", texto: "Todos" },
  { valor: "paid", texto: "Pagados" },
  { valor: "shipped", texto: "Enviados" },
  { valor: "delivered", texto: "Entregados" },
  { valor: "pending", texto: "Sin pagar" },
  { valor: "cancelled", texto: "Cancelados" },
]

const money = (n: number | null | undefined) => `$${(n ?? 0).toFixed(2)}`

const fecha = (s: string) =>
  new Date(s).toLocaleDateString("es-PA", { day: "2-digit", month: "short", year: "numeric" })

export default function AdminOrdersPage() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [filtro, setFiltro] = useState("porEnviar")
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState<string | null>(null)
  const [pendientesViejos, setPendientesViejos] = useState<number | null>(null)
  const { toast } = useToast()

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const res = await fetch(`/api/admin/orders?estado=${filtro}&limite=100`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("No pude traer los pedidos.")
      const json = await res.json()
      setPedidos(json.pedidos ?? [])
      setTotal(json.total ?? 0)
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setCargando(false)
    }
  }, [filtro, toast])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    fetch("/api/admin/limpiar-pendientes", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setPendientesViejos(j.cuantos))
      .catch(() => {})
  }, [])

  const cambiarEstado = async (id: string, status: Estado) => {
    setGuardando(id)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "No se pudo actualizar.")
      toast({
        title: "Pedido actualizado",
        description: json.stockDevuelto ? "Se devolvió el stock al inventario." : undefined,
      })
      cargar()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setGuardando(null)
    }
  }

  const limpiarPendientes = async () => {
    try {
      const res = await fetch("/api/admin/limpiar-pendientes", {
        method: "POST",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "No se pudo limpiar.")
      toast({ title: `${json.cancelados} pedido(s) cerrados` })
      setPendientesViejos(0)
      cargar()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Button variant="ghost" className="mb-2 -ml-3 rounded-full" asChild>
              <Link href="/admin">
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Panel
              </Link>
            </Button>
            <h1 className="font-display text-3xl font-bold text-purple-900 dark:text-purple-100">
              Pedidos
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-purple-100/70">
              {cargando ? "Cargando…" : `${total} pedido${total === 1 ? "" : "s"}`}
            </p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={cargar} disabled={cargando}>
            <RefreshCw className={`mr-2 h-4 w-4 ${cargando ? "animate-spin" : ""}`} /> Actualizar
          </Button>
        </div>

        {pendientesViejos ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-400/20 dark:bg-amber-400/10">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              Hay <strong>{pendientesViejos}</strong> pedido(s) que quedaron sin pagar hace más de
              un día. Son carritos abandonados en el checkout.
            </p>
            <Button size="sm" variant="outline" className="rounded-full" onClick={limpiarPendientes}>
              <Trash2 className="mr-2 h-4 w-4" /> Cerrarlos
            </Button>
          </div>
        ) : null}

        <div className="mb-6 flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <Button
              key={f.valor}
              size="sm"
              variant={filtro === f.valor ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setFiltro(f.valor)}
            >
              {f.texto}
            </Button>
          ))}
        </div>

        {!cargando && pedidos.length === 0 && (
          <div className="rounded-3xl border border-purple-100 bg-card py-16 text-center dark:border-white/10">
            <Package className="mx-auto mb-3 h-10 w-10 text-purple-300" />
            <p className="text-gray-600 dark:text-purple-100/70">
              No hay pedidos en este filtro.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {pedidos.map((p) => {
            const estado = (p.status || "pending") as Estado
            const info = ETIQUETAS[estado] ?? ETIQUETAS.pending
            const dir = p.shippingAddress || {}
            return (
              <div
                key={p.id}
                className="rounded-3xl border border-purple-100 bg-card p-5 dark:border-white/10"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge className={`${info.clase} border-none`}>
                        <info.Icono className="mr-1 h-3.5 w-3.5" />
                        {info.texto}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-purple-100/50">
                        #{p.id.slice(0, 8)} · {fecha(p.createdAt)}
                      </span>
                    </div>
                    <p className="font-semibold text-purple-900 dark:text-purple-100">
                      {p.user?.name || "Sin nombre"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-purple-100/70">
                      {p.user?.email}
                      {p.user?.phone ? ` · ${p.user.phone}` : ""}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {money(p.totalAmount)}
                  </p>
                </div>

                <div className="mb-4 flex flex-wrap gap-3">
                  {p.items?.map((it: any) => (
                    <div key={it.id} className="flex items-center gap-2 rounded-2xl bg-purple-50 p-2 pr-4 dark:bg-white/5">
                      <div className="relative h-12 w-9 overflow-hidden rounded-lg bg-purple-100 dark:bg-white/10">
                        {it.product?.images?.[0] && (
                          <Image
                            src={it.product.images[0]}
                            alt={it.product?.name || "Producto"}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        )}
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-purple-900 dark:text-purple-100">
                          {it.product?.name || "Producto"}
                        </p>
                        <p className="text-gray-600 dark:text-purple-100/70">
                          {it.quantity} × {money(it.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {(dir.street || dir.city) && (
                  <p className="mb-4 text-sm text-gray-600 dark:text-purple-100/70">
                    <strong className="font-medium text-purple-900 dark:text-purple-100">Envío:</strong>{" "}
                    {[dir.street, dir.city, dir.state, dir.country].filter(Boolean).join(", ")}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {estado === "paid" && (
                    <Button size="sm" className="rounded-full" disabled={guardando === p.id}
                      onClick={() => cambiarEstado(p.id, "shipped")}>
                      <Truck className="mr-2 h-4 w-4" /> Marcar enviado
                    </Button>
                  )}
                  {estado === "shipped" && (
                    <Button size="sm" className="rounded-full" disabled={guardando === p.id}
                      onClick={() => cambiarEstado(p.id, "delivered")}>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Marcar entregado
                    </Button>
                  )}
                  {estado !== "cancelled" && estado !== "delivered" && (
                    <Button size="sm" variant="outline" className="rounded-full" disabled={guardando === p.id}
                      onClick={() => cambiarEstado(p.id, "cancelled")}>
                      <XCircle className="mr-2 h-4 w-4" /> Cancelar
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
