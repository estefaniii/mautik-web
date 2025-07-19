import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
	const { email } = await request.json();
	console.log('Solicitando JWT para email:', email);
	if (!email) {
		return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
	}
	const user = await prisma.user.findUnique({ where: { email } });
	console.log('Usuario encontrado:', user);
	if (!user) {
		return NextResponse.json(
			{ error: 'Usuario no encontrado' },
			{ status: 404 },
		);
	}
	const userPayload = {
		id: user.id,
		email: user.email,
		name: user.name,
		isAdmin: user.isAdmin,
	};
	console.log('Generando token con userPayload:', userPayload);
	const token = generateToken(userPayload);
	const response = NextResponse.json({ token });
	response.cookies.set('auth-token', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 7 * 24 * 60 * 60,
	});
	return response;
}
