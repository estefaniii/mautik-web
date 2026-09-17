/**
 * Único lugar donde viven los datos de contacto de Mautik.
 *
 * Antes estaban repartidos en placeholders por todo el código
 * (noreply@tu-dominio.com, notificaciones@tudominio.com, no-reply@mautik.com...),
 * lo que hacía que Resend rechazara los envíos y que los correos de
 * confirmación nunca llegaran.
 *
 * ── Importante sobre el remitente ──────────────────────────────────────
 * Resend SOLO deja enviar desde un dominio verificado en tu cuenta.
 * No se puede enviar *desde* una dirección @gmail.com. Por eso hay dos
 * conceptos distintos y no hay que confundirlos:
 *
 *   REMITENTE (from)  -> tiene que ser un dominio verificado en Resend
 *   RESPUESTA (reply-to) + el que se muestra al cliente -> el correo real
 *                          de Mautik, que sí puede ser Gmail
 *
 * Mientras no verifiques un dominio propio de Mautik, pon en el .env:
 *   EMAIL_FROM_DOMAIN=dmgurus.com      (ya lo tienes verificado)
 * y los clientes igual te van a responder al Gmail de Mautik.
 */

/**
 * WhatsApp de Mautik, en formato internacional y solo dígitos (507 = Panamá).
 * Se usa para armar los enlaces wa.me. No es un dato secreto: va en el HTML.
 */
export const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP || "50767782931").replace(/\D/g, "");

/** Enlace de WhatsApp con un mensaje ya escrito. */
export function enlaceWhatsapp(mensaje = "¡Hola Mautik! Vi la tienda y quería preguntar por ") {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Número de Yappy de Mautik, al que la clienta manda el pago.
 *
 * Es el mismo de WhatsApp y ya está publicado en el pie de la web, así que no
 * es un dato reservado. Se guarda acá para que el checkout y el panel muestren
 * siempre el mismo y no haya que buscarlo en dos archivos.
 */
export const YAPPY_NUMERO = (process.env.NEXT_PUBLIC_YAPPY_NUMERO || "67782931").replace(/\D/g, "");

/** El mismo número, escrito como se lee en Panamá: 6778-2931 */
export function yappyBonito(n = YAPPY_NUMERO) {
  return n.length === 8 ? `${n.slice(0, 4)}-${n.slice(4)}` : n;
}

/** Correo público de la marca: es el que ve y al que responde el cliente. */
export const EMAIL_PUBLICO =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "mautik.official@gmail.com";

/** Dominio verificado en Resend, desde el que salen los envíos. */
const DOMINIO_ENVIO = process.env.EMAIL_FROM_DOMAIN || "";

export const MARCA = {
  nombre: "Mautik",
  instagram: "@mautik_official",
  instagramUrl: "https://www.instagram.com/mautik_official",
  facebookUrl: "https://www.facebook.com/Mautikofficial",
  ciudad: "La Chorrera",
  provincia: "Panamá Oeste",
  pais: "Panamá",
  color: "#7c3aed",
  colorOscuro: "#5b21b6",
} as const;

export { sitioUrl } from "@/lib/site-url";

/**
 * Remitente para Resend. Devuelve null si no hay dominio verificado, para que
 * quien llame pueda avisar en el log en vez de intentar un envío que va a
 * fallar con un error poco claro.
 */
export function remitente(buzon = "pedidos"): string | null {
  if (!DOMINIO_ENVIO) return null;
  return `${MARCA.nombre} <${buzon}@${DOMINIO_ENVIO}>`;
}

/** true si se puede enviar correo de verdad en este entorno. */
export function correoListo(): boolean {
  return Boolean(process.env.RESEND_API_KEY && DOMINIO_ENVIO);
}

/** Explica por qué no se puede enviar, para los logs. */
export function motivoCorreoNoListo(): string {
  if (!process.env.RESEND_API_KEY) return "falta RESEND_API_KEY";
  if (!DOMINIO_ENVIO)
    return "falta EMAIL_FROM_DOMAIN (dominio verificado en Resend)";
  return "";
}
