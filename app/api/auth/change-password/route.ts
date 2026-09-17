import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getAuthUser, verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cambio de contraseña desde el perfil.
 *
 * ⚠️ Esto NUNCA funcionó. La ruta exigía una cabecera `Authorization: Bearer`
 * y la página del perfil solo mandaba `Content-Type`, así que cada intento
 * moría en 401 "Token de autenticación requerido" antes de mirar siquiera la
 * contraseña. La app entera se autentica con la sesión de NextAuth o con la
 * cookie `auth-token`; acá se hace igual, y el Bearer se sigue aceptando por
 * si algo viejo lo manda.
 */
export async function POST(request: NextRequest) {
	try {
		let usuarioId: string | null = null;

		const token = request.headers.get('authorization')?.replace('Bearer ', '');
		if (token) {
			const decoded = verifyToken(token);
			if (!decoded) {
				return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
			}
			usuarioId = decoded.id;
		} else {
			const usuario = await getAuthUser(request);
			usuarioId = usuario?.id ?? null;
		}

		if (!usuarioId) {
			return NextResponse.json(
				{ error: 'Tienes que iniciar sesión.' },
				{ status: 401 },
			);
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
		const user = await prisma.user.findUnique({ where: { id: usuarioId } });
		if (!user) {
			return NextResponse.json(
				{ error: 'Usuario no encontrado' },
				{ status: 404 },
			);
		}
		/*
		  Quien entró con Google no tiene contraseña guardada. Sin este aviso,
		  `bcrypt.compare` contra una cadena vacía devolvía false y el mensaje
		  era "Contraseña actual incorrecta": imposible de entender cuando
		  nunca hubo una contraseña que poner.
		*/
		if (!user.password) {
			return NextResponse.json(
				{
					error:
						'Tu cuenta entra con Google, así que no tiene contraseña que cambiar.',
				},
				{ status: 400 },
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
