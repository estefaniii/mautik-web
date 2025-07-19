import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendOrderConfirmationEmail } from '@/lib/resend';

export async function GET(request: NextRequest) {
	try {
		const orders = await prisma.order.findMany({
			include: { user: true, items: true },
		});
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
		const data = await request.json();
		if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
			return NextResponse.json(
				{ error: 'No hay productos en el pedido.' },
				{ status: 400 },
			);
		}
		// Validar stock de cada producto
		const productUpdates: { id: string; newStock: number }[] = [];
		const orderItems: Array<{ name: string; quantity: number; price: number }> =
			[];

		for (const item of data.items) {
			const product = await prisma.product.findUnique({
				where: { id: item.productId },
			});
			if (!product || product.stock < item.quantity) {
				return NextResponse.json(
					{ error: `Stock insuficiente para ${product?.name || 'producto'}` },
					{ status: 400 },
				);
			}
			productUpdates.push({
				id: item.productId,
				newStock: product.stock - item.quantity,
			});
			orderItems.push({
				name: product.name,
				quantity: item.quantity,
				price: item.price,
			});
		}
		// Usar transacción para actualizar stock y crear pedido
		const result = await prisma.$transaction(async (tx) => {
			for (const update of productUpdates) {
				await tx.product.update({
					where: { id: update.id },
					data: { stock: update.newStock },
				});
			}
			const order = await tx.order.create({
				data: {
					userId: data.userId,
					items: {
						create: data.items.map((item: any) => ({
							productId: item.productId,
							quantity: item.quantity,
							price: item.price,
						})),
					},
					status: data.paymentId && data.paymentMethod ? 'paid' : 'pending',
					isPaid: !!(data.paymentId && data.paymentMethod),
					isDelivered: false,
					totalAmount: data.totalAmount,
					shippingAddress: data.shippingAddress,
					paymentMethod: data.paymentMethod || null,
					paymentId: data.paymentId || null,
					paidAt: data.paidAt
						? new Date(data.paidAt)
						: data.paymentId && data.paymentMethod
							? new Date()
							: null,
				},
				include: { items: true, user: true },
			});
			return order;
		});

		// Enviar email de confirmación
		if (result.user && data.shippingAddress) {
			try {
				await sendOrderConfirmationEmail({
					customerName: result.user.name || 'Cliente',
					customerEmail: result.user.email,
					orderItems,
					shippingAddress: data.shippingAddress,
					paymentMethod: data.paymentMethod
						? { brand: data.paymentMethod, last4: '****' }
						: { brand: 'N/A', last4: 'N/A' },
					totalAmount: data.totalAmount,
					orderId: result.id,
				});
			} catch (emailError) {
				console.error('Error enviando email de confirmación:', emailError);
				// No fallar el pedido si falla el email
			}
		}

		return NextResponse.json({
			message: 'Pedido creado exitosamente',
			order: result,
		});
	} catch (error) {
		console.error('Error creando pedido:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
