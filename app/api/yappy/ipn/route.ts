import { NextRequest, NextResponse } from 'next/server';
import {
	verificarFirmaIpn,
	yappyEstaConfigurado,
	ESTADOS_YAPPY,
	type EstadoYappy,
} from '@/lib/payments/yappy';
import { marcarCuponUsado } from '@/lib/payments/cupones';
import { sendOrderConfirmationEmail } from '@/lib/resend';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * IPN de Yappy: es Yappy quien nos dice si el pago se ejecutó.
 * Esta ruta es la ÚNICA fuente de verdad para marcar un pedido como pagado
 * con Yappy — nunca confiamos en el redirect del navegador.
 *
 * Yappy la llama por GET con los datos en el query string.
 */
async function procesar(datos: {
	orderId?: string | null;
	status?: string | null;
	hash?: string | null;
	domain?: string | null;
	confirmationNumber?: string | null;
}) {
	if (!yappyEstaConfigurado()) {
		return NextResponse.json({ error: 'Yappy no configurado.' }, { status: 503 });
	}

	const { orderId, status, hash } = datos;
	if (!orderId || !status || !hash) {
		return NextResponse.json({ error: 'Faltan parámetros.' }, { status: 400 });
	}

	const ok = verificarFirmaIpn({
		orderId,
		status: status as EstadoYappy,
		hash,
		domain: datos.domain || undefined,
	});

	if (!ok) {
		console.error('[yappy/ipn] firma inválida para el pedido', orderId);
		return NextResponse.json({ error: 'Firma inválida.' }, { status: 401 });
	}

	const pedido = await prisma.order.findUnique({
		where: { id: orderId },
		include: { items: true, user: { select: { name: true, email: true } } },
	});
	if (!pedido) {
		return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
	}

	if (status === 'E') {
		/*
		  Pago confirmado.

		  ⚠️ Antes esto SOLO marcaba el pedido como pagado. No descontaba el
		  stock, no consumía el cupón y no mandaba el correo de confirmación
		  —las tres cosas que sí hace la ruta de PayPal—. O sea que una venta
		  por Yappy dejaba el inventario intacto (se podía revender algo que ya
		  no existe), el cupón sin gastar y a la clienta sin ningún aviso de
		  que su compra entró.

		  `updateMany` con `isPaid:false` hace que todo esto sea idempotente:
		  Yappy puede reintentar la IPN y el stock se descuenta una sola vez.
		*/
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
					paymentMethod: 'yappy',
					paymentId: datos.confirmationNumber || pedido.paymentId,
				},
			});

			// Si ya estaba pagado (IPN repetida), no se toca nada más.
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
				'[yappy/ipn] pedido pagado con stock insuficiente:',
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
					paymentMethod: {
						brand: 'Yappy',
						last4: String(datos.confirmationNumber || '').slice(-4),
					},
					totalAmount: pedido.totalAmount ?? 0,
					orderId: pedido.id,
				});
			} catch (errorCorreo) {
				// El pago ya entró: un correo que falla no puede tumbarlo.
				console.error('[yappy/ipn] no se pudo mandar el correo:', errorCorreo);
			}
		}
	} else {
		await prisma.order.updateMany({
			where: { id: orderId, isPaid: false },
			data: {
				status: `yappy_${ESTADOS_YAPPY[status as EstadoYappy] || 'desconocido'}`,
			},
		});
	}

	return NextResponse.json({ ok: true });
}

export async function GET(request: NextRequest) {
	const q = request.nextUrl.searchParams;
	return procesar({
		orderId: q.get('orderId'),
		status: q.get('status'),
		hash: q.get('hash'),
		domain: q.get('domain'),
		confirmationNumber: q.get('confirmationNumber'),
	});
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		return procesar(body);
	} catch {
		return NextResponse.json({ error: 'Cuerpo inválido.' }, { status: 400 });
	}
}
