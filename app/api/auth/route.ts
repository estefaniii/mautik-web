import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
	await connectDB();
	const { email, password } = await req.json();
	if (!email || !password) {
		return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
	}
	const user = await User.findOne({ email });
	if (!user) {
		return NextResponse.json(
			{ error: 'Usuario no encontrado' },
			{ status: 400 },
		);
	}
	const valid = await bcrypt.compare(password, user.password);
	if (!valid) {
		return NextResponse.json(
			{ error: 'Contraseña incorrecta' },
			{ status: 400 },
		);
	}
	// Generar JWT
	const token = jwt.sign(
		{ id: user._id, email: user.email, name: user.name },
		JWT_SECRET,
		{ expiresIn: '7d' },
	);
	return NextResponse.json({
		token,
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			avatar: user.avatar,
		},
	});
}
