// Uso de 'params' actualizado para Next.js 13+ API routes
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
	request: NextRequest,
	context: { params: { id: string } },
) {
	try {
		const { params } = context;
		const { id } = params;
		const product = await prisma.product.findUnique({ where: { id } });
		if (!product) {
			return NextResponse.json(
				{ error: 'Producto no encontrado' },
				{ status: 404 },
			);
		}
		return NextResponse.json({ product });
	} catch (error) {
		console.error('Error obteniendo producto:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	context: { params: { id: string } },
) {
	try {
		const { params } = context;
		const { id } = params;
		const deleted = await prisma.product.delete({ where: { id } });
		return NextResponse.json({ success: true, deleted });
	} catch (error) {
		console.error('Error eliminando producto:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: NextRequest,
	context: { params: { id: string } },
) {
	try {
		const { params } = context;
		const { id } = params;
		const data = await request.json();

		// Eliminar cualquier campo id del payload para evitar cambios de ID
		delete data.id;

		// Validaciones básicas
		if (
			!data.name ||
			typeof data.name !== 'string' ||
			data.name.trim().length < 3
		) {
			return NextResponse.json(
				{
					error:
						'El nombre del producto es obligatorio y debe tener al menos 3 caracteres.',
				},
				{ status: 400 },
			);
		}
		if (
			!data.description ||
			typeof data.description !== 'string' ||
			data.description.trim().length < 10
		) {
			return NextResponse.json(
				{
					error:
						'La descripción es obligatoria y debe tener al menos 10 caracteres.',
				},
				{ status: 400 },
			);
		}
		if (typeof data.price !== 'number' || data.price < 0) {
			return NextResponse.json(
				{
					error:
						'El precio es obligatorio y debe ser un número mayor o igual a 0.',
				},
				{ status: 400 },
			);
		}
		if (!data.category || typeof data.category !== 'string') {
			return NextResponse.json(
				{ error: 'La categoría es obligatoria.' },
				{ status: 400 },
			);
		}
		if (!Array.isArray(data.images) || data.images.length === 0) {
			return NextResponse.json(
				{ error: 'Debes subir al menos una imagen.' },
				{ status: 400 },
			);
		}
		if (typeof data.stock !== 'number' || data.stock < 0) {
			return NextResponse.json(
				{
					error:
						'El stock es obligatorio y debe ser un número mayor o igual a 0.',
				},
				{ status: 400 },
			);
		}
		if (
			!data.sku ||
			typeof data.sku !== 'string' ||
			data.sku.trim().length < 3
		) {
			return NextResponse.json(
				{ error: 'El SKU es obligatorio y debe tener al menos 3 caracteres.' },
				{ status: 400 },
			);
		}
		// Validar unicidad de SKU (excepto para el mismo producto)
		const existingSku = await prisma.product.findFirst({
			where: { sku: data.sku, NOT: { id } },
		});
		if (existingSku) {
			return NextResponse.json(
				{ error: 'El SKU ya existe. Debe ser único.' },
				{ status: 400 },
			);
		}
		const updated = await prisma.product.update({
			where: { id },
			data: {
				name: data.name,
				description: data.description,
				price: data.price,
				stock: data.stock,
				images: data.images,
				category: data.category,
				sku: data.sku,
				originalPrice: data.originalPrice,
				featured: !!data.featured,
				isNew: !!data.isNew,
				discount: data.discount,
			},
		});
		return NextResponse.json({
			message: 'Producto actualizado exitosamente',
			product: updated,
		});
	} catch (error: any) {
		console.error('Error actualizando producto:', error);
		if (error.code === 'P2002' && error.meta?.target?.includes('sku')) {
			return NextResponse.json(
				{ error: 'El SKU ya existe. Debe ser único.' },
				{ status: 400 },
			);
		}
		return NextResponse.json(
			{ error: error.message || 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
