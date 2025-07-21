import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
	const ip = request.headers.get('x-forwarded-for') || 'unknown';
	const { allowed, retryAfter } = rateLimit(`reset:${ip}`);
	if (!allowed) {
		return NextResponse.json(
			{
				error: `Demasiados intentos. Intenta de nuevo en ${retryAfter} segundos.`,
			},
			{ status: 429 },
		);
	}
	try {
		const { token, password } = await request.json();
		if (!token || !password) {
			return NextResponse.json(
				{ error: 'Token y nueva contraseña requeridos' },
				{ status: 400 },
			);
		}
		if (password.length < 6) {
			return NextResponse.json(
				{ error: 'La contraseña debe tener al menos 6 caracteres' },
				{ status: 400 },
			);
		}
		const user = await prisma.user.findFirst({
			where: {
				resetPasswordToken: token,
				resetPasswordExpires: { gte: new Date() },
			},
		});
		if (!user) {
			return NextResponse.json(
				{ error: 'Token inválido o expirado' },
				{ status: 400 },
			);
		}
		const hashed = await bcrypt.hash(password, 12);
		await prisma.user.update({
			where: { id: user.id },
			data: {
				password: hashed,
				resetPasswordToken: null,
				resetPasswordExpires: null,
			},
		});
		return NextResponse.json({
			message: 'Contraseña restablecida exitosamente',
		});
	} catch (error) {
		console.error('Error en reset-password:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
