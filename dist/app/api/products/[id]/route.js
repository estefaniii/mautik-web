"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.DELETE = DELETE;
exports.PUT = PUT;
// Uso de 'params' actualizado para Next.js 13+ API routes
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
async function GET(request, context) {
    try {
        const { params } = context;
        const { id } = params;
        const product = await db_1.prisma.product.findUnique({ where: { id } });
        if (!product) {
            return server_1.NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
        }
        return server_1.NextResponse.json({ product });
    }
    catch (error) {
        console.error('Error obteniendo producto:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
async function DELETE(request, context) {
    try {
        const { params } = context;
        const { id } = params;
        const deleted = await db_1.prisma.product.delete({ where: { id } });
        return server_1.NextResponse.json({ success: true, deleted });
    }
    catch (error) {
        console.error('Error eliminando producto:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
async function PUT(request, context) {
    var _a, _b;
    try {
        const { params } = context;
        const { id } = params;
        const data = await request.json();
        // Eliminar cualquier campo id del payload para evitar cambios de ID
        delete data.id;
        // Validaciones básicas
        if (!data.name ||
            typeof data.name !== 'string' ||
            data.name.trim().length < 3) {
            return server_1.NextResponse.json({
                error: 'El nombre del producto es obligatorio y debe tener al menos 3 caracteres.',
            }, { status: 400 });
        }
        if (!data.description ||
            typeof data.description !== 'string' ||
            data.description.trim().length < 10) {
            return server_1.NextResponse.json({
                error: 'La descripción es obligatoria y debe tener al menos 10 caracteres.',
            }, { status: 400 });
        }
        if (typeof data.price !== 'number' || data.price < 0) {
            return server_1.NextResponse.json({
                error: 'El precio es obligatorio y debe ser un número mayor o igual a 0.',
            }, { status: 400 });
        }
        if (!data.category || typeof data.category !== 'string') {
            return server_1.NextResponse.json({ error: 'La categoría es obligatoria.' }, { status: 400 });
        }
        if (!Array.isArray(data.images) || data.images.length === 0) {
            return server_1.NextResponse.json({ error: 'Debes subir al menos una imagen.' }, { status: 400 });
        }
        if (typeof data.stock !== 'number' || data.stock < 0) {
            return server_1.NextResponse.json({
                error: 'El stock es obligatorio y debe ser un número mayor o igual a 0.',
            }, { status: 400 });
        }
        if (!data.sku ||
            typeof data.sku !== 'string' ||
            data.sku.trim().length < 3) {
            return server_1.NextResponse.json({ error: 'El SKU es obligatorio y debe tener al menos 3 caracteres.' }, { status: 400 });
        }
        // Validar unicidad de SKU (excepto para el mismo producto)
        const existingSku = await db_1.prisma.product.findFirst({
            where: { sku: data.sku, NOT: { id } },
        });
        if (existingSku) {
            return server_1.NextResponse.json({ error: 'El SKU ya existe. Debe ser único.' }, { status: 400 });
        }
        const updated = await db_1.prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                stock: data.stock,
                images: data.images,
                category: data.category,
                sku: data.sku,
                originalPrice: data.originalPrice,
                featured: !!data.featured,
                isNew: !!data.isNew,
                discount: data.discount,
            },
        });
        return server_1.NextResponse.json({
            message: 'Producto actualizado exitosamente',
            product: updated,
        });
    }
    catch (error) {
        console.error('Error actualizando producto:', error);
        if (error.code === 'P2002' && ((_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.includes('sku'))) {
            return server_1.NextResponse.json({ error: 'El SKU ya existe. Debe ser único.' }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
    }
}
