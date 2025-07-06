import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { getUserFromRequest } from '@/lib/auth';

export async function GET() {
	try {
		await connectDB();
		const products = await Product.find({}).lean();
		return NextResponse.json({ products });
	} catch (error) {
		console.error('Error obteniendo productos:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	const user = getUserFromRequest(request);
	if (!user || !user.isAdmin) {
		return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
	}
	try {
		const productData = await request.json();
		// Validaciones básicas
		if (
			!productData.name ||
			typeof productData.name !== 'string' ||
			productData.name.trim().length < 3
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
			!productData.description ||
			typeof productData.description !== 'string' ||
			productData.description.trim().length < 10
		) {
			return NextResponse.json(
				{
					error:
						'La descripción es obligatoria y debe tener al menos 10 caracteres.',
				},
				{ status: 400 },
			);
		}
		if (typeof productData.price !== 'number' || productData.price < 0) {
			return NextResponse.json(
				{
					error:
						'El precio es obligatorio y debe ser un número mayor o igual a 0.',
				},
				{ status: 400 },
			);
		}
		if (!productData.category || typeof productData.category !== 'string') {
			return NextResponse.json(
				{ error: 'La categoría es obligatoria.' },
				{ status: 400 },
			);
		}
		if (!Array.isArray(productData.images) || productData.images.length === 0) {
			return NextResponse.json(
				{ error: 'Debes subir al menos una imagen.' },
				{ status: 400 },
			);
		}
		if (typeof productData.stock !== 'number' || productData.stock < 0) {
			return NextResponse.json(
				{
					error:
						'El stock es obligatorio y debe ser un número mayor o igual a 0.',
				},
				{ status: 400 },
			);
		}
		if (!productData.sku || typeof productData.sku !== 'string') {
			productData.sku = `SKU-${Date.now()}-${Math.random()
				.toString(36)
				.substr(2, 9)}`;
		}
		await connectDB();
		const product = await Product.create(productData);
		return NextResponse.json({
			message: 'Producto creado exitosamente',
			product,
		});
	} catch (error: any) {
		console.error('Error creando producto:', error);
		if (error.code === 11000) {
			return NextResponse.json({ error: 'El SKU ya existe' }, { status: 400 });
		}
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
