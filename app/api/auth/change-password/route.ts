import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
	try {
		const token = request.headers.get('authorization')?.replace('Bearer ', '');
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
		const { currentPassword, newPassword } = await request.json();
		if (!currentPassword || !newPassword) {
			return NextResponse.json(
				{ error: 'Todos los campos son requeridos' },
				{ status: 400 },
			);
		}
		if (newPassword.length < 6) {
			return NextResponse.json(
				{ error: 'La nueva contraseña debe tener al menos 6 caracteres' },
				{ status: 400 },
			);
		}
		const user = await prisma.user.findUnique({ where: { id: decoded.id } });
		if (!user) {
			return NextResponse.json(
				{ error: 'Usuario no encontrado' },
				{ status: 404 },
			);
		}
		const isValid = await bcrypt.compare(currentPassword, user.password || '');
		if (!isValid) {
			return NextResponse.json(
				{ error: 'Contraseña actual incorrecta' },
				{ status: 400 },
			);
		}
		const hashedPassword = await bcrypt.hash(newPassword, 12);
		await prisma.user.update({
			where: { id: user.id },
			data: { password: hashedPassword },
		});
		return NextResponse.json({
			message: 'Contraseña actualizada exitosamente',
		});
	} catch (error) {
		console.error('Error cambiando contraseña:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
