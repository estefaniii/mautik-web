"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CartPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const image_1 = __importDefault(require("next/image"));
const link_1 = __importDefault(require("next/link"));
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const cart_context_1 = require("@/context/cart-context");
const use_toast_1 = require("@/components/ui/use-toast");
const separator_1 = require("@/components/ui/separator");
const input_1 = require("@/components/ui/input");
const framer_motion_1 = require("framer-motion");
const dynamic_1 = __importDefault(require("next/dynamic"));
const CartRecommendations = (0, dynamic_1.default)(() => Promise.resolve().then(() => __importStar(require("@/components/cart-recommendations"))), { ssr: false });
function CartPage() {
    const { cart, updateQuantity, removeFromCart, clearCart } = (0, cart_context_1.useCart)();
    const { toast } = (0, use_toast_1.useToast)();
    const [couponCode, setCouponCode] = (0, react_1.useState)("");
    const [discount, setDiscount] = (0, react_1.useState)(0);
    const [stockMessages, setStockMessages] = (0, react_1.useState)({});
    const prevStocks = (0, react_1.useRef)({});
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 10; // Fixed shipping cost
    const total = subtotal - discount + shipping;
    // Polling para actualizar stock de todos los productos cada 20s
    (0, react_1.useEffect)(() => {
        const interval = setInterval(async () => {
            var _a;
            const updates = {};
            for (const item of cart) {
                try {
                    const res = await fetch(`/api/products/${item.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (typeof data.stock === 'number' && data.stock !== item.stock) {
                            updates[item.id] = data.stock;
                            if (data.stock < ((_a = prevStocks.current[item.id]) !== null && _a !== void 0 ? _a : item.stock)) {
                                setStockMessages(msgs => (Object.assign(Object.assign({}, msgs), { [item.id]: 'El stock ha bajado, ajustamos tu carrito.' })));
                            }
                            prevStocks.current[item.id] = data.stock;
                        }
                    }
                }
                catch (_b) { }
            }
            if (Object.keys(updates).length > 0) {
                for (const id in updates) {
                    const cartItem = cart.find(i => i.id === id);
                    if (cartItem && cartItem.quantity > updates[id]) {
                        updateQuantity(id, updates[id]);
                    }
                }
            }
        }, 20000);
        return () => clearInterval(interval);
    }, [cart]);
    // Validar stock antes de aumentar cantidad
    const fetchLatestStock = async (id) => {
        var _a, _b;
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
            const data = await res.json();
            if (typeof data.stock === 'number') {
                const cartItem = cart.find(i => i.id === id);
                if (data.stock !== (cartItem === null || cartItem === void 0 ? void 0 : cartItem.stock)) {
                    if (data.stock < ((_a = cartItem === null || cartItem === void 0 ? void 0 : cartItem.quantity) !== null && _a !== void 0 ? _a : 0)) {
                        updateQuantity(id, data.stock);
                        setStockMessages(msgs => (Object.assign(Object.assign({}, msgs), { [id]: 'El stock ha cambiado, ajustamos tu carrito.' })));
                    }
                }
                return data.stock;
            }
        }
        return ((_b = cart.find(i => i.id === id)) === null || _b === void 0 ? void 0 : _b.stock) || 0;
    };
    const handleIncreaseWithStockCheck = async (id) => {
        const latestStock = await fetchLatestStock(id);
        const item = cart.find(i => i.id === id);
        if (item && item.quantity < latestStock) {
            updateQuantity(id, item.quantity + 1);
            setStockMessages(msgs => (Object.assign(Object.assign({}, msgs), { [id]: '' })));
        }
        else {
            setStockMessages(msgs => (Object.assign(Object.assign({}, msgs), { [id]: 'No hay más stock disponible.' })));
        }
    };
    const handleApplyCoupon = () => {
        setDiscount(0);
        toast({
            title: "Cupón inválido",
            description: "El código de cupón ingresado no es válido.",
            variant: "destructive",
        });
    };
    const handleDecrease = (id) => {
        const item = cart.find(i => i.id === id);
        if (item && item.quantity > 1) {
            updateQuantity(id, item.quantity - 1);
        }
    };
    const handleIncrease = (id) => {
        const item = cart.find(i => i.id === id);
        if (item && item.quantity < item.stock) {
            updateQuantity(id, item.quantity + 1);
        }
    };
    const handleQuantityChange = (id, newQuantity) => {
        const item = cart.find(i => i.id === id);
        if (newQuantity < 1)
            newQuantity = 1;
        if (item && newQuantity > item.stock)
            newQuantity = item.stock;
        updateQuantity(id, newQuantity);
    };
    const handleRemoveItem = (id) => {
        removeFromCart(id);
        toast({
            title: "Producto eliminado",
            description: "El producto ha sido eliminado de tu carrito.",
        });
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "bg-gradient-to-b from-purple-50 to-white min-h-screen py-12", children: (0, jsx_runtime_1.jsxs)("div", { className: "container mx-auto px-4", children: [(0, jsx_runtime_1.jsx)("h1", { className: "font-display text-3xl font-bold text-purple-900 text-center mb-8", children: "Tu Carrito" }), cart.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-center mb-6", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingBag, { className: "h-20 w-20 text-purple-200" }) }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "Tu carrito est\u00E1 vac\u00EDo" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-8", children: "Parece que a\u00FAn no has a\u00F1adido productos a tu carrito." }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/shop", children: (0, jsx_runtime_1.jsx)(button_1.Button, { className: "bg-purple-800 hover:bg-purple-900 px-8 py-6 text-lg", children: "Explorar Productos" }) })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col lg:flex-row gap-8", children: [(0, jsx_runtime_1.jsx)("div", { className: "lg:w-2/3", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-6", children: [(0, jsx_runtime_1.jsxs)("h2", { className: "text-xl font-semibold text-purple-900", children: ["Productos (", cart.length, ")"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "ghost", className: "text-red-500 hover:text-red-700 hover:bg-red-50", onClick: () => {
                                                    clearCart();
                                                    toast({
                                                        title: "Carrito vacío",
                                                        description: "Se han eliminado todos los productos del carrito.",
                                                    });
                                                }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }), " Vaciar Carrito"] })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { children: cart.map((item) => ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, x: -100 }, transition: { duration: 0.3 }, className: "flex items-center gap-2 border-b border-gray-200 py-0 last:border-b-0 sm:flex-row flex-row", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0 relative h-32 w-32 sm:h-36 sm:w-36 rounded-md overflow-hidden bg-gray-100", children: (0, jsx_runtime_1.jsx)(image_1.default, { src: item.images && item.images.length > 0 ? item.images[0] : "/placeholder.jpg", alt: item.name, fill: true, className: "object-cover rounded-md" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0 flex flex-col justify-between gap-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "truncate text-sm font-medium text-gray-900 dark:text-gray-100", children: item.name }), item.attributes && item.attributes.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "truncate text-xs text-gray-500 dark:text-gray-400", children: item.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ') })), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between gap-2", children: [(0, jsx_runtime_1.jsxs)("span", { className: "font-semibold text-base text-purple-700 dark:text-purple-300", children: ["$", item.price.toFixed(2)] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => handleDecrease(item.id), disabled: item.quantity <= 1, className: "px-2 py-1 text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800/30 rounded-l", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Minus, { className: "h-4 w-4" }) }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: 1, max: item.stock, value: item.quantity, onChange: e => handleQuantityChange(item.id, Number(e.target.value)), className: "w-12 text-center border-x border-gray-300 dark:border-gray-600 bg-transparent", disabled: item.stock === 0 }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleIncreaseWithStockCheck(item.id), disabled: item.quantity >= item.stock, className: "px-2 py-1 text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800/30 rounded-r", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4" }) }), item.quantity >= item.stock && item.stock > 0 && ((0, jsx_runtime_1.jsx)("span", { className: "ml-2 text-xs text-red-500", children: "Stock m\u00E1ximo disponible" })), stockMessages[item.id] && ((0, jsx_runtime_1.jsx)("span", { className: "block text-xs text-red-500 mt-1", children: stockMessages[item.id] })), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleRemoveItem(item.id), className: "ml-1 p-1 rounded bg-transparent hover:bg-red-100 dark:hover:bg-red-900", "aria-label": "Eliminar", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "w-3 h-3 text-red-500" }) })] })] })] })] }, item.id))) }), (0, jsx_runtime_1.jsx)("div", { className: "mt-6", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/shop", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", className: "flex items-center border-purple-800 text-purple-800 hover:bg-purple-100", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }), " Seguir Comprando"] }) }) })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "lg:w-1/3", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6 sticky top-24", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold text-purple-900 mb-6", children: "Resumen de Compra" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4 mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Subtotal" }), (0, jsx_runtime_1.jsxs)("span", { className: "font-medium", children: ["$", subtotal.toFixed(2)] })] }), discount > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-green-600", children: [(0, jsx_runtime_1.jsx)("span", { children: "Descuento" }), (0, jsx_runtime_1.jsxs)("span", { children: ["-$", discount.toFixed(2)] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Env\u00EDo" }), (0, jsx_runtime_1.jsxs)("span", { className: "font-medium", children: ["$", shipping.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-6 flex flex-col gap-2", children: [(0, jsx_runtime_1.jsx)("label", { className: "text-xs font-medium text-gray-600 mb-1", htmlFor: "cart-coupon", children: "\u00BFTienes un cup\u00F3n?" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { id: "cart-coupon", placeholder: "Ingresa tu c\u00F3digo", value: couponCode, onChange: (e) => setCouponCode(e.target.value), className: "h-11 text-base focus:border-purple-400 focus:ring-0 rounded" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleApplyCoupon, className: "h-11 px-6 text-base bg-purple-100 text-purple-800 hover:bg-purple-200 border-none shadow-none", type: "button", children: "Aplicar" })] })] }), (0, jsx_runtime_1.jsx)(separator_1.Separator, {}), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-semibold text-gray-800", children: "Total" }), (0, jsx_runtime_1.jsxs)("span", { className: "font-bold text-xl text-purple-900", children: ["$", total.toFixed(2)] })] })] }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/checkout", children: (0, jsx_runtime_1.jsx)(button_1.Button, { className: "w-full bg-purple-800 hover:bg-purple-900 py-6 text-lg", children: "Proceder al Pago" }) })] }) })] })), cart.length > 0 && ((0, jsx_runtime_1.jsx)(CartRecommendations, { excludeIds: cart.map(i => i.id) }))] }) }));
}
