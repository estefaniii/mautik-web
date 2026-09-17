import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Comprobación de que la base responde. Sirve para diagnosticar a mano.
 *
 * ⚠️ YA NO HAY CRON APUNTANDO ACÁ, Y NO SE DEBE VOLVER A PONER.
 *
 * Hasta el 2026-09-16 un cron de Vercel pegaba acá **cada 5 minutos, las 24
 * horas**, para que Neon no suspendiera la base y no hubiera arranques en
 * frío. El efecto fue el contrario al buscado:
 *
 *   · El plan gratis de Neon da ~192 horas de cómputo al mes.
 *   · Una base despierta 24/7 gasta 720 horas al mes.
 *   · O sea que la cuota se agota en unos 8 días, y cuando se agota la base
 *     deja de responder POR COMPLETO: sin productos, sin carrito, sin pedidos.
 *
 * Y eso fue exactamente lo que pasó: el cron se puso el 10 de septiembre y el
 * 16 la tienda estaba caída con
 * `ERROR: Your account or project has exceeded the compute time quota`.
 *
 * Cambiar un arranque en frío de un segundo por la tienda muerta una semana
 * al mes es un pésimo negocio. Ahora la base duerme cuando no hay nadie, que
 * es justamente para lo que está pensado el plan.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
	const t0 = Date.now();
	try {
		await prisma.$queryRaw`SELECT 1`;
		return NextResponse.json(
			{ ok: true, ms: Date.now() - t0 },
			{ headers: { 'Cache-Control': 'no-store' } },
		);
	} catch (error: any) {
		// Un fallo acá casi siempre es la base despertando. Se registra para
		// poder verlo en los logs de Vercel, pero no se expone el detalle.
		console.error('[keepalive] la base no respondió:', error?.message);
		return NextResponse.json(
			{ ok: false, ms: Date.now() - t0 },
			{ status: 503, headers: { 'Cache-Control': 'no-store' } },
		);
	}
}
