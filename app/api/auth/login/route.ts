import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '@/lib/auth';

// Elimina toda la lógica de localUsers y fallback a datos locales. Solo usa Prisma.

export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return NextResponse.json(
				{ error: 'Email y contraseña son requeridos' },
				{ status: 400 },
			);
		}

		try {
			// Intentar conectar a MongoDB Atlas
			// Elimina: await connectDB();

			const result = await authenticateUser(email, password);

			if (!result.success) {
				return NextResponse.json({ error: result.error }, { status: 401 });
			}

			const response = NextResponse.json({
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
		} catch (error) {
			console.error('Login error:', error);
			return NextResponse.json(
				{ error: 'Error interno del servidor' },
				{ status: 500 },
			);
		}
	} catch (error) {
		console.error('Login error:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
