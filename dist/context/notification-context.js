"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationProvider = NotificationProvider;
exports.useNotifications = useNotifications;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const auth_context_1 = require("./auth-context");
const NotificationContext = (0, react_1.createContext)(undefined);
function NotificationProvider({ children }) {
    const { user, isAuthenticated } = (0, auth_context_1.useAuth)();
    const [notifications, setNotifications] = (0, react_1.useState)([]);
    const [unreadCount, setUnreadCount] = (0, react_1.useState)(0);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const fetchNotifications = async () => {
        if (!isAuthenticated)
            return;
        setIsLoading(true);
        try {
            const response = await fetch('/api/notifications?limit=50', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        }
        catch (error) {
            console.error('Error fetching notifications:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    action: 'markAsRead',
                    notificationId,
                }),
            });
            if (response.ok) {
                setNotifications(prev => prev.map(notification => notification.id === notificationId
                    ? Object.assign(Object.assign({}, notification), { isRead: true }) : notification));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        }
        catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };
    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    action: 'markAllAsRead',
                }),
            });
            if (response.ok) {
                setNotifications(prev => prev.map(notification => (Object.assign(Object.assign({}, notification), { isRead: true }))));
                setUnreadCount(0);
            }
        }
        catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };
    const deleteNotification = async (notificationId) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    action: 'delete',
                    notificationId,
                }),
            });
            if (response.ok) {
                const notification = notifications.find(n => n.id === notificationId);
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
                if (notification && !notification.isRead) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            }
        }
        catch (error) {
            console.error('Error deleting notification:', error);
        }
    };
    const refreshUnreadCount = async () => {
        if (!isAuthenticated)
            return;
        try {
            const response = await fetch('/api/notifications?limit=1', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.unreadCount);
            }
        }
        catch (error) {
            console.error('Error refreshing unread count:', error);
        }
    };
    // Cargar notificaciones cuando el usuario se autentica
    (0, react_1.useEffect)(() => {
        if (isAuthenticated) {
            fetchNotifications();
        }
        else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [isAuthenticated]);
    // Actualizar conteo de no leídas cada 30 segundos
    (0, react_1.useEffect)(() => {
        if (!isAuthenticated)
            return;
        const interval = setInterval(() => {
            refreshUnreadCount();
        }, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);
    const value = {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshUnreadCount,
    };
    return ((0, jsx_runtime_1.jsx)(NotificationContext.Provider, { value: value, children: children }));
}
function useNotifications() {
    const context = (0, react_1.useContext)(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
