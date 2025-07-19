"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const auth_1 = require("@/lib/auth");
const db_1 = require("@/lib/db");
// Obtener carrito del usuario autenticado
async function GET(request) {
    var _a;
    try {
        const token = (_a = request.cookies.get('auth-token')) === null || _a === void 0 ? void 0 : _a.value;
        if (!token)
            return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        const user = (0, auth_1.verifyToken)(token);
        if (!user)
            return server_1.NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        const cartItems = await db_1.prisma.cartItem.findMany({
            where: { userId: user.id },
            include: { product: true },
            orderBy: { createdAt: 'asc' },
        });
        return server_1.NextResponse.json(cartItems);
    }
    catch (error) {
        return server_1.NextResponse.json({ error: 'Error al obtener carrito' }, { status: 500 });
    }
}
// Agregar producto al carrito
async function POST(request) {
    var _a;
    try {
        const token = (_a = request.cookies.get('auth-token')) === null || _a === void 0 ? void 0 : _a.value;
        if (!token)
            return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        const user = (0, auth_1.verifyToken)(token);
        if (!user)
            return server_1.NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        const { productId, quantity } = await request.json();
        if (!productId || typeof quantity !== 'number') {
            return server_1.NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
        }
        // Si ya existe, suma la cantidad
        const existing = await db_1.prisma.cartItem.findFirst({
            where: { userId: user.id, productId },
        });
        let cartItem;
        if (existing) {
            cartItem = await db_1.prisma.cartItem.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + quantity },
            });
        }
        else {
            cartItem = await db_1.prisma.cartItem.create({
                data: { userId: user.id, productId, quantity },
            });
        }
        return server_1.NextResponse.json(cartItem);
    }
    catch (error) {
        return server_1.NextResponse.json({ error: 'Error al agregar al carrito' }, { status: 500 });
    }
}
// Actualizar cantidad de un producto
async function PUT(request) {
    var _a;
    try {
        const token = (_a = request.cookies.get('auth-token')) === null || _a === void 0 ? void 0 : _a.value;
        if (!token)
            return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        const user = (0, auth_1.verifyToken)(token);
        if (!user)
            return server_1.NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        const { productId, quantity } = await request.json();
        if (!productId || typeof quantity !== 'number') {
            return server_1.NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
        }
        const cartItem = await db_1.prisma.cartItem.updateMany({
            where: { userId: user.id, productId },
            data: { quantity },
        });
        return server_1.NextResponse.json(cartItem);
    }
    catch (error) {
        return server_1.NextResponse.json({ error: 'Error al actualizar cantidad' }, { status: 500 });
    }
}
// Eliminar producto del carrito o limpiar carrito
async function DELETE(request) {
    var _a;
    try {
        const token = (_a = request.cookies.get('auth-token')) === null || _a === void 0 ? void 0 : _a.value;
        if (!token)
            return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        const user = (0, auth_1.verifyToken)(token);
        if (!user)
            return server_1.NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        const { productId } = await request.json();
        if (productId) {
            // Eliminar solo ese producto
            await db_1.prisma.cartItem.deleteMany({
                where: { userId: user.id, productId },
            });
        }
        else {
            // Limpiar todo el carrito
            await db_1.prisma.cartItem.deleteMany({ where: { userId: user.id } });
        }
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        return server_1.NextResponse.json({ error: 'Error al eliminar del carrito' }, { status: 500 });
    }
}
