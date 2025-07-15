import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
	prisma = new PrismaClient();
} else {
	if (!(global as any).prisma) {
		(global as any).prisma = new PrismaClient();
	}
	prisma = (global as any).prisma;
}

export interface NotificationData {
	orderId?: string;
	productId?: string;
	reviewId?: string;
	status?: string;
	amount?: number;
	[key: string]: any;
}

export interface CreateNotificationParams {
	userId: string;
	type: 'order' | 'product' | 'user' | 'system';
	title: string;
	message: string;
	data?: NotificationData;
}

export class NotificationService {
	// Crear una nueva notificación
	static async create(params: CreateNotificationParams) {
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
		} catch (error) {
			console.error('Error creating notification:', error);
			const errorToThrow =
				error instanceof Error
					? error
					: new Error(
							typeof error === 'string' ? error : JSON.stringify(error),
					  );
			throw errorToThrow;
		}
	}

	// Obtener notificaciones de un usuario
	static async getUserNotifications(userId: string, limit = 20) {
		try {
			const notifications = await prisma.notification.findMany({
				where: { userId },
				orderBy: { createdAt: 'desc' },
				take: limit,
			});

			return notifications;
		} catch (error) {
			console.error('Error fetching user notifications:', error);
			const errorToThrow =
				error instanceof Error
					? error
					: new Error(
							typeof error === 'string' ? error : JSON.stringify(error),
					  );
			throw errorToThrow;
		}
	}

	// Marcar notificación como leída
	static async markAsRead(notificationId: string) {
		try {
			const notification = await prisma.notification.update({
				where: { id: notificationId },
				data: { isRead: true },
			});

			return notification;
		} catch (error) {
			console.error('Error marking notification as read:', error);
			const errorToThrow =
				error instanceof Error
					? error
					: new Error(
							typeof error === 'string' ? error : JSON.stringify(error),
					  );
			throw errorToThrow;
		}
	}

	// Marcar todas las notificaciones como leídas
	static async markAllAsRead(userId: string) {
		try {
			await prisma.notification.updateMany({
				where: { userId, isRead: false },
				data: { isRead: true },
			});
		} catch (error) {
			console.error('Error marking all notifications as read:', error);
			const errorToThrow =
				error instanceof Error
					? error
					: new Error(
							typeof error === 'string' ? error : JSON.stringify(error),
					  );
			throw errorToThrow;
		}
	}

	// Obtener conteo de notificaciones no leídas
	static async getUnreadCount(userId: string) {
		try {
			const count = await prisma.notification.count({
				where: { userId, isRead: false },
			});

			return count;
		} catch (error) {
			console.error('Error getting unread count:', error);
			const errorToThrow =
				error instanceof Error
					? error
					: new Error(
							typeof error === 'string' ? error : JSON.stringify(error),
					  );
			throw errorToThrow;
		}
	}

	// Eliminar notificación
	static async delete(notificationId: string) {
		try {
			await prisma.notification.delete({
				where: { id: notificationId },
			});
		} catch (error) {
			console.error('Error deleting notification:', error);
			const errorToThrow =
				error instanceof Error
					? error
					: new Error(
							typeof error === 'string' ? error : JSON.stringify(error),
					  );
			throw errorToThrow;
		}
	}

	// Funciones específicas para diferentes tipos de notificaciones

	// Notificaciones de pedidos
	static async notifyOrderCreated(
		orderId: string,
		userId: string,
		amount: number,
	) {
		return this.create({
			userId,
			type: 'order',
			title: 'Pedido Confirmado',
			message: `Tu pedido #${orderId.slice(
				-8,
			)} ha sido confirmado. Total: $${amount.toFixed(2)}`,
			data: { orderId, amount },
		});
	}

	static async notifyOrderStatusChanged(
		orderId: string,
		userId: string,
		status: string,
	) {
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
			message:
				statusMessages[status as keyof typeof statusMessages] ||
				`Estado actualizado a: ${status}`,
			data: { orderId, status },
		});
	}

	// Notificaciones de productos (para admin)
	static async notifyLowStock(
		productId: string,
		productName: string,
		currentStock: number,
	) {
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

	static async notifyProductOutOfStock(productId: string, productName: string) {
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
	static async notifyWelcome(userId: string, userName: string) {
		return this.create({
			userId,
			type: 'user',
			title: '¡Bienvenido a Mautik!',
			message: `Hola ${userName}, gracias por registrarte en nuestra tienda`,
			data: { userName },
		});
	}

	static async notifyProfileUpdated(userId: string) {
		return this.create({
			userId,
			type: 'user',
			title: 'Perfil Actualizado',
			message: 'Tu perfil ha sido actualizado exitosamente',
		});
	}

	// Notificaciones de reseñas (para admin)
	static async notifyNewReview(
		reviewId: string,
		productName: string,
		rating: number,
	) {
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
	static async notifySystem(
		userIds: string[],
		title: string,
		message: string,
		data?: NotificationData,
	) {
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
	static async notifyAllUsers(
		title: string,
		message: string,
		data?: NotificationData,
	) {
		const users = await prisma.user.findMany({
			select: { id: true },
		});

		return this.notifySystem(
			users.map((user) => user.id),
			title,
			message,
			data,
		);
	}
}
