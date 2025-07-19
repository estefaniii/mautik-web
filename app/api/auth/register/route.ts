import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
	const ip = request.headers.get('x-forwarded-for') || 'unknown';
	const { allowed, retryAfter } = rateLimit(`register:${ip}`);
	if (!allowed) {
		return NextResponse.json(
			{
				error: `Demasiados intentos. Intenta de nuevo en ${retryAfter} segundos.`,
			},
			{ status: 429 },
		);
	}

	try {
		const { name, email, password } = await request.json();

		if (!name || !email || !password) {
			return NextResponse.json(
				{ error: 'Nombre, email y contraseña son requeridos' },
				{ status: 400 },
			);
		}

		if (password.length < 6) {
			return NextResponse.json(
				{ error: 'La contraseña debe tener al menos 6 caracteres' },
				{ status: 400 },
			);
		}

		// Verificar si el usuario ya existe
		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			return NextResponse.json(
				{ error: 'El email ya está registrado' },
				{ status: 400 },
			);
		}

		// Hashear la contraseña
		const hashedPassword = await bcrypt.hash(password, 12);

		// Crear nuevo usuario
		const user = await prisma.user.create({
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

		const token = generateToken(userPayload);

		const response = NextResponse.json({
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
	} catch (error) {
		console.error('Registration error:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
