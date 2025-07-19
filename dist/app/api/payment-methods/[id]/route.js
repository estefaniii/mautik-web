"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = PUT;
exports.DELETE = DELETE;
// Uso de 'params' actualizado para Next.js 13+ API routes
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const auth_1 = require("@/lib/auth");
function getTokenFromRequest(request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.replace('Bearer ', '');
    }
    const cookies = request.cookies;
    const tokenCookie = cookies.get('auth-token');
    return (tokenCookie === null || tokenCookie === void 0 ? void 0 : tokenCookie.value) || null;
}
// PUT: Editar método de pago
async function PUT(request, context) {
    try {
        const token = getTokenFromRequest(request);
        if (!token)
            return server_1.NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        const decoded = (0, auth_1.verifyToken)(token);
        if (!decoded)
            return server_1.NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        const userId = decoded.id;
        const { params } = context;
        const { id } = params;
        const body = await request.json();
        // Verificar que el método pertenece al usuario
        const method = await db_1.prisma.paymentMethod.findUnique({ where: { id } });
        if (!method || method.userId !== userId) {
            return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        }
        const { type, brand, last4, expMonth, expYear, stripePaymentMethodId, isDefault, } = body;
        const updated = await db_1.prisma.paymentMethod.update({
            where: { id },
            data: {
                type,
                brand,
                last4,
                expMonth,
                expYear,
                stripePaymentMethodId,
                isDefault: !!isDefault,
            },
        });
        // Si se marca como default, quitar default de los demás
        if (updated.isDefault) {
            await db_1.prisma.paymentMethod.updateMany({
                where: { userId, id: { not: updated.id } },
                data: { isDefault: false },
            });
        }
        return server_1.NextResponse.json(updated);
    }
    catch (error) {
        console.error('Error PUT payment method:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
// DELETE: Eliminar método de pago
async function DELETE(request, context) {
    try {
        const token = getTokenFromRequest(request);
        if (!token)
            return server_1.NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        const decoded = (0, auth_1.verifyToken)(token);
        if (!decoded)
            return server_1.NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        const userId = decoded.id;
        const { params } = context;
        const { id } = params;
        // Verificar que el método pertenece al usuario
        const method = await db_1.prisma.paymentMethod.findUnique({ where: { id } });
        if (!method || method.userId !== userId) {
            return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        }
        await db_1.prisma.paymentMethod.delete({ where: { id } });
        // Si era default y quedan otros, poner el primero como default
        if (method.isDefault) {
            const next = await db_1.prisma.paymentMethod.findFirst({
                where: { userId },
                orderBy: { createdAt: 'asc' },
            });
            if (next) {
                await db_1.prisma.paymentMethod.update({
                    where: { id: next.id },
                    data: { isDefault: true },
                });
            }
        }
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Error DELETE payment method:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
