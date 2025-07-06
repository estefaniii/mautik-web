import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authenticateUser, generateToken } from '@/lib/auth';
import User from '@/models/User';

// Datos de usuarios locales para cuando MongoDB Atlas no esté disponible
const localUsers = [
	{
		id: 'admin-1',
		name: 'Admin Mautik',
		email: 'admin@mautik.com',
		password: 'admin123', // En producción, esto debería estar hasheado
		isAdmin: true,
	},
	{
		id: 'user-1',
		name: 'Usuario Demo',
		email: 'user@demo.com',
		password: 'user123',
		isAdmin: false,
	},
];

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
			await connectDB();

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
					httpOnly: true, // Cambiado a true para mayor seguridad
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax',
					maxAge: 7 * 24 * 60 * 60, // 7 días
				});
			}

			return response;
		} catch (error) {
			console.log(
				'MongoDB Atlas no disponible, usando datos locales para login:',
				error instanceof Error ? error.message : 'Unknown error',
			);

			// Si falla la conexión, usar datos locales
			const localUser = localUsers.find(
				(u) => u.email === email && u.password === password,
			);

			if (!localUser) {
				return NextResponse.json(
					{
						error: 'Credenciales incorrectas',
					},
					{ status: 401 },
				);
			}

			const userPayload = {
				id: localUser.id,
				email: localUser.email,
				name: localUser.name,
				isAdmin: localUser.isAdmin,
			};

			const token = generateToken(userPayload);

			const response = NextResponse.json({
				message: 'Login exitoso (modo local)',
				user: userPayload,
				token: token,
			});

			// Establecer cookie con el token
			response.cookies.set('auth-token', token, {
				httpOnly: true, // Cambiado a true para mayor seguridad
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 7 * 24 * 60 * 60, // 7 días
			});

			return response;
		}
	} catch (error) {
		console.error('Login error:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
