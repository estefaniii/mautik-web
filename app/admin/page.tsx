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
  Clock,
  BarChart as BarChartIcon,
  Mail as MailIcon
} from "lucide-react"
import Link from "next/link";
import type { Product } from "@/types/product"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/auth-context"
import AdminGuard from "@/components/admin-guard"
import React from "react"

function MassMailTab() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  if (!user?.isAdmin) {
    return <div className="p-8 text-center text-red-600 font-bold">Acceso denegado</div>;
  }

  const handleSend = async () => {
    setSending(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/mass-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("¡Correos enviados exitosamente!");
        setSubject("");
        setMessage("");
      } else {
        setError(data.error || "Error desconocido");
      }
    } catch (e) {
      setError("Error de red o servidor");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Envío Masivo de Correos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block font-medium mb-1">Asunto</label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Asunto del correo" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Mensaje (HTML permitido)</label>
            <Textarea rows={8} value={message} onChange={e => setMessage(e.target.value)} placeholder="Escribe el mensaje aquí..." />
          </div>
          <div className="flex gap-2 mb-4">
            <Button type="button" variant="outline" onClick={() => setPreview(p => !p)}>{preview ? "Ocultar" : "Vista previa"}</Button>
            <Button type="button" onClick={handleSend} disabled={sending || !subject || !message}>{sending ? "Enviando..." : "Enviar a todos"}</Button>
          </div>
          {preview && (
            <div className="border rounded p-4 bg-gray-50 mb-4">
              <div className="font-bold mb-2">Vista previa:</div>
              <div dangerouslySetInnerHTML={{ __html: message }} />
            </div>
          )}
          {success && <div className="text-green-600 font-medium mt-2">{success}</div>}
          {error && <div className="text-red-600 font-medium mt-2">{error}</div>}
        </CardContent>
      </Card>
    </div>
  );
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
  salesGrowth: number
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
    pendingOrders: 0,
    salesGrowth: 0
  })
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [searchProducts, setSearchProducts] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [searchOrders, setSearchOrders] = useState("");
  const [searchReviews, setSearchReviews] = useState("");
  const [monthlySales, setMonthlySales] = useState<{ month: string; total: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProducts(true);
        setLoadingUsers(true);
        setLoadingOrders(true);
        setLoadingReviews(true);

        // Fetch metrics
        const metricsRes = await fetch("/api/admin/metrics");
        if (metricsRes.ok) {
          const data = await metricsRes.json();
          setMetrics(data);
        }

        // Fetch monthly sales
        const monthlySalesRes = await fetch("/api/admin/monthly-sales");
        if (monthlySalesRes.ok) {
          const data = await monthlySalesRes.json();
          setMonthlySales(data);
        }

        // Fetch products
        const productsRes = await fetch("/api/admin/products");
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data);
        }

        // Fetch users
        const usersRes = await fetch("/api/admin/users");
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data);
        }

        // Fetch orders
        const ordersRes = await fetch("/api/admin/orders");
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrders(data);
        }

        // Fetch reviews
        const reviewsRes = await fetch("/api/admin/reviews");
        if (reviewsRes.ok) {
          const data = await reviewsRes.json();
          setReviews(data);
        }

      } catch (error) {
        toast({
          title: "Error al cargar datos",
          description: "No se pudieron cargar los datos del panel de administración.",
          variant: "destructive",
        });
      } finally {
        setLoadingProducts(false);
        setLoadingUsers(false);
        setLoadingOrders(false);
        setLoadingReviews(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [toast]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchProducts.toLowerCase()) ||
    product.category.toLowerCase().includes(searchProducts.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const filteredOrders = orders.filter(order =>
    order.user.name.toLowerCase().includes(searchOrders.toLowerCase()) ||
    order.user.email.toLowerCase().includes(searchOrders.toLowerCase())
  );

  const filteredReviews = reviews.filter(review =>
    review.user.name.toLowerCase().includes(searchReviews.toLowerCase()) ||
    review.product.name.toLowerCase().includes(searchReviews.toLowerCase())
  );

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        toast({ title: "Producto eliminado", description: "El producto se ha eliminado exitosamente." });
      } else {
        const errorData = await res.json();
        toast({ title: "Error al eliminar producto", description: errorData.error || "Error desconocido" });
      }
    } catch (e) {
      toast({ title: "Error de red o servidor", description: "No se pudo eliminar el producto." });
    }
  };

  const handleToggleUserRole = async (id: string, currentRole: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin: !currentRole }),
      });
      if (res.ok) {
        setUsers(users.map(user => user._id === id ? { ...user, isAdmin: !currentRole } : user));
        toast({ title: "Rol de usuario actualizado", description: `El rol de usuario se ha actualizado a ${!currentRole ? "Admin" : "Usuario"}` });
      } else {
        const errorData = await res.json();
        toast({ title: "Error al actualizar rol", description: errorData.error || "Error desconocido" });
      }
    } catch (e) {
      toast({ title: "Error de red o servidor", description: "No se pudo actualizar el rol del usuario." });
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter(user => user._id !== id));
        toast({ title: "Usuario eliminado", description: "El usuario se ha eliminado exitosamente." });
      } else {
        const errorData = await res.json();
        toast({ title: "Error al eliminar usuario", description: errorData.error || "Error desconocido" });
      }
    } catch (e) {
      toast({ title: "Error de red o servidor", description: "No se pudo eliminar el usuario." });
    }
  };

  return (
    <AdminGuard>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Panel de Administración</h1>
          <div className="flex items-center gap-4">
            <Link href="/admin/cleanup">
              <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar localStorage
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard" className="flex flex-col items-center gap-1">
              <TrendingUp size={20} />
              <span className="hidden sm:block md:block lg:block xl:block">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex flex-col items-center gap-1">
              <Package size={20} />
              <span className="hidden sm:block md:block lg:block xl:block">Productos</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex flex-col items-center gap-1">
              <Users size={20} />
              <span className="hidden sm:block md:block lg:block xl:block">Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex flex-col items-center gap-1">
              <ShoppingCart size={20} />
              <span className="hidden sm:block md:block lg:block xl:block">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex flex-col items-center gap-1">
              <Star size={20} />
              <span className="hidden sm:block md:block lg:block xl:block">Reseñas</span>
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex flex-col items-center gap-1">
              <DollarSign size={20} />
              <span className="hidden sm:block md:block lg:block xl:block">Cupones</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col items-center gap-1">
              <BarChartIcon size={20} />
              <span className="hidden sm:block md:block lg:block xl:block">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="mass-mail" className="flex flex-col items-center gap-1">
              <MailIcon size={20} />
              <span className="hidden sm:block md:block lg:block xl:block">Envío Masivo</span>
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
                    {metrics.salesGrowth > 0 ? '+' : ''}{metrics.salesGrowth.toFixed(1)}% desde el mes pasado
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
            {/* Gráfica de ventas mensuales */}
            <Card>
              <CardHeader>
                <CardTitle>Ventas por Mes ({new Date().getFullYear()})</CardTitle>
                <CardDescription>Ventas totales de pedidos entregados por mes</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySales} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                    <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Productos */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchProducts}
                  onChange={(e) => setSearchProducts(e.target.value)}
                  className="w-64"
                />
              </div>
              <Link href="/admin/products/new">
                <Button variant="default">+ Nuevo Producto</Button>
              </Link>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Productos</CardTitle>
                <CardDescription>
                  Administra los productos de la tienda
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProducts ? (
                  <div className="text-center py-8">Cargando productos...</div>
                ) : (
                  <Table>
                    <TableHeader className="hidden sm:table-header-group">
                      <TableRow>
                        <TableHead>Imagen</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Etiquetas</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id} className="sm:table-row flex flex-col sm:flex-row mb-4 sm:mb-0 border sm:border-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none p-3 sm:p-0 bg-white sm:bg-transparent">
                          <TableCell className="flex items-center gap-3 sm:table-cell">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Imagen:</span>
                            <div className="w-16 h-16 rounded-md overflow-hidden">
                              <img
                                src={product.images[0] || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="sm:table-cell flex items-center gap-2">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Nombre:</span>
                            <span className="font-medium">{product.name}</span>
                          </TableCell>
                          <TableCell className="sm:table-cell flex items-center gap-2">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Categoría:</span>
                            {product.category}
                          </TableCell>
                          <TableCell className="sm:table-cell flex items-center gap-2">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Precio:</span>
                            ${product.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="sm:table-cell flex items-center gap-2">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Stock:</span>
                            {product.stock}
                          </TableCell>
                          <TableCell className="sm:table-cell flex items-center gap-2">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Etiquetas:</span>
                            <div className="flex gap-1 flex-wrap">
                              {product.isNew && <Badge variant="secondary">Nuevo</Badge>}
                              {product.featured && <Badge variant="outline">Destacado</Badge>}
                              {(product.discount || 0) > 0 && (
                                <Badge variant="destructive">-{product.discount}%</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="sm:table-cell flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Acciones:</span>
                            <div className="flex gap-2 flex-col sm:flex-row">
                              <Link href={`/admin/products/${product.id}/edit`}>
                                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => handleDeleteProduct(String(product.id))}
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
                    <TableHeader className="hidden sm:table-header-group">
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
                        <TableRow key={user.id || user._id} className="sm:table-row flex flex-col sm:flex-row mb-4 sm:mb-0 border sm:border-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none p-3 sm:p-0 bg-white sm:bg-transparent">
                          <TableCell className="flex items-center gap-3 sm:table-cell">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Usuario:</span>
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
                          <TableCell className="sm:table-cell flex items-center gap-2">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Email:</span>
                            <span>{user.email}</span>
                          </TableCell>
                          <TableCell className="sm:table-cell flex items-center gap-2">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Rol:</span>
                            <Badge variant={user.isAdmin ? "default" : "secondary"}>
                              {user.isAdmin ? "Admin" : "Usuario"}
                            </Badge>
                          </TableCell>
                          <TableCell className="sm:table-cell flex items-center gap-2">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Fecha:</span>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell className="sm:table-cell flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Acciones:</span>
                            <div className="flex gap-2 flex-col sm:flex-row">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => handleToggleUserRole(String(user._id), user.isAdmin)}
                              >
                                {user.isAdmin ? "Quitar Admin" : "Hacer Admin"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => handleDeleteUser(String(user._id))}
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
                    <TableHeader className="hidden sm:table-header-group">
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
                        <TableRow key={order._id} className="sm:table-row flex flex-col sm:flex-row mb-4 sm:mb-0 border sm:border-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none p-3 sm:p-0 bg-white sm:bg-transparent">
                          <TableCell className="flex items-center gap-3 sm:table-cell">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Cliente:</span>
                            <div>
                              <p className="font-medium">{order.user.name}</p>
                              <p className="text-sm text-muted-foreground">{order.user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="sm:table-cell flex items-center gap-2">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Productos:</span>
                            <div className="text-sm">
                              {order.items.length} productos
                            </div>
                          </TableCell>
                          <TableCell className="sm:table-cell flex items-center gap-2">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Total:</span>
                            <div className="font-medium">
                              ${order.total.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell className="sm:table-cell flex items-center gap-2">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Estado:</span>
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
                          <TableCell className="sm:table-cell flex items-center gap-2">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Fecha:</span>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="sm:table-cell flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Acciones:</span>
                            <div className="flex gap-2 flex-col sm:flex-row">
                              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                <Edit className="h-4 w-4" />
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
                    <TableHeader className="hidden sm:table-header-group">
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
                        <TableRow key={review._id} className="sm:table-row flex flex-col sm:flex-row mb-4 sm:mb-0 border sm:border-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none p-3 sm:p-0 bg-white sm:bg-transparent">
                          <TableCell className="flex items-center gap-3 sm:table-cell">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Usuario:</span>
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
                          <TableCell className="sm:table-cell flex items-center gap-2">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Producto:</span>
                            <span>{review.product.name}</span>
                          </TableCell>
                          <TableCell className="sm:table-cell flex items-center gap-2">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Calificación:</span>
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
                          <TableCell className="sm:table-cell flex items-center gap-2">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Comentario:</span>
                            <div className="max-w-xs truncate">
                              {review.comment}
                            </div>
                          </TableCell>
                          <TableCell className="sm:table-cell flex items-center gap-2">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Fecha:</span>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="sm:table-cell flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                            <span className="sm:hidden text-xs text-gray-500 w-24">Acciones:</span>
                            <div className="flex gap-2 flex-col sm:flex-row">
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

          {/* Coupons */}
          <TabsContent value="coupons" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cupones..."
                  value={searchProducts} // Reusing searchProducts for now, as no specific coupon search field exists
                  onChange={(e) => setSearchProducts(e.target.value)}
                  className="w-64"
                />
              </div>
              <Link href="/admin/coupons/new">
                <Button variant="default">+ Nuevo Cupón</Button>
              </Link>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Cupones</CardTitle>
                <CardDescription>
                  Administra los cupones de descuento disponibles para los usuarios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Reusing loadingProducts for now */}
                {loadingProducts ? (
                  <div className="text-center py-8">Cargando cupones...</div>
                ) : (
                  <Table>
                    <TableHeader className="hidden sm:table-header-group">
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Placeholder for coupon data */}
                      <TableRow className="sm:table-row flex flex-col sm:flex-row mb-4 sm:mb-0 border sm:border-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none p-3 sm:p-0 bg-white sm:bg-transparent">
                        <TableCell className="sm:table-cell flex items-center gap-2">
                          <span className="sm:hidden text-xs text-gray-500 w-24">Código:</span>
                          <span>SUMMER2023</span>
                        </TableCell>
                        <TableCell className="sm:table-cell flex items-center gap-2">
                          <span className="sm:hidden text-xs text-gray-500 w-24">Tipo:</span>
                          <span>Porcentaje</span>
                        </TableCell>
                        <TableCell className="sm:table-cell flex items-center gap-2">
                          <span className="sm:hidden text-xs text-gray-500 w-24">Valor:</span>
                          <span>10%</span>
                        </TableCell>
                        <TableCell className="sm:table-cell flex items-center gap-2">
                          <span className="sm:hidden text-xs text-gray-500 w-24">Estado:</span>
                          <Badge variant="default">Activo</Badge>
                        </TableCell>
                        <TableCell className="sm:table-cell flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                          <span className="sm:hidden text-xs text-gray-500 w-24">Acciones:</span>
                          <div className="flex gap-2 flex-col sm:flex-row">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow className="sm:table-row flex flex-col sm:flex-row mb-4 sm:mb-0 border sm:border-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none p-3 sm:p-0 bg-white sm:bg-transparent">
                        <TableCell className="sm:table-cell flex items-center gap-2">
                          <span className="sm:hidden text-xs text-gray-500 w-24">Código:</span>
                          <span>WELCOME10</span>
                        </TableCell>
                        <TableCell className="sm:table-cell flex items-center gap-2">
                          <span className="sm:hidden text-xs text-gray-500 w-24">Tipo:</span>
                          <span>Fijo</span>
                        </TableCell>
                        <TableCell className="sm:table-cell flex items-center gap-2">
                          <span className="sm:hidden text-xs text-gray-500 w-24">Valor:</span>
                          <span>$10</span>
                        </TableCell>
                        <TableCell className="sm:table-cell flex items-center gap-2">
                          <span className="sm:hidden text-xs text-gray-500 w-24">Estado:</span>
                          <Badge variant="secondary">Inactivo</Badge>
                        </TableCell>
                        <TableCell className="sm:table-cell flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                          <span className="sm:hidden text-xs text-gray-500 w-24">Acciones:</span>
                          <div className="flex gap-2 flex-col sm:flex-row">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Avanzado</CardTitle>
                <CardDescription>
                  Métricas detalladas y reportes de rendimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Accede a analytics avanzados con métricas detalladas de ventas, productos más vendidos y comportamiento de usuarios.
                  </p>
                  <Link href="/admin/analytics">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Ver Analytics Detallado
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Envío Masivo */}
          <TabsContent value="mass-mail" className="space-y-6">
            <MassMailTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  )
}
