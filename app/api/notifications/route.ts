import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notifications';
import { getAuthUser } from '@/lib/auth';

// GET - Obtener notificaciones del usuario
export async function GET(request: NextRequest) {
	try {
		const user = await getAuthUser(request);

		if (!user) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get('limit') || '20');
		const unreadOnly = searchParams.get('unread') === 'true';

		let notifications;
		if (unreadOnly) {
			// Obtener solo notificaciones no leídas
			notifications = await NotificationService.getUserNotifications(
				user.id,
				limit,
			);
			notifications = notifications.filter((n) => !n.isRead);
		} else {
			// Obtener todas las notificaciones
			notifications = await NotificationService.getUserNotifications(
				user.id,
				limit,
			);
		}

		// Obtener conteo de no leídas
		const unreadCount = await NotificationService.getUnreadCount(user.id);

		return NextResponse.json({
			notifications,
			unreadCount,
		});
	} catch (error) {
		console.error('Error fetching notifications:', error);
		return NextResponse.json(
			{ error: 'Error al obtener notificaciones' },
			{ status: 500 },
		);
	}
}

// POST - Marcar notificación como leída
export async function POST(request: NextRequest) {
	try {
		const user = await getAuthUser(request);

		if (!user) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}

		const { action, notificationId } = await request.json();

		switch (action) {
			case 'markAsRead':
				if (!notificationId) {
					return NextResponse.json(
						{ error: 'ID de notificación requerido' },
						{ status: 400 },
					);
				}
				await NotificationService.markAsRead(notificationId);
				break;

			case 'markAllAsRead':
				await NotificationService.markAllAsRead(user.id);
				break;

			case 'delete':
				if (!notificationId) {
					return NextResponse.json(
						{ error: 'ID de notificación requerido' },
						{ status: 400 },
					);
				}
				await NotificationService.delete(notificationId);
				break;

			default:
				return NextResponse.json(
					{ error: 'Acción no válida' },
					{ status: 400 },
				);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error updating notification:', error);
		return NextResponse.json(
			{ error: 'Error al actualizar notificación' },
			{ status: 500 },
		);
	}
}
