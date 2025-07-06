"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { useFavorites } from "@/context/favorites-context"
import { useTheme } from "@/context/theme-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X, 
  ShoppingBag, 
  Heart, 
  Settings,
  Shield,
  Calendar,
  Lock,
  Bell,
  Trash2,
  Camera,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Package,
  Star,
  CreditCard,
  LogOut,
  Moon,
  Sun
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AuthGuard from "@/components/auth-guard"
import Link from "next/link"
import ProductCard from "@/components/product-card"
import ProfileAvatar from "@/components/profile-avatar"

interface UserSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
  orderUpdates: boolean
  darkMode: boolean
}

export default function ProfilePage() {
  const { user, isLoading, logout, updateProfile } = useAuth()
  const { favorites, getFavoriteProducts } = useFavorites()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { toast } = useToast()
  
  // Profile editing states
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  
  // Form states
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: ""
    }
  })
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    orderUpdates: true,
    darkMode: isDarkMode
  })
  
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (user) {
      setLoadingOrders(true);
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          // Filtrar solo los pedidos del usuario autenticado
          const userOrders = Array.isArray(data)
            ? data.filter((order: any) => order.user && (order.user._id === user.id || order.user === user.id))
            : [];
          setOrders(userOrders);
        })
        .catch(() => setOrders([]))
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: ""
        }
      })
    }
  }, [user])

  // Cargar modo oscuro desde localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode !== null) {
      const isDarkMode = savedDarkMode === 'true'
      setSettings(prev => ({ ...prev, darkMode: isDarkMode }))
      
      // Aplicar el tema al documento
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])

  const handleSave = async () => {
    try {
      if (!user) {
        toast({
          title: "❌ Error",
          description: "Usuario no autenticado",
          variant: "destructive"
        });
        return;
      }

      // Validar campos requeridos
      if (!editForm.name.trim() || !editForm.email.trim()) {
        toast({
          title: "❌ Error",
          description: "Nombre y email son campos obligatorios",
          variant: "destructive"
        });
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email)) {
        toast({
          title: "❌ Error",
          description: "Formato de email inválido",
          variant: "destructive"
        });
        return;
      }

      // Preparar datos para actualizar
      const updateData = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address
      };

      // Llamar a la API para actualizar el perfil
      const result = await updateProfile(updateData);

      if (result.success) {
        toast({
          title: "✅ Perfil actualizado",
          description: "Tu información ha sido actualizada exitosamente.",
        });
        setIsEditing(false);
      } else {
        toast({
          title: "❌ Error",
          description: result.error || "No se pudo actualizar el perfil. Inténtalo de nuevo.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "❌ Error",
        description: "Error de conexión al actualizar el perfil",
        variant: "destructive"
      });
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "❌ Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "❌ Error",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (!user) {
        toast({
          title: "❌ Error",
          description: "Usuario no autenticado",
          variant: "destructive"
        });
        return;
      }

      // Llamar a la API para cambiar la contraseña
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          userId: user?.id
        }),
      });

      const data = await response.json();
      const result = { success: response.ok, error: data.error };

      if (result.success) {
        toast({
          title: "✅ Contraseña actualizada",
          description: "Tu contraseña ha sido cambiada exitosamente.",
        });
        setShowPasswordDialog(false);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        toast({
          title: "❌ Error",
          description: result.error || "No se pudo cambiar la contraseña. Inténtalo de nuevo.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "❌ Error",
        description: "Error de conexión al cambiar la contraseña",
        variant: "destructive"
      });
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // Simular eliminación de cuenta
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "✅ Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada permanentemente.",
      })
      logout()
    } catch (error) {
    toast({
        title: "❌ Error",
        description: "No se pudo eliminar la cuenta. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  const handleCancel = () => {
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: ""
        }
    })
    }
    setIsEditing(false)
  }

  const handleImageChange = async (imageUrl: string) => {
    try {
      // Aquí puedes integrar con tu API para actualizar la imagen del usuario
      // Por ahora simulamos la actualización
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Actualizar el estado del usuario con la nueva imagen usando el contexto
      const result = await updateProfile({ avatar: imageUrl })
      
      if (result.success) {
        toast({
          title: "✅ Imagen actualizada",
          description: "Tu foto de perfil ha sido actualizada exitosamente.",
        })
      } else {
        toast({
          title: "❌ Error",
          description: result.error || "No se pudo actualizar la imagen. Inténtalo de nuevo.",
          variant: "destructive"
        })
      }
    } catch (error) {
    toast({
        title: "❌ Error",
        description: "No se pudo actualizar la imagen. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  const handleDarkModeToggle = () => {
    toggleDarkMode()
    
    toast({
      title: !isDarkMode ? "🌙 Modo oscuro activado" : "☀️ Modo claro activado",
      description: `Has cambiado al ${!isDarkMode ? 'modo oscuro' : 'modo claro'}.`,
    })
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getMemberSince = () => {
    if (!user?.createdAt) return "Reciente"
    const date = new Date(user.createdAt)
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando tu perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
          {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Mi Cuenta</h1>
              <p className="text-gray-600 text-lg">Gestiona tu perfil, pedidos y preferencias</p>
          </div>

            <Tabs defaultValue="profile" className="space-y-8">
              <TabsList className="grid w-full grid-cols-5 bg-white shadow-lg">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                  Perfil
              </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                  Pedidos
              </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                  Favoritos
              </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                  Configuración
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Seguridad
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-white">Información Personal</CardTitle>
                        <CardDescription className="text-purple-100">
                        Actualiza tu información personal y de contacto
                      </CardDescription>
                    </div>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} variant="secondary" className="bg-white/20 hover:bg-white/30">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    ) : (
                        <div className="flex gap-2">
                          <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                          <Save className="h-4 w-4 mr-2" />
                            Guardar
                        </Button>
                          <Button onClick={handleCancel} variant="secondary" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                  <CardContent className="p-6">
                    {/* Avatar Section */}
                    <div className="flex items-center space-x-6 mb-8">
                      <ProfileAvatar
                        currentImage={user?.avatar}
                        userName={user?.name || "Usuario"}
                        onImageChange={handleImageChange}
                        size="lg"
                        isEditing={isEditing}
                      />
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900">{user?.name}</h3>
                        <p className="text-gray-600 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {user?.email}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          {user?.isAdmin && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              <Shield className="h-3 w-3 mr-1" />
                              Administrador
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-gray-600">
                            <Calendar className="h-3 w-3 mr-1" />
                            Miembro desde {getMemberSince()}
                          </Badge>
                        </div>
                    </div>
                  </div>

                    <Separator className="my-6" />

                    {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Nombre completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          disabled={!isEditing}
                            className="pl-10 h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="email"
                          type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          disabled={!isEditing}
                            className="pl-10 h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="phone"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          disabled={!isEditing}
                            className="pl-10 h-12"
                        />
                        </div>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-4 mt-8">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-purple-600" />
                        <h4 className="font-semibold text-lg">Dirección de Envío</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="street" className="text-sm font-medium">Calle y número</Label>
                          <Input
                            id="street"
                            value={editForm.address.street}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              address: { ...editForm.address, street: e.target.value }
                            })}
                            disabled={!isEditing}
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm font-medium">Ciudad</Label>
                          <Input
                            id="city"
                            value={editForm.address.city}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              address: { ...editForm.address, city: e.target.value }
                            })}
                            disabled={!isEditing}
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-sm font-medium">Estado/Provincia</Label>
                          <Input
                            id="state"
                            value={editForm.address.state}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              address: { ...editForm.address, state: e.target.value }
                            })}
                            disabled={!isEditing}
                            className="h-12"
                          />
                        </div>
                    <div className="space-y-2">
                          <Label htmlFor="zipCode" className="text-sm font-medium">Código Postal</Label>
                          <Input
                            id="zipCode"
                            value={editForm.address.zipCode}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              address: { ...editForm.address, zipCode: e.target.value }
                            })}
                            disabled={!isEditing}
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="country" className="text-sm font-medium">País</Label>
                        <Input
                            id="country"
                            value={editForm.address.country}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              address: { ...editForm.address, country: e.target.value }
                            })}
                          disabled={!isEditing}
                            className="h-12"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center text-white">
                      <ShoppingBag className="h-6 w-6 mr-3" />
                      Mis Pedidos
                    </CardTitle>
                    <CardDescription className="text-green-100">
                      Historial de todos tus pedidos y su estado
                  </CardDescription>
                </CardHeader>
                  <CardContent className="p-6">
                    {loadingOrders ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando pedidos...</p>
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="space-y-6">
                        {orders.map((order) => (
                          <div key={order._id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                              <div>
                                <span className="font-semibold">Pedido:</span> {order.orderNumber || order._id}
                                <span className="ml-4 font-semibold">Fecha:</span> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                              </div>
                              <div>
                                <Badge variant="outline" className="capitalize">
                                  {order.status}
                                </Badge>
                                {order.isPaid && <Badge variant="secondary" className="ml-2">Pagado</Badge>}
                              </div>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr>
                                    <th className="text-left p-2">Producto</th>
                                    <th className="text-left p-2">Cantidad</th>
                                    <th className="text-left p-2">Precio</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.items.map((item: any, idx: number) => (
                                    <tr key={idx}>
                                      <td className="p-2 flex items-center gap-2">
                                        <img src={item.image || (item.product && item.product.images && item.product.images[0]) || '/placeholder.svg'} alt={item.name} className="w-10 h-10 object-cover rounded" />
                                        <span>{item.name || (item.product && item.product.name)}</span>
                                      </td>
                                      <td className="p-2">{item.quantity}</td>
                                      <td className="p-2">${item.price.toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="flex justify-end mt-2">
                              <span className="font-semibold">Total: ${order.total?.toFixed(2) || 'N/A'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                          <ShoppingBag className="h-12 w-12 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No hay pedidos aún</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Cuando hagas tu primer pedido, aparecerá aquí con todos los detalles y el estado de seguimiento.
                        </p>
                        <Link href="/shop">
                          <Button size="lg" className="bg-green-600 hover:bg-green-700">
                            <ShoppingBag className="h-5 w-5 mr-2" />
                            Ir a la Tienda
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center text-white">
                      <Heart className="h-6 w-6 mr-3" />
                      Mis Favoritos
                    </CardTitle>
                    <CardDescription className="text-pink-100">
                      Productos que has marcado como favoritos
                      </CardDescription>
                </CardHeader>
                  <CardContent className="p-6">
                    {favorites && favorites.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getFavoriteProducts().map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                  ) : (
                      <div className="text-center py-12">
                        <div className="bg-pink-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                          <Heart className="h-12 w-12 text-pink-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No hay favoritos aún</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Marca productos como favoritos para verlos aquí y acceder rápidamente a ellos.
                        </p>
                        <Link href="/shop">
                          <Button size="lg" className="bg-pink-600 hover:bg-pink-700">
                            <Heart className="h-5 w-5 mr-2" />
                            Explorar Productos
                          </Button>
                        </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center text-white">
                      <Settings className="h-6 w-6 mr-3" />
                      Configuración de Notificaciones
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      Gestiona cómo recibes las notificaciones
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Bell className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Notificaciones por email</h4>
                          <p className="text-sm text-gray-600">Recibe actualizaciones sobre tus pedidos</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Phone className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Notificaciones SMS</h4>
                          <p className="text-sm text-gray-600">Recibe alertas por mensaje de texto</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Mail className="h-5 w-5 text-purple-600" />
                        </div>
                      <div>
                          <h4 className="font-semibold">Emails de marketing</h4>
                          <p className="text-sm text-gray-600">Recibe ofertas y novedades</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.marketingEmails}
                        onCheckedChange={(checked) => setSettings({...settings, marketingEmails: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="bg-orange-100 p-2 rounded-lg">
                          <Package className="h-5 w-5 text-orange-600" />
                        </div>
                      <div>
                          <h4 className="font-semibold">Actualizaciones de pedidos</h4>
                          <p className="text-sm text-gray-600">Seguimiento en tiempo real</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.orderUpdates}
                        onCheckedChange={(checked) => setSettings({...settings, orderUpdates: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 p-3 rounded-xl shadow-md">
                          {isDarkMode ? (
                            <Sun className="h-6 w-6 text-yellow-500" />
                          ) : (
                            <Moon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Modo oscuro</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {isDarkMode ? "Activa el modo claro para una experiencia más brillante" : "Activa el modo oscuro para una experiencia más suave"}
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <Switch
                          checked={isDarkMode}
                          onCheckedChange={handleDarkModeToggle}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-blue-500"
                        />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-0 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center text-white">
                      <Shield className="h-6 w-6 mr-3" />
                      Seguridad de la Cuenta
                    </CardTitle>
                    <CardDescription className="text-red-100">
                      Gestiona la seguridad de tu cuenta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Lock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Cambiar contraseña</h4>
                          <p className="text-sm text-gray-600">Actualiza tu contraseña de seguridad</p>
                        </div>
                      </div>
                      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Cambiar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Cambiar Contraseña</DialogTitle>
                            <DialogDescription>
                              Ingresa tu contraseña actual y la nueva contraseña.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="currentPassword">Contraseña actual</Label>
                              <div className="relative">
                                <Input
                                  id="currentPassword"
                                  type={showPassword.current ? "text" : "password"}
                                  value={passwordForm.currentPassword}
                                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                  className="pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                                >
                                  {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="newPassword">Nueva contraseña</Label>
                              <div className="relative">
                                <Input
                                  id="newPassword"
                                  type={showPassword.new ? "text" : "password"}
                                  value={passwordForm.newPassword}
                                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                  className="pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                                >
                                  {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                              <div className="relative">
                                <Input
                                  id="confirmPassword"
                                  type={showPassword.confirm ? "text" : "password"}
                                  value={passwordForm.confirmPassword}
                                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                  className="pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                                >
                                  {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={handlePasswordChange}>
                              Cambiar Contraseña
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <Trash2 className="h-5 w-5 text-red-600" />
                        </div>
                      <div>
                          <h4 className="font-semibold">Eliminar cuenta</h4>
                          <p className="text-sm text-gray-600">Elimina permanentemente tu cuenta</p>
                        </div>
                      </div>
                      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Eliminar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>¿Estás seguro?</DialogTitle>
                            <DialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente tu cuenta y todos tus datos.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                              Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteAccount}>
                              Sí, eliminar cuenta
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <LogOut className="h-5 w-5 text-gray-600" />
                        </div>
                      <div>
                          <h4 className="font-semibold">Cerrar sesión</h4>
                          <p className="text-sm text-gray-600">Cierra tu sesión actual</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={logout}>
                        Cerrar Sesión
                      </Button>
                    </div>
                  </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
    </AuthGuard>
  )
}
