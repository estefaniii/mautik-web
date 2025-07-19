"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const auth_1 = require("@/lib/auth");
const db_1 = require("@/lib/db");
async function GET(request) {
    var _a;
    try {
        // Obtener el token de las cookies
        const token = (_a = request.cookies.get('auth-token')) === null || _a === void 0 ? void 0 : _a.value;
        if (!token) {
            return server_1.NextResponse.json({
                isAuthenticated: false,
                message: 'No token found',
            });
        }
        // Verificar el token
        const userPayload = (0, auth_1.verifyToken)(token);
        if (!userPayload) {
            return server_1.NextResponse.json({
                isAuthenticated: false,
                message: 'Invalid token',
            });
        }
        // Buscar el usuario en la base de datos
        const user = await db_1.prisma.user.findUnique({
            where: {
                id: userPayload.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                isAdmin: true,
                avatar: true,
                address: true,
                phone: true,
            },
        });
        if (!user) {
            return server_1.NextResponse.json({
                isAuthenticated: false,
                message: 'User not found',
            });
        }
        return server_1.NextResponse.json({
            isAuthenticated: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                avatar: user.avatar,
                address: user.address,
                phone: user.phone,
            },
        });
    }
    catch (error) {
        const err = error;
        console.error('Auth check error:', (err === null || err === void 0 ? void 0 : err.message) || 'Unknown error');
        return server_1.NextResponse.json({
            isAuthenticated: false,
            message: 'Server error',
        }, { status: 500 });
    }
}
