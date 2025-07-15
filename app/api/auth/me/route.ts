import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

		// Buscar el usuario en la base de datos
		const user = await prisma.user.findUnique({
			where: {
				id: userPayload.id,
			},
			select: {
				id: true,
				name: true,
				email: true,
				isAdmin: true,
				avatar: true,
				address: true,
				phone: true,
			},
		});

		if (!user) {
			return NextResponse.json({
				isAuthenticated: false,
				message: 'User not found',
			});
		}

		return NextResponse.json({
			isAuthenticated: true,
			user: {
				id: user.id,
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
