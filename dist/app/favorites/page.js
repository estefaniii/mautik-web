"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FavoritesPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const favorites_context_1 = require("@/context/favorites-context");
const cart_context_1 = require("@/context/cart-context");
const use_toast_1 = require("@/hooks/use-toast");
const product_card_1 = __importDefault(require("@/components/product-card"));
const select_1 = require("@/components/ui/select");
const link_1 = __importDefault(require("next/link"));
const auth_guard_1 = __importDefault(require("@/components/auth-guard"));
function FavoritesPage() {
    const { getFavoriteProducts, clearFavorites, favoritesCount } = (0, favorites_context_1.useFavorites)();
    const { addToCart } = (0, cart_context_1.useCart)();
    const { toast } = (0, use_toast_1.useToast)();
    const [sortBy, setSortBy] = (0, react_1.useState)("added-desc");
    const [viewMode, setViewMode] = (0, react_1.useState)("grid");
    const [selectedCategory, setSelectedCategory] = (0, react_1.useState)("all");
    const favoriteProducts = getFavoriteProducts();
    // Get unique categories from favorite products
    const categories = Array.from(new Set(favoriteProducts.map(product => product.category)));
    // Filter products by category
    const filteredProducts = selectedCategory === "all"
        ? favoriteProducts
        : favoriteProducts.filter(product => product.category === selectedCategory);
    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case "name-asc":
                return a.name.localeCompare(b.name);
            case "name-desc":
                return b.name.localeCompare(a.name);
            case "price-asc":
                return a.price - b.price;
            case "price-desc":
                return b.price - a.price;
            case "rating-desc":
                return (b.rating || 0) - (a.rating || 0);
            case "added-desc":
                return 0; // Already sorted by addition date in context
            default:
                return 0;
        }
    });
    const handleAddToCart = (product) => {
        addToCart(Object.assign(Object.assign({}, product), { quantity: 1, attributes: product.attributes || [] }));
        toast({
            title: "Producto añadido",
            description: `${product.name} se ha añadido a tu carrito.`,
        });
    };
    const handleClearFavorites = () => {
        clearFavorites();
    };
    if (favoriteProducts.length === 0) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-gradient-to-b from-purple-50 to-white py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "container mx-auto px-4", children: (0, jsx_runtime_1.jsx)("div", { className: "max-w-2xl mx-auto text-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Heart, { className: "h-24 w-24 text-gray-300 mx-auto mb-6" }), (0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-purple-900 mb-4", children: "No tienes favoritos" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-8", children: "A\u00FAn no has guardado ning\u00FAn producto en tus favoritos. Explora nuestra colecci\u00F3n y guarda los productos que m\u00E1s te gusten." }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { asChild: true, className: "bg-purple-800 hover:bg-purple-900", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/shop", children: "Explorar Productos" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", asChild: true, children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/", children: "Volver al Inicio" }) })] })] }) }) }) }));
    }
    return ((0, jsx_runtime_1.jsx)(auth_guard_1.default, { children: (0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-gradient-to-b from-purple-50 to-white py-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "container mx-auto px-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "mb-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-purple-900 mb-2", children: "Mis Favoritos" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600", children: [favoritesCount, " producto", favoritesCount !== 1 ? 's' : '', " guardado", favoritesCount !== 1 ? 's' : '', " en tus favoritos"] })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: handleClearFavorites, className: "text-red-600 hover:text-red-700 hover:bg-red-50", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }), "Limpiar Favoritos"] })] }) }), (0, jsx_runtime_1.jsx)(card_1.Card, { className: "mb-6", children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row gap-4 items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row gap-4 items-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Filter, { className: "h-4 w-4 text-gray-500" }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: selectedCategory, onValueChange: setSelectedCategory, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-40", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Categor\u00EDa" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "all", children: "Todas las categor\u00EDas" }), categories.map((category) => ((0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: category, children: category }, category)))] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.SortAsc, { className: "h-4 w-4 text-gray-500" }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: sortBy, onValueChange: (value) => setSortBy(value), children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-40", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Ordenar por" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "added-desc", children: "M\u00E1s recientes" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "name-asc", children: "Nombre A-Z" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "name-desc", children: "Nombre Z-A" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "price-asc", children: "Precio menor" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "price-desc", children: "Precio mayor" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "rating-desc", children: "Mejor valorados" })] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: viewMode === "grid" ? "default" : "outline", size: "sm", onClick: () => setViewMode("grid"), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Grid, { className: "h-4 w-4" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: viewMode === "list" ? "default" : "outline", size: "sm", onClick: () => setViewMode("list"), children: (0, jsx_runtime_1.jsx)(lucide_react_1.List, { className: "h-4 w-4" }) })] })] }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "mb-6", children: (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600", children: ["Mostrando ", sortedProducts.length, " de ", favoriteProducts.length, " producto", favoriteProducts.length !== 1 ? 's' : '', selectedCategory !== "all" && ` en ${selectedCategory}`] }) }), viewMode === "grid" ? ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6", children: sortedProducts.map((product) => ((0, jsx_runtime_1.jsx)(product_card_1.default, { product: product }, product.id))) })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: sortedProducts.map((product) => {
                            var _a, _b, _c, _d;
                            return ((0, jsx_runtime_1.jsx)(card_1.Card, { className: "overflow-hidden", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative w-32 h-32 flex-shrink-0", children: [(0, jsx_runtime_1.jsx)("img", { src: product.images[0] || "/placeholder.svg", alt: product.name, className: "w-full h-full object-cover" }), product.isNew && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { className: "absolute top-2 left-2 bg-green-500 hover:bg-green-600", children: "Nuevo" })), ((_a = product.discount) !== null && _a !== void 0 ? _a : 0) > 0 && ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { className: "absolute top-2 right-2 bg-red-500 hover:bg-red-600", children: ["-", (_b = product.discount) !== null && _b !== void 0 ? _b : 0, "%"] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start mb-2", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-800 mb-1", children: product.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 mb-2", children: product.description }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4 text-sm text-gray-500", children: [(0, jsx_runtime_1.jsx)("span", { className: "bg-gray-100 px-2 py-1 rounded-full", children: product.category }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center", children: product.reviewCount && product.reviewCount > 0 ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Star, { className: "h-3 w-3 text-yellow-400 fill-current mr-1" }), (0, jsx_runtime_1.jsxs)("span", { children: [product.rating, " (", product.reviewCount, ")"] })] })) : null })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-right", children: ((_c = product.discount) !== null && _c !== void 0 ? _c : 0) > 0 ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-lg font-bold text-purple-800", children: ["$", (product.price * (1 - ((_d = product.discount) !== null && _d !== void 0 ? _d : 0) / 100)).toFixed(2)] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-500 line-through", children: ["$", product.price.toFixed(2)] })] })) : ((0, jsx_runtime_1.jsxs)("p", { className: "text-lg font-bold text-purple-800", children: ["$", product.price.toFixed(2)] })) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { size: "sm", onClick: () => handleAddToCart(product), className: "bg-purple-800 hover:bg-purple-900", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingCart, { className: "h-4 w-4 mr-1" }), "A\u00F1adir al Carrito"] }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", asChild: true, children: (0, jsx_runtime_1.jsxs)(link_1.default, { href: `/product/${product.id}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "h-4 w-4 mr-1" }), "Ver Detalles"] }) })] })] })] }) }, product.id));
                        }) })), sortedProducts.length === 0 && favoriteProducts.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Filter, { className: "h-12 w-12 text-gray-300 mx-auto mb-4" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No hay resultados" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-4", children: "No se encontraron productos en la categor\u00EDa seleccionada." }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: () => setSelectedCategory("all"), children: "Ver todos los favoritos" })] }))] }) }) }));
}
