"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("@/lib/auth");
const rate_limit_1 = require("@/lib/rate-limit");
async function POST(request) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed, retryAfter } = (0, rate_limit_1.rateLimit)(`register:${ip}`);
    if (!allowed) {
        return server_1.NextResponse.json({
            error: `Demasiados intentos. Intenta de nuevo en ${retryAfter} segundos.`,
        }, { status: 429 });
    }
    try {
        const { name, email, password } = await request.json();
        if (!name || !email || !password) {
            return server_1.NextResponse.json({ error: 'Nombre, email y contraseña son requeridos' }, { status: 400 });
        }
        if (password.length < 6) {
            return server_1.NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
        }
        // Verificar si el usuario ya existe
        const existingUser = await db_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return server_1.NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
        }
        // Hashear la contraseña
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Crear nuevo usuario
        const user = await db_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                isAdmin: false,
            },
        });
        const userPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
        };
        const token = (0, auth_1.generateToken)(userPayload);
        const response = server_1.NextResponse.json({
            message: 'Usuario registrado exitosamente',
            user: userPayload,
            token: token,
        });
        // Establecer cookie con el token
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 días
        });
        return response;
    }
    catch (error) {
        console.error('Registration error:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
