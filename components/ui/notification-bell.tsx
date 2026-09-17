"use client"

import { useState } from 'react'
import { Bell, Check, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotifications } from '@/context/notification-context'
import { useToast } from '@/hooks/use-toast'

export function NotificationBell() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleMarkAsRead = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await markAsRead(notificationId)
      toast({
        title: "Notificación marcada como leída",
        description: "La notificación se ha marcado como leída.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo marcar la notificación como leída.",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await deleteNotification(notificationId)
      toast({
        title: "Notificación eliminada",
        description: "La notificación se ha eliminado.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la notificación.",
        variant: "destructive"
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast({
        title: "Todas marcadas como leídas",
        description: "Todas las notificaciones se han marcado como leídas.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron marcar todas las notificaciones como leídas.",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `Hace ${diffInMinutes} min`
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)}h`
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return '✅'
      case 'ERROR':
        return '❌'
      case 'WARNING':
        return '⚠️'
      case 'INFO':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {/*
          44x44 de área de toque: el botón medía 24x24 por un `style` en línea,
          bastante por debajo del mínimo recomendado para el dedo. El ícono
          sigue igual de grande; lo que crece es la zona que responde.
        */}
        <button
          className="group relative grid h-11 w-11 place-items-center rounded-full border-none bg-transparent p-0 shadow-none transition-colors hover:bg-purple-50 dark:hover:bg-white/10"
          aria-label="Notificaciones"
        >
          <Bell className="h-6 w-6 text-purple-800 dark:text-purple-300 transition-colors group-hover:text-purple-700 dark:group-hover:text-purple-200" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      {/*
        El marco venía con el borde duro que trae el componente por defecto y
        se veía como una caja pegada sobre la página. Se suaviza: esquinas más
        redondas, borde apenas insinuado y una sombra difusa en vez de línea.
      */}
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-80 max-h-96 overflow-y-auto rounded-2xl border-purple-100/70 p-1.5 shadow-[0_12px_40px_rgba(24,10,48,0.14)] dark:border-white/10"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-6 px-2 text-xs"
            >
              Marcar todas como leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-purple-100/60">
            Cargando notificaciones...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-purple-100/60">
            No hay notificaciones
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start p-3 cursor-pointer hover:bg-purple-50 dark:hover:bg-white/5 ${
                !notification.isRead ? 'bg-blue-50' : ''
              }`}
              onClick={() => !notification.isRead && markAsRead(notification.id)}
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex items-start gap-2 flex-1">
                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900">
                      {notification.title}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {notification.message}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDate(notification.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="h-6 w-6 p-0"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                    onClick={(e) => handleDelete(notification.id, e)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                          </Button>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
