import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Le da al navegador lo justo para dibujar el botón de PayPal.
 *
 * Antes esto viajaba en `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, y eso traía dos
 * molestias:
 *   1. Vercel avisa —con razón— que el prefijo `NEXT_PUBLIC_` expone el valor
 *      al navegador, y obliga a marcar la variable como "Config" en vez de
 *      secreta. Un paso más para equivocarse.
 *   2. Las `NEXT_PUBLIC_*` se incrustan AL COMPILAR. O sea que después de
 *      cargarla en Vercel había que volver a desplegar para que el botón
 *      apareciera; si no, seguía sin salir y parecía que estaba mal puesta.
 *
 * Leyéndolo desde el servidor, alcanza con `PAYPAL_CLIENT_ID` y el cambio
 * toma efecto solo, sin desplegar de nuevo.
 *
 * El Client ID no es un secreto: viaja igual en la URL del SDK de PayPal que
 * carga cualquier visitante. El que NUNCA sale de acá es el
 * PAYPAL_CLIENT_SECRET.
 */
export async function GET(pedido: Request) {
	const clientId = (process.env.PAYPAL_CLIENT_ID || '').trim();
	const secret = (process.env.PAYPAL_CLIENT_SECRET || '').trim();

	/*
	  Comprobación de forma, no solo de presencia.

	  Pasó de verdad: se pegó en Vercel el Client ID que el panel de PayPal
	  muestra ABREVIADO, o sea "AY2Hsk...zq7H..." con puntos suspensivos. La
	  variable existía, `Boolean(clientId)` daba true, y el botón simplemente no
	  aparecía nunca porque PayPal devolvía 400 al cargar el SDK — sin ningún
	  mensaje que dijera por qué.

	  Un Client ID de PayPal son ~80 caracteres de [A-Za-z0-9_-], igual que el
	  secret. Si no tiene esa forma, lo decimos claro.
	*/
	const bienFormado = (v: string) => /^[A-Za-z0-9_-]{60,120}$/.test(v);

	const problemas: string[] = [];
	if (!clientId) problemas.push('falta PAYPAL_CLIENT_ID');
	else if (!bienFormado(clientId))
		problemas.push(
			`PAYPAL_CLIENT_ID no tiene forma de client id (${clientId.length} caracteres` +
				`${clientId.includes('...') ? ', y trae "..." — se pegó la versión abreviada del panel de PayPal' : ''})`,
		);
	if (!secret) problemas.push('falta PAYPAL_CLIENT_SECRET');
	else if (!bienFormado(secret))
		problemas.push(
			`PAYPAL_CLIENT_SECRET no tiene forma de secret (${secret.length} caracteres` +
				`${secret.includes('...') ? ', y trae "..."' : ''})`,
		);

	const configurado = problemas.length === 0;
	const entorno = process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox';

	/*
	  Probar de verdad, no sólo mirar la forma.

	  El botón salía bien y al tocarlo PayPal devolvía 401 sin decir por qué.
	  «Bien formado» no es «sirve»: unas credenciales de sandbox tienen la misma
	  pinta que unas de live, y usarlas contra el otro endpoint da exactamente
	  ese 401.

	  Con `?probar=1` se pide el token a los DOS entornos y se dice en cuál
	  autentican. Eso convierte media hora de adivinar en una respuesta. No sale
	  ningún secreto: sólo el código de estado de cada uno.
	*/
	const url = new URL(pedido.url);
	let prueba: Record<string, unknown> | undefined;

	if (configurado && url.searchParams.get('probar') === '1') {
		const probar = async (base: string) => {
			try {
				const r = await fetch(`${base}/v1/oauth2/token`, {
					method: 'POST',
					headers: {
						Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: 'grant_type=client_credentials',
					cache: 'no-store',
				});
				return r.status;
			} catch {
				return 0;
			}
		};

		const [live, sandbox] = await Promise.all([
			probar('https://api-m.paypal.com'),
			probar('https://api-m.sandbox.paypal.com'),
		]);

		const donde = live === 200 ? 'live' : sandbox === 200 ? 'sandbox' : null;
		prueba = {
			live,
			sandbox,
			autenticaEn: donde,
			usando: entorno,
			sugerencia:
				donde === null
					? 'Las credenciales no autentican en ninguno de los dos: están mal copiadas o la app de PayPal fue borrada.'
					: donde === entorno
						? 'Todo en orden: autentica en el entorno configurado.'
						: `Son credenciales de ${donde} y PAYPAL_ENV dice ${entorno}. Poné PAYPAL_ENV=${donde}, o cambiá las credenciales por las de ${entorno}.`,
		};
	}

	return NextResponse.json(
		{
			clientId: configurado ? clientId : '',
			entorno,
			configurado,
			// Nunca sale el valor del secret: solo si tiene la pinta correcta.
			problemas,
			...(prueba ? { prueba } : {}),
		},
		{ headers: { 'Cache-Control': 'no-store' } },
	);
}
