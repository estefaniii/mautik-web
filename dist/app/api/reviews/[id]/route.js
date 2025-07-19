"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const auth_1 = require("@/lib/auth");
// Uso de 'params' actualizado para Next.js 13+ API routes
// PUT - Actualizar una reseña
async function PUT(request, context) {
    var _a;
    try {
        const { params } = context;
        const { id } = params;
        const body = await request.json();
        const { rating, comment } = body;
        // Validar campos requeridos
        if (!rating || !comment) {
            return server_1.NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
        }
        if (rating < 1 || rating > 5) {
            return server_1.NextResponse.json({ error: 'La calificación debe estar entre 1 y 5' }, { status: 400 });
        }
        // Verificar autenticación
        const token = (_a = request.headers.get('authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            return server_1.NextResponse.json({ error: 'Token de autenticación requerido' }, { status: 401 });
        }
        const decoded = (0, auth_1.verifyToken)(token);
        if (!decoded) {
            return server_1.NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }
        // Buscar la reseña y verificar que pertenece al usuario
        const review = await db_1.prisma.review.findUnique({ where: { id } });
        if (!review) {
            return server_1.NextResponse.json({ error: 'Reseña no encontrada' }, { status: 404 });
        }
        if (review.userId !== decoded.id) {
            return server_1.NextResponse.json({ error: 'No tienes permisos para editar esta reseña' }, { status: 403 });
        }
        // Actualizar la reseña
        const updatedReview = await db_1.prisma.review.update({
            where: { id },
            data: {
                rating,
                comment,
                updatedAt: new Date(),
            },
            include: { user: { select: { id: true, name: true, avatar: true } } },
        });
        return server_1.NextResponse.json({
            review: updatedReview,
            message: 'Reseña actualizada exitosamente',
        });
    }
    catch (error) {
        console.error('Error actualizando reseña:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
// DELETE - Eliminar una reseña
async function DELETE(request, context) {
    var _a;
    try {
        const { params } = context;
        const { id } = params;
        // Verificar autenticación
        const token = (_a = request.headers.get('authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            return server_1.NextResponse.json({ error: 'Token de autenticación requerido' }, { status: 401 });
        }
        const decoded = (0, auth_1.verifyToken)(token);
        if (!decoded) {
            return server_1.NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }
        // Buscar la reseña y verificar que pertenece al usuario
        const review = await db_1.prisma.review.findUnique({ where: { id } });
        if (!review) {
            return server_1.NextResponse.json({ error: 'Reseña no encontrada' }, { status: 404 });
        }
        if (review.userId !== decoded.id) {
            return server_1.NextResponse.json({ error: 'No tienes permisos para eliminar esta reseña' }, { status: 403 });
        }
        // Eliminar la reseña
        await db_1.prisma.review.delete({ where: { id } });
        return server_1.NextResponse.json({
            message: 'Reseña eliminada exitosamente',
        });
    }
    catch (error) {
        console.error('Error eliminando reseña:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
