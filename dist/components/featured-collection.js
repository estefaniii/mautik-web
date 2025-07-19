"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FeaturedCollection;
const jsx_runtime_1 = require("react/jsx-runtime");
const link_1 = __importDefault(require("next/link"));
const button_1 = require("@/components/ui/button");
const lazy_image_1 = __importDefault(require("@/components/ui/lazy-image"));
const favorites_context_1 = require("@/context/favorites-context");
const product_card_1 = __importDefault(require("@/components/product-card"));
const react_1 = require("react");
const loading_states_1 = require("@/components/ui/loading-states");
function FeaturedCollection() {
    const { favorites, getFavoriteProducts } = (0, favorites_context_1.useFavorites)();
    const [recommended, setRecommended] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products');
                if (response.ok) {
                    const products = await response.json();
                    let recommendedProducts = [];
                    // Si hay favoritos, mostrar productos de la misma categoría
                    if (favorites && favorites.length > 0) {
                        const favoriteCategories = favorites.map(f => f.category);
                        recommendedProducts = products.filter(p => favoriteCategories.includes(p.category) &&
                            !favorites.some(f => f.id === p.id)).slice(0, 8);
                    }
                    // Si no hay recomendaciones basadas en favoritos, mostrar productos destacados
                    if (recommendedProducts.length === 0) {
                        recommendedProducts = products.filter(p => p.featured).slice(0, 8);
                    }
                    // Si aún no hay productos, mostrar los más nuevos
                    if (recommendedProducts.length === 0) {
                        recommendedProducts = products.filter(p => p.isNew).slice(0, 8);
                    }
                    // Si aún no hay productos, mostrar los primeros 8
                    if (recommendedProducts.length === 0) {
                        recommendedProducts = products.slice(0, 8);
                    }
                    setRecommended(recommendedProducts);
                }
            }
            catch (error) {
                const errorToUse = error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));
                console.error('Error fetching products:', errorToUse);
            }
            finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [favorites]);
    if (loading) {
        return ((0, jsx_runtime_1.jsxs)("section", { className: "py-16 relative overflow-hidden", children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 z-0", children: (0, jsx_runtime_1.jsx)(lazy_image_1.default, { src: "/maar.png", alt: "Featured Collection Background", fill: true, className: "object-cover brightness-[0.7]", priority: false }) }), (0, jsx_runtime_1.jsx)("div", { className: "container mx-auto px-4 relative z-10", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-lg bg-white/90 dark:bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-lg", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-purple-800 dark:text-purple-900 font-medium", children: "Colecci\u00F3n Destacada" }), (0, jsx_runtime_1.jsx)("h2", { className: "font-display text-3xl md:text-4xl font-bold text-purple-900 dark:text-purple-900 mt-2 mb-4", children: "Oc\u00E9ano Paname\u00F1o 2025" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-700 dark:text-black mb-8", children: "Descubre nuestra nueva colecci\u00F3n inspirada en los maravillosos oc\u00E9anos de Panam\u00E1. Piezas \u00FAnicas que capturan la belleza del mar con elegancia y creatividad artesanal." }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row gap-4", children: [(0, jsx_runtime_1.jsx)(link_1.default, { href: "/shop?collection=oceano-panameno", children: (0, jsx_runtime_1.jsx)(button_1.Button, { size: "lg", className: "bg-purple-800 hover:bg-purple-900 dark:bg-purple-700 dark:hover:bg-purple-800", children: "Ver Colecci\u00F3n" }) }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/lookbook", children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "lg", className: "border-purple-800 text-purple-800 hover:bg-purple-100 dark:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-50", children: "Ver Lookbook" }) })] })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "container mx-auto px-4 mt-16", children: (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6", children: [...Array(8)].map((_, i) => ((0, jsx_runtime_1.jsx)(loading_states_1.ProductCardSkeleton, {}, i))) }) })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("section", { className: "py-16 relative overflow-hidden", children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 z-0", children: (0, jsx_runtime_1.jsx)(lazy_image_1.default, { src: "/maar.png", alt: "Featured Collection Background", fill: true, className: "object-cover brightness-[0.7]", priority: false }) }), (0, jsx_runtime_1.jsx)("div", { className: "container mx-auto px-4 relative z-10", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-lg bg-white/90 dark:bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-lg", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-purple-800 dark:text-purple-900 font-medium", children: "Colecci\u00F3n Destacada" }), (0, jsx_runtime_1.jsx)("h2", { className: "font-display text-3xl md:text-4xl font-bold text-purple-900 dark:text-purple-900 mt-2 mb-4", children: "Oc\u00E9ano Paname\u00F1o 2025" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-700 dark:text-black mb-8", children: "Descubre nuestra nueva colecci\u00F3n inspirada en los maravillosos oc\u00E9anos de Panam\u00E1. Piezas \u00FAnicas que capturan la belleza del mar con elegancia y creatividad artesanal." }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row gap-4", children: [(0, jsx_runtime_1.jsx)(link_1.default, { href: "/shop?collection=oceano-panameno", children: (0, jsx_runtime_1.jsx)(button_1.Button, { size: "lg", className: "bg-purple-800 hover:bg-purple-900 dark:bg-purple-700 dark:hover:bg-purple-800", children: "Ver Colecci\u00F3n" }) }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/lookbook", children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "lg", className: "border-purple-800 text-purple-800 hover:bg-purple-100 dark:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-50", children: "Ver Lookbook" }) })] })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "container mx-auto px-4 mt-16", children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-display text-2xl font-bold text-purple-900 dark:text-purple-100 mb-8", children: favorites && favorites.length > 0 ? "Recomendados para ti" : "Colección Destacada" }), recommended.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6", children: recommended.map((product) => ((0, jsx_runtime_1.jsx)(product_card_1.default, { product: product }, product.id))) })) : ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8", children: (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "No hay productos disponibles en este momento." }) }))] })] }));
}
