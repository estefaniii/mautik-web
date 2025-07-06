import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
	await connectDB();
	const users = await User.find().select('-password');
	return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
	await connectDB();
	const { name, email, password, avatar, address, phone } = await req.json();
	if (!name || !email || !password) {
		return NextResponse.json(
			{ error: 'Faltan campos obligatorios' },
			{ status: 400 },
		);
	}
	const existing = await User.findOne({ email });
	if (existing) {
		return NextResponse.json(
			{ error: 'El email ya está registrado' },
			{ status: 400 },
		);
	}
	const hashed = await bcrypt.hash(password, 10);
	const user = await User.create({
		name,
		email,
		password: hashed,
		avatar,
		address,
		phone,
	});
	return NextResponse.json({
		id: user._id,
		name: user.name,
		email: user.email,
		avatar: user.avatar,
	});
}
