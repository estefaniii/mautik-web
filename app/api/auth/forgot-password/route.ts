import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { resend } from '@/lib/resend';
import crypto from 'crypto';
import { rateLimit } from '@/lib/rate-limit';

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
	const ip = request.headers.get('x-forwarded-for') || 'unknown';
	const { allowed, retryAfter } = rateLimit(`forgot:${ip}`);
	if (!allowed) {
		return NextResponse.json(
			{
				error: `Demasiados intentos. Intenta de nuevo en ${retryAfter} segundos.`,
			},
			{ status: 429 },
		);
	}
	if (!resend) {
		return new Response(
			JSON.stringify({ error: 'Resend API key not configured' }),
			{ status: 500 },
		);
	}
	try {
		const { email } = await request.json();
		if (!email) {
			return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
		}
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			// No revelar si el usuario existe o no
			return NextResponse.json({
				message: 'Si el email existe, se enviará un enlace de recuperación.',
			});
		}
		// Generar token seguro
		const token = crypto.randomBytes(32).toString('hex');
		const expiry = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos
		await prisma.user.update({
			where: { email },
			data: {
				resetPasswordToken: token,
				resetPasswordExpires: expiry,
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
		return NextResponse.json({
			message: 'Si el email existe, se enviará un enlace de recuperación.',
		});
	} catch (error) {
		console.error('Error en forgot-password:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
