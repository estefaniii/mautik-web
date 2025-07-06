import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import { verifyToken } from '@/lib/auth';

// PUT - Actualizar una reseña
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = params;
		const body = await request.json();
		const { rating, title, comment } = body;

		// Validar campos requeridos
		if (!rating || !title || !comment) {
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

		try {
			await connectDB();

			// Buscar la reseña y verificar que pertenece al usuario
			const review = await Review.findById(id);
			if (!review) {
				return NextResponse.json(
					{ error: 'Reseña no encontrada' },
					{ status: 404 },
				);
			}

			if (review.user.toString() !== decoded.id) {
				return NextResponse.json(
					{ error: 'No tienes permisos para editar esta reseña' },
					{ status: 403 },
				);
			}

			// Actualizar la reseña
			review.rating = rating;
			review.title = title;
			review.comment = comment;
			review.updatedAt = new Date();

			await review.save();
			await review.populate('user', 'name avatar');

			return NextResponse.json({
				review,
				message: 'Reseña actualizada exitosamente',
			});
		} catch (error) {
			const err = error as any;
			console.log(
				'MongoDB Atlas no disponible, simulando actualización local:',
				err?.message || 'Unknown error',
			);

			// Simular actualización local
			const mockReview = {
				_id: id,
				product: 'product-id',
				user: {
					_id: decoded.id,
					name: 'Usuario Demo',
					avatar: '/placeholder-user.jpg',
				},
				rating,
				title,
				comment,
				helpful: 0,
				verified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			return NextResponse.json({
				review: mockReview,
				message:
					'Reseña actualizada (simulación local) - MongoDB Atlas no disponible',
			});
		}
	} catch (error: any) {
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
	{ params }: { params: { id: string } },
) {
	try {
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

		try {
			await connectDB();

			// Buscar la reseña y verificar que pertenece al usuario
			const review = await Review.findById(id);
			if (!review) {
				return NextResponse.json(
					{ error: 'Reseña no encontrada' },
					{ status: 404 },
				);
			}

			if (review.user.toString() !== decoded.id) {
				return NextResponse.json(
					{ error: 'No tienes permisos para eliminar esta reseña' },
					{ status: 403 },
				);
			}

			// Eliminar la reseña
			await Review.findByIdAndDelete(id);

			return NextResponse.json({
				message: 'Reseña eliminada exitosamente',
			});
		} catch (error) {
			const err = error as any;
			console.log(
				'MongoDB Atlas no disponible, simulando eliminación local:',
				err?.message || 'Unknown error',
			);

			// Simular eliminación local
			return NextResponse.json({
				message:
					'Reseña eliminada (simulación local) - MongoDB Atlas no disponible',
			});
		}
	} catch (error: any) {
		console.error('Error eliminando reseña:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
