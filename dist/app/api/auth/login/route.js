"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const auth_1 = require("@/lib/auth");
const rate_limit_1 = require("@/lib/rate-limit");
// Elimina toda la lógica de localUsers y fallback a datos locales. Solo usa Prisma.
async function POST(request) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed, retryAfter } = (0, rate_limit_1.rateLimit)(`login:${ip}`);
    if (!allowed) {
        return server_1.NextResponse.json({
            error: `Demasiados intentos. Intenta de nuevo en ${retryAfter} segundos.`,
        }, { status: 429 });
    }
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return server_1.NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
        }
        try {
            // Intentar conectar a MongoDB Atlas
            // Elimina: await connectDB();
            const result = await (0, auth_1.authenticateUser)(email, password);
            if (!result.success) {
                return server_1.NextResponse.json({ error: result.error }, { status: 401 });
            }
            const response = server_1.NextResponse.json({
                message: 'Login exitoso',
                user: result.user,
                token: result.token,
            });
            // Establecer cookie con el token
            if (result.token) {
                response.cookies.set('auth-token', result.token, {
                    httpOnly: false, // Cambiado a false temporalmente para debug
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60, // 7 días
                });
            }
            return response;
        }
        catch (error) {
            console.error('Login error:', error);
            return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
        }
    }
    catch (error) {
        console.error('Login error:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
