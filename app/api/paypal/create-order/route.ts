import { NextRequest, NextResponse } from 'next/server';
import { crearOrden, paypalEstaConfigurado } from '@/lib/payments/paypal';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Crea la orden de PayPal para un pedido que YA existe en nuestra base.
 *
 * Del navegador solo llega el id del pedido. Los productos, los precios, el
 * envío y el total salen de la fila del pedido, que a su vez se calculó contra
 * la base al crearlo. Así el monto que ve el comprador en PayPal es
 * exactamente el mismo que después se compara al capturar.
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
		const { orderId } = await request.json();
		if (!orderId || typeof orderId !== 'string') {
			return NextResponse.json({ error: 'Falta el orderId.' }, { status: 400 });
		}

		const pedido = await prisma.order.findUnique({
			where: { id: orderId },
			include: { items: true },
		});
		if (!pedido) {
			return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
		}
		if (pedido.userId !== usuario.id) {
			return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
		}
		if (pedido.isPaid) {
			return NextResponse.json({ error: 'Este pedido ya está pagado.' }, { status: 409 });
		}
		if (!pedido.items.length) {
			return NextResponse.json({ error: 'El pedido no tiene productos.' }, { status: 400 });
		}

		const productos = await prisma.product.findMany({
			where: { id: { in: pedido.items.map((i) => i.productId) } },
			select: { id: true, name: true, sku: true },
		});
		const porId = new Map(productos.map((p) => [p.id, p]));

		const subtotal = pedido.items.reduce((s, i) => s + i.price * i.quantity, 0);
		// Lo que el pedido tenga de más sobre la suma de los items es el envío.
		const envio = Math.max(0, Math.round(((pedido.totalAmount ?? subtotal) - subtotal) * 100) / 100);

		const orden = await crearOrden({
			orderId: pedido.id,
			items: pedido.items.map((i) => ({
				name: porId.get(i.productId)?.name || 'Producto Mautik',
				quantity: i.quantity,
				price: i.price,
				sku: porId.get(i.productId)?.sku,
			})),
			envio,
			impuestos: 0,
		});

		return NextResponse.json({
			paypalOrderId: orden.id,
			total: pedido.totalAmount,
			subtotal,
			envio,
		});
	} catch (error: any) {
		console.error('[paypal/create-order]', error);
		return NextResponse.json(
			{ error: error?.message || 'No pude crear la orden en PayPal.' },
			{ status: 400 },
		);
	}
}
