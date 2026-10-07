import { Resend } from 'resend';
import {
	EMAIL_PUBLICO,
	MARCA,
	correoListo,
	motivoCorreoNoListo,
	remitente,
	sitioUrl,
} from '@/lib/contacto';

export const resend = process.env.RESEND_API_KEY
	? new Resend(process.env.RESEND_API_KEY)
	: null;

export interface DatosPedidoEmail {
	customerName: string;
	customerEmail: string;
	orderItems: Array<{ name: string; quantity: number; price: number }>;
	shippingAddress: any;
	/** 'yappy' | 'paypal' | { brand, last4 } | string */
	paymentMethod?: any;
	totalAmount: number;
	orderId?: string;
	/** Si no se pasa, el envío se deduce como total - subtotal. */
	shippingCost?: number;
}

const dinero = (n: number) => `$${Number(n || 0).toFixed(2)}`;

/** Escapa el contenido que viene del usuario para no romper el HTML del correo. */
const esc = (v: unknown) =>
	String(v ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

function nombreMetodoPago(pm: any): string {
	if (!pm) return 'Por confirmar';
	if (typeof pm === 'string') {
		const k = pm.toLowerCase();
		if (k === 'yappy') return 'Yappy';
		if (k === 'paypal') return 'PayPal';
		return pm;
	}
	if (pm.brand && pm.last4 && pm.last4 !== '****' && pm.last4 !== 'N/A') {
		return `${pm.brand} •••• ${pm.last4}`;
	}
	if (pm.brand && pm.brand !== 'N/A') return nombreMetodoPago(pm.brand);
	return 'Por confirmar';
}

function bloqueDireccion(d: any): string {
	if (!d) return '';
	const lineas = [
		d.street,
		[d.city, d.state ?? d.province].filter(Boolean).join(', '),
		[d.country, d.zipCode].filter(Boolean).join(' '),
		d.phone ? `Tel: ${d.phone}` : '',
	]
		.filter(Boolean)
		.map(esc);
	if (!lineas.length) return '';
	return `
      <h3 style="margin:28px 0 8px;font-size:15px;color:#111827">Dirección de envío</h3>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563">${lineas.join('<br>')}</p>`;
}

export const sendOrderConfirmationEmail = async (orderData: DatosPedidoEmail) => {
	const {
		customerName,
		customerEmail,
		orderItems,
		shippingAddress,
		paymentMethod,
		totalAmount,
		orderId,
	} = orderData;

	if (!correoListo() || !resend) {
		console.warn(
			`[resend] No envío la confirmación del pedido ${orderId ?? '(sin id)'}: ${motivoCorreoNoListo()}`,
		);
		return false;
	}

	const from = remitente('pedidos');
	if (!from) return false;

	try {
		const subtotal = orderItems.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0,
		);
		// El envío real sale del total del pedido, no de un valor fijo.
		const envio =
			orderData.shippingCost ?? Math.max(0, Number((totalAmount - subtotal).toFixed(2)));
		const url = sitioUrl();

		const filas = orderItems
			.map(
				(item) => `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #eef0f3;font-size:14px;color:#374151">
                    ${esc(item.name)} <span style="color:#9ca3af">× ${item.quantity}</span>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid #eef0f3;font-size:14px;color:#111827;text-align:right;white-space:nowrap">
                    ${dinero(item.price * item.quantity)}
                  </td>
                </tr>`,
			)
			.join('');

		const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Confirmación de tu pedido en ${MARCA.nombre}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden">Tu pedido en ${MARCA.nombre} quedó confirmado por ${dinero(totalAmount)}.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f6">
    <tr>
      <td align="center" style="padding:24px 12px">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden">

          <tr>
            <td style="background:linear-gradient(135deg,${MARCA.color},${MARCA.colorOscuro});padding:32px 28px;text-align:center">
              <h1 style="margin:0;font-size:24px;color:#ffffff;font-weight:700">¡Gracias por tu compra!</h1>
              <p style="margin:8px 0 0;font-size:15px;color:#e9d8fd">Tu pedido quedó confirmado</p>
            </td>
          </tr>

          <tr>
            <td style="padding:28px">
              <p style="margin:0 0 6px;font-size:16px;color:#111827">Hola ${esc(customerName)},</p>
              <p style="margin:0 0 22px;font-size:14px;line-height:1.6;color:#4b5563">
                Recibimos tu pedido y ya empezamos a prepararlo. Cada pieza de ${MARCA.nombre} se hace
                a mano en ${MARCA.ciudad}, así que te escribimos en cuanto esté listo para enviar.
              </p>

              ${
								orderId
									? `<p style="margin:0 0 22px;font-size:13px;color:#6b7280">
                       Número de pedido: <strong style="color:#111827">${esc(orderId)}</strong>
                     </p>`
									: ''
							}

              <h3 style="margin:0 0 8px;font-size:15px;color:#111827">Resumen del pedido</h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${filas}
                <tr>
                  <td style="padding:12px 0 4px;font-size:14px;color:#6b7280">Subtotal</td>
                  <td style="padding:12px 0 4px;font-size:14px;color:#374151;text-align:right">${dinero(subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:0 0 12px;font-size:14px;color:#6b7280">Envío</td>
                  <td style="padding:0 0 12px;font-size:14px;color:#374151;text-align:right">${
										envio > 0 ? dinero(envio) : 'Por coordinar'
									}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-top:2px solid ${MARCA.color};font-size:16px;font-weight:700;color:#111827">Total</td>
                  <td style="padding:12px 0;border-top:2px solid ${MARCA.color};font-size:16px;font-weight:700;color:#111827;text-align:right">${dinero(totalAmount)}</td>
                </tr>
              </table>

              ${bloqueDireccion(shippingAddress)}

              <h3 style="margin:28px 0 8px;font-size:15px;color:#111827">Método de pago</h3>
              <p style="margin:0;font-size:14px;color:#4b5563">${esc(nombreMetodoPago(paymentMethod))}</p>

              <div style="text-align:center;margin:32px 0 8px">
                <a href="${url}/orders" style="display:inline-block;background:${MARCA.color};color:#ffffff;padding:13px 26px;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin:4px">Ver mi pedido</a>
                <a href="${url}/shop" style="display:inline-block;background:#f3f4f6;color:#111827;padding:13px 26px;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin:4px">Seguir comprando</a>
              </div>

              <p style="margin:22px 0 0;font-size:14px;line-height:1.6;color:#4b5563">
                ¿Alguna duda? Responde este correo o escríbenos por Instagram
                <a href="${MARCA.instagramUrl}" style="color:${MARCA.color};text-decoration:none">${MARCA.instagram}</a>.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#fafafb;padding:22px 28px;text-align:center;border-top:1px solid #eef0f3">
              <p style="margin:0 0 4px;font-size:13px;color:#6b7280">
                ${MARCA.nombre} · Artesanía hecha a mano en ${MARCA.ciudad}, ${MARCA.provincia}, ${MARCA.pais}
              </p>
              <p style="margin:0 0 4px;font-size:13px;color:#6b7280">
                <a href="mailto:${EMAIL_PUBLICO}" style="color:${MARCA.color};text-decoration:none">${EMAIL_PUBLICO}</a>
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#9ca3af">
                Te enviamos este correo a ${esc(customerEmail)} porque hiciste un pedido en ${MARCA.nombre}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

		await resend.emails.send({
			from,
			to: [customerEmail],
			replyTo: EMAIL_PUBLICO,
			subject: orderId
				? `Pedido confirmado · ${MARCA.nombre} (${orderId.slice(0, 8)})`
				: `¡Gracias por tu compra en ${MARCA.nombre}!`,
			html,
		});

		console.log(`[resend] Confirmación enviada para el pedido ${orderId ?? '(sin id)'}`);
		return true;
	} catch (error) {
		console.error('[resend] Error enviando la confirmación de pedido:', error);
		return false;
	}
};

/* ────────────────────────────────────────────────────────────────────────
   Aviso a la tienda

   ⚠️ Esto NO EXISTÍA. El único correo que salía era el de confirmación para
   la clienta; a Estéfani no le llegaba nada. O sea que para enterarse de una
   venta tenía que entrar al panel a mirar.

   Con Yappy eso es peor todavía: el pago lo confirma ella a mano, así que si
   no se entera de que entró un pedido, la clienta paga y se queda esperando
   sin que nadie prepare nada.
   ──────────────────────────────────────────────────────────────────────── */

export interface AvisoTienda extends DatosPedidoEmail {
	/** Teléfono que dejó la clienta, si lo hay. */
	customerPhone?: string;
	/**
	 * 'pagado'   → el dinero ya entró, hay que preparar el pedido
	 * 'esperando' → pedido registrado, falta que llegue el Yappy
	 */
	estado: 'pagado' | 'esperando';
	/** Referencia corta que la clienta pone en el concepto del Yappy. */
	referencia?: string;
}

export const sendNewOrderNotification = async (datos: AvisoTienda) => {
	if (!correoListo()) {
		console.warn(`[resend] No aviso de la venta: ${motivoCorreoNoListo()}`);
		return false;
	}
	const from = remitente('pedidos');
	if (!from) return false;

	const esperando = datos.estado === 'esperando';
	const filas = datos.orderItems
		.map(
			(i) => `
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#111827">${esc(i.name)}</td>
          <td style="padding:8px 0;font-size:14px;color:#6b7280;text-align:center">×${i.quantity}</td>
          <td style="padding:8px 0;font-size:14px;color:#111827;text-align:right">${dinero(i.price * i.quantity)}</td>
        </tr>`,
		)
		.join('');

	const html = `
  <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:560px;margin:auto;padding:28px 24px;background:#faf8ff;border-radius:18px">
    <p style="margin:0 0 4px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:${esperando ? '#b45309' : '#5b21b6'}">
      ${esperando ? 'Pedido esperando pago' : 'Venta confirmada'}
    </p>
    <h1 style="margin:0 0 18px;font-size:22px;color:#111827">
      ${dinero(datos.totalAmount)}${datos.orderId ? ` · ${esc(datos.orderId.slice(0, 8).toUpperCase())}` : ''}
    </h1>

    ${
			esperando
				? `<div style="margin:0 0 20px;padding:12px 14px;background:#fef3c7;border-radius:12px;font-size:14px;color:#78350f">
             Cuando veas el Yappy en tu app, entra al panel y toca
             <strong>Confirmar pago</strong>. Ahí se descuenta el stock y le
             sale el correo a la clienta.
             ${datos.referencia ? `<br><br>Referencia que debe escribir: <strong>${esc(datos.referencia)}</strong>` : ''}
           </div>`
				: ''
		}

    <h3 style="margin:0 0 8px;font-size:15px;color:#111827">Quién compró</h3>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#4b5563">
      ${esc(datos.customerName)}<br>
      <a href="mailto:${esc(datos.customerEmail)}" style="color:${MARCA.color}">${esc(datos.customerEmail)}</a>
      ${datos.customerPhone ? `<br>Tel: ${esc(datos.customerPhone)}` : ''}
    </p>

    <h3 style="margin:0 0 4px;font-size:15px;color:#111827">Qué compró</h3>
    <table style="width:100%;border-collapse:collapse">${filas}
      <tr><td colspan="3" style="border-top:1px solid #e5e7eb;padding-top:10px"></td></tr>
      <tr>
        <td colspan="2" style="font-size:14px;font-weight:600;color:#111827">Total</td>
        <td style="font-size:16px;font-weight:700;color:#111827;text-align:right">${dinero(datos.totalAmount)}</td>
      </tr>
    </table>

    <p style="margin:18px 0 0;font-size:14px;color:#6b7280">
      Pago: <strong style="color:#111827">${esc(nombreMetodoPago(datos.paymentMethod))}</strong>
    </p>

    ${bloqueDireccion(datos.shippingAddress)}

    <p style="margin:28px 0 0">
      <a href="https://mautik.vercel.app/admin"
         style="display:inline-block;padding:12px 26px;background:#5b21b6;color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px">
        Abrir el panel
      </a>
    </p>
  </div>`;

	try {
		await resend!.emails.send({
			from,
			to: [EMAIL_PUBLICO],
			replyTo: datos.customerEmail,
			subject: esperando
				? `⏳ Pedido esperando Yappy · ${dinero(datos.totalAmount)} · ${esc(datos.customerName)}`
				: `💜 Venta de ${dinero(datos.totalAmount)} · ${esc(datos.customerName)}`,
			html,
		});
		return true;
	} catch (error) {
		console.error('[resend] no se pudo avisar de la venta:', error);
		return false;
	}
};
