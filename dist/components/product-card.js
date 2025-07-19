"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProductCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
const lazy_image_1 = __importDefault(require("@/components/ui/lazy-image"));
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const badge_1 = require("@/components/ui/badge");
const use_toast_1 = require("@/hooks/use-toast");
const cart_context_1 = require("@/context/cart-context");
const favorites_context_1 = require("@/context/favorites-context");
function ProductCard({ product }) {
    var _a, _b, _c;
    const { toast } = (0, use_toast_1.useToast)();
    const { addToCart } = (0, cart_context_1.useCart)();
    const { isFavorite, toggleFavorite } = (0, favorites_context_1.useFavorites)();
    const [imageError, setImageError] = (0, react_1.useState)(false);
    // Usar solo 'id' para productos (Prisma/Postgres)
    const productId = product.id;
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(Object.assign(Object.assign({}, product), { quantity: 1, stock: product.stock, attributes: product.attributes || [] }));
        toast({
            title: "Producto añadido",
            description: `${product.name} se ha añadido a tu carrito.`,
        });
    };
    const handleToggleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(String(product.id));
    };
    const handleImageError = () => {
        setImageError(true);
    };
    // Obtener la imagen del producto o usar placeholder
    const getProductImage = () => {
        if (imageError || !product.images || product.images.length === 0) {
            return "/placeholder.jpg";
        }
        return product.images[0];
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "group bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 product-card-hover h-full flex flex-col border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300/50 dark:hover:border-purple-500/50", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsxs)(link_1.default, { href: `/product/${productId}`, className: "block relative h-40 md:h-64 w-full overflow-hidden", children: [(0, jsx_runtime_1.jsx)(lazy_image_1.default, { src: getProductImage(), alt: product.name, fill: true, className: "object-cover transition-all duration-500 group-hover:scale-110", onError: handleImageError, sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw", priority: false }), (0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "absolute top-3 left-3 z-20 flex flex-col gap-2", children: [((_a = product.discount) !== null && _a !== void 0 ? _a : 0) > 0 && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { className: "bg-gradient-to-r from-red-500/90 to-red-400/80 text-white flex items-center badge-anim shadow-md backdrop-blur-sm", children: (0, jsx_runtime_1.jsxs)("span", { className: "font-sans text-xs font-semibold", children: ["-", product.discount, "%"] }) })), product.isNew && ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { className: "bg-gradient-to-r from-green-500/90 to-green-400/80 text-white flex items-center badge-anim shadow-md backdrop-blur-sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Star, { size: 12, className: "mr-1" }), (0, jsx_runtime_1.jsx)("span", { className: "font-sans text-xs font-semibold", children: "Nuevo" })] })), product.stock === 0 && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { className: "bg-gradient-to-r from-gray-400/90 to-gray-500/80 text-white flex items-center badge-anim shadow-md backdrop-blur-sm", children: (0, jsx_runtime_1.jsx)("span", { className: "font-sans text-xs font-semibold", children: "Agotado" }) }))] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleToggleFavorite, className: "absolute top-3 right-3 z-20 p-2 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group/fav", "aria-label": isFavorite(productId) ? "Quitar de favoritos" : "Agregar a favoritos", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Heart, { size: 20, className: `transition-all duration-300 ${isFavorite(productId)
                                ? "text-red-500 fill-current scale-110"
                                : "text-gray-600 dark:text-gray-400 group-hover/fav:text-red-500"}` }) }), (0, jsx_runtime_1.jsx)("div", { className: "absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleAddToCart, disabled: product.stock === 0, className: "w-full bg-purple-800 hover:bg-purple-900 dark:bg-purple-700 dark:hover:bg-purple-800 text-white shadow-lg", size: "sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingCart, { size: 16, className: "mr-2" }), product.stock === 0 ? "Agotado" : "Añadir al carrito"] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-3 md:p-5 flex flex-col flex-grow", children: [(0, jsx_runtime_1.jsx)(link_1.default, { href: `/product/${productId}`, className: "block group/title", children: (0, jsx_runtime_1.jsx)("h3", { className: "text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1 line-clamp-1 group-hover/title:text-purple-800 dark:group-hover/title:text-purple-300 transition-colors", children: product.name }) }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-300 text-xs mb-2 line-clamp-2 flex-grow leading-tight", children: product.description }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mt-auto pt-2 border-t border-gray-100 dark:border-gray-800", children: [(0, jsx_runtime_1.jsx)("div", { children: ((_b = product.discount) !== null && _b !== void 0 ? _b : 0) > 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-lg md:text-xl font-bold text-purple-800 dark:text-purple-300", children: ["$", (product.price *
                                                    (1 - (((_c = product.discount) !== null && _c !== void 0 ? _c : 0) / 100))).toFixed(2)] }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm text-gray-500 dark:text-gray-400 line-through", children: ["$", product.price.toFixed(2)] })] })) : ((0, jsx_runtime_1.jsxs)("span", { className: "text-lg md:text-xl font-bold text-purple-800 dark:text-purple-300", children: ["$", product.price.toFixed(2)] })) }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center", children: product.reviewCount && product.reviewCount > 0 ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "flex", children: [...Array(5)].map((_, i) => ((0, jsx_runtime_1.jsx)(lucide_react_1.Star, { size: 14, className: `${i < Math.floor(product.rating)
                                                    ? "text-yellow-400 dark:text-yellow-300 fill-current"
                                                    : "text-gray-300 dark:text-gray-600"}` }, i))) }), (0, jsx_runtime_1.jsxs)("span", { className: "text-xs text-gray-500 dark:text-gray-400 ml-1", children: ["(", product.reviewCount, ")"] })] })) : null })] })] })] }));
}
