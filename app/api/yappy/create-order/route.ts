import { NextRequest, NextResponse } from 'next/server';
import { crearOrden, yappyEstaConfigurado } from '@/lib/payments/yappy';
import { calcularTotales } from '@/lib/payments/totales';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Crea la orden en Yappy y devuelve la URL a la que hay que mandar al
 * comprador. El monto se recalcula en el servidor.
 */
export async function POST(request: NextRequest) {
	/*
	  Hay que tener sesión, y el pedido tiene que ser TUYO.

	  Sin esto, cualquiera que supiera (o adivinara) el id de un pedido ajeno
	  podía pedirle a Yappy una orden de cobro sobre él. Es la misma regla que
	  ya tenía PayPal.
	*/
	const usuario = await getAuthUser(request);
	if (!usuario) {
		return NextResponse.json(
			{ error: 'Tienes que iniciar sesión.' },
			{ status: 401 },
		);
	}

	if (!yappyEstaConfigurado()) {
		return NextResponse.json(
			{ error: 'Yappy no está configurado en este entorno.' },
			{ status: 503 },
		);
	}

	try {
		const { orderId, items, direccion, metodoEnvio, telefono } =
			await request.json();

		if (!orderId || typeof orderId !== 'string') {
			return NextResponse.json({ error: 'Falta el orderId.' }, { status: 400 });
		}

		// Yappy solo acepta alias de 8 dígitos (celular panameño).
		const tel = String(telefono || '').replace(/\D/g, '');
		if (tel && tel.length !== 8) {
			return NextResponse.json(
				{ error: 'El número de Yappy debe tener 8 dígitos.' },
				{ status: 400 },
			);
		}

		const pedido = await prisma.order.findUnique({ where: { id: orderId } });
		if (!pedido) {
			return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
		}
		if (pedido.userId !== usuario.id) {
			return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
		}
		if (pedido.isPaid) {
			return NextResponse.json({ error: 'Este pedido ya está pagado.' }, { status: 409 });
		}

		/*
		  El cupón del pedido entra en el cálculo.

		  Sin esto, Yappy cobraba el total SIN descuento mientras el pedido
		  guardado decía que sí lo tenía: la clienta veía "−$2.00" en el
		  carrito y pagaba los $2 igual.
		*/
		const totales = await calcularTotales(items, {
			direccion,
			metodoEnvio,
			codigoCupon: pedido.couponCode,
		});

		const orden = await crearOrden({
			orderId,
			total: totales.total,
			subtotal: totales.subtotal,
			impuestos: totales.impuestos,
			envio: totales.envio,
			telefono: tel || undefined,
		});

		// Guardamos el transactionId para poder conciliar cuando llegue la IPN.
		await prisma.order.update({
			where: { id: orderId },
			data: {
				paymentMethod: 'yappy',
				paymentId: orden.transactionId,
				totalAmount: totales.total,
				status: 'awaiting_payment',
			},
		});

		return NextResponse.json({
			redirectUrl: orden.redirectUrl,
			transactionId: orden.transactionId,
			total: totales.total,
		});
	} catch (error: any) {
		console.error('[yappy/create-order]', error);
		return NextResponse.json(
			{ error: error?.message || 'No pude crear la orden en Yappy.' },
			{ status: 400 },
		);
	}
}
