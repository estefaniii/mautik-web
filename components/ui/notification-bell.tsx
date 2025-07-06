"use client"

import { useState } from "react"
import { Bell, Check, X, Package, Star, Heart, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Notification {
  id: number
  type: "order" | "review" | "favorite" | "message"
  title: string
  message: string
  time: string
  read: boolean
  icon?: React.ReactNode
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "order",
    title: "Pedido Enviado",
    message: "Tu pedido #12345 ha sido enviado y llegará en 2-3 días.",
    time: "Hace 2 horas",
    read: false,
    icon: <Package className="h-4 w-4" />
  },
  {
    id: 2,
    type: "review",
    title: "Reseña Publicada",
    message: "Tu reseña sobre el Anillo de Diamante ha sido publicada.",
    time: "Hace 1 día",
    read: false,
    icon: <Star className="h-4 w-4" />
  },
  {
    id: 3,
    type: "favorite",
    title: "Producto en Oferta",
    message: "La Pulsera de Plata que tienes en favoritos ahora tiene 20% de descuento.",
    time: "Hace 2 días",
    read: true,
    icon: <Heart className="h-4 w-4" />
  },
  {
    id: 4,
    type: "message",
    title: "Soporte al Cliente",
    message: "Hemos respondido a tu consulta sobre el envío.",
    time: "Hace 3 días",
    read: true,
    icon: <MessageCircle className="h-4 w-4" />
  }
]

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-4 w-4 text-blue-500" />
      case "review":
        return <Star className="h-4 w-4 text-yellow-500" />
      case "favorite":
        return <Heart className="h-4 w-4 text-red-500" />
      case "message":
        return <MessageCircle className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-blue-50 border-blue-200"
      case "review":
        return "bg-yellow-50 border-yellow-200"
      case "favorite":
        return "bg-red-50 border-red-200"
      case "message":
        return "bg-green-50 border-green-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative group flex items-center justify-center bg-transparent p-0 border-none shadow-none" aria-label="Notificaciones" style={{ width: 24, height: 24 }}>
          <Bell className="h-6 w-6 text-purple-800 dark:text-purple-300 transition-colors group-hover:text-purple-700 dark:group-hover:text-purple-200" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-purple-800 dark:bg-purple-700"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-6 px-2 text-xs"
            >
              Marcar todas como leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-4 text-gray-300" />
            <p>No tienes notificaciones</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="p-0">
              <div className={`w-full p-3 border-l-4 ${getNotificationColor(notification.type)} ${
                !notification.read ? "bg-opacity-100" : "bg-opacity-50"
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-600"}`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-purple-600 hover:text-purple-700">
              Ver todas las notificaciones
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
