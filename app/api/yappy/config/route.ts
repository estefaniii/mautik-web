import { NextRequest, NextResponse } from 'next/server';
import { yappyEstaConfigurado } from '@/lib/payments/yappy';
import { comercialConfigurado } from '@/lib/payments/yappy-comercial';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * ¿Se puede cobrar con Yappy en este entorno?
 *
 * NO devuelve ninguna credencial: solo dice sí o no, y qué falta.
 *
 * Hay DOS productos distintos de Banco General y se confunden fácil:
 *
 *  · "Botón de Pago Yappy" (el que implementa este código): entrega
 *    ID del Comercio (32 caracteres) + Clave Secreta, y su API vive en
 *    apipagosbg.bgeneral.cloud (/payments/validatemerchant, /payments/payment-wc).
 *
 *  · "Yappy Comercial API" v3.x: entrega Código de semilla + Clave secreta +
 *    API Key, y su API es otra (/v1/collection-method, etc.).
 *
 * El botón del checkout se enciende SOLO con las credenciales del primero,
 * que es el protocolo que el código sabe hablar. Las del segundo se reportan
 * acá nada más para poder diagnosticar, porque encender el botón con unas
 * credenciales que el código no sabe usar sería mandar a la clienta a un
 * cobro que falla.
 */
export async function GET(_request: NextRequest) {
	const dominio = Boolean(
		process.env.YAPPY_DOMAIN ||
			process.env.NEXT_PUBLIC_SITE_URL ||
			process.env.NEXT_PUBLIC_BASE_URL,
	);

	const faltan: string[] = [];
	if (!process.env.YAPPY_MERCHANT_ID) faltan.push('YAPPY_MERCHANT_ID');
	if (!process.env.YAPPY_SECRET_KEY) faltan.push('YAPPY_SECRET_KEY');
	if (!dominio) faltan.push('YAPPY_DOMAIN');

	return NextResponse.json({
		configurado: yappyEstaConfigurado() && dominio,
		entorno: process.env.YAPPY_ENV === 'test' ? 'pruebas' : 'produccion',
		faltan,
		// Diagnóstico: qué credenciales hay cargadas, sin decir su valor.
		credencialesCargadas: {
			botonDePago: {
				YAPPY_MERCHANT_ID: Boolean(process.env.YAPPY_MERCHANT_ID),
				YAPPY_SECRET_KEY: Boolean(process.env.YAPPY_SECRET_KEY),
			},
			yappyComercialApi: {
				YAPPY_API_KEY: Boolean(process.env.YAPPY_API_KEY),
				YAPPY_SEED: Boolean(process.env.YAPPY_SEED),
				YAPPY_API_BASE_V3: Boolean(process.env.YAPPY_API_BASE_V3),
				listoParaConsultar: comercialConfigurado(),
			},
		},
	});
}
