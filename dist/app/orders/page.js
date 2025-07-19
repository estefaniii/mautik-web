"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OrdersPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const link_1 = __importDefault(require("next/link"));
const auth_context_1 = require("@/context/auth-context");
const utils_1 = require("@/lib/utils");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const auth_guard_1 = __importDefault(require("@/components/auth-guard"));
function OrdersPage() {
    const { user } = (0, auth_context_1.useAuth)();
    const [orders, setOrders] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        var _a;
        const userId = (_a = user === null || user === void 0 ? void 0 : user.id) === null || _a === void 0 ? void 0 : _a.toString();
        setOrders((0, utils_1.getOrders)(userId));
    }, [user]);
    return ((0, jsx_runtime_1.jsx)(auth_guard_1.default, { children: (0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-gradient-to-b from-purple-50 to-white py-12", children: (0, jsx_runtime_1.jsxs)("div", { className: "container mx-auto px-4 max-w-3xl", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-purple-900 mb-8 text-center", children: "Mis Pedidos" }), orders.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-8 text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingBag, { className: "h-20 w-20 text-purple-200 mx-auto mb-6" }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "No tienes pedidos a\u00FAn" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-8", children: "\u00A1Haz tu primer pedido y comienza a disfrutar de nuestros productos!" }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/shop", children: (0, jsx_runtime_1.jsx)(button_1.Button, { className: "bg-purple-800 hover:bg-purple-900 px-8 py-6 text-lg", children: "Explorar Productos" }) })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-6", children: orders.map((order) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-4 w-4 text-gray-400" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-500", children: new Date(order.date).toLocaleDateString() })] }), (0, jsx_runtime_1.jsxs)("h3", { className: "text-lg font-semibold text-purple-900 mb-1", children: ["Pedido #", order.id] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-2 mb-1", children: (0, jsx_runtime_1.jsx)(badge_1.Badge, { className: order.status === "Procesando" ? "bg-yellow-100 text-yellow-800" :
                                                    order.status === "Enviado" ? "bg-blue-100 text-blue-800" :
                                                        order.status === "Entregado" ? "bg-green-100 text-green-800" :
                                                            "bg-gray-100 text-gray-800", children: order.status }) }), (0, jsx_runtime_1.jsxs)("div", { className: "text-gray-600 text-sm", children: [order.items.length, " producto", order.items.length !== 1 ? "s" : "", " \u00B7 Total: ", (0, jsx_runtime_1.jsxs)("span", { className: "font-semibold text-purple-800", children: ["$", order.total.toFixed(2)] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-col gap-2 md:items-end", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: `/orders/${order.id}`, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "h-4 w-4" }), " Ver Detalle"] }) }) })] }, order.id))) }))] }) }) }));
}
