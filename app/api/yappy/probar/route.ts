import { NextRequest, NextResponse } from 'next/server';
import { abrirSesion, comercialConfigurado } from '@/lib/payments/yappy-comercial';
import { exigirAdmin } from '@/lib/solo-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Prueba de conexión con las APIs de Integración de Yappy.
 *
 * Solo administración. Intenta abrir una sesión y dice si el banco contestó,
 * sin devolver el token ni ninguna credencial. Sirve para saber si la
 * dirección de la API y las cabeceras están bien ANTES de construir nada
 * encima.
 */
export async function GET(request: NextRequest) {
	const noPuede = await exigirAdmin(request);
	if (noPuede) return noPuede;

	if (!comercialConfigurado()) {
		return NextResponse.json(
			{
				ok: false,
				motivo: 'Faltan variables',
				necesito: {
					YAPPY_API_KEY: Boolean(process.env.YAPPY_API_KEY),
					YAPPY_SECRET_KEY: Boolean(process.env.YAPPY_SECRET_KEY),
					YAPPY_API_BASE_V3: Boolean(process.env.YAPPY_API_BASE_V3),
				},
			},
			{ status: 503 },
		);
	}

	try {
		await abrirSesion();
		return NextResponse.json({ ok: true, mensaje: 'Sesión abierta con Yappy.' });
	} catch (error: any) {
		return NextResponse.json(
			{ ok: false, error: error?.message || 'No pude abrir sesión.' },
			{ status: 502 },
		);
	}
}
