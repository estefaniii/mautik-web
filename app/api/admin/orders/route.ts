import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { exigirAdmin } from '@/lib/solo-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Pedidos para el panel de administración.
 *
 * Dos cambios respecto a la versión anterior:
 *  · Traía `user: true` entero, o sea que el JSON incluía el hash de la
 *    contraseña de cada clienta. Ahora va un `select` con lo que de verdad
 *    hace falta para atender un pedido: nombre, correo y teléfono.
 *  · Traía TODOS los pedidos de una, sin orden. Ahora vienen los más nuevos
 *    primero y de a tandas.
 */
export async function GET(request: NextRequest) {
	const noPuede = await exigirAdmin(request);
	if (noPuede) return noPuede;

	const { searchParams } = new URL(request.url);
	const estado = searchParams.get('estado');
	const limite = Math.min(Number(searchParams.get('limite') ?? 50), 200);
	const salto = Math.max(Number(searchParams.get('salto') ?? 0), 0);

	const where =
		estado && estado !== 'todos'
			? estado === 'porEnviar'
				? { isPaid: true, isDelivered: false }
				: { status: estado }
			: {};

	const [pedidos, total] = await Promise.all([
		prisma.order.findMany({
			where,
			orderBy: { createdAt: 'desc' },
			take: limite,
			skip: salto,
			include: {
				user: { select: { id: true, name: true, email: true, phone: true } },
				items: {
					include: { product: { select: { name: true, sku: true, images: true } } },
				},
			},
		}),
		prisma.order.count({ where }),
	]);

	return NextResponse.json({ pedidos, total });
}
