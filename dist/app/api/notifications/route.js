"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const notifications_1 = require("@/lib/notifications");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
// Función para verificar el token JWT desde las cookies
const verifyTokenFromCookies = (request) => {
    var _a;
    try {
        const authToken = (_a = request.cookies.get('auth-token')) === null || _a === void 0 ? void 0 : _a.value;
        if (!authToken) {
            return null;
        }
        const decoded = jsonwebtoken_1.default.verify(authToken, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
};
// GET - Obtener notificaciones del usuario
async function GET(request) {
    try {
        const user = verifyTokenFromCookies(request);
        if (!user) {
            return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const unreadOnly = searchParams.get('unread') === 'true';
        let notifications;
        if (unreadOnly) {
            // Obtener solo notificaciones no leídas
            notifications = await notifications_1.NotificationService.getUserNotifications(user.id, limit);
            notifications = notifications.filter((n) => !n.isRead);
        }
        else {
            // Obtener todas las notificaciones
            notifications = await notifications_1.NotificationService.getUserNotifications(user.id, limit);
        }
        // Obtener conteo de no leídas
        const unreadCount = await notifications_1.NotificationService.getUnreadCount(user.id);
        return server_1.NextResponse.json({
            notifications,
            unreadCount,
        });
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        return server_1.NextResponse.json({ error: 'Error al obtener notificaciones' }, { status: 500 });
    }
}
// POST - Marcar notificación como leída
async function POST(request) {
    try {
        const user = verifyTokenFromCookies(request);
        if (!user) {
            return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        const { action, notificationId } = await request.json();
        switch (action) {
            case 'markAsRead':
                if (!notificationId) {
                    return server_1.NextResponse.json({ error: 'ID de notificación requerido' }, { status: 400 });
                }
                await notifications_1.NotificationService.markAsRead(notificationId);
                break;
            case 'markAllAsRead':
                await notifications_1.NotificationService.markAllAsRead(user.id);
                break;
            case 'delete':
                if (!notificationId) {
                    return server_1.NextResponse.json({ error: 'ID de notificación requerido' }, { status: 400 });
                }
                await notifications_1.NotificationService.delete(notificationId);
                break;
            default:
                return server_1.NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
        }
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Error updating notification:', error);
        return server_1.NextResponse.json({ error: 'Error al actualizar notificación' }, { status: 500 });
    }
}
