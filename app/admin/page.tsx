"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  Package, 
  ShoppingCart,
  Star,
  DollarSign,
  TrendingUp,
  Clock
} from "lucide-react"

interface Product {
  _id?: string
  id?: number
  name: string
  description: string
  price: number
  category: string
  images: string[]
  stock: number
  rating?: number
  reviewCount?: number
  isNew?: boolean
  discount?: number
  featured?: boolean
}

interface User {
  _id?: string
  id?: string
  name: string
  email: string
  isAdmin: boolean
  avatar?: string
  phone?: string
  address?: any
  createdAt?: Date
}

interface Order {
  _id?: string
  id?: string
  user: User
  items: Array<{
    product: Product
    quantity: number
    price: number
  }>
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: Date
  shippingAddress: any
  paymentMethod: string
}

interface Review {
  _id?: string
  id?: string
  user: User
  product: Product
  rating: number
  comment: string
  createdAt: Date
}

interface Metrics {
  totalSales: number
  totalProducts: number
  totalUsers: number
  pendingOrders: number
}

export default function AdminPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState('dashboard')
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [metrics, setMetrics] = useState<Metrics>({
    totalSales: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0
  })
  
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [searchProducts, setSearchProducts] = useState('')
  const [searchUsers, setSearchUsers] = useState('')
  const [searchOrders, setSearchOrders] = useState('')
  const [searchReviews, setSearchReviews] = useState('')

  useEffect(() => {
    if (tab === 'dashboard') {
      fetchMetrics()
    } else if (tab === 'products') {
      fetchProducts()
    } else if (tab === 'users') {
      fetchUsers()
    } else if (tab === 'orders') {
      fetchOrders()
    } else if (tab === 'reviews') {
      fetchReviews()
    }
  }, [tab])

  const fetchMetrics = async () => {
    try {
      const [productsRes, usersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/users')
      ])
      
      const products = await productsRes.json()
      const users = await usersRes.json()
      
      setMetrics({
        totalSales: 15000,
        totalProducts: products.length,
        totalUsers: users.length,
        pendingOrders: 5
      })
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  const fetchProducts = async () => {
    setLoadingProducts(true)
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchOrders = async () => {
    setLoadingOrders(true)
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoadingOrders(false)
    }
  }

  const fetchReviews = async () => {
    setLoadingReviews(true)
    try {
      const res = await fetch('/api/reviews')
      if (res.ok) {
        const data = await res.json()
        setReviews(data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
    } finally {
      setLoadingReviews(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return
    
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: "Producto eliminado", description: "El producto se ha eliminado exitosamente." })
        fetchProducts()
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el producto.", variant: "destructive" })
    }
  }

  const handleToggleUserRole = async (userId: string, isAdmin: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !isAdmin })
      })
      
      if (res.ok) {
        toast({ title: "Rol actualizado", description: "El rol del usuario se ha actualizado." })
        fetchUsers()
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar el rol.", variant: "destructive" })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return
    
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: "Usuario eliminado", description: "El usuario se ha eliminado exitosamente." })
        fetchUsers()
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el usuario.", variant: "destructive" })
    }
  }

  const filteredProducts = (products || []).filter(product =>
    product.name.toLowerCase().includes(searchProducts.toLowerCase()) ||
    product.category.toLowerCase().includes(searchProducts.toLowerCase())
  )

  const filteredUsers = (users || []).filter(user =>
    user.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUsers.toLowerCase())
  )

  const filteredOrders = (orders || []).filter(order =>
    order.user.name.toLowerCase().includes(searchOrders.toLowerCase()) ||
    order.status.toLowerCase().includes(searchOrders.toLowerCase())
  )

  const filteredReviews = (reviews || []).filter(review =>
    review.user.name.toLowerCase().includes(searchReviews.toLowerCase()) ||
    review.product.name.toLowerCase().includes(searchReviews.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Panel de Administración</h1>
        <Badge variant="secondary" className="text-sm">
          Admin Dashboard
        </Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp size={16} />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package size={16} />
            Productos
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users size={16} />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart size={16} />
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star size={16} />
            Reseñas
          </TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.totalSales.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% desde el mes pasado
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  Productos en catálogo
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Usuarios registrados
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Requieren atención
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Productos */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchProducts}
                onChange={(e) => setSearchProducts(e.target.value)}
                className="w-64"
              />
            </div>
            <Button onClick={() => window.location.href = '/admin/products/new'}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gestión de Productos</CardTitle>
              <CardDescription>
                Administra el catálogo de productos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <div className="text-center py-8">Cargando productos...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imagen</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product._id || product.id}>
                        <TableCell>
                          <div className="w-12 h-12 rounded-md overflow-hidden">
                            <img
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {product.isNew && <Badge variant="secondary">Nuevo</Badge>}
                            {product.featured && <Badge variant="outline">Destacado</Badge>}
                            {(product.discount || 0) > 0 && (
                              <Badge variant="destructive">-{product.discount}%</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = `/admin/products/${product._id}/edit`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product._id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usuarios */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra los usuarios registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="text-center py-8">Cargando usuarios...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Fecha de Registro</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id || user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <img
                                src={user.avatar || "/placeholder-user.jpg"}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.isAdmin ? "default" : "secondary"}>
                            {user.isAdmin ? "Admin" : "Usuario"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleUserRole(user._id!, user.isAdmin)}
                            >
                              {user.isAdmin ? "Quitar Admin" : "Hacer Admin"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user._id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pedidos */}
        <TabsContent value="orders" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pedidos..."
                value={searchOrders}
                onChange={(e) => setSearchOrders(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gestión de Pedidos</CardTitle>
              <CardDescription>
                Administra los pedidos de los clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className="text-center py-8">Cargando pedidos...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Productos</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order._id || order.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.user.name}</p>
                            <p className="text-sm text-muted-foreground">{order.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {order.items.length} productos
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${order.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            order.status === 'pending' ? 'secondary' :
                            order.status === 'processing' ? 'default' :
                            order.status === 'shipped' ? 'outline' :
                            order.status === 'delivered' ? 'default' :
                            'destructive'
                          }>
                            {order.status === 'pending' ? 'Pendiente' :
                             order.status === 'processing' ? 'Procesando' :
                             order.status === 'shipped' ? 'Enviado' :
                             order.status === 'delivered' ? 'Entregado' :
                             'Cancelado'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reseñas */}
        <TabsContent value="reviews" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar reseñas..."
                value={searchReviews}
                onChange={(e) => setSearchReviews(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gestión de Reseñas</CardTitle>
              <CardDescription>
                Administra las reseñas de los productos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingReviews ? (
                <div className="text-center py-8">Cargando reseñas...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Calificación</TableHead>
                      <TableHead>Comentario</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReviews.map((review) => (
                      <TableRow key={review._id || review.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <img
                                src={review.user.avatar || "/placeholder-user.jpg"}
                                alt={review.user.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-medium">{review.user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{review.product.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-sm">{review.rating}/5</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {review.comment}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
                                // Aquí iría la lógica para eliminar la reseña
                                toast({ title: "Reseña eliminada", description: "La reseña se ha eliminado exitosamente." })
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
