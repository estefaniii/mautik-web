import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { exigirAdmin } from '@/lib/solo-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cierra los pedidos que quedaron a medias.
 *
 * Cuando alguien llega al checkout y elige PayPal, se le crea el pedido en
 * estado `pending` para poder calcular el monto del lado del servidor. Si
 * después cierra la pestaña, ese pedido se queda ahí para siempre ensuciando
 * la lista de pedidos y las métricas.
 *
 * NO tocan el stock: un pedido pendiente nunca lo descontó (eso pasa recién al
 * cobrar), así que cancelarlos no devuelve ni quita nada.
 *
 * ── Sobre el cron ──────────────────────────────────────────────────────
 * Vercel invoca los cron jobs con **GET**, no con POST. La primera versión de
 * esto tenía la limpieza en POST y en GET solo el conteo: el cron habría
 * corrido todos los días sin hacer absolutamente nada, y sin avisar.
 *
 * Ahora:
 *   GET  + cabecera de cron  -> limpia
 *   GET  + sesión de admin   -> solo cuenta cuántos hay (para el panel)
 *   POST + sesión de admin   -> limpia (el botón "Cerrarlos")
 */
const HORAS_POR_DEFECTO = 24;

/**
 * ¿Viene de Vercel Cron?
 *
 * Si existe CRON_SECRET, Vercel manda `Authorization: Bearer <secreto>` y eso
 * es lo que se comprueba. Si no está definido, se acepta la cabecera
 * `x-vercel-cron`, que Vercel agrega a sus propias invocaciones y borra de
 * cualquier petición que venga de afuera.
 */
function esCron(request: NextRequest): boolean {
	const secreto = process.env.CRON_SECRET;
	if (secreto) {
		return request.headers.get('authorization') === `Bearer ${secreto}`;
	}
	return request.headers.get('x-vercel-cron') !== null;
}

async function limpiar(horas: number) {
	const corte = new Date(Date.now() - horas * 60 * 60 * 1000);
	const resultado = await prisma.order.updateMany({
		where: { status: 'pending', isPaid: false, createdAt: { lt: corte } },
		data: { status: 'cancelled' },
	});
	return {
		ok: true,
		cancelados: resultado.count,
		criterio: `pendientes sin pagar con más de ${horas} h`,
	};
}

function horasDe(request: NextRequest) {
	const v = Number(new URL(request.url).searchParams.get('horas') ?? HORAS_POR_DEFECTO);
	return Math.min(Math.max(Number.isFinite(v) ? v : HORAS_POR_DEFECTO, 1), 720);
}

export async function GET(request: NextRequest) {
	if (esCron(request)) {
		const r = await limpiar(horasDe(request));
		console.log('[cron limpiar-pendientes]', r);
		return NextResponse.json(r);
	}

	const noPuede = await exigirAdmin(request);
	if (noPuede) return noPuede;

	const corte = new Date(Date.now() - HORAS_POR_DEFECTO * 60 * 60 * 1000);
	const cuantos = await prisma.order.count({
		where: { status: 'pending', isPaid: false, createdAt: { lt: corte } },
	});
	return NextResponse.json({ cuantos, horas: HORAS_POR_DEFECTO });
}

export async function POST(request: NextRequest) {
	if (!esCron(request)) {
		const noPuede = await exigirAdmin(request);
		if (noPuede) return noPuede;
	}
	return NextResponse.json(await limpiar(horasDe(request)));
}
