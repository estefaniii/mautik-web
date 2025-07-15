import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

// Uso de 'params' actualizado para Next.js 13+ API routes
const prisma = new PrismaClient();

// PUT - Actualizar una reseña
export async function PUT(
	request: NextRequest,
	context: { params: { id: string } },
) {
	try {
		const { params } = context;
		const { id } = params;
		const body = await request.json();
		const { rating, comment } = body;

		// Validar campos requeridos
		if (!rating || !comment) {
			return NextResponse.json(
				{ error: 'Todos los campos son requeridos' },
				{ status: 400 },
			);
		}
		if (rating < 1 || rating > 5) {
			return NextResponse.json(
				{ error: 'La calificación debe estar entre 1 y 5' },
				{ status: 400 },
			);
		}

		// Verificar autenticación
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

		// Buscar la reseña y verificar que pertenece al usuario
		const review = await prisma.review.findUnique({ where: { id } });
		if (!review) {
			return NextResponse.json(
				{ error: 'Reseña no encontrada' },
				{ status: 404 },
			);
		}
		if (review.userId !== decoded.id) {
			return NextResponse.json(
				{ error: 'No tienes permisos para editar esta reseña' },
				{ status: 403 },
			);
		}

		// Actualizar la reseña
		const updatedReview = await prisma.review.update({
			where: { id },
			data: {
				rating,
				comment,
				updatedAt: new Date(),
			},
			include: { user: { select: { id: true, name: true, avatar: true } } },
		});

		return NextResponse.json({
			review: updatedReview,
			message: 'Reseña actualizada exitosamente',
		});
	} catch (error) {
		console.error('Error actualizando reseña:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}

// DELETE - Eliminar una reseña
export async function DELETE(
	request: NextRequest,
	context: { params: { id: string } },
) {
	try {
		const { params } = context;
		const { id } = params;
		// Verificar autenticación
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
		// Buscar la reseña y verificar que pertenece al usuario
		const review = await prisma.review.findUnique({ where: { id } });
		if (!review) {
			return NextResponse.json(
				{ error: 'Reseña no encontrada' },
				{ status: 404 },
			);
		}
		if (review.userId !== decoded.id) {
			return NextResponse.json(
				{ error: 'No tienes permisos para eliminar esta reseña' },
				{ status: 403 },
			);
		}
		// Eliminar la reseña
		await prisma.review.delete({ where: { id } });
		return NextResponse.json({
			message: 'Reseña eliminada exitosamente',
		});
	} catch (error) {
		console.error('Error eliminando reseña:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
