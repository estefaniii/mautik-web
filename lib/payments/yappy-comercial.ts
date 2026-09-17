/**
 * APIs de Integración de Yappy Comercial (manual v1.0.0, Open API v1.1.0).
 *
 * ⚠️ LO PRIMERO, PORQUE CAMBIA TODO: estas APIs **no cobran**.
 *
 * El manual del banco expone exactamente tres cosas:
 *   1. Sesión              — abrir y cerrar sesión
 *   2. Movimientos         — historial de transacciones y detalle de una
 *   3. Métodos de cobro    — consultar los métodos configurados
 *
 * No hay ningún endpoint para crear un cobro. Son APIs de CONSULTA y
 * conciliación, no de checkout. El "Botón de Pago Yappy" —el que sí cobra en
 * una tienda en línea— es otro producto, con otras credenciales (ID del
 * Comercio de 32 caracteres + Clave Secreta) y otra API
 * (apipagosbg.bgeneral.cloud), que es la que implementa `lib/payments/yappy.ts`.
 *
 * Para qué sirve entonces esto: para CONFIRMAR pagos automáticamente. La
 * clienta paga por Yappy al alias de Mautik y el servidor, en vez de esperar
 * una captura de pantalla por WhatsApp, busca ese pago en el historial y marca
 * el pedido solo.
 *
 * Credenciales (se generan en Integraciones → Generar credenciales):
 *   YAPPY_API_KEY     — identifica el comercio
 *   YAPPY_SECRET_KEY  — clave con la que se firma el código de sesión
 *   YAPPY_SEED        — código de semilla
 *   YAPPY_API_BASE_V3 — la dirección de la API (sale de la sección "Header"
 *                       de cada API en el panel; el swagger trae un
 *                       localhost de ejemplo, no la real)
 */

import crypto from 'node:crypto';

const BASE = process.env.YAPPY_API_BASE_V3 || '';

export function comercialConfigurado(): boolean {
	return Boolean(
		process.env.YAPPY_API_KEY && process.env.YAPPY_SECRET_KEY && BASE,
	);
}

/**
 * Código de inicio de sesión, tal como lo define el manual (pág. 16):
 *
 *   concatenar  API Key + fecha de hoy en YYYY-MM-DD
 *   hashear     con SHA-256 usando la Secret Key como clave
 *
 * O sea HMAC-SHA256, en hexadecimal (el ejemplo del swagger son 64 caracteres
 * hex, que es exactamente el tamaño de un SHA-256 en hex).
 */
export function codigoSesion(
	fecha = new Date(),
	base: 'api-key' | 'semilla' = 'api-key',
): string {
	const apiKey = base === 'semilla' ? process.env.YAPPY_SEED : process.env.YAPPY_API_KEY;
	const secret = process.env.YAPPY_SECRET_KEY;
	if (!apiKey || !secret) throw new Error('Faltan YAPPY_API_KEY o YAPPY_SECRET_KEY.');

	// Fecha de Panamá (UTC-5). El servidor de Vercel corre en UTC, así que a
	// partir de las 7 de la tarde hora de Panamá ya estaría mandando la fecha
	// del día siguiente y el banco rechazaría el código.
	const enPanama = new Date(fecha.getTime() - 5 * 60 * 60 * 1000);
	const hoy = enPanama.toISOString().slice(0, 10);

	return crypto.createHmac('sha256', secret).update(`${apiKey}${hoy}`).digest('hex');
}

/*
  Cabeceras, con los nombres EXACTOS que publica el panel de Yappy:

    authorization  token de la sesión
    api-key        clave de acceso
    secret-key     clave secreta
    client-ip      IP del cliente      ← obligatoria
    channel        canal de la solicitud ← obligatoria

  Las dos últimas son fáciles de pasar por alto y sin ellas el banco responde
  YP-0008 ("cabeceras obligatorias faltantes en la peticion").
*/
function cabeceras(token?: string, ip?: string) {
	return {
		'content-type': 'application/json',
		'api-key': process.env.YAPPY_API_KEY || '',
		'secret-key': process.env.YAPPY_SECRET_KEY || '',
		'client-ip': ip || process.env.YAPPY_CLIENT_IP || '127.0.0.1',
		channel: process.env.YAPPY_CHANNEL || 'API',
		...(token ? { authorization: `Bearer ${token}` } : {}),
	};
}

async function pedir<T>(ruta: string, opciones: RequestInit): Promise<T> {
	const res = await fetch(`${BASE}${ruta}`, { ...opciones, cache: 'no-store' });
	const texto = await res.text();
	let json: any;
	try {
		json = texto ? JSON.parse(texto) : {};
	} catch {
		throw new Error(`Yappy devolvió algo que no es JSON (${res.status}): ${texto.slice(0, 150)}`);
	}
	// YP-0000 es éxito; YP-0001 es "sin datos", que no es un error.
	const codigo = json?.status?.code;
	if (codigo && codigo !== 'YP-0000' && codigo !== 'YP-0001') {
		throw new Error(`Yappy ${codigo}: ${json?.status?.description || 'error'}`);
	}
	if (!res.ok) throw new Error(`Yappy HTTP ${res.status}`);
	return json as T;
}

/** La sesión dura un rato; se guarda en memoria para no pedirla en cada consulta. */
let sesion: { token: string; vence: number } | null = null;

/*
  Acá la documentación se contradice y conviene dejarlo escrito:

   · El manual (pág. 16) dice que el código se arma con API Key + fecha,
     firmado con la Clave Secreta.
   · El swagger describe el mismo endpoint como "receives the encrypted seed
     and the client id".

  O sea que el valor que se cifra podría ser la API Key o el Código de semilla.
  En vez de adivinar, se intenta con el de la documentación oficial y, si el
  banco lo rechaza, se reintenta con la semilla. El que funcione queda en el
  log, para dejarlo fijo después.
*/
export async function abrirSesion(): Promise<string> {
	if (sesion && sesion.vence > Date.now()) return sesion.token;

	const intentos: Array<{ nombre: string; code: string }> = [
		{ nombre: 'api-key', code: codigoSesion() },
	];
	if (process.env.YAPPY_SEED) {
		intentos.push({ nombre: 'semilla', code: codigoSesion(new Date(), 'semilla') });
	}

	let ultimoError: unknown = null;
	for (const intento of intentos) {
		try {
			const json = await pedir<any>('/v1/session/login', {
				method: 'POST',
				headers: cabeceras(),
				body: JSON.stringify({ body: { code: intento.code } }),
			});
			const token = json?.body?.token;
			if (!token) throw new Error('Yappy no devolvió token de sesión.');
			console.log(`[yappy] sesión abierta usando el código de tipo "${intento.nombre}"`);
			// La respuesta no dice cuánto dura: se renueva cada 10 minutos.
			sesion = { token, vence: Date.now() + 10 * 60 * 1000 };
			return token;
		} catch (e) {
			ultimoError = e;
		}
	}
	throw ultimoError instanceof Error ? ultimoError : new Error('No pude abrir sesión en Yappy.');
}

export interface MovimientoYappy {
	id: string;
	number?: string;
	payment_date?: string;
	type?: string;
	/** CREDIT = el comercio recibe el dinero. */
	role?: string;
	charge?: { amount?: number; currency?: string };
	description?: string;
	bill_description?: string;
	status?: string;
}

/** Historial de transacciones entre dos fechas (YYYY-MM-DD). */
export async function historial(
	desde: string,
	hasta: string,
	limite = 50,
): Promise<MovimientoYappy[]> {
	const token = await abrirSesion();
	const json = await pedir<any>('/v1/movement/history', {
		method: 'POST',
		headers: cabeceras(token),
		body: JSON.stringify({
			body: { pagination: { start_date: desde, end_date: hasta, limit: limite } },
		}),
	});
	return json?.body?.transactions ?? [];
}

/**
 * Busca un pago ENTRANTE que calce con un pedido.
 *
 * Calza por monto exacto y, si el texto del pago trae la referencia del
 * pedido, también por eso. Solo mira transacciones con rol CREDIT (las que le
 * entran al comercio) para no confundir un pago hecho POR Mautik con uno
 * recibido.
 */
export async function buscarPago(opciones: {
	monto: number;
	referencia?: string;
	desde: string;
	hasta: string;
}): Promise<MovimientoYappy | null> {
	const movimientos = await historial(opciones.desde, opciones.hasta, 100);
	const centavos = (n: number) => Math.round(n * 100);

	const candidatos = movimientos.filter(
		(m) =>
			m.role === 'CREDIT' &&
			typeof m.charge?.amount === 'number' &&
			centavos(m.charge.amount) === centavos(opciones.monto),
	);

	if (opciones.referencia) {
		const ref = opciones.referencia.toLowerCase();
		const conRef = candidatos.find((m) =>
			`${m.description ?? ''} ${m.bill_description ?? ''}`.toLowerCase().includes(ref),
		);
		if (conRef) return conRef;
	}

	return candidatos[0] ?? null;
}
