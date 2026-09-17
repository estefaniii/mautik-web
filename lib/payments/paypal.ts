/**
 * PayPal — Orders v2.
 *
 * Flujo:
 *   1. crearOrden()   -> id de orden de PayPal (el cliente aprueba en el popup)
 *   2. capturarOrden() -> cobro efectivo; devuelve el captureId
 *   3. verificarWebhook() valida las notificaciones de PayPal
 *
 * El monto SIEMPRE se recalcula en el servidor a partir de los productos de la
 * base de datos: nunca se confía en el total que manda el navegador.
 */

const LIVE = "https://api-m.paypal.com";
const SANDBOX = "https://api-m.sandbox.paypal.com";

const API_BASE = process.env.PAYPAL_ENV === "live" ? LIVE : SANDBOX;

export function paypalEstaConfigurado(): boolean {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
  );
}

function credenciales() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error(
      "PayPal no está configurado. Faltan PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET."
    );
  }
  return { id, secret };
}

let cacheToken: { token: string; expira: number } | null = null;

/** Token OAuth2, reutilizado hasta un minuto antes de vencer. */
async function token(): Promise<string> {
  if (cacheToken && cacheToken.expira > Date.now()) return cacheToken.token;

  const { id, secret } = credenciales();
  const res = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`PayPal: no pude autenticarme (HTTP ${res.status})`);
  }
  const json = await res.json();
  cacheToken = {
    token: json.access_token,
    expira: Date.now() + (json.expires_in - 60) * 1000,
  };
  return cacheToken.token;
}

async function pedir<T>(
  ruta: string,
  init: { method: string; body?: unknown; idempotencia?: string }
): Promise<T> {
  const res = await fetch(`${API_BASE}${ruta}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${await token()}`,
      "Content-Type": "application/json",
      ...(init.idempotencia ? { "PayPal-Request-Id": init.idempotencia } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  const texto = await res.text();
  const json = texto ? JSON.parse(texto) : {};
  if (!res.ok) {
    const detalle =
      json?.details?.[0]?.description || json?.message || `HTTP ${res.status}`;
    throw new Error(`PayPal: ${detalle}`);
  }
  return json as T;
}

export interface ItemPaypal {
  name: string;
  quantity: number;
  /** precio unitario en dólares */
  price: number;
  sku?: string;
}

export interface CrearOrdenPaypal {
  /** id de nuestro pedido (Order.id) */
  orderId: string;
  items: ItemPaypal[];
  envio?: number;
  impuestos?: number;
}

const dos = (n: number) => n.toFixed(2);

export async function crearOrden(datos: CrearOrdenPaypal) {
  if (!datos.items?.length) throw new Error("El pedido no tiene productos.");

  const subtotal = datos.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const envio = datos.envio ?? 0;
  const impuestos = datos.impuestos ?? 0;
  const total = subtotal + envio + impuestos;
  if (!(total > 0)) throw new Error("El total debe ser mayor a 0.");

  const base = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/$/, "");

  return pedir<{ id: string; status: string; links: Array<{ rel: string; href: string }> }>(
    "/v2/checkout/orders",
    {
      method: "POST",
      // evita crear dos órdenes si el cliente hace doble clic
      idempotencia: `mautik-${datos.orderId}`,
      body: {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: datos.orderId,
            custom_id: datos.orderId,
            description: "Pedido Mautik — artesanía hecha a mano en Panamá",
            amount: {
              currency_code: "USD",
              value: dos(total),
              breakdown: {
                item_total: { currency_code: "USD", value: dos(subtotal) },
                shipping: { currency_code: "USD", value: dos(envio) },
                tax_total: { currency_code: "USD", value: dos(impuestos) },
              },
            },
            items: datos.items.map((i) => ({
              name: i.name.slice(0, 127),
              quantity: String(i.quantity),
              sku: i.sku?.slice(0, 127),
              unit_amount: { currency_code: "USD", value: dos(i.price) },
              category: "PHYSICAL_GOODS",
            })),
          },
        ],
        application_context: {
          brand_name: "Mautik",
          locale: "es-PA",
          shipping_preference: "GET_FROM_FILE",
          user_action: "PAY_NOW",
          ...(base
            ? {
                return_url: `${base}/checkout?paypal=ok`,
                cancel_url: `${base}/checkout?paypal=cancel`,
              }
            : {}),
        },
      },
    }
  );
}

export interface CapturaPaypal {
  captureId: string;
  status: string;
  montoCobrado: number;
  moneda: string;
  email?: string;
  orderIdInterno?: string;
}

export async function capturarOrden(paypalOrderId: string): Promise<CapturaPaypal> {
  const json = await pedir<any>(`/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    idempotencia: `mautik-cap-${paypalOrderId}`,
  });

  const unidad = json?.purchase_units?.[0];
  const captura = unidad?.payments?.captures?.[0];
  if (!captura) throw new Error("PayPal no devolvió datos de captura.");

  return {
    captureId: captura.id,
    status: captura.status,
    montoCobrado: Number(captura.amount?.value ?? 0),
    moneda: captura.amount?.currency_code ?? "USD",
    email: json?.payer?.email_address,
    orderIdInterno: unidad?.custom_id ?? unidad?.reference_id,
  };
}

/** Consulta el estado de una orden sin capturarla. */
export async function verOrden(paypalOrderId: string) {
  return pedir<any>(`/v2/checkout/orders/${paypalOrderId}`, { method: "GET" });
}

/**
 * Verifica una notificación de webhook contra la API de PayPal.
 * Requiere PAYPAL_WEBHOOK_ID (lo da el panel de PayPal al crear el webhook).
 */
export async function verificarWebhook(
  headers: Headers,
  cuerpoCrudo: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;

  const requeridos = [
    "paypal-auth-algo",
    "paypal-cert-url",
    "paypal-transmission-id",
    "paypal-transmission-sig",
    "paypal-transmission-time",
  ];
  if (requeridos.some((h) => !headers.get(h))) return false;

  const json = await pedir<{ verification_status: string }>(
    "/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      body: {
        auth_algo: headers.get("paypal-auth-algo"),
        cert_url: headers.get("paypal-cert-url"),
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        transmission_time: headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: JSON.parse(cuerpoCrudo),
      },
    }
  );
  return json.verification_status === "SUCCESS";
}
