"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  Calendar,
  DollarSign,
  ShoppingBag,
  Eye,
  Download
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage: string
  quantity: number
  price: number
}

interface Order {
  id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: OrderItem[]
  createdAt: string
  updatedAt: string
  isPaid: boolean
  isDelivered: boolean
}

const statusConfig = {
  pending: {
    label: 'Pendiente',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
  },
  processing: {
    label: 'Procesando',
    icon: Package,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  shipped: {
    label: 'Enviado',
    icon: Truck,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  delivered: {
    label: 'Entregado',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    bgColor: 'bg-red-50 dark:bg-red-900/20'
  }
}

export default function PurchaseHistory() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredOrders = () => {
    if (activeTab === 'all') return orders
    return orders.filter(order => order.status === activeTab)
  }

  const getStatusConfig = (status: Order['status']) => {
    return statusConfig[status]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getOrderSummary = () => {
    const totalOrders = orders.length
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length
    const pendingOrders = orders.filter(order => ['pending', 'processing'].includes(order.status)).length

    return { totalOrders, totalSpent, deliveredOrders, pendingOrders }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Inicia sesión para ver tu historial de compras
          </h1>
          <Link href="/login">
            <Button>Iniciar Sesión</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const summary = getOrderSummary()
  const filteredOrders = getFilteredOrders()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Historial de Compras
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Revisa todos tus pedidos y su estado actual
          </p>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <ShoppingBag className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Pedidos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {summary.totalOrders}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Gastado</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    ${summary.totalSpent.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Entregados</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {summary.deliveredOrders}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {summary.pendingOrders}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">Todos ({orders.length})</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="processing">Procesando</TabsTrigger>
            <TabsTrigger value="shipped">Enviados</TabsTrigger>
            <TabsTrigger value="delivered">Entregados</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Lista de pedidos */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No hay pedidos
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {activeTab === 'all' 
                  ? 'Aún no has realizado ningún pedido.'
                  : `No hay pedidos con estado "${getStatusConfig(activeTab as Order['status'])?.label}"`
                }
              </p>
              <Link href="/shop">
                <Button>Ir a la tienda</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const status = getStatusConfig(order.status)
              const StatusIcon = status.icon

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className={`${status.bgColor} border-b`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <StatusIcon className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-lg">
                            Pedido #{order.id.slice(-8)}
                          </CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.productImage || '/placeholder.svg'}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {item.productName}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Cantidad: {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              ${(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>Actualizado: {formatDate(order.updatedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalles
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Factura
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
} 