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
			console.error('❌ Falta firma o secreto de Stripe');
			return NextResponse.json(
				{ error: 'Falta firma o secreto de Stripe' },
				{ status: 400 },
			);
		}
		event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
		console.log(`🔔 Webhook recibido: ${event.type}`);
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
			console.log(`💰 Checkout completado: ${session.id}`);

			try {
				// Buscar el pedido por paymentId (session.id)
				const order = await prisma.order.findFirst({
					where: { paymentId: session.id },
					include: { user: true, items: { include: { product: true } } },
				});

				if (order && !order.isPaid) {
					// Actualizar estado del pedido
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

					// Actualizar stock de productos
					for (const itemTyped of order.items as Array<{
						productId: string;
						quantity: number;
					}>) {
						const item: { productId: string; quantity: number } = itemTyped;
						await prisma.product.update({
							where: { id: item.productId },
							data: {
								stock: {
									decrement: item.quantity,
								},
							},
						});
					}
					console.log('📦 Stock actualizado para todos los productos');

					// Enviar email de confirmación al cliente
					try {
						await sendOrderConfirmationEmail({
							customerName: order.user.name || 'Cliente',
							customerEmail: order.user.email,
							orderItems: order.items.map((item: any) => ({
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

					// Enviar email de notificación al admin
					try {
						await sendOrderConfirmationEmail({
							customerName: order.user.name || 'Cliente',
							customerEmail: ADMIN_EMAIL,
							orderItems: order.items.map(
								(item: {
									product: { name: string };
									quantity: number;
									price: number;
								}) => ({
									name: item.product.name,
									quantity: item.quantity,
									price: item.price,
								}),
							),
							shippingAddress: order.shippingAddress,
							paymentMethod: { brand: 'Stripe', last4: '****' },
							totalAmount: order.totalAmount || 0,
							orderId: order.id,
						});
						console.log('📧 Email de notificación enviado al admin');
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
									message: `Se ha recibido un nuevo pedido pagado (#${order.id}) por ${order.user.name || 'Cliente'} por $${order.totalAmount}.`,
									data: {
										orderId: order.id,
										totalAmount: order.totalAmount,
										customerName: order.user.name,
										customerEmail: order.user.email,
									},
									isRead: false,
								},
							});
							console.log('🔔 Notificación interna creada para el admin');
						}
					} catch (notifError) {
						console.error('❌ Error creando notificación interna:', notifError);
					}
				} else if (!order) {
					console.warn('⚠️ No se encontró pedido con paymentId:', session.id);
				} else {
					console.log('ℹ️ Pedido ya marcado como pagado:', order.id);
				}
			} catch (err) {
				console.error('❌ Error procesando checkout.session.completed:', err);
			}
			break;
		}

		case 'payment_intent.succeeded': {
			const paymentIntent = event.data.object as Stripe.PaymentIntent;
			console.log(`💳 Payment Intent exitoso: ${paymentIntent.id}`);
			break;
		}

		case 'payment_intent.payment_failed': {
			const paymentIntent = event.data.object as Stripe.PaymentIntent;
			console.log(`❌ Payment Intent fallido: ${paymentIntent.id}`);
			// Nota: Para manejar payment_intent.payment_failed necesitaríamos
			// agregar campos adicionales al modelo Order
			break;
		}

		case 'charge.refunded': {
			const charge = event.data.object as Stripe.Charge;
			console.log(`↩️ Cargo reembolsado: ${charge.id}`);
			// Nota: Para manejar charge.refunded necesitaríamos
			// agregar campos adicionales al modelo Order
			break;
		}

		default:
			console.log(`🔔 Evento no manejado: ${event.type}`);
	}

	return NextResponse.json({ received: true }, { status: 200 });
}
