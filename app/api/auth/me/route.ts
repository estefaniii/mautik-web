import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Quién está conectada.
 *
 * ⚠️ Esto miraba SOLO la cookie `auth-token`, y esa cookie no la tiene nadie:
 * los inicios de sesión —tanto el de Google como el de correo y contraseña—
 * pasan por NextAuth, que guarda su propia sesión. Verificado en producción:
 * la ruta respondía `isAuthenticated: false` con la sesión abierta.
 *
 * Por eso el perfil mostraba el teléfono y la dirección vacíos aunque
 * estuvieran guardados. `getAuthUser` mira primero la sesión de NextAuth y
 * después la cookie, que es como se autentica el resto de la aplicación.
 */
export async function GET(request: NextRequest) {
	try {
		const userPayload = await getAuthUser(request);
		if (!userPayload) {
			return NextResponse.json({
				isAuthenticated: false,
				message: 'No session',
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
				// Sin esto el perfil siempre decía "Miembro desde Reciente":
				// la fecha no llegaba nunca al navegador.
				createdAt: true,
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
				createdAt: user.createdAt,
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
