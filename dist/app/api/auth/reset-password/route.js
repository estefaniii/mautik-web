"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const rate_limit_1 = require("@/lib/rate-limit");
async function POST(request) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed, retryAfter } = (0, rate_limit_1.rateLimit)(`reset:${ip}`);
    if (!allowed) {
        return server_1.NextResponse.json({
            error: `Demasiados intentos. Intenta de nuevo en ${retryAfter} segundos.`,
        }, { status: 429 });
    }
    try {
        const { token, password } = await request.json();
        if (!token || !password) {
            return server_1.NextResponse.json({ error: 'Token y nueva contraseña requeridos' }, { status: 400 });
        }
        if (password.length < 6) {
            return server_1.NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
        }
        const user = await db_1.prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordTokenExpiry: { gte: new Date() },
            },
        });
        if (!user) {
            return server_1.NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 });
        }
        const hashed = await bcryptjs_1.default.hash(password, 12);
        await db_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashed,
                resetPasswordToken: null,
                resetPasswordTokenExpiry: null,
            },
        });
        return server_1.NextResponse.json({
            message: 'Contraseña restablecida exitosamente',
        });
    }
    catch (error) {
        console.error('Error en reset-password:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
