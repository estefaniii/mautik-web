import { NextRequest, NextResponse } from 'next/server';
import { capturarOrden, paypalEstaConfigurado } from '@/lib/payments/paypal';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { sendOrderConfirmationEmail } from '@/lib/resend';
import { marcarCuponUsado } from '@/lib/payments/cupones';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cobra efectivamente una orden aprobada por el comprador.
 *
 * Este es el ÚNICO lugar donde un pedido pasa a "pagado". El navegador nunca
 * captura: si lo hiciera, alcanzaría con editar la petición para pagar un
 * centavo. Acá se compara lo que PayPal dice que cobró contra el total que
 * calculamos nosotros desde la base, y recién ahí se marca pagado, se
 * descuenta el stock y se manda el correo de confirmación.
 *
 * Es idempotente: si el pedido ya estaba pagado, devuelve ok sin volver a
 * cobrar ni a descontar stock (PayPal puede reintentar, y la clienta puede
 * recargar la página).
 */
export async function POST(request: NextRequest) {
	if (!paypalEstaConfigurado()) {
		return NextResponse.json(
			{ error: 'PayPal no está configurado en este entorno.' },
			{ status: 503 },
		);
	}

	const usuario = await getAuthUser(request);
	if (!usuario) {
		return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
	}

	try {
		const { paypalOrderId, orderId } = await request.json();
		if (!paypalOrderId || !orderId) {
			return NextResponse.json(
				{ error: 'Faltan paypalOrderId u orderId.' },
				{ status: 400 },
			);
		}

		const pedido = await prisma.order.findUnique({
			where: { id: orderId },
			include: { items: true },
		});
		if (!pedido) {
			return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
		}
		// Nadie puede capturar el pedido de otra persona.
		if (pedido.userId !== usuario.id) {
			return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
		}
		if (pedido.isPaid) {
			return NextResponse.json({ ok: true, yaEstabaPagado: true, captureId: pedido.paymentId });
		}

		const captura = await capturarOrden(paypalOrderId);

		if (captura.status !== 'COMPLETED') {
			return NextResponse.json(
				{ error: `PayPal devolvió el estado ${captura.status}.` },
				{ status: 402 },
			);
		}

		// El pedido solo se marca pagado si el monto cobrado coincide con el total.
		if (
			pedido.totalAmount != null &&
			Math.abs(captura.montoCobrado - pedido.totalAmount) > 0.01
		) {
			console.error(
				`[paypal/capture] monto distinto: cobrado ${captura.montoCobrado} vs pedido ${pedido.totalAmount}`,
			);
			return NextResponse.json(
				{ error: 'El monto cobrado no coincide con el pedido.' },
				{ status: 409 },
			);
		}

		// Marcar pagado y descontar stock van juntos o no van: si el stock no
		// alcanza, el pedido igual queda pagado (la plata ya se cobró) pero se
		// marca para revisar a mano en vez de dejar el stock en negativo.
		const productos = await prisma.product.findMany({
			where: { id: { in: pedido.items.map((i) => i.productId) } },
			select: { id: true, name: true, stock: true },
		});
		const stockPorId = new Map(productos.map((p) => [p.id, p.stock]));
		const faltantes = pedido.items.filter(
			(i) => (stockPorId.get(i.productId) ?? 0) < i.quantity,
		);

		await prisma.$transaction(async (tx) => {
			for (const item of pedido.items) {
				const disponible = stockPorId.get(item.productId) ?? 0;
				await tx.product.update({
					where: { id: item.productId },
					// nunca por debajo de cero
					data: { stock: Math.max(0, disponible - item.quantity) },
				});
			}
			await tx.order.update({
				where: { id: orderId },
				data: {
					isPaid: true,
					paidAt: new Date(),
					status: faltantes.length ? 'paid_revisar_stock' : 'paid',
					paymentMethod: 'paypal',
					paymentId: captura.captureId,
				},
			});

			/*
			  El cupón se consume ACÁ, no al crear el pedido.

			  Si se contara al crear, un carrito abandonado —que es la mayoría—
			  gastaría el uso y un cupón de "10 usos" se agotaría sin una sola
			  venta. Va dentro de la misma transacción que el cobro: o se marca
			  pagado y se consume el cupón, o no pasa ninguna de las dos.
			*/
			if (pedido.couponCode) {
				await marcarCuponUsado(tx, pedido.couponCode);
			}
		});

		if (faltantes.length) {
			console.error(
				'[paypal/capture] pedido pagado con stock insuficiente:',
				orderId,
				faltantes.map((f) => f.productId),
			);
		}

		// El correo se manda recién acá. Antes salía al crear el pedido, así que
		// llegaba "Pedido confirmado" aunque el pago nunca se completara.
		try {
			const nombres = new Map(productos.map((p) => [p.id, p.name]));
			await sendOrderConfirmationEmail({
				customerName: usuario.name || 'Cliente',
				customerEmail: usuario.email,
				orderItems: pedido.items.map((i) => ({
					name: nombres.get(i.productId) || 'Producto',
					quantity: i.quantity,
					price: i.price,
				})),
				shippingAddress: pedido.shippingAddress as any,
				paymentMethod: { brand: 'PayPal', last4: captura.captureId.slice(-4) },
				totalAmount: pedido.totalAmount ?? captura.montoCobrado,
				orderId: pedido.id,
			});
		} catch (errorCorreo) {
			// El pago ya está hecho: un correo que falla no puede tumbar la compra.
			console.error('[paypal/capture] no se pudo mandar el correo:', errorCorreo);
		}

		return NextResponse.json({ ok: true, captureId: captura.captureId });
	} catch (error: any) {
		console.error('[paypal/capture]', error);
		return NextResponse.json(
			{ error: error?.message || 'No pude cobrar el pago.' },
			{ status: 400 },
		);
	}
}
