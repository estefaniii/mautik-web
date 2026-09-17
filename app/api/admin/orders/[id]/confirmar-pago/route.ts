import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { exigirAdmin } from '@/lib/solo-admin';
import { marcarCuponUsado } from '@/lib/payments/cupones';
import { sendOrderConfirmationEmail } from '@/lib/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Confirmar a mano un pago recibido por Yappy.
 *
 * Mientras el Botón de Pago no esté habilitado, la clienta paga por Yappy al
 * número de Mautik y Estéfani confirma desde el panel cuando ve el dinero en
 * su app del banco.
 *
 * Hace EXACTAMENTE lo mismo que la captura de PayPal, que es lo importante:
 * marcar pagado, descontar el stock, consumir el cupón y mandar el correo de
 * confirmación. Si solo se cambiara el estado a "paid" (que es lo que hace el
 * PATCH normal del panel), el inventario quedaría intacto y se podría vender
 * dos veces la misma pieza.
 *
 * Es idempotente: tocar el botón dos veces no descuenta el stock dos veces.
 */
export async function POST(
	request: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	const noPuede = await exigirAdmin(request);
	if (noPuede) return noPuede;

	const { id } = await context.params;
	const { referencia } = await request.json().catch(() => ({ referencia: undefined }));

	const pedido = await prisma.order.findUnique({
		where: { id },
		include: { items: true, user: { select: { name: true, email: true } } },
	});
	if (!pedido) {
		return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
	}
	if (pedido.isPaid) {
		return NextResponse.json({ ok: true, yaEstabaPagado: true });
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
			where: { id, isPaid: false },
			data: {
				isPaid: true,
				paidAt: new Date(),
				status: faltantes.length ? 'paid_revisar_stock' : 'paid',
				paymentMethod: 'yappy',
				paymentId: referencia ? String(referencia).slice(0, 64) : pedido.paymentId,
			},
		});
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

	if (resultado.yaEstaba) {
		return NextResponse.json({ ok: true, yaEstabaPagado: true });
	}

	if (pedido.user?.email) {
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
				paymentMethod: { brand: 'Yappy', last4: String(referencia || '').slice(-4) },
				totalAmount: pedido.totalAmount ?? 0,
				orderId: pedido.id,
			});
		} catch (e) {
			console.error('[confirmar-pago] el correo falló:', e);
		}
	}

	return NextResponse.json({
		ok: true,
		avisoStock: faltantes.length > 0,
	});
}
