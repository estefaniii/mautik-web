/**
 * Único lugar donde se decide la URL pública del sitio.
 *
 * Por qué existe: `.env` del proyecto tiene
 *   NEXT_PUBLIC_BASE_URL=http://localhost:3000
 *   NEXT_PUBLIC_SITE_URL=http://localhost:3000
 * y ese archivo llega al build de Vercel, así que en producción salieron
 * `rel="canonical"` y `og:url` apuntando a localhost. Un canonical a localhost
 * es peor que no tener canonical: Google lo sigue y no encuentra nada.
 *
 * Por eso acá los valores de localhost se descartan a menos que realmente
 * estemos en desarrollo. Así el sitio queda correcto aunque el .env esté mal.
 */

const PRODUCCION_POR_DEFECTO = "https://mautik-web.vercel.app";

const esLocal = (u: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?/i.test(u);

const limpiar = (u?: string | null) => {
  const v = (u || "").trim().replace(/\/+$/, "");
  return v || null;
};

export function sitioUrl(): string {
  const enDesarrollo = process.env.NODE_ENV === "development";

  const candidatos = [
    limpiar(process.env.NEXT_PUBLIC_SITE_URL),
    limpiar(process.env.NEXT_PUBLIC_BASE_URL),
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null,
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
      : null,
  ].filter(Boolean) as string[];

  // En desarrollo sí queremos localhost si está configurado.
  if (enDesarrollo) {
    return candidatos[0] || "http://localhost:3000";
  }

  // En producción, cualquier localhost heredado del .env se ignora.
  const bueno = candidatos.find((u) => !esLocal(u));
  return bueno || PRODUCCION_POR_DEFECTO;
}

export default sitioUrl;
