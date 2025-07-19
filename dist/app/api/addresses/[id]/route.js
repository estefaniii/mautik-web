"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = PUT;
exports.DELETE = DELETE;
exports.PATCH = PATCH;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const auth_1 = require("@/lib/auth");
// Uso de 'params' actualizado para Next.js 13+ API routes
function getTokenFromRequest(request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.replace('Bearer ', '');
    }
    const cookies = request.cookies;
    const tokenCookie = cookies.get('auth-token');
    return (tokenCookie === null || tokenCookie === void 0 ? void 0 : tokenCookie.value) || null;
}
// PUT: Editar dirección
async function PUT(request, context) {
    const { params } = context;
    const { id } = params;
    const token = getTokenFromRequest(request);
    if (!token)
        return server_1.NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const decoded = (0, auth_1.verifyToken)(token);
    if (!decoded)
        return server_1.NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    const userId = decoded.id;
    const body = await request.json();
    const address = await db_1.prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) {
        return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const updated = await db_1.prisma.address.update({
        where: { id },
        data: Object.assign({}, body),
    });
    // Si se marca como default, quitar default de las demás
    if (updated.isDefault) {
        await db_1.prisma.address.updateMany({
            where: { userId, id: { not: updated.id } },
            data: { isDefault: false },
        });
    }
    return server_1.NextResponse.json(updated);
}
// DELETE: Eliminar dirección
async function DELETE(request, { params }) {
    const token = getTokenFromRequest(request);
    if (!token)
        return server_1.NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const decoded = (0, auth_1.verifyToken)(token);
    if (!decoded)
        return server_1.NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    const userId = decoded.id;
    const { id } = params;
    const address = await db_1.prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) {
        return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    await db_1.prisma.address.delete({ where: { id } });
    return server_1.NextResponse.json({ success: true });
}
// PATCH: Marcar como predeterminada
async function PATCH(request, { params }) {
    const token = getTokenFromRequest(request);
    if (!token)
        return server_1.NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const decoded = (0, auth_1.verifyToken)(token);
    if (!decoded)
        return server_1.NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    const userId = decoded.id;
    const { id } = params;
    const address = await db_1.prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) {
        return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    // Marcar esta como default y las demás como no default
    await db_1.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
    });
    const updated = await db_1.prisma.address.update({
        where: { id },
        data: { isDefault: true },
    });
    return server_1.NextResponse.json(updated);
}
