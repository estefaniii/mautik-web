"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PayPalButton;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function PayPalButton({ amount, currency = "USD", onSuccess, onError }) {
    const paypalRef = (0, react_1.useRef)(null);
    const paypalButtonsInstance = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
        if (!clientId) {
            onError === null || onError === void 0 ? void 0 : onError("PayPal Client ID no configurado");
            return;
        }
        function loadPayPalScript() {
            return new Promise((resolve, reject) => {
                if (window.paypal) {
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
            const paypal = window.paypal;
            if (!paypal) {
                onError === null || onError === void 0 ? void 0 : onError("PayPal SDK no disponible después de cargar el script");
                return;
            }
            // Destruir el botón anterior si existe
            if (paypalButtonsInstance.current) {
                try {
                    paypalButtonsInstance.current.close();
                }
                catch (_a) { }
                paypalButtonsInstance.current = null;
            }
            paypalButtonsInstance.current = paypal.Buttons({
                style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
                createOrder: (data, actions) => {
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
                onApprove: async (data, actions) => {
                    var _a;
                    const details = await actions.order.capture();
                    const payerEmail = (_a = details === null || details === void 0 ? void 0 : details.payer) === null || _a === void 0 ? void 0 : _a.email_address;
                    onSuccess(details.id, payerEmail);
                },
                onError: (err) => {
                    onError === null || onError === void 0 ? void 0 : onError(err);
                },
            });
            paypalButtonsInstance.current.render(paypalRef.current);
        }
        // Limpiar el contenedor antes de renderizar
        if (paypalRef.current)
            paypalRef.current.innerHTML = "";
        loadPayPalScript()
            .then(() => renderButton())
            .catch((err) => onError === null || onError === void 0 ? void 0 : onError(err));
        // Cleanup: destruir el botón al desmontar
        return () => {
            if (paypalButtonsInstance.current) {
                try {
                    paypalButtonsInstance.current.close();
                }
                catch (_a) { }
                paypalButtonsInstance.current = null;
            }
        };
        // eslint-disable-next-line
    }, [amount, currency]);
    return (0, jsx_runtime_1.jsx)("div", { ref: paypalRef });
}
