import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
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

		try {
			// Intentar conectar a MongoDB Atlas
			await connectDB();

			// Verificar si el usuario ya existe
			const existingUser = await User.findOne({ email });
			if (existingUser) {
				return NextResponse.json(
					{ error: 'El email ya está registrado' },
					{ status: 400 },
				);
			}

			// Crear nuevo usuario
			const user = new User({
				name,
				email,
				password,
				isAdmin: false,
			});

			await user.save();

			const userPayload = {
				id: user._id.toString(),
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
			console.log(
				'MongoDB Atlas no disponible, simulando registro local:',
				error instanceof Error ? error.message : 'Unknown error',
			);

			// Si falla la conexión, simular registro en datos locales
			const newUserId = `user-${Date.now()}-${Math.random()
				.toString(36)
				.substr(2, 9)}`;

			const userPayload = {
				id: newUserId,
				email: email,
				name: name,
				isAdmin: false,
			};

			const token = generateToken(userPayload);

			const response = NextResponse.json({
				message:
					'Usuario registrado (modo local - MongoDB Atlas no disponible)',
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
	} catch (error) {
		console.error('Registration error:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
