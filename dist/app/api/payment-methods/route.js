"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const auth_1 = require("@/lib/auth");
// Helper para obtener el token del request
function getTokenFromRequest(request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.replace('Bearer ', '');
    }
    const cookies = request.cookies;
    const tokenCookie = cookies.get('auth-token');
    return (tokenCookie === null || tokenCookie === void 0 ? void 0 : tokenCookie.value) || null;
}
// GET: Listar métodos de pago del usuario autenticado
async function GET(request) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) {
            return server_1.NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }
        const decoded = (0, auth_1.verifyToken)(token);
        if (!decoded) {
            return server_1.NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }
        const userId = decoded.id;
        const methods = await db_1.prisma.paymentMethod.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        });
        return server_1.NextResponse.json(methods);
    }
    catch (error) {
        console.error('Error GET payment methods:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
// POST: Agregar un método de pago
async function POST(request) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) {
            return server_1.NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }
        const decoded = (0, auth_1.verifyToken)(token);
        if (!decoded) {
            return server_1.NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }
        const userId = decoded.id;
        const body = await request.json();
        const { type, brand, last4, expMonth, expYear, stripePaymentMethodId, isDefault, } = body;
        // Si es el primer método, ponerlo como default
        const count = await db_1.prisma.paymentMethod.count({ where: { userId } });
        const paymentMethod = await db_1.prisma.paymentMethod.create({
            data: {
                userId,
                type,
                brand,
                last4,
                expMonth,
                expYear,
                stripePaymentMethodId,
                isDefault: count === 0 ? true : !!isDefault,
            },
        });
        // Si se marca como default, quitar default de los demás
        if (paymentMethod.isDefault) {
            await db_1.prisma.paymentMethod.updateMany({
                where: { userId, id: { not: paymentMethod.id } },
                data: { isDefault: false },
            });
        }
        return server_1.NextResponse.json(paymentMethod, { status: 201 });
    }
    catch (error) {
        console.error('Error POST payment method:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
