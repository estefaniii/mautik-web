import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Emite la cookie `auth-token` para quien ya inició sesión con Google.
 *
 * ⚠️ Esta ruta ERA UN BYPASS COMPLETO DEL LOGIN. Recibía `{ email }` en el
 * cuerpo, buscaba ese usuario y devolvía un JWT firmado con su identidad —sin
 * contraseña, sin sesión, sin nada—, y encima lo dejaba puesto como cookie.
 * O sea: sabiendo una dirección de correo cualquiera te convertías en esa
 * persona; con el correo de la administradora, en administradora.
 *
 * Ahora el correo NO se lee del cuerpo: sale de la sesión de NextAuth
 * verificada en el servidor. El cliente ya no puede elegir de quién es el
 * token que recibe.
 */
export async function POST(_request: NextRequest) {
	const session = await getServerSession(authOptions);
	const email = session?.user?.email;

	if (!email) {
		return NextResponse.json(
			{ error: 'No hay sesión iniciada.' },
			{ status: 401 },
		);
	}

	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) {
		return NextResponse.json(
			{ error: 'Usuario no encontrado' },
			{ status: 404 },
		);
	}

	const token = generateToken({
		id: user.id,
		email: user.email,
		name: user.name,
		isAdmin: user.isAdmin,
	});

	const response = NextResponse.json({ ok: true });
	response.cookies.set('auth-token', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: 7 * 24 * 60 * 60,
	});
	return response;
}
