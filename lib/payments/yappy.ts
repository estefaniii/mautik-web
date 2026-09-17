/**
 * Botón de Pago Yappy (Banco General, Panamá).
 *
 * Flujo:
 *   1. validarComercio()  -> token de sesión (vale ~5 min)
 *   2. crearOrden()       -> { transactionId, hash, documentName } + URL de redirección
 *   3. el cliente paga en Yappy (app o web)
 *   4. Yappy llama a nuestra IPN (/api/yappy/ipn) con el resultado
 *   5. verificarFirmaIpn() valida el HMAC antes de marcar el pedido como pagado
 *
 * ⚠️ IMPORTANTE: los endpoints y el orden exacto de los campos del HMAC los
 * define Banco General al habilitar el comercio y pueden variar según la
 * versión del contrato. Antes de salir a producción, compáralos con el PDF de
 * integración que entrega el banco y ajusta YAPPY_API_BASE / firmaIpn() si
 * hace falta. Todo lo demás (persistencia, validación, manejo de errores) ya
 * queda resuelto acá.
 */

import crypto from "node:crypto";

const API_BASE =
  process.env.YAPPY_API_BASE || "https://apipagosbg.bgeneral.cloud";

/** URL del checkout de Yappy: producción o pruebas, según YAPPY_ENV. */
const CHECKOUT_BASE =
  process.env.YAPPY_ENV === "test"
    ? "https://bt-pagosbg.bgeneral.com/ipg/v1"
    : "https://bt.yappycloud.com/ipg/v1";

export interface YappyConfig {
  merchantId: string;
  secretKey: string;
  domain: string;
}

export function leerConfigYappy(): YappyConfig {
  const merchantId = process.env.YAPPY_MERCHANT_ID;
  const secretKey = process.env.YAPPY_SECRET_KEY;
  const domain =
    process.env.YAPPY_DOMAIN ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL;

  if (!merchantId || !secretKey || !domain) {
    throw new Error(
      "Yappy no está configurado. Faltan YAPPY_MERCHANT_ID, YAPPY_SECRET_KEY o YAPPY_DOMAIN."
    );
  }
  return { merchantId, secretKey, domain: domain.replace(/\/$/, "") };
}

export function yappyEstaConfigurado(): boolean {
  return Boolean(process.env.YAPPY_MERCHANT_ID && process.env.YAPPY_SECRET_KEY);
}

async function pedir<T>(ruta: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${ruta}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    // Yappy no debe cachearse nunca
    cache: "no-store",
  });

  const texto = await res.text();
  let json: any;
  try {
    json = texto ? JSON.parse(texto) : {};
  } catch {
    throw new Error(`Yappy devolvió una respuesta no-JSON (${res.status}): ${texto.slice(0, 200)}`);
  }

  // Yappy responde 200 con un `status.code` propio; YP-0000 es el único de éxito.
  const codigo = json?.status?.code;
  const codigoMalo = typeof codigo === "string" && codigo !== "YP-0000";
  if (!res.ok || codigoMalo) {
    const msg = json?.status?.description || json?.message || `HTTP ${res.status}`;
    throw new Error(`Yappy: ${msg}`);
  }
  return json as T;
}

/** Paso 1: valida el dominio del comercio y devuelve el token de sesión. */
export async function validarComercio(cfg = leerConfigYappy()): Promise<string> {
  const json = await pedir<any>("/payments/validatemerchant", {
    merchantId: cfg.merchantId,
    urlDomain: cfg.domain,
  });
  const token = json?.body?.token ?? json?.token;
  if (!token) throw new Error("Yappy no devolvió token de sesión.");
  return token;
}

export interface CrearOrdenYappy {
  /** id de nuestro pedido (Order.id) — Yappy lo devuelve en la IPN */
  orderId: string;
  /** monto total ya con impuestos y envío, en dólares */
  total: number;
  subtotal?: number;
  impuestos?: number;
  envio?: number;
  /** teléfono panameño del comprador, 8 dígitos sin guion */
  telefono?: string;
  /** 'PAY' compra normal | 'DON' donación */
  tipo?: "PAY" | "DON";
}

export interface OrdenYappy {
  transactionId: string;
  documentName: string;
  hash: string;
  /** URL a la que hay que mandar al comprador */
  redirectUrl: string;
  expiresAt: string;
}

const dos = (n: number) => Number(n.toFixed(2));

/** Paso 2: crea la orden en Yappy y arma la URL de redirección. */
export async function crearOrden(
  datos: CrearOrdenYappy,
  cfg = leerConfigYappy()
): Promise<OrdenYappy> {
  if (!(datos.total > 0)) throw new Error("El total debe ser mayor a 0.");

  const token = await validarComercio(cfg);
  const subtotal = dos(datos.subtotal ?? datos.total);
  const impuestos = dos(datos.impuestos ?? 0);
  const envio = dos(datos.envio ?? 0);

  const json = await pedir<any>(
    "/payments/payment-wc",
    {
      merchantId: cfg.merchantId,
      orderId: datos.orderId,
      domain: cfg.domain,
      paymentDate: Math.floor(Date.now() / 1000),
      aliasYappy: datos.telefono || "",
      ipnUrl: `${cfg.domain}/api/yappy/ipn`,
      discount: "0.00",
      taxes: impuestos.toFixed(2),
      subtotal: subtotal.toFixed(2),
      shipping: envio.toFixed(2),
      total: dos(datos.total).toFixed(2),
    },
    token
  );

  const body = json?.body ?? json;
  const { transactionId, documentName, hash, expiresAt } = body ?? {};
  if (!transactionId || !hash) {
    throw new Error("Yappy no devolvió transactionId/hash.");
  }

  return {
    transactionId,
    documentName: documentName ?? "",
    hash,
    expiresAt: expiresAt ?? "",
    redirectUrl: `${CHECKOUT_BASE}?hash=${encodeURIComponent(hash)}`,
  };
}

/** Estados que devuelve Yappy en la IPN. */
export type EstadoYappy = "E" | "R" | "C" | "X";

export const ESTADOS_YAPPY: Record<EstadoYappy, string> = {
  E: "ejecutado",
  R: "rechazado",
  C: "cancelado",
  X: "expirado",
};

export interface IpnYappy {
  orderId: string;
  status: EstadoYappy;
  hash: string;
  domain?: string;
  confirmationNumber?: string;
}

/**
 * Firma que Yappy calcula sobre la IPN: HMAC-SHA256 de
 * `orderId + status + domain` con la secret key en base64, en hex.
 */
function firmaIpn(datos: IpnYappy, secretKey: string, domain: string): string {
  const mensaje = `${datos.orderId}${datos.status}${datos.domain || domain}`;
  const clave = Buffer.from(secretKey, "base64");
  return crypto.createHmac("sha256", clave).update(mensaje).digest("hex");
}

/**
 * Paso 5: verifica que la IPN venga realmente de Yappy.
 * Usa comparación en tiempo constante para no filtrar información por timing.
 */
export function verificarFirmaIpn(datos: IpnYappy, cfg = leerConfigYappy()): boolean {
  if (!datos?.orderId || !datos?.status || !datos?.hash) return false;
  const esperado = firmaIpn(datos, cfg.secretKey, cfg.domain);
  const a = Buffer.from(esperado, "utf8");
  const b = Buffer.from(String(datos.hash), "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
