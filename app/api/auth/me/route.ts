import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';

export async function GET(request: NextRequest) {
	try {
		// Obtener el token de las cookies
		const token = request.cookies.get('auth-token')?.value;

		if (!token) {
			return NextResponse.json({
				isAuthenticated: false,
				message: 'No token found',
			});
		}

		// Verificar el token
		const userPayload = verifyToken(token);
		if (!userPayload) {
			return NextResponse.json({
				isAuthenticated: false,
				message: 'Invalid token',
			});
		}

		try {
			// Intentar conectar a MongoDB Atlas
			await connectDB();

			// Buscar el usuario en la base de datos
			const user = await User.findById(userPayload.id).select('-password');

			if (!user) {
				return NextResponse.json({
					isAuthenticated: false,
					message: 'User not found',
				});
			}

			return NextResponse.json({
				isAuthenticated: true,
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					isAdmin: user.isAdmin,
					avatar: user.avatar,
					address: user.address,
					phone: user.phone,
				},
			});
		} catch (error) {
			const err = error as any;
			console.log(
				'MongoDB Atlas no disponible, usando datos locales para auth:',
				err?.message || 'Unknown error',
			);

			// Si falla la conexión, usar datos locales
			const localUsers = [
				{
					id: 'admin-1',
					name: 'Admin Mautik',
					email: 'admin@mautik.com',
					isAdmin: true,
					avatar: '',
					address: null,
					phone: null,
				},
				{
					id: 'user-1',
					name: 'Usuario Demo',
					email: 'user@demo.com',
					isAdmin: false,
					avatar: '',
					address: null,
					phone: null,
				},
			];

			// Buscar usuario en datos locales
			const localUser = localUsers.find((u) => u.id === userPayload.id);

			if (!localUser) {
				return NextResponse.json({
					isAuthenticated: false,
					message: 'User not found in local data',
				});
			}

			return NextResponse.json({
				isAuthenticated: true,
				user: localUser,
				message: 'Using local data - MongoDB Atlas not available',
			});
		}
	} catch (error) {
		const err = error as any;
		console.error('Auth check error:', err?.message || 'Unknown error');
		return NextResponse.json(
			{
				isAuthenticated: false,
				message: 'Server error',
			},
			{ status: 500 },
		);
	}
}
