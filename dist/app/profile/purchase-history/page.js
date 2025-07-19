"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PurchaseHistory;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const auth_context_1 = require("@/context/auth-context");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const image_1 = __importDefault(require("next/image"));
const statusConfig = {
    pending: {
        label: 'Pendiente',
        icon: lucide_react_1.Clock,
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    processing: {
        label: 'Procesando',
        icon: lucide_react_1.Package,
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    shipped: {
        label: 'Enviado',
        icon: lucide_react_1.Truck,
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    delivered: {
        label: 'Entregado',
        icon: lucide_react_1.CheckCircle,
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    cancelled: {
        label: 'Cancelado',
        icon: lucide_react_1.XCircle,
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        bgColor: 'bg-red-50 dark:bg-red-900/20'
    }
};
function PurchaseHistory() {
    var _a;
    const { user } = (0, auth_context_1.useAuth)();
    const [orders, setOrders] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [activeTab, setActiveTab] = (0, react_1.useState)('all');
    (0, react_1.useEffect)(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);
    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        }
        catch (error) {
            console.error('Error fetching orders:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const getFilteredOrders = () => {
        if (activeTab === 'all')
            return orders;
        return orders.filter(order => order.status === activeTab);
    };
    const getStatusConfig = (status) => {
        return statusConfig[status];
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const getOrderSummary = () => {
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
        const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
        const pendingOrders = orders.filter(order => ['pending', 'processing'].includes(order.status)).length;
        return { totalOrders, totalSpent, deliveredOrders, pendingOrders };
    };
    if (!user) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "container mx-auto px-4 py-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4", children: "Inicia sesi\u00F3n para ver tu historial de compras" }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/login", children: (0, jsx_runtime_1.jsx)(button_1.Button, { children: "Iniciar Sesi\u00F3n" }) })] }) }));
    }
    if (loading) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "container mx-auto px-4 py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-pulse space-y-4", children: [...Array(3)].map((_, i) => ((0, jsx_runtime_1.jsx)("div", { className: "bg-gray-200 dark:bg-gray-700 h-32 rounded-lg" }, i))) }) }));
    }
    const summary = getOrderSummary();
    const filteredOrders = getFilteredOrders();
    return ((0, jsx_runtime_1.jsx)("div", { className: "container mx-auto px-4 py-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-6xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2", children: "Historial de Compras" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "Revisa todos tus pedidos y su estado actual" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-8", children: [(0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingBag, { className: "h-8 w-8 text-purple-600 mr-3" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Total Pedidos" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: summary.totalOrders })] })] }) }) }), (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { className: "h-8 w-8 text-green-600 mr-3" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Total Gastado" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: ["$", summary.totalSpent.toFixed(2)] })] })] }) }) }), (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "h-8 w-8 text-green-600 mr-3" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Entregados" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: summary.deliveredOrders })] })] }) }) }), (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-8 w-8 text-yellow-600 mr-3" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Pendientes" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: summary.pendingOrders })] })] }) }) })] }), (0, jsx_runtime_1.jsx)(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "mb-6", children: (0, jsx_runtime_1.jsxs)(tabs_1.TabsList, { className: "grid w-full grid-cols-6", children: [(0, jsx_runtime_1.jsxs)(tabs_1.TabsTrigger, { value: "all", children: ["Todos (", orders.length, ")"] }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "pending", children: "Pendientes" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "processing", children: "Procesando" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "shipped", children: "Enviados" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "delivered", children: "Entregados" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "cancelled", children: "Cancelados" })] }) }), filteredOrders.length === 0 ? ((0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-8 text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Package, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900 dark:text-gray-100 mb-2", children: "No hay pedidos" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400 mb-4", children: activeTab === 'all'
                                    ? 'Aún no has realizado ningún pedido.'
                                    : `No hay pedidos con estado "${(_a = getStatusConfig(activeTab)) === null || _a === void 0 ? void 0 : _a.label}"` }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/shop", children: (0, jsx_runtime_1.jsx)(button_1.Button, { children: "Ir a la tienda" }) })] }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-6", children: filteredOrders.map((order) => {
                        const status = getStatusConfig(order.status);
                        const StatusIcon = status.icon;
                        return ((0, jsx_runtime_1.jsxs)(card_1.Card, { className: "overflow-hidden", children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { className: `${status.bgColor} border-b`, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsx)(StatusIcon, { className: "h-5 w-5" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "text-lg", children: ["Pedido #", order.id.slice(-8)] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: formatDate(order.createdAt) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(badge_1.Badge, { className: status.color, children: status.label }), (0, jsx_runtime_1.jsxs)("span", { className: "text-lg font-bold text-gray-900 dark:text-gray-100", children: ["$", order.total.toFixed(2)] })] })] }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: order.items.map((item) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0", children: (0, jsx_runtime_1.jsx)(image_1.default, { src: item.productImage || '/placeholder.svg', alt: item.productName, fill: true, className: "object-cover" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium text-gray-900 dark:text-gray-100 truncate", children: item.productName }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Cantidad: ", item.quantity, " \u00D7 $", item.price.toFixed(2)] })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-right", children: (0, jsx_runtime_1.jsxs)("p", { className: "font-medium text-gray-900 dark:text-gray-100", children: ["$", (item.quantity * item.price).toFixed(2)] }) })] }, item.id))) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mt-6 pt-4 border-t", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsxs)("span", { children: ["Actualizado: ", formatDate(order.updatedAt)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(link_1.default, { href: `/orders/${order.id}`, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "h-4 w-4 mr-1" }), "Ver Detalles"] }) }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { className: "h-4 w-4 mr-1" }), "Factura"] })] })] })] })] }, order.id));
                    }) }))] }) }));
}
