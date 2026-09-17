import { NextRequest, NextResponse } from 'next/server';
import { verificarWebhook } from '@/lib/payments/paypal';
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
			await prisma.order.updateMany({
				where: { id: orderId, isPaid: false },
				data: {
					isPaid: true,
					paidAt: new Date(),
					status: 'paid',
					paymentMethod: 'paypal',
					paymentId: recurso.id,
				},
			});
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
