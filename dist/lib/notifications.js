"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
let prisma;
if (process.env.NODE_ENV === 'production') {
    prisma = new client_1.PrismaClient();
}
else {
    if (!global.prisma) {
        global.prisma = new client_1.PrismaClient();
    }
    prisma = global.prisma;
}
class NotificationService {
    // Crear una nueva notificación
    static async create(params) {
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId: params.userId,
                    type: params.type,
                    title: params.title,
                    message: params.message,
                    data: params.data || {},
                },
            });
            return notification;
        }
        catch (error) {
            console.error('Error creating notification:', error);
            const errorToThrow = error instanceof Error
                ? error
                : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            throw errorToThrow;
        }
    }
    // Obtener notificaciones de un usuario
    static async getUserNotifications(userId, limit = 20) {
        try {
            const notifications = await prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
            });
            return notifications;
        }
        catch (error) {
            console.error('Error fetching user notifications:', error);
            const errorToThrow = error instanceof Error
                ? error
                : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            throw errorToThrow;
        }
    }
    // Marcar notificación como leída
    static async markAsRead(notificationId) {
        try {
            const notification = await prisma.notification.update({
                where: { id: notificationId },
                data: { isRead: true },
            });
            return notification;
        }
        catch (error) {
            console.error('Error marking notification as read:', error);
            const errorToThrow = error instanceof Error
                ? error
                : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            throw errorToThrow;
        }
    }
    // Marcar todas las notificaciones como leídas
    static async markAllAsRead(userId) {
        try {
            await prisma.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true },
            });
        }
        catch (error) {
            console.error('Error marking all notifications as read:', error);
            const errorToThrow = error instanceof Error
                ? error
                : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            throw errorToThrow;
        }
    }
    // Obtener conteo de notificaciones no leídas
    static async getUnreadCount(userId) {
        try {
            const count = await prisma.notification.count({
                where: { userId, isRead: false },
            });
            return count;
        }
        catch (error) {
            console.error('Error getting unread count:', error);
            const errorToThrow = error instanceof Error
                ? error
                : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            throw errorToThrow;
        }
    }
    // Eliminar notificación
    static async delete(notificationId) {
        try {
            await prisma.notification.delete({
                where: { id: notificationId },
            });
        }
        catch (error) {
            console.error('Error deleting notification:', error);
            const errorToThrow = error instanceof Error
                ? error
                : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            throw errorToThrow;
        }
    }
    // Funciones específicas para diferentes tipos de notificaciones
    // Notificaciones de pedidos
    static async notifyOrderCreated(orderId, userId, amount) {
        return this.create({
            userId,
            type: 'order',
            title: 'Pedido Confirmado',
            message: `Tu pedido #${orderId.slice(-8)} ha sido confirmado. Total: $${amount.toFixed(2)}`,
            data: { orderId, amount },
        });
    }
    static async notifyOrderStatusChanged(orderId, userId, status) {
        const statusMessages = {
            processing: 'Tu pedido está siendo procesado',
            shipped: 'Tu pedido ha sido enviado',
            delivered: 'Tu pedido ha sido entregado',
            cancelled: 'Tu pedido ha sido cancelado',
        };
        return this.create({
            userId,
            type: 'order',
            title: 'Estado del Pedido Actualizado',
            message: statusMessages[status] ||
                `Estado actualizado a: ${status}`,
            data: { orderId, status },
        });
    }
    // Notificaciones de productos (para admin)
    static async notifyLowStock(productId, productName, currentStock) {
        // Obtener todos los usuarios admin
        const admins = await prisma.user.findMany({
            where: { isAdmin: true },
            select: { id: true },
        });
        const notifications = [];
        for (const admin of admins) {
            const notification = await this.create({
                userId: admin.id,
                type: 'product',
                title: 'Stock Bajo',
                message: `El producto "${productName}" tiene solo ${currentStock} unidades en stock`,
                data: { productId, currentStock },
            });
            notifications.push(notification);
        }
        return notifications;
    }
    static async notifyProductOutOfStock(productId, productName) {
        const admins = await prisma.user.findMany({
            where: { isAdmin: true },
            select: { id: true },
        });
        const notifications = [];
        for (const admin of admins) {
            const notification = await this.create({
                userId: admin.id,
                type: 'product',
                title: 'Producto Agotado',
                message: `El producto "${productName}" se ha agotado`,
                data: { productId },
            });
            notifications.push(notification);
        }
        return notifications;
    }
    // Notificaciones de usuario
    static async notifyWelcome(userId, userName) {
        return this.create({
            userId,
            type: 'user',
            title: '¡Bienvenido a Mautik!',
            message: `Hola ${userName}, gracias por registrarte en nuestra tienda`,
            data: { userName },
        });
    }
    static async notifyProfileUpdated(userId) {
        return this.create({
            userId,
            type: 'user',
            title: 'Perfil Actualizado',
            message: 'Tu perfil ha sido actualizado exitosamente',
        });
    }
    // Notificaciones de reseñas (para admin)
    static async notifyNewReview(reviewId, productName, rating) {
        const admins = await prisma.user.findMany({
            where: { isAdmin: true },
            select: { id: true },
        });
        const notifications = [];
        for (const admin of admins) {
            const notification = await this.create({
                userId: admin.id,
                type: 'user',
                title: 'Nueva Reseña',
                message: `Nueva reseña de ${rating} estrellas para "${productName}"`,
                data: { reviewId, rating, productName },
            });
            notifications.push(notification);
        }
        return notifications;
    }
    // Notificaciones del sistema
    static async notifySystem(userIds, title, message, data) {
        const notifications = [];
        for (const userId of userIds) {
            const notification = await this.create({
                userId,
                type: 'system',
                title,
                message,
                data,
            });
            notifications.push(notification);
        }
        return notifications;
    }
    // Notificar a todos los usuarios
    static async notifyAllUsers(title, message, data) {
        const users = await prisma.user.findMany({
            select: { id: true },
        });
        return this.notifySystem(users.map((user) => user.id), title, message, data);
    }
}
exports.NotificationService = NotificationService;
