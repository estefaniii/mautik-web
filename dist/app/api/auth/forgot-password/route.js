"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const resend_1 = require("resend");
const crypto_1 = __importDefault(require("crypto"));
const rate_limit_1 = require("@/lib/rate-limit");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
async function POST(request) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed, retryAfter } = (0, rate_limit_1.rateLimit)(`forgot:${ip}`);
    if (!allowed) {
        return server_1.NextResponse.json({
            error: `Demasiados intentos. Intenta de nuevo en ${retryAfter} segundos.`,
        }, { status: 429 });
    }
    try {
        const { email } = await request.json();
        if (!email) {
            return server_1.NextResponse.json({ error: 'Email requerido' }, { status: 400 });
        }
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // No revelar si el usuario existe o no
            return server_1.NextResponse.json({
                message: 'Si el email existe, se enviará un enlace de recuperación.',
            });
        }
        // Generar token seguro
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos
        await db_1.prisma.user.update({
            where: { email },
            data: {
                resetPasswordToken: token,
                resetPasswordTokenExpiry: expiry,
            },
        });
        // Enviar email
        const resetUrl = `${BASE_URL}/reset-password?token=${token}`;
        await resend.emails.send({
            from: 'Mautik <no-reply@mautik.com>',
            to: email,
            subject: 'Recupera tu contraseña',
            html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Este enlace expirará en 30 minutos.</p>`,
        });
        return server_1.NextResponse.json({
            message: 'Si el email existe, se enviará un enlace de recuperación.',
        });
    }
    catch (error) {
        console.error('Error en forgot-password:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
