import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

export async function verifyAuth(
	request: NextRequest,
): Promise<UserPayload | null> {
	return getUserFromRequest(request);
}

export async function authenticateUser(email: string, password: string) {
	try {
		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
				name: true,
				isAdmin: true,
				password: true,
			},
		});
		if (!user) {
			return { success: false, error: 'Usuario no encontrado' };
		}

		// Usar bcrypt.compare en lugar de user.comparePassword
		const isPasswordValid = await bcrypt.compare(password, user.password || '');
		if (!isPasswordValid) {
			return { success: false, error: 'Contraseña incorrecta' };
		}

		const userPayload: UserPayload = {
			id: user.id,
			email: user.email,
			name: user.name,
			isAdmin: user.isAdmin,
		};

		const token = generateToken(userPayload);
		return { success: true, user: userPayload, token };
	} catch (error) {
		const errorToUse =
			error instanceof Error
				? error
				: new Error(typeof error === 'string' ? error : JSON.stringify(error));
		console.error('Authentication error:', errorToUse);
		return { success: false, error: 'Error de autenticación' };
	}
}

export async function createAdminUser() {
	try {
		// Verificar si ya existe un admin
		const existingAdmin = await prisma.user.findFirst({
			where: { isAdmin: true },
		});
		if (existingAdmin) {
			console.log('Admin user already exists');
			return { success: false, error: 'Admin user already exists' };
		}

		// Hashear la contraseña antes de crear el usuario
		const hashedPassword = await bcrypt.hash('admin123', 12);

		// Crear usuario admin
		const adminUser = await prisma.user.create({
			data: {
				name: 'Admin Mautik',
				email: 'admin@mautik.com',
				password: hashedPassword,
				isAdmin: true,
			},
		});

		console.log('Admin user created successfully');
		return { success: true, user: adminUser };
	} catch (error) {
		const errorToUse =
			error instanceof Error
				? error
				: new Error(typeof error === 'string' ? error : JSON.stringify(error));
		console.error('Error creating admin user:', errorToUse);
		return { success: false, error: 'Error creating admin user' };
	}
}
