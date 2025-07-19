"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
async function POST() {
    try {
        const response = server_1.NextResponse.json({
            message: 'Logout exitoso',
        });
        // Eliminar la cookie de autenticación
        response.cookies.set('auth-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0, // Expirar inmediatamente
        });
        return response;
    }
    catch (error) {
        console.error('Logout error:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
