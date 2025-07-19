"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ForgotPasswordPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const card_1 = require("@/components/ui/card");
const use_toast_1 = require("@/hooks/use-toast");
const link_1 = __importDefault(require("next/link"));
function ForgotPasswordPage() {
    const [email, setEmail] = (0, react_1.useState)("");
    const [sent, setSent] = (0, react_1.useState)(false);
    const { toast } = (0, use_toast_1.useToast)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setSent(true);
                toast({
                    title: "Revisa tu correo",
                    description: "Si el email existe, recibirás un enlace para restablecer tu contraseña.",
                });
            }
            else {
                toast({
                    title: "Error",
                    description: data.error || "No se pudo enviar el email.",
                    variant: "destructive",
                });
            }
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Error de conexión.",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4", children: (0, jsx_runtime_1.jsx)("div", { className: "w-full max-w-md", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "shadow-xl border-0", children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-2xl font-bold text-center", children: "\u00BFOlvidaste tu contrase\u00F1a?" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: sent ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center text-green-600", children: ["Si el email existe, recibir\u00E1s un enlace para restablecer tu contrase\u00F1a.", (0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/login", className: "text-purple-600 hover:underline", children: "Volver al login" }) })] })) : ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { type: "email", placeholder: "Tu email", value: email, onChange: e => setEmail(e.target.value), required: true, disabled: loading }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Enviando..." : "Enviar enlace" }), (0, jsx_runtime_1.jsx)("div", { className: "text-center mt-2", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/login", className: "text-purple-600 hover:underline", children: "Volver al login" }) })] })) })] }) }) }));
}
