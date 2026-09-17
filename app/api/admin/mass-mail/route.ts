import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/db';
import { exigirAdmin } from '@/lib/solo-admin';
import { EMAIL_PUBLICO, MARCA, correoListo, motivoCorreoNoListo, remitente } from '@/lib/contacto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Envío masivo a las clientas registradas.
 *
 * Esta ruta NO EXISTÍA. La pestaña "Envío Masivo" del panel lleva meses
 * apuntando a `/api/admin/mass-mail`, que devolvía 404: se escribía el correo,
 * se tocaba enviar y no pasaba nada.
 *
 * Precauciones, porque esto le escribe a gente de verdad:
 *  · Solo administración.
 *  · Va en tandas y de a poco, para no chocar con el límite de Resend.
 *  · Cada destinataria recibe SU correo (nada de poner a todas en copia y
 *    filtrar las direcciones de las demás).
 *  · Responde con el detalle de cuántos salieron y cuántos fallaron.
 *
 * GET devuelve cuántas destinatarias hay, para poder mostrarlo ANTES de
 * mandar nada.
 */

const LOTE = 20;           // correos por tanda
const PAUSA_MS = 1100;     // Resend permite ~2/segundo en el plan gratis

/**
 * Deja pasar el HTML que escriba la administración, pero le saca lo que
 * podría ejecutarse.
 *
 * El cuerpo antes se escapaba entero (`&lt;b&gt;`), así que escribir HTML no
 * servía de nada: llegaba el código como texto. Ahora se permite, porque
 * Estéfani quiere armar correos con imágenes y formato.
 *
 * Lo que se quita: `<script>`, `<iframe>`, `<object>`, los atributos `on*`
 * (onclick, onerror...) y las URLs `javascript:`. Ninguna de esas cosas
 * funciona en un cliente de correo de todos modos — Gmail las descarta— así
 * que sacarlas no le quita nada al diseño y evita que un correo quede
 * marcado como sospechoso.
 */
function limpiarHtml(html: string): string {
	return html
		.replace(/<\s*(script|iframe|object|embed|link|meta)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
		.replace(/<\s*(script|iframe|object|embed|link|meta)\b[^>]*\/?>/gi, '')
		.replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
		.replace(/\son\w+\s*=\s*'[^']*'/gi, '')
		.replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
		.replace(/javascript\s*:/gi, '');
}

/** El correo completo, con el marco de Mautik. La usa el envío Y la vista previa. */
function armarHtml(cuerpo: string, nombre: string | null): string {
	return `
  <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:560px;margin:auto;background:#faf8ff;padding:32px 28px;border-radius:20px;">
    <h1 style="color:#5b21b6;font-size:22px;margin:0 0 18px;">${MARCA.nombre}</h1>
    ${nombre ? `<p style="color:#3f3350;font-size:15px;margin:0 0 12px;">Hola ${nombre},</p>` : ''}
    <div style="color:#3f3350;font-size:15px;line-height:1.6;">${cuerpo}</div>
    <p style="margin:28px 0 0;">
      <a href="https://mautik-web.vercel.app/shop" style="display:inline-block;padding:12px 28px;background:#5b21b6;color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;">Ver la tienda</a>
    </p>
    <p style="margin-top:28px;font-size:12px;color:#8b7fa0;">
      Recibes esto porque tienes cuenta en ${MARCA.nombre}.
      Escríbenos a ${EMAIL_PUBLICO} si no quieres recibir más correos.
    </p>
  </div>`;
}

async function destinatarias() {
	return prisma.user.findMany({
		where: { email: { not: '' } },
		select: { email: true, name: true },
		orderBy: { createdAt: 'asc' },
	});
}

export async function GET(request: NextRequest) {
	const noPuede = await exigirAdmin(request);
	if (noPuede) return noPuede;

	const gente = await destinatarias();
	return NextResponse.json({
		total: gente.length,
		correoListo: correoListo(),
		motivo: correoListo() ? null : motivoCorreoNoListo(),
	});
}

export async function POST(request: NextRequest) {
	const noPuede = await exigirAdmin(request);
	if (noPuede) return noPuede;

	const { subject, message, soloVistaPrevia } = await request.json();

	/*
	  Vista previa: devuelve EXACTAMENTE el mismo HTML que se enviaría, con el
	  marco de Mautik alrededor, sin mandar un solo correo. Antes la "vista
	  previa" del panel pintaba el mensaje crudo con `dangerouslySetInnerHTML`
	  dentro de la página: ni se parecía a lo que iba a recibir la clienta.
	*/
	if (soloVistaPrevia) {
		return NextResponse.json({
			html: armarHtml(limpiarHtml(String(message ?? '').trim()), 'Nombre'),
			asunto: String(subject ?? '').trim() || '(sin asunto)',
		});
	}

	if (!subject || String(subject).trim().length < 3) {
		return NextResponse.json({ error: 'Falta el asunto.' }, { status: 400 });
	}
	if (!message || String(message).trim().length < 10) {
		return NextResponse.json(
			{ error: 'El mensaje es muy corto (mínimo 10 caracteres).' },
			{ status: 400 },
		);
	}
	if (!correoListo()) {
		return NextResponse.json(
			{ error: `No se puede enviar: ${motivoCorreoNoListo()}` },
			{ status: 503 },
		);
	}

	const from = remitente('novedades');
	if (!from) {
		return NextResponse.json({ error: 'Falta el remitente.' }, { status: 503 });
	}

	const gente = await destinatarias();
	if (gente.length === 0) {
		return NextResponse.json({ error: 'No hay destinatarias registradas.' }, { status: 400 });
	}

	const resend = new Resend(process.env.RESEND_API_KEY);
	const cuerpo = limpiarHtml(String(message).trim());

	let enviados = 0;
	const fallidos: string[] = [];

	for (let i = 0; i < gente.length; i += LOTE) {
		const tanda = gente.slice(i, i + LOTE);
		for (const p of tanda) {
			try {
				await resend.emails.send({
					from,
					to: p.email,
					replyTo: EMAIL_PUBLICO,
					subject: String(subject).trim(),
					html: armarHtml(cuerpo, p.name?.split(' ')[0] ?? null),
				});
				enviados++;
			} catch (e) {
				console.error('[mass-mail] falló', p.email, e);
				fallidos.push(p.email);
			}
			await new Promise((r) => setTimeout(r, PAUSA_MS));
		}
	}

	return NextResponse.json({
		ok: true,
		enviados,
		fallidos: fallidos.length,
		total: gente.length,
		message: `Enviados ${enviados} de ${gente.length}${fallidos.length ? `, ${fallidos.length} con error` : ''}.`,
	});
}
