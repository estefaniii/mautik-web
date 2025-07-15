import { useEffect, useRef } from "react";

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  onSuccess: (orderId: string, payerEmail?: string) => void;
  onError?: (error: any) => void;
}

export default function PayPalButton({ amount, currency = "USD", onSuccess, onError }: PayPalButtonProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const paypalButtonsInstance = useRef<any>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) {
      onError?.("PayPal Client ID no configurado");
      return;
    }
    function loadPayPalScript() {
      return new Promise<void>((resolve, reject) => {
        if ((window as any).paypal) {
          resolve();
          return;
        }
        const existingScript = document.getElementById("paypal-sdk");
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve());
          existingScript.addEventListener("error", () => reject("No se pudo cargar el SDK de PayPal"));
          return;
        }
        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
        script.id = "paypal-sdk";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject("No se pudo cargar el SDK de PayPal");
        document.body.appendChild(script);
      });
    }
    function renderButton() {
      const paypal = (window as any).paypal;
      if (!paypal) {
        onError?.("PayPal SDK no disponible después de cargar el script");
        return;
      }
      // Destruir el botón anterior si existe
      if (paypalButtonsInstance.current) {
        try {
          paypalButtonsInstance.current.close();
        } catch {}
        paypalButtonsInstance.current = null;
      }
      paypalButtonsInstance.current = paypal.Buttons({
        style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount.toFixed(2),
                  currency_code: currency,
                },
              },
            ],
          });
        },
        onApprove: async (data: any, actions: any) => {
          const details = await actions.order.capture();
          const payerEmail = details?.payer?.email_address;
          onSuccess(details.id, payerEmail);
        },
        onError: (err: any) => {
          onError?.(err);
        },
      });
      paypalButtonsInstance.current.render(paypalRef.current);
    }
    // Limpiar el contenedor antes de renderizar
    if (paypalRef.current) paypalRef.current.innerHTML = "";
    loadPayPalScript()
      .then(() => renderButton())
      .catch((err) => onError?.(err));
    // Cleanup: destruir el botón al desmontar
    return () => {
      if (paypalButtonsInstance.current) {
        try {
          paypalButtonsInstance.current.close();
        } catch {}
        paypalButtonsInstance.current = null;
      }
    };
    // eslint-disable-next-line
  }, [amount, currency]);

  return <div ref={paypalRef} />;
} 