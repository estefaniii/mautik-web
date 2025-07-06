"use client"

import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { getOrders } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowLeft, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/context/cart-context"
import AuthGuard from "@/components/auth-guard"

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [order, setOrder] = useState<any | null>(null)

  useEffect(() => {
    const userId = user?.id?.toString()
    const orders = getOrders(userId)
    const found = orders.find((o: any) => o.id.toString() === params.id)
    setOrder(found || null)
  }, [user, params.id])

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pedido no encontrado</h2>
          <Button asChild variant="outline">
            <Link href="/orders">Volver a pedidos</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleReorder = () => {
    order.items.forEach((item: any) => {
      addToCart({ ...item, quantity: item.quantity })
    })
    router.push("/cart")
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Button asChild variant="outline" className="mb-6">
            <Link href="/orders"><ArrowLeft className="h-4 w-4 mr-2" /> Volver a pedidos</Link>
          </Button>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-2xl font-bold text-purple-900 flex-1">Pedido #{order.id}</h1>
              <Badge className={
                order.status === "Procesando" ? "bg-yellow-100 text-yellow-800" :
                order.status === "Enviado" ? "bg-blue-100 text-blue-800" :
                order.status === "Entregado" ? "bg-green-100 text-green-800" :
                "bg-gray-100 text-gray-800"
              }>
                {order.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-6 text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{new Date(order.date).toLocaleString()}</span>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Datos de envío</h2>
              <div className="text-gray-700">
                <div><span className="font-medium">Nombre:</span> {order.userName}</div>
                <div><span className="font-medium">Email:</span> {order.email}</div>
                <div><span className="font-medium">Teléfono:</span> {order.phone}</div>
                <div><span className="font-medium">Dirección:</span> {order.address}, {order.city}, {order.state}, {order.zip}, {order.country}</div>
                <div><span className="font-medium">Método de pago:</span> {order.payment === "card" ? "Tarjeta de crédito/débito" : "Pago contra entrega"}</div>
              </div>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Productos</h2>
              <div className="divide-y divide-gray-200">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center py-3">
                    <div>
                      <div className="font-medium text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-500">Cantidad: {item.quantity}</div>
                    </div>
                    <div className="text-purple-800 font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Envío</span>
                <span className="font-medium">{order.shipping === 0 ? "Gratis" : `$${order.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="font-bold text-purple-900">${order.total.toFixed(2)}</span>
              </div>
            </div>
            <Button onClick={handleReorder} className="w-full bg-purple-800 hover:bg-purple-900 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Volver a comprar
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
