"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ResetPasswordPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const card_1 = require("@/components/ui/card");
const use_toast_1 = require("@/hooks/use-toast");
const link_1 = __importDefault(require("next/link"));
function ResetPasswordPage() {
    const router = (0, navigation_1.useRouter)();
    const searchParams = (0, navigation_1.useSearchParams)();
    const token = searchParams.get("token") || "";
    const [password, setPassword] = (0, react_1.useState)("");
    const [confirm, setConfirm] = (0, react_1.useState)("");
    const [success, setSuccess] = (0, react_1.useState)(false);
    const { toast } = (0, use_toast_1.useToast)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) {
            toast({
                title: "Error",
                description: "Las contraseñas no coinciden.",
                variant: "destructive",
            });
            return;
        }
        if (password.length < 6) {
            toast({
                title: "Error",
                description: "La contraseña debe tener al menos 6 caracteres.",
                variant: "destructive",
            });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
                toast({
                    title: "Contraseña restablecida",
                    description: "Ahora puedes iniciar sesión con tu nueva contraseña.",
                });
                setTimeout(() => router.push("/login"), 2000);
            }
            else {
                toast({
                    title: "Error",
                    description: data.error || "No se pudo restablecer la contraseña.",
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
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4", children: (0, jsx_runtime_1.jsx)("div", { className: "w-full max-w-md", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "shadow-xl border-0", children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-2xl font-bold text-center", children: "Restablecer contrase\u00F1a" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: success ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center text-green-600", children: ["Contrase\u00F1a restablecida correctamente. Redirigiendo al login...", (0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/login", className: "text-purple-600 hover:underline", children: "Ir al login" }) })] })) : ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { type: "password", placeholder: "Nueva contrase\u00F1a", value: password, onChange: e => setPassword(e.target.value), required: true, disabled: loading }), (0, jsx_runtime_1.jsx)(input_1.Input, { type: "password", placeholder: "Confirmar contrase\u00F1a", value: confirm, onChange: e => setConfirm(e.target.value), required: true, disabled: loading }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Restableciendo..." : "Restablecer contraseña" }), (0, jsx_runtime_1.jsx)("div", { className: "text-center mt-2", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/login", className: "text-purple-600 hover:underline", children: "Volver al login" }) })] })) })] }) }) }));
}
