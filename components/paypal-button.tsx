"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Botón de PayPal.
 *
 * IMPORTANTE — cómo estaba antes y por qué se cambió:
 * el botón armaba la orden con `actions.order.create({ amount })` y la cobraba
 * con `actions.order.capture()`, las dos cosas EN EL NAVEGADOR y con el monto
 * que el propio navegador mandaba. O sea: cualquiera con la consola abierta
 * podía pagar $0.01 por un capibara de $30 y el pedido quedaba marcado como
 * pagado. Las rutas de servidor que recalculan el total contra la base
 * (`/api/paypal/create-order` y `/api/paypal/capture`) ya existían, pero nadie
 * las llamaba.
 *
 * Ahora el navegador solo dice "quiero pagar el pedido X". El monto lo arma y
 * lo cobra el servidor, y la captura solo marca el pedido pagado si lo cobrado
 * coincide con el total calculado en la base.
 */

interface PayPalButtonProps {
  /** id del pedido YA creado en nuestra base (estado pendiente) */
  orderId: string;
  /** items del carrito: solo ids y cantidades, el precio lo pone el servidor */
  items: Array<{ productId: string; quantity: number }>;
  direccion?: any;
  metodoEnvio?: string;
  currency?: string;
  onSuccess: (datos: { captureId: string; orderId: string }) => void;
  onError?: (error: any) => void;
}

function cargarSdk(clientId: string, currency: string) {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).paypal) return resolve();

    const existente = document.getElementById("paypal-sdk") as HTMLScriptElement | null;
    if (existente) {
      existente.addEventListener("load", () => resolve());
      existente.addEventListener("error", () => reject(new Error("No se pudo cargar el SDK de PayPal")));
      return;
    }

    const params = new URLSearchParams({
      "client-id": clientId,
      currency,
      intent: "capture",
      locale: "es_PA",
      components: "buttons",
      // en Panamá no aplican, y si se dejan el botón muestra opciones que no
      // se pueden completar
      "disable-funding": "credit,paylater",
    });

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
    script.id = "paypal-sdk";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar el SDK de PayPal"));
    document.body.appendChild(script);
  });
}

export default function PayPalButton({
  orderId,
  items,
  direccion,
  metodoEnvio,
  currency = "USD",
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const contenedor = useRef<HTMLDivElement>(null);
  const botones = useRef<any>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Los callbacks se guardan en refs para que el botón no se vuelva a dibujar
  // cada vez que el componente padre se re-renderiza: PayPal parpadea feo.
  const datos = useRef({ orderId, items, direccion, metodoEnvio, onSuccess, onError });
  datos.current = { orderId, items, direccion, metodoEnvio, onSuccess, onError };

  useEffect(() => {
    let vivo = true;

    // El Client ID lo pide al servidor en vez de leerlo de una variable
    // NEXT_PUBLIC_*. Dos ventajas: no hay que volver a desplegar cada vez que
    // se toca en Vercel (las NEXT_PUBLIC_ se incrustan al compilar), y no hay
    // que marcar nada como "expuesto al navegador" en el panel.
    fetch("/api/paypal/config")
      .then((r) => r.json())
      .then(({ clientId, configurado }) => {
        if (!vivo) return Promise.reject(new Error("sin configurar"));
        if (!configurado || !clientId) {
          setMensaje("PayPal todavía no está configurado en este sitio.");
          onError?.(new Error("Faltan PAYPAL_CLIENT_ID y/o PAYPAL_CLIENT_SECRET"));
          return Promise.reject(new Error("sin configurar"));
        }
        return cargarSdk(clientId, currency);
      })
      .then(() => {
        if (!vivo || !contenedor.current) return;
        const paypal = (window as any).paypal;
        if (!paypal?.Buttons) {
          setMensaje("No se pudo cargar PayPal. Recargá la página.");
          return;
        }

        contenedor.current.innerHTML = "";

        botones.current = paypal.Buttons({
          style: { layout: "vertical", color: "gold", shape: "pill", label: "paypal", height: 48 },

          // El servidor arma la orden: recalcula precios y envío desde la base.
          createOrder: async () => {
            const d = datos.current;
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: d.orderId,
                items: d.items,
                direccion: d.direccion,
                metodoEnvio: d.metodoEnvio,
              }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || "No pude crear la orden en PayPal.");
            return json.paypalOrderId;
          },

          // El servidor cobra y compara el monto contra el pedido antes de
          // marcarlo pagado. El navegador nunca captura.
          onApprove: async (data: any) => {
            const d = datos.current;
            const res = await fetch("/api/paypal/capture", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paypalOrderId: data.orderID, orderId: d.orderId }),
            });
            const json = await res.json();
            if (!res.ok || !json.ok) {
              throw new Error(json?.error || "El pago no se pudo confirmar.");
            }
            d.onSuccess({ captureId: json.captureId ?? "", orderId: d.orderId });
          },

          onError: (err: any) => {
            setMensaje("Hubo un problema con PayPal. Probá de nuevo.");
            datos.current.onError?.(err);
          },

          onCancel: () => {
            setMensaje("Cancelaste el pago. Tu pedido quedó pendiente.");
          },
        });

        botones.current.render(contenedor.current);
      })
      .catch((err) => {
        if (err?.message === "sin configurar") return; // ya se avisó arriba
        setMensaje("No se pudo cargar PayPal. Revisa tu conexión.");
        onError?.(err);
      });

    return () => {
      vivo = false;
      if (botones.current) {
        try {
          botones.current.close();
        } catch {}
        botones.current = null;
      }
    };
    // A propósito solo depende de la moneda: todo lo demás viaja por el ref.
  }, [currency]);

  return (
    <div>
      <div ref={contenedor} />
      {mensaje && (
        <p className="mt-3 text-sm text-purple-900 dark:text-purple-100/80" role="status">
          {mensaje}
        </p>
      )}
    </div>
  );
}
