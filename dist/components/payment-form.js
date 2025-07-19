"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PaymentForm;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_stripe_js_1 = require("@stripe/react-stripe-js");
const button_1 = require("./ui/button");
const fa_1 = require("react-icons/fa");
function PaymentForm({ amount, onSuccess, onError, noFormWrapper = false }) {
    const stripe = (0, react_stripe_js_1.useStripe)();
    const elements = (0, react_stripe_js_1.useElements)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const handleSubmit = async (e) => {
        var _a, _b, _c, _d, _e, _f;
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            // 1. Crear PaymentIntent en el backend
            const res = await fetch('/api/stripe/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.error || 'Error creando PaymentIntent');
            const clientSecret = data.clientSecret;
            // 2. Confirmar el pago con Stripe.js
            const result = await (stripe === null || stripe === void 0 ? void 0 : stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements === null || elements === void 0 ? void 0 : elements.getElement(react_stripe_js_1.CardElement),
                },
            }));
            if (result === null || result === void 0 ? void 0 : result.error) {
                setError(result.error.message || 'Error al procesar el pago');
                onError === null || onError === void 0 ? void 0 : onError(result.error);
                setLoading(false);
                return;
            }
            if (((_a = result === null || result === void 0 ? void 0 : result.paymentIntent) === null || _a === void 0 ? void 0 : _a.status) === 'succeeded') {
                onSuccess(result.paymentIntent.id, (_f = (_e = (_d = (_c = (_b = result.paymentIntent) === null || _b === void 0 ? void 0 : _b.charges) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.billing_details) === null || _f === void 0 ? void 0 : _f.email);
            }
            else {
                setError('El pago no fue exitoso.');
                onError === null || onError === void 0 ? void 0 : onError('El pago no fue exitoso.');
            }
        }
        catch (err) {
            let errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
            setError(errorToUse.message || 'Error inesperado');
            onError === null || onError === void 0 ? void 0 : onError(errorToUse);
        }
        finally {
            setLoading(false);
        }
    };
    const formFields = ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-2", children: [(0, jsx_runtime_1.jsx)(fa_1.FaCcVisa, { className: "text-blue-600 h-7 w-7" }), (0, jsx_runtime_1.jsx)(fa_1.FaCcMastercard, { className: "text-red-600 h-7 w-7" }), (0, jsx_runtime_1.jsx)("span", { className: "ml-2 text-gray-700 text-sm", children: "Aceptamos Visa y Mastercard" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-2 text-gray-800 font-semibold text-lg flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(fa_1.FaLock, { className: "text-green-600 h-4 w-4" }), " Pago seguro con Stripe"] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-2 text-indigo-700 font-bold text-xl", children: ["Total: $", amount.toFixed(2)] }), (0, jsx_runtime_1.jsx)("div", { className: "rounded border border-gray-300 p-3 bg-white", children: (0, jsx_runtime_1.jsx)(react_stripe_js_1.CardElement, { options: { hidePostalCode: true, style: { base: { fontSize: '16px', color: '#1a202c', '::placeholder': { color: '#a0aec0' } }, invalid: { color: '#e53e3e' } } } }) }), error && (0, jsx_runtime_1.jsx)("div", { className: "text-red-500 text-sm mt-2", children: error }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "submit", className: "w-full bg-indigo-600 hover:bg-indigo-700 mt-2", disabled: loading || !stripe || !elements, children: [loading ? (0, jsx_runtime_1.jsx)("span", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2" }) : null, loading ? 'Procesando...' : `Pagar $${amount.toFixed(2)}`] })] }));
    if (noFormWrapper) {
        return (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: formFields });
    }
    return ((0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, className: "space-y-4", children: formFields }));
}
