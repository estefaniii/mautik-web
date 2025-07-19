"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OrderSummarySticky;
const jsx_runtime_1 = require("react/jsx-runtime");
const cart_context_1 = require("@/context/cart-context");
const navigation_1 = require("next/navigation");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
function OrderSummarySticky({ subtotal, shipping, total, loading, paymentMethod, onEditCart }) {
    const { cart } = (0, cart_context_1.useCart)();
    const router = (0, navigation_1.useRouter)();
    const [isMobile, setIsMobile] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);
    if (!isMobile || cart.length === 0)
        return null;
    const handleScrollToForm = () => {
        const form = document.getElementById("checkout-main-form");
        if (form) {
            form.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed bottom-0 left-0 w-full z-40 bg-white border-t border-indigo-200 shadow-lg md:hidden animate-fade-in-up", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between px-4 py-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 text-sm text-gray-700", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingCart, { className: "h-5 w-5 text-indigo-600" }), (0, jsx_runtime_1.jsxs)("span", { className: "font-semibold", children: [cart.length, " producto", cart.length > 1 ? 's' : ''] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500 mt-1", children: ["Subtotal: ", (0, jsx_runtime_1.jsxs)("span", { className: "font-medium text-gray-900", children: ["$", subtotal.toFixed(2)] }), " \u2022 Env\u00EDo: ", (0, jsx_runtime_1.jsxs)("span", { className: "font-medium text-gray-900", children: ["$", shipping.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-base font-bold text-indigo-800 mt-1", children: ["Total: $", total.toFixed(2)] }), paymentMethod && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1 text-xs text-gray-600 mt-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CreditCard, { className: "h-4 w-4 text-indigo-500" }), (0, jsx_runtime_1.jsx)("span", { children: paymentMethod })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-2 ml-4", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", onClick: onEditCart || (() => router.push('/cart')), className: "border-indigo-400 text-indigo-700", children: "Editar carrito" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { disabled: loading, className: "bg-indigo-600 hover:bg-indigo-700 text-white w-32 flex items-center justify-center", onClick: handleScrollToForm, children: [loading && (0, jsx_runtime_1.jsx)("span", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), loading ? "Procesando..." : "Finalizar compra"] })] })] }) }));
}
