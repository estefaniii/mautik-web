import { NextResponse } from 'next/server';

export async function POST() {
	try {
		const response = NextResponse.json({
			message: 'Logout exitoso',
		});

		// Eliminar la cookie de autenticación
		response.cookies.set('auth-token', '', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 0, // Expirar inmediatamente
		});

		return response;
	} catch (error) {
		console.error('Logout error:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
