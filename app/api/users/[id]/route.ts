import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Helper function to get token from request
const getTokenFromRequest = (request: NextRequest): string | null => {
	// First try to get from Authorization header
	const authHeader = request.headers.get('authorization');
	if (authHeader && authHeader.startsWith('Bearer ')) {
		return authHeader.replace('Bearer ', '');
	}

	// Fallback to cookies
	const cookies = request.cookies;
	const tokenCookie = cookies.get('auth-token');
	return tokenCookie?.value || null;
};

// PUT - Actualizar perfil del usuario
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = params;
		const body = await request.json();
		const {
			name,
			email,
			phone,
			address,
			avatar,
			currentPassword,
			newPassword,
		} = body;

		// Verificar autenticación
		const token = getTokenFromRequest(request);
		if (!token) {
			return NextResponse.json(
				{ error: 'Token de autenticación requerido' },
				{ status: 401 },
			);
		}

		const decoded = verifyToken(token);
		if (!decoded) {
			return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
		}

		// Verificar que el usuario está actualizando su propio perfil
		if (decoded.id !== id) {
			return NextResponse.json(
				{ error: 'No tienes permisos para actualizar este perfil' },
				{ status: 403 },
			);
		}

		try {
			await connectDB();

			// Buscar el usuario
			const user = await User.findById(id);
			if (!user) {
				return NextResponse.json(
					{ error: 'Usuario no encontrado' },
					{ status: 404 },
				);
			}

			// Si se está cambiando la contraseña, verificar la contraseña actual
			if (newPassword) {
				if (!currentPassword) {
					return NextResponse.json(
						{ error: 'Contraseña actual requerida para cambiar la contraseña' },
						{ status: 400 },
					);
				}

				const isValidPassword = await bcrypt.compare(
					currentPassword,
					user.password,
				);
				if (!isValidPassword) {
					return NextResponse.json(
						{ error: 'Contraseña actual incorrecta' },
						{ status: 400 },
					);
				}

				// Validar nueva contraseña
				if (newPassword.length < 6) {
					return NextResponse.json(
						{ error: 'La nueva contraseña debe tener al menos 6 caracteres' },
						{ status: 400 },
					);
				}

				// Hashear nueva contraseña
				user.password = await bcrypt.hash(newPassword, 12);
			}

			// Actualizar campos del perfil
			if (name !== undefined) user.name = name;
			if (email !== undefined) {
				// Verificar que el email no esté en uso por otro usuario
				const existingUser = await User.findOne({ email, _id: { $ne: id } });
				if (existingUser) {
					return NextResponse.json(
						{ error: 'El email ya está en uso por otro usuario' },
						{ status: 400 },
					);
				}
				user.email = email;
			}
			if (phone !== undefined) user.phone = phone;
			if (address !== undefined) user.address = address;
			if (avatar !== undefined) user.avatar = avatar;

			// Guardar cambios
			await user.save();

			// Retornar usuario actualizado (sin contraseña)
			const updatedUser = {
				id: user._id,
				name: user.name,
				email: user.email,
				isAdmin: user.isAdmin,
				avatar: user.avatar,
				address: user.address,
				phone: user.phone,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			};

			return NextResponse.json({
				user: updatedUser,
				message: 'Perfil actualizado exitosamente',
			});
		} catch (error) {
			const err = error as any;
			console.error(
				'Error actualizando perfil en MongoDB:',
				err?.message || 'Unknown error',
			);

			// Si hay un error de conexión, intentar con datos locales
			if (err?.name === 'MongoNetworkError' || err?.code === 'ENOTFOUND') {
				console.log('MongoDB Atlas no disponible, usando datos locales');

				// Obtener datos del usuario actual desde el token
				const decoded = verifyToken(token);
				if (!decoded) {
					return NextResponse.json(
						{ error: 'Token inválido' },
						{ status: 401 },
					);
				}

				// Simular actualización local preservando los datos del usuario actual
				const mockUser = {
					id: id,
					name: name || decoded.name || 'Admin Mautik',
					email: email || decoded.email || 'admin@mautik.com',
					isAdmin: decoded.isAdmin || true,
					avatar: avatar || decoded.avatar || '/placeholder-user.jpg',
					address: address ||
						decoded.address || {
							street: '',
							city: '',
							state: '',
							zipCode: '',
							country: '',
						},
					phone: phone || decoded.phone || '',
					createdAt: decoded.createdAt || new Date(),
					updatedAt: new Date(),
				};

				return NextResponse.json({
					user: mockUser,
					message:
						'Perfil actualizado (simulación local) - MongoDB Atlas no disponible',
				});
			}

			// Para otros errores, retornar error
			return NextResponse.json(
				{ error: 'Error interno del servidor' },
				{ status: 500 },
			);
		}
	} catch (error: any) {
		console.error('Error en API de actualización de perfil:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}

// GET - Obtener perfil del usuario
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = params;

		// Verificar autenticación
		const token = getTokenFromRequest(request);
		if (!token) {
			return NextResponse.json(
				{ error: 'Token de autenticación requerido' },
				{ status: 401 },
			);
		}

		const decoded = verifyToken(token);
		if (!decoded) {
			return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
		}

		// Verificar que el usuario está accediendo a su propio perfil
		if (decoded.id !== id) {
			return NextResponse.json(
				{ error: 'No tienes permisos para acceder a este perfil' },
				{ status: 403 },
			);
		}

		try {
			await connectDB();

			// Buscar el usuario
			const user = await User.findById(id).select('-password');
			if (!user) {
				return NextResponse.json(
					{ error: 'Usuario no encontrado' },
					{ status: 404 },
				);
			}

			return NextResponse.json({
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					isAdmin: user.isAdmin,
					avatar: user.avatar,
					address: user.address,
					phone: user.phone,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				},
			});
		} catch (error) {
			const err = error as any;
			console.error(
				'Error obteniendo perfil de MongoDB:',
				err?.message || 'Unknown error',
			);

			// Si hay un error de conexión, retornar datos locales
			if (err?.name === 'MongoNetworkError' || err?.code === 'ENOTFOUND') {
				console.log('MongoDB Atlas no disponible, usando datos locales');

				// Obtener datos del usuario actual desde el token
				const decoded = verifyToken(token);
				if (!decoded) {
					return NextResponse.json(
						{ error: 'Token inválido' },
						{ status: 401 },
					);
				}

				// Simular datos locales preservando los datos del usuario actual
				const mockUser = {
					id: id,
					name: decoded.name || 'Admin Mautik',
					email: decoded.email || 'admin@mautik.com',
					isAdmin: decoded.isAdmin || true,
					avatar: decoded.avatar || '/placeholder-user.jpg',
					address: decoded.address || {
						street: '',
						city: '',
						state: '',
						zipCode: '',
						country: '',
					},
					phone: decoded.phone || '',
					createdAt: decoded.createdAt || new Date(),
					updatedAt: new Date(),
				};

				return NextResponse.json({
					user: mockUser,
					message: 'Datos locales - MongoDB Atlas no disponible',
				});
			}

			return NextResponse.json(
				{ error: 'Error interno del servidor' },
				{ status: 500 },
			);
		}
	} catch (error: any) {
		console.error('Error en API de obtención de perfil:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
