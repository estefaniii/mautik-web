import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface UserPayload {
	id: string;
	email: string;
	name: string;
	isAdmin: boolean;
	avatar?: string;
	address?: any;
	phone?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export function generateToken(user: UserPayload): string {
	return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload | null {
	try {
		return jwt.verify(token, JWT_SECRET) as UserPayload;
	} catch (error) {
		return null;
	}
}

export function getUserFromRequest(request: NextRequest): UserPayload | null {
	const authHeader = request.headers.get('authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return null;
	}

	const token = authHeader.substring(7);
	return verifyToken(token);
}

export async function authenticateUser(email: string, password: string) {
	try {
		const user = await User.findOne({ email }).select('+password');
		if (!user) {
			return { success: false, error: 'Usuario no encontrado' };
		}

		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			return { success: false, error: 'Contraseña incorrecta' };
		}

		const userPayload: UserPayload = {
			id: user._id.toString(),
			email: user.email,
			name: user.name,
			isAdmin: user.isAdmin,
		};

		const token = generateToken(userPayload);
		return { success: true, user: userPayload, token };
	} catch (error) {
		console.error('Authentication error:', error);
		return { success: false, error: 'Error de autenticación' };
	}
}

export async function createAdminUser() {
	try {
		// Verificar si ya existe un admin
		const existingAdmin = await User.findOne({ isAdmin: true });
		if (existingAdmin) {
			console.log('Admin user already exists');
			return { success: false, error: 'Admin user already exists' };
		}

		// Crear usuario admin
		const adminUser = new User({
			name: 'Admin Mautik',
			email: 'admin@mautik.com',
			password: 'admin123',
			isAdmin: true,
		});

		await adminUser.save();
		console.log('Admin user created successfully');
		return { success: true, user: adminUser };
	} catch (error) {
		console.error('Error creating admin user:', error);
		return { success: false, error: 'Error creating admin user' };
	}
}
