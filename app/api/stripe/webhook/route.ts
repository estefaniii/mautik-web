import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { sendOrderConfirmationEmail } from '@/lib/resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2025-06-30.basil',
});

const ADMIN_EMAIL = 'estefanidelosangelestorres@gmail.com';

export async function POST(req: NextRequest) {
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
	const sig = req.headers.get('stripe-signature');
	const buf = await req.arrayBuffer();
	const body = Buffer.from(buf);

	let event: Stripe.Event;

	try {
		if (!sig || !webhookSecret) {
			return NextResponse.json(
				{ error: 'Falta firma o secreto de Stripe' },
				{ status: 400 },
			);
		}
		event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
	} catch (err: any) {
		console.error('❌ Error verificando firma Stripe:', err.message);
		return NextResponse.json(
			{ error: `Webhook Error: ${err.message}` },
			{ status: 400 },
		);
	}

	// Manejar eventos relevantes
	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object as Stripe.Checkout.Session;
			try {
				// Buscar el pedido por paymentId (session.id)
				const order = await prisma.order.findFirst({
					where: { paymentId: session.id },
					include: { user: true, items: { include: { product: true } } },
				});
				if (order && !order.isPaid) {
					await prisma.order.update({
						where: { id: order.id },
						data: {
							status: 'paid',
							isPaid: true,
							paidAt: new Date(),
							paymentMethod: 'stripe',
						},
					});
					console.log('✅ Pedido actualizado como pagado:', order.id);
					// Enviar email de confirmación al cliente
					try {
						await sendOrderConfirmationEmail({
							customerName: order.user.name || 'Cliente',
							customerEmail: order.user.email,
							orderItems: order.items.map((item) => ({
								name: item.product.name,
								quantity: item.quantity,
								price: item.price,
							})),
							shippingAddress: order.shippingAddress,
							paymentMethod: { brand: 'Stripe', last4: '****' },
							totalAmount: order.totalAmount || 0,
							orderId: order.id,
						});
						console.log('📧 Email de confirmación enviado a', order.user.email);
					} catch (emailError) {
						console.error(
							'❌ Error enviando email de confirmación:',
							emailError,
						);
					}
					// Enviar email de confirmación al admin
					try {
						await sendOrderConfirmationEmail({
							customerName: order.user.name || 'Cliente',
							customerEmail: ADMIN_EMAIL,
							orderItems: order.items.map((item) => ({
								name: item.product.name,
								quantity: item.quantity,
								price: item.price,
							})),
							shippingAddress: order.shippingAddress,
							paymentMethod: { brand: 'Stripe', last4: '****' },
							totalAmount: order.totalAmount || 0,
							orderId: order.id,
						});
						console.log(
							'📧 Email de confirmación enviado al admin',
							ADMIN_EMAIL,
						);
					} catch (adminEmailError) {
						console.error('❌ Error enviando email al admin:', adminEmailError);
					}
					// Crear notificación interna para el admin
					try {
						const adminUser = await prisma.user.findFirst({
							where: { isAdmin: true },
						});
						if (adminUser) {
							await prisma.notification.create({
								data: {
									userId: adminUser.id,
									type: 'order',
									title: 'Nuevo pedido pagado',
									message: `Se ha recibido un nuevo pedido pagado (#${order.id}) por ${order.user.name || 'Cliente'}.`,
									data: { orderId: order.id, totalAmount: order.totalAmount },
									isRead: false,
								},
							});
							console.log('🔔 Notificación interna creada para el admin');
						} else {
							console.warn(
								'⚠️ No se encontró usuario admin para notificación interna',
							);
						}
					} catch (notifError) {
						console.error(
							'❌ Error creando notificación interna para admin:',
							notifError,
						);
					}
				} else if (!order) {
					console.warn('⚠️ No se encontró pedido con paymentId:', session.id);
				}
			} catch (err) {
				console.error('❌ Error actualizando pedido:', err);
			}
			break;
		}
		// Puedes agregar más casos para otros eventos de Stripe
		default:
			console.log(`🔔 Evento recibido: ${event.type}`);
	}

	return NextResponse.json({ received: true }, { status: 200 });
}
