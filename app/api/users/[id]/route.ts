import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Uso de 'params' actualizado para Next.js 13+ API routes

// Helper function to get token from request
const getTokenFromRequest = (request: NextRequest): string | null => {
	// First try to get from Authorization header
	const authHeader = request.headers.get('authorization');
	if (authHeader && authHeader.startsWith('Bearer ')) {
		return authHeader.replace('Bearer ', '');
	}
	// Fallback to cookies
	const cookies = request.cookies;
	const tokenCookie = cookies.get('auth-token');
	return tokenCookie?.value || null;
};

// PUT - Actualizar perfil del usuario
export async function PUT(
	request: NextRequest,
	context: { params: { id: string } },
) {
	try {
		const { params } = context;
		const { id } = params;
		const body = await request.json();
		const {
			name,
			email,
			phone,
			address,
			avatar,
			currentPassword,
			newPassword,
		} = body;

		// Verificar autenticación
		const token = getTokenFromRequest(request);
		if (!token) {
			return NextResponse.json(
				{ error: 'Token de autenticación requerido' },
				{ status: 401 },
			);
		}
		const decoded = verifyToken(token);
		if (!decoded) {
			return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
		}
		// Verificar que el usuario está actualizando su propio perfil
		if (decoded.id !== id) {
			return NextResponse.json(
				{ error: 'No tienes permisos para actualizar este perfil' },
				{ status: 403 },
			);
		}
		// Buscar el usuario
		const user = await prisma.user.findUnique({ where: { id } });
		if (!user) {
			return NextResponse.json(
				{ error: 'Usuario no encontrado' },
				{ status: 404 },
			);
		}
		// Si se está cambiando la contraseña, verificar la contraseña actual
		if (newPassword) {
			if (!currentPassword) {
				return NextResponse.json(
					{ error: 'Contraseña actual requerida para cambiar la contraseña' },
					{ status: 400 },
				);
			}
			const isValidPassword = await bcrypt.compare(
				currentPassword,
				user.password,
			);
			if (!isValidPassword) {
				return NextResponse.json(
					{ error: 'Contraseña actual incorrecta' },
					{ status: 400 },
				);
			}
			if (newPassword.length < 6) {
				return NextResponse.json(
					{ error: 'La nueva contraseña debe tener al menos 6 caracteres' },
					{ status: 400 },
				);
			}
			user.password = await bcrypt.hash(newPassword, 12);
		}
		// Validar email único
		if (email !== undefined) {
			const existingUser = await prisma.user.findFirst({
				where: { email: email, id: { not: id } },
			});
			if (existingUser) {
				return NextResponse.json(
					{ error: 'El email ya está en uso por otro usuario' },
					{ status: 400 },
				);
			}
		}
		// Actualizar campos del perfil
		const updatedUser = await prisma.user.update({
			where: { id },
			data: {
				name: name !== undefined ? name : user.name,
				email: email !== undefined ? email : user.email,
				phone: phone !== undefined ? phone : user.phone,
				address: address !== undefined ? address : user.address,
				avatar: avatar !== undefined ? avatar : user.avatar,
				password: user.password,
			},
		});
		return NextResponse.json({
			user: {
				id: updatedUser.id,
				name: updatedUser.name,
				email: updatedUser.email,
				isAdmin: updatedUser.isAdmin,
				avatar: updatedUser.avatar,
				address: updatedUser.address,
				phone: updatedUser.phone,
				createdAt: updatedUser.createdAt,
				updatedAt: updatedUser.updatedAt,
			},
			message: 'Perfil actualizado exitosamente',
		});
	} catch (error: any) {
		console.error('Error en API de actualización de perfil:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}

// GET - Obtener perfil del usuario
export async function GET(
	request: NextRequest,
	context: { params: { id: string } },
) {
	try {
		const { params } = context;
		const { id } = params;
		// Verificar autenticación
		const token = getTokenFromRequest(request);
		if (!token) {
			return NextResponse.json(
				{ error: 'Token de autenticación requerido' },
				{ status: 401 },
			);
		}
		const decoded = verifyToken(token);
		if (!decoded) {
			return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
		}
		// Verificar que el usuario está accediendo a su propio perfil
		if (decoded.id !== id) {
			return NextResponse.json(
				{ error: 'No tienes permisos para acceder a este perfil' },
				{ status: 403 },
			);
		}
		const user = await prisma.user.findUnique({
			where: { id },
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
		if (!user) {
			return NextResponse.json(
				{ error: 'Usuario no encontrado' },
				{ status: 404 },
			);
		}
		return NextResponse.json({ user });
	} catch (error: any) {
		console.error('Error en API de perfil:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
