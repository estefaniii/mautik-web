"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationBell = NotificationBell;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
const notification_context_1 = require("@/context/notification-context");
const use_toast_1 = require("@/hooks/use-toast");
function NotificationBell() {
    const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } = (0, notification_context_1.useNotifications)();
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const { toast } = (0, use_toast_1.useToast)();
    const handleMarkAsRead = async (notificationId, event) => {
        event.stopPropagation();
        try {
            await markAsRead(notificationId);
            toast({
                title: "Notificación marcada como leída",
                description: "La notificación se ha marcado como leída.",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "No se pudo marcar la notificación como leída.",
                variant: "destructive"
            });
        }
    };
    const handleDelete = async (notificationId, event) => {
        event.stopPropagation();
        try {
            await deleteNotification(notificationId);
            toast({
                title: "Notificación eliminada",
                description: "La notificación se ha eliminado.",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar la notificación.",
                variant: "destructive"
            });
        }
    };
    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            toast({
                title: "Todas marcadas como leídas",
                description: "Todas las notificaciones se han marcado como leídas.",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "No se pudieron marcar todas las notificaciones como leídas.",
                variant: "destructive"
            });
        }
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInHours * 60);
            return `Hace ${diffInMinutes} min`;
        }
        else if (diffInHours < 24) {
            return `Hace ${Math.floor(diffInHours)}h`;
        }
        else {
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            });
        }
    };
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'SUCCESS':
                return '✅';
            case 'ERROR':
                return '❌';
            case 'WARNING':
                return '⚠️';
            case 'INFO':
                return 'ℹ️';
            default:
                return '📢';
        }
    };
    return ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { open: isOpen, onOpenChange: setIsOpen, children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)("button", { className: "relative group flex items-center justify-center bg-transparent p-0 border-none shadow-none", "aria-label": "Notificaciones", style: { width: 24, height: 24 }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bell, { className: "h-6 w-6 text-purple-800 dark:text-purple-300 transition-colors group-hover:text-purple-700 dark:group-hover:text-purple-200" }), unreadCount > 0 && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "destructive", className: "absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center", children: unreadCount > 99 ? '99+' : unreadCount }))] }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-80 max-h-96 overflow-y-auto", children: [(0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuLabel, { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Notificaciones" }), unreadCount > 0 && ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: handleMarkAllAsRead, className: "h-6 px-2 text-xs", children: "Marcar todas como le\u00EDdas" }))] }), (0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuSeparator, {}), isLoading ? ((0, jsx_runtime_1.jsx)("div", { className: "p-4 text-center text-sm text-gray-500", children: "Cargando notificaciones..." })) : notifications.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "p-4 text-center text-sm text-gray-500", children: "No hay notificaciones" })) : (notifications.map((notification) => ((0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuItem, { className: `flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`, onClick: () => !notification.isRead && markAsRead(notification.id), children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between w-full", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-2 flex-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-lg", children: getNotificationIcon(notification.type) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "font-medium text-sm text-gray-900", children: notification.title }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-600 mt-1", children: notification.message }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-400 mt-1", children: formatDate(notification.createdAt) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1 ml-2", children: [!notification.isRead && ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: (e) => handleMarkAsRead(notification.id, e), className: "h-6 w-6 p-0", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Check, { className: "h-3 w-3" }) })), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: (e) => handleDelete(notification.id, e), className: "h-6 w-6 p-0 text-red-500 hover:text-red-700", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-3 w-3" }) })] })] }) }, notification.id))))] })] }));
}
