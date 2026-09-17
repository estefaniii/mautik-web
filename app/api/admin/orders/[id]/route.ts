import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { exigirAdmin } from '@/lib/solo-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cambiar el estado de un pedido desde el panel.
 *
 * Estados que maneja la tienda:
 *   pending    → hecho pero sin pagar (nace así; PayPal lo pasa a paid)
 *   paid       → pagado, falta enviarlo
 *   shipped    → ya se envió
 *   delivered  → entregado
 *   cancelled  → cancelado
 *
 * Cancelar un pedido que ya había descontado stock lo DEVUELVE. Si no, cada
 * cancelación dejaba unidades perdidas para siempre en la base.
 */
const ESTADOS = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const;
type Estado = (typeof ESTADOS)[number];

export async function PATCH(
	request: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	const noPuede = await exigirAdmin(request);
	if (noPuede) return noPuede;

	try {
		const { id } = await context.params;
		const { status } = (await request.json()) as { status?: Estado };

		if (!status || !ESTADOS.includes(status)) {
			return NextResponse.json(
				{ error: `Estado inválido. Valores: ${ESTADOS.join(', ')}.` },
				{ status: 400 },
			);
		}

		const pedido = await prisma.order.findUnique({
			where: { id },
			include: { items: true },
		});
		if (!pedido) {
			return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
		}

		const seCancela = status === 'cancelled' && pedido.status !== 'cancelled';
		// El stock solo se devuelve si de verdad se había descontado, que pasa
		// al cobrar. Un pedido pendiente nunca lo tocó.
		const devolverStock = seCancela && pedido.isPaid;

		const actualizado = await prisma.$transaction(async (tx) => {
			if (devolverStock) {
				for (const item of pedido.items) {
					await tx.product.update({
						where: { id: item.productId },
						data: { stock: { increment: item.quantity } },
					});
				}
			}
			return tx.order.update({
				where: { id },
				data: {
					status,
					isDelivered: status === 'delivered',
					...(status === 'delivered' || status === 'shipped' ? {} : {}),
				},
				include: { items: true },
			});
		});

		return NextResponse.json({ ok: true, pedido: actualizado, stockDevuelto: devolverStock });
	} catch (error: any) {
		console.error('[admin/orders PATCH]', error);
		return NextResponse.json(
			{ error: error?.message || 'No pude actualizar el pedido.' },
			{ status: 500 },
		);
	}
}
