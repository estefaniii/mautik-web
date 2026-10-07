import { NextRequest, NextResponse } from 'next/server';
import { verificarWebhook } from '@/lib/payments/paypal';
import { marcarCuponUsado } from '@/lib/payments/cupones';
import { sendOrderConfirmationEmail, sendNewOrderNotification } from '@/lib/resend';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Red de seguridad: si el comprador cierra la pestaña antes de que corra
 * /api/paypal/capture, PayPal nos avisa por acá y el pedido igual se marca
 * como pagado.
 *
 * Configurar en el panel de PayPal apuntando a /api/paypal/webhook y
 * suscribiendo PAYMENT.CAPTURE.COMPLETED y PAYMENT.CAPTURE.DENIED.
 */
export async function POST(request: NextRequest) {
	const crudo = await request.text();

	const valido = await verificarWebhook(request.headers, crudo);
	if (!valido) {
		// Nunca confiamos en un webhook sin firma verificada.
		return NextResponse.json({ error: 'Firma inválida.' }, { status: 401 });
	}

	try {
		const evento = JSON.parse(crudo);
		const recurso = evento?.resource;
		const orderId = recurso?.custom_id;

		if (!orderId) {
			return NextResponse.json({ ok: true, ignorado: 'sin custom_id' });
		}

		if (evento.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
			/*
			  ⚠️ Esto SOLO marcaba el pedido como pagado.

			  No descontaba stock, no consumía el cupón y no mandaba el correo
			  —las tres cosas que sí hace /api/paypal/capture—. Y justamente
			  este webhook es la red de seguridad para cuando la clienta cierra
			  la pestaña antes de que corra la captura: es decir, en el único
			  caso en que hace falta, el pedido quedaba pagado pero con el
			  inventario intacto y sin avisarle a nadie.

			  Ahora hace lo mismo que la captura. `updateMany` con
			  `isPaid:false` lo vuelve idempotente: si llegan la captura Y el
			  webhook (lo normal), el stock se descuenta una sola vez.
			*/
			const pedido = await prisma.order.findUnique({
				where: { id: orderId },
				include: { items: true, user: { select: { name: true, email: true } } },
			});
			if (!pedido) {
				return NextResponse.json({ ok: true, ignorado: 'pedido inexistente' });
			}

			const productos = await prisma.product.findMany({
				where: { id: { in: pedido.items.map((i) => i.productId) } },
				select: { id: true, name: true, stock: true },
			});
			const stockPorId = new Map(productos.map((p) => [p.id, p.stock]));
			const faltantes = pedido.items.filter(
				(i) => (stockPorId.get(i.productId) ?? 0) < i.quantity,
			);

			const resultado = await prisma.$transaction(async (tx) => {
				const marcado = await tx.order.updateMany({
					where: { id: orderId, isPaid: false },
					data: {
						isPaid: true,
						paidAt: new Date(),
						status: faltantes.length ? 'paid_revisar_stock' : 'paid',
						paymentMethod: 'paypal',
						paymentId: recurso.id,
					},
				});
				// Ya lo había marcado la captura: no se toca nada más.
				if (marcado.count === 0) return { yaEstaba: true };

				for (const item of pedido.items) {
					const disponible = stockPorId.get(item.productId) ?? 0;
					await tx.product.update({
						where: { id: item.productId },
						data: { stock: Math.max(0, disponible - item.quantity) },
					});
				}
				if (pedido.couponCode) {
					await marcarCuponUsado(tx, pedido.couponCode);
				}
				return { yaEstaba: false };
			});

			if (faltantes.length) {
				console.error(
					'[paypal/webhook] pedido pagado con stock insuficiente:',
					orderId,
					faltantes.map((f) => f.productId),
				);
			}

			if (!resultado.yaEstaba && pedido.user?.email) {
				try {
					const nombres = new Map(productos.map((p) => [p.id, p.name]));
					await sendOrderConfirmationEmail({
						customerName: pedido.user.name || 'Cliente',
						customerEmail: pedido.user.email,
						orderItems: pedido.items.map((i) => ({
							name: nombres.get(i.productId) || 'Producto',
							quantity: i.quantity,
							price: i.price,
						})),
						shippingAddress: pedido.shippingAddress as any,
						paymentMethod: { brand: 'PayPal', last4: String(recurso.id || '').slice(-4) },
						totalAmount: pedido.totalAmount ?? 0,
						orderId: pedido.id,
					});
				} catch (errorCorreo) {
					// El pago ya entró: un correo que falla no puede tumbarlo.
					console.error('[paypal/webhook] no se pudo mandar el correo:', errorCorreo);
				}
			}
			/* Y el aviso a la tienda, para que Estéfani se entere de la venta
			   sin tener que estar mirando el panel. */
			try {
				const nombres2 = new Map(productos.map((p) => [p.id, p.name]));
				await sendNewOrderNotification({
					estado: 'pagado',
					customerName: pedido.user?.name || 'Cliente',
					customerEmail: pedido.user?.email || '',
					orderItems: pedido.items.map((i) => ({
						name: nombres2.get(i.productId) || 'Producto',
						quantity: i.quantity,
						price: i.price,
					})),
					shippingAddress: pedido.shippingAddress as any,
					paymentMethod: 'paypal',
					totalAmount: pedido.totalAmount ?? 0,
					orderId: pedido.id,
				});
			} catch (e) {
				console.error('[aviso-tienda] no se pudo avisar:', e);
			}

		} else if (evento.event_type === 'PAYMENT.CAPTURE.DENIED') {
			await prisma.order.updateMany({
				where: { id: orderId, isPaid: false },
				data: { status: 'payment_failed' },
			});
		}

		return NextResponse.json({ ok: true });
	} catch (error: any) {
		console.error('[paypal/webhook]', error);
		return NextResponse.json({ error: 'Error procesando el webhook.' }, { status: 500 });
	}
}
