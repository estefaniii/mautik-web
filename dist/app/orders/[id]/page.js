"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OrderDetailPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const navigation_1 = require("next/navigation");
const auth_context_1 = require("@/context/auth-context");
const utils_1 = require("@/lib/utils");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const cart_context_1 = require("@/context/cart-context");
const auth_guard_1 = __importDefault(require("@/components/auth-guard"));
function OrderDetailPage() {
    const params = (0, navigation_1.useParams)();
    const router = (0, navigation_1.useRouter)();
    const { user } = (0, auth_context_1.useAuth)();
    const { addToCart } = (0, cart_context_1.useCart)();
    const [order, setOrder] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        var _a;
        const userId = (_a = user === null || user === void 0 ? void 0 : user.id) === null || _a === void 0 ? void 0 : _a.toString();
        const orders = (0, utils_1.getOrders)(userId);
        const found = orders.find((o) => o.id.toString() === params.id);
        setOrder(found || null);
    }, [user, params.id]);
    if (!order) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-8 text-center max-w-xl", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "Pedido no encontrado" }), (0, jsx_runtime_1.jsx)(button_1.Button, { asChild: true, variant: "outline", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/orders", children: "Volver a pedidos" }) })] }) }));
    }
    const handleReorder = () => {
        order.items.forEach((item) => {
            addToCart(Object.assign(Object.assign({}, item), { quantity: item.quantity }));
        });
        router.push("/cart");
    };
    return ((0, jsx_runtime_1.jsx)(auth_guard_1.default, { children: (0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-gradient-to-b from-purple-50 to-white py-12", children: (0, jsx_runtime_1.jsxs)("div", { className: "container mx-auto px-4 max-w-2xl", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { asChild: true, variant: "outline", className: "mb-6", children: (0, jsx_runtime_1.jsxs)(link_1.default, { href: "/orders", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }), " Volver a pedidos"] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4 mb-4", children: [(0, jsx_runtime_1.jsxs)("h1", { className: "text-2xl font-bold text-purple-900 flex-1", children: ["Pedido #", order.id] }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { className: order.status === "Procesando" ? "bg-yellow-100 text-yellow-800" :
                                            order.status === "Enviado" ? "bg-blue-100 text-blue-800" :
                                                order.status === "Entregado" ? "bg-green-100 text-green-800" :
                                                    "bg-gray-100 text-gray-800", children: order.status })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-6 text-gray-500", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: new Date(order.date).toLocaleString() })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold mb-2", children: "Datos de env\u00EDo" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-gray-700", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Nombre:" }), " ", order.userName] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Email:" }), " ", order.email] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Tel\u00E9fono:" }), " ", order.phone] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Direcci\u00F3n:" }), " ", order.address, ", ", order.city, ", ", order.state, ", ", order.zip, ", ", order.country] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "M\u00E9todo de pago:" }), " ", order.payment === "card" ? "Tarjeta de crédito/débito" : "Pago contra entrega"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold mb-2", children: "Productos" }), (0, jsx_runtime_1.jsx)("div", { className: "divide-y divide-gray-200", children: order.items.map((item) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center py-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "font-medium text-gray-800", children: item.name }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500", children: ["Cantidad: ", item.quantity] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-purple-800 font-semibold", children: ["$", (item.price * item.quantity).toFixed(2)] })] }, item.id))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between mb-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Subtotal" }), (0, jsx_runtime_1.jsxs)("span", { className: "font-medium", children: ["$", order.subtotal.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between mb-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Env\u00EDo" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: order.shipping === 0 ? "Gratis" : `$${order.shipping.toFixed(2)}` })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-lg", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-semibold text-gray-800", children: "Total" }), (0, jsx_runtime_1.jsxs)("span", { className: "font-bold text-purple-900", children: ["$", order.total.toFixed(2)] })] })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleReorder, className: "w-full bg-purple-800 hover:bg-purple-900 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingCart, { className: "h-5 w-5" }), " Volver a comprar"] })] })] }) }) }));
}
