import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
	const { name, email, password, avatar, address, phone } = await req.json();
	if (!name || !email || !password) {
		return NextResponse.json(
			{ error: 'Faltan campos obligatorios' },
			{ status: 400 },
		);
	}
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		return NextResponse.json(
			{ error: 'El email ya está registrado' },
			{ status: 400 },
		);
	}
	const hashed = await bcrypt.hash(password, 10);
	const user = await prisma.user.create({
		data: {
			name,
			email,
			password: hashed,
			avatar,
			address,
			phone,
		},
	});
	return NextResponse.json({
		id: user.id,
		name: user.name,
		email: user.email,
		avatar: user.avatar,
	});
}

export async function GET(request: NextRequest) {
	// Only allow admin users to fetch all users
	const token = request.cookies.get('auth-token')?.value;
	if (!token) {
		return NextResponse.json({ error: 'No token provided' }, { status: 401 });
	}
	const userPayload = verifyToken(token);
	if (!userPayload || !userPayload.isAdmin) {
		return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
	}
	const users = await prisma.user.findMany({
		select: {
			id: true,
			name: true,
			email: true,
			isAdmin: true,
			avatar: true,
			address: true,
			phone: true,
			createdAt: true,
			updatedAt: true,
		},
	});
	return NextResponse.json(users);
}
