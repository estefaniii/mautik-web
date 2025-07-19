"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContactPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const textarea_1 = require("@/components/ui/textarea");
const lucide_react_1 = require("lucide-react");
const use_toast_1 = require("@/hooks/use-toast");
function ContactPage() {
    const [formData, setFormData] = (0, react_1.useState)({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const { toast } = (0, use_toast_1.useToast)();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast({
            title: "Mensaje enviado",
            description: "Gracias por contactarnos. Te responderemos pronto.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
        setIsSubmitting(false);
    };
    const handleChange = (e) => {
        setFormData(Object.assign(Object.assign({}, formData), { [e.target.name]: e.target.value }));
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen py-12", children: (0, jsx_runtime_1.jsxs)("div", { className: "container mx-auto px-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "max-w-3xl mx-auto text-center mb-12", children: [(0, jsx_runtime_1.jsx)("h1", { className: "font-display text-4xl md:text-5xl font-bold text-purple-900 dark:text-purple-200 mb-4", children: "Cont\u00E1ctanos" }), (0, jsx_runtime_1.jsx)("p", { className: "text-lg text-gray-700 dark:text-gray-300", children: "\u00BFTienes alguna pregunta o quieres hacer un pedido personalizado? Estamos aqu\u00ED para ayudarte." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-purple-900 dark:text-purple-200 mb-6", children: "Env\u00EDanos un mensaje" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Nombre completo" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "name", name: "name", type: "text", required: true, value: formData.name, onChange: handleChange, className: "w-full", placeholder: "Tu nombre" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Correo electr\u00F3nico" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "email", name: "email", type: "email", required: true, value: formData.email, onChange: handleChange, className: "w-full", placeholder: "tu@email.com" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "subject", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Asunto" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "subject", name: "subject", type: "text", required: true, value: formData.subject, onChange: handleChange, className: "w-full", placeholder: "\u00BFEn qu\u00E9 podemos ayudarte?" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "message", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Mensaje" }), (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { id: "message", name: "message", required: true, value: formData.message, onChange: handleChange, className: "w-full min-h-[120px]", placeholder: "Cu\u00E9ntanos m\u00E1s detalles..." })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "submit", disabled: isSubmitting, className: "w-full bg-purple-800 hover:bg-purple-900", children: isSubmitting ? ("Enviando...") : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Send, { className: "mr-2 h-4 w-4" }), "Enviar mensaje"] })) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-purple-900 dark:text-purple-200 mb-6", children: "Informaci\u00F3n de contacto" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MapPin, { className: "mr-3 h-6 w-6 text-purple-800 dark:text-purple-300 flex-shrink-0 mt-1" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-semibold text-gray-900 dark:text-gray-100", children: "Ubicaci\u00F3n" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "La Chorrera, Panama Oeste, Panam\u00E1" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Mail, { className: "mr-3 h-6 w-6 text-purple-800 dark:text-purple-300" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-semibold text-gray-900 dark:text-gray-100", children: "Email" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "mautik.official@gmail.com" })] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-purple-900 dark:text-purple-200 mb-6", children: "Horarios de atenci\u00F3n" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: "Lunes - Viernes" }), (0, jsx_runtime_1.jsx)("span", { className: "font-semibold dark:text-gray-100", children: "9:00 AM - 6:00 PM" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: "S\u00E1bados" }), (0, jsx_runtime_1.jsx)("span", { className: "font-semibold dark:text-gray-100", children: "9:00 AM - 4:00 PM" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: "Domingos" }), (0, jsx_runtime_1.jsx)("span", { className: "font-semibold dark:text-gray-100", children: "Cerrado" })] })] })] })] })] })] }) }));
}
