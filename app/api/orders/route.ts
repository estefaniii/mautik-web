import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
	try {
		await connectDB();
		const orders = await Order.find({})
			.populate('user')
			.populate('items.product');
		return NextResponse.json(orders);
	} catch (error) {
		console.error('Error fetching orders:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		await connectDB();
		const user = getUserFromRequest(request);
		if (!user) {
			return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
		}
		const data = await request.json();
		// Validar datos mínimos
		if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
			return NextResponse.json(
				{ error: 'No hay productos en el pedido.' },
				{ status: 400 },
			);
		}
		// Validar cada item
		for (const item of data.items) {
			if (
				!item.product ||
				typeof item.product !== 'string' ||
				!item.product.match(/^[a-fA-F0-9]{24}$/)
			) {
				return NextResponse.json(
					{ error: 'ID de producto inválido en el pedido.' },
					{ status: 400 },
				);
			}
			if (typeof item.quantity !== 'number' || item.quantity <= 0) {
				return NextResponse.json(
					{ error: 'Cantidad inválida para un producto en el pedido.' },
					{ status: 400 },
				);
			}
		}
		// Descontar stock
		for (const item of data.items) {
			const product = await Product.findById(item.product);
			if (!product) {
				return NextResponse.json(
					{ error: `Producto no encontrado: ${item.product}` },
					{ status: 400 },
				);
			}
			if (product.stock < item.quantity) {
				return NextResponse.json(
					{ error: `Stock insuficiente para ${product.name}` },
					{ status: 400 },
				);
			}
			product.stock -= item.quantity;
			await product.save();
		}
		// Crear pedido
		const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
		const order = await Order.create({
			...data,
			user: user.id,
			orderNumber,
			status: 'pending',
			isPaid: false,
			isDelivered: false,
		});
		return NextResponse.json({ message: 'Pedido creado exitosamente', order });
	} catch (error) {
		console.error('Error creando pedido:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
