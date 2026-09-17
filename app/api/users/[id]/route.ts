import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// En Next.js 16 `params` es una Promise: hay que esperarla antes de leer el id.

/**
 * ⚠️ Guardar el perfil NUNCA funcionó en producción.
 *
 * Estas rutas exigían la cookie `auth-token` (o una cabecera Bearer) y esa
 * cookie no la tiene nadie: se inicia sesión con NextAuth, que guarda la suya.
 * Resultado verificado contra el sitio en vivo: `PUT /api/users/<id>` devolvía
 * 401 "Token de autenticación requerido" con la sesión abierta, así que la
 * clienta no podía cambiar ni su nombre, ni su teléfono, ni su dirección, ni
 * su foto. El formulario decía "Perfil actualizado exitosamente"... solo
 * cuando el servidor no contestaba error, y siempre contestaba error.
 *
 * `getAuthUser` resuelve la sesión igual que el resto de la aplicación.
 */

// PUT - Actualizar perfil del usuario
export async function PUT(
	request: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await context.params;
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
		const decoded = await getAuthUser(request);
		if (!decoded) {
			return NextResponse.json(
				{ error: 'Tienes que iniciar sesión.' },
				{ status: 401 },
			);
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
				user.password || '',
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
	context: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await context.params;
		// Verificar autenticación
		const decoded = await getAuthUser(request);
		if (!decoded) {
			return NextResponse.json(
				{ error: 'Tienes que iniciar sesión.' },
				{ status: 401 },
			);
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
