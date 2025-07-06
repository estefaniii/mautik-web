"use client"

import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { getOrders } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ShoppingBag, Eye } from "lucide-react"
import AuthGuard from "@/components/auth-guard"

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    const userId = user?.id?.toString()
    setOrders(getOrders(userId))
  }, [user])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold text-purple-900 mb-8 text-center">Mis Pedidos</h1>
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <ShoppingBag className="h-20 w-20 text-purple-200 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">No tienes pedidos aún</h2>
              <p className="text-gray-600 mb-8">¡Haz tu primer pedido y comienza a disfrutar de nuestros productos!</p>
              <Link href="/shop">
                <Button className="bg-purple-800 hover:bg-purple-900 px-8 py-6 text-lg">Explorar Productos</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-purple-900 mb-1">Pedido #{order.id}</h3>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={
                        order.status === "Procesando" ? "bg-yellow-100 text-yellow-800" :
                        order.status === "Enviado" ? "bg-blue-100 text-blue-800" :
                        order.status === "Entregado" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-gray-600 text-sm">
                      {order.items.length} producto{order.items.length !== 1 ? "s" : ""} · Total: <span className="font-semibold text-purple-800">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:items-end">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" /> Ver Detalle
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
