import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
	try {
		await connectDB();

		const { currentPassword, newPassword, userId } = await request.json();

		if (!currentPassword || !newPassword || !userId) {
			return NextResponse.json(
				{ error: 'Todos los campos son requeridos' },
				{ status: 400 },
			);
		}

		// Buscar el usuario
		const user = await User.findById(userId);
		if (!user) {
			return NextResponse.json(
				{ error: 'Usuario no encontrado' },
				{ status: 404 },
			);
		}

		// Verificar la contraseña actual
		const isValidPassword = await bcrypt.compare(
			currentPassword,
			user.password,
		);
		if (!isValidPassword) {
			return NextResponse.json(
				{ error: 'La contraseña actual es incorrecta' },
				{ status: 400 },
			);
		}

		// Encriptar la nueva contraseña
		const hashedNewPassword = await bcrypt.hash(newPassword, 12);

		// Actualizar la contraseña
		user.password = hashedNewPassword;
		await user.save();

		return NextResponse.json(
			{ message: 'Contraseña actualizada exitosamente' },
			{ status: 200 },
		);
	} catch (error) {
		console.error('Error changing password:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
