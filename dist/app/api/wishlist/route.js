"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.DELETE = DELETE;
exports.PATCH = PATCH;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
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
// GET - Obtener wishlist del usuario
async function GET(request) {
    try {
        const user = verifyTokenFromCookies(request);
        if (!user) {
            return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        const wishlist = await db_1.prisma.wishlistItem.findMany({
            where: { userId: user.id },
            include: {
                product: true,
            },
            orderBy: { addedAt: 'desc' },
        });
        // Mapear a formato WishlistItem
        const mappedWishlist = wishlist.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            originalPrice: item.product.originalPrice,
            description: item.product.description,
            images: item.product.images,
            category: item.product.category,
            stock: item.product.stock,
            rating: 4.5, // TODO: Calcular rating real
            reviewCount: 0, // TODO: Obtener conteo real de reseñas
            featured: item.product.featured,
            isNew: item.product.isNew,
            discount: item.product.discount,
            addedAt: item.addedAt,
        }));
        return server_1.NextResponse.json(mappedWishlist);
    }
    catch (error) {
        console.error('Error fetching wishlist:', error);
        return server_1.NextResponse.json({ error: 'Error al obtener lista de deseos' }, { status: 500 });
    }
}
// POST - Agregar productos a wishlist
async function POST(request) {
    try {
        const user = verifyTokenFromCookies(request);
        if (!user) {
            return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        const wishlistItems = await request.json();
        // Agregar productos a la wishlist
        const addedItems = [];
        for (const item of wishlistItems) {
            // Verificar si ya existe
            const existing = await db_1.prisma.wishlistItem.findFirst({
                where: {
                    userId: user.id,
                    productId: item.id,
                },
            });
            if (!existing) {
                const wishlistItem = await db_1.prisma.wishlistItem.create({
                    data: {
                        userId: user.id,
                        productId: item.id,
                        addedAt: new Date(item.addedAt || Date.now()),
                    },
                    include: {
                        product: true,
                    },
                });
                addedItems.push(wishlistItem);
            }
        }
        return server_1.NextResponse.json({
            success: true,
            added: addedItems.length,
        });
    }
    catch (error) {
        console.error('Error adding to wishlist:', error);
        return server_1.NextResponse.json({ error: 'Error al agregar a lista de deseos' }, { status: 500 });
    }
}
// DELETE - Limpiar wishlist
async function DELETE(request) {
    try {
        const user = verifyTokenFromCookies(request);
        if (!user) {
            return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        await db_1.prisma.wishlistItem.deleteMany({
            where: { userId: user.id },
        });
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Error clearing wishlist:', error);
        return server_1.NextResponse.json({ error: 'Error al limpiar lista de deseos' }, { status: 500 });
    }
}
// PATCH - Eliminar producto específico de wishlist
async function PATCH(request) {
    try {
        const user = verifyTokenFromCookies(request);
        if (!user) {
            return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        const { productId } = await request.json();
        if (!productId) {
            return server_1.NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 });
        }
        await db_1.prisma.wishlistItem.deleteMany({
            where: {
                userId: user.id,
                productId: productId,
            },
        });
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Error removing from wishlist:', error);
        return server_1.NextResponse.json({ error: 'Error al eliminar de lista de deseos' }, { status: 500 });
    }
}
