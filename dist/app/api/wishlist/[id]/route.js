"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = DELETE;
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
// Uso de 'params' actualizado para Next.js 13+ API routes
// DELETE - Remover producto específico de wishlist
async function DELETE(request, context) {
    try {
        const user = verifyTokenFromCookies(request);
        if (!user) {
            return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        const productId = context.params.id;
        // Verificar que el producto existe
        const product = await db_1.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            return server_1.NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
        }
        // Eliminar de wishlist
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
        return server_1.NextResponse.json({ error: 'Error al remover de lista de deseos' }, { status: 500 });
    }
}
