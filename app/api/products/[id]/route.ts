import { type NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = params;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json({ error: 'ID inválido' }, { status: 404 });
		}
		await connectDB();
		const product = await Product.findById(id).lean();
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
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	const user = getUserFromRequest(req);
	if (!user || !user.isAdmin) {
		return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
	}
	try {
		const { id } = params;
		await connectDB();
		const deleted = await Product.findByIdAndDelete(id);
		if (!deleted) {
			return NextResponse.json(
				{ error: 'Producto no encontrado' },
				{ status: 404 },
			);
		}
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error eliminando producto:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	const user = getUserFromRequest(req);
	if (!user || !user.isAdmin) {
		return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
	}
	try {
		const { id } = params;
		const data = await req.json();
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
		if (!data.sku || typeof data.sku !== 'string') {
			data.sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		}
		await connectDB();
		const updated = await Product.findByIdAndUpdate(id, data, { new: true });
		if (!updated) {
			return NextResponse.json(
				{ error: 'Producto no encontrado' },
				{ status: 404 },
			);
		}
		return NextResponse.json(updated);
	} catch (error) {
		console.error('Error actualizando producto:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
