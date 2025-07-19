"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProductRecommendations;
const jsx_runtime_1 = require("react/jsx-runtime");
const favorites_context_1 = require("@/context/favorites-context");
const product_card_1 = __importDefault(require("@/components/product-card"));
const react_1 = require("react");
function ProductRecommendations({ category, excludeId }) {
    const { favorites } = (0, favorites_context_1.useFavorites)();
    const [recommended, setRecommended] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await fetch('/api/products');
                if (response.ok) {
                    const products = await response.json();
                    // Filtrar productos de la misma categoría, excluyendo el actual y favoritos
                    const favoriteIds = favorites.map(f => f.id);
                    const recommendations = products.filter(product => product.category.toLowerCase() === category.toLowerCase() &&
                        product.id !== excludeId &&
                        !favoriteIds.includes(product.id)).slice(0, 4);
                    // Si no hay suficientes de la misma categoría, agregar productos destacados
                    if (recommendations.length < 4) {
                        const featuredProducts = products.filter(product => product.featured &&
                            product.id !== excludeId &&
                            !favoriteIds.includes(product.id) &&
                            !recommendations.some(r => r.id === product.id)).slice(0, 4 - recommendations.length);
                        recommendations.push(...featuredProducts);
                    }
                    // Mapear a formato Product
                    const mappedRecommendations = recommendations.map(apiProduct => ({
                        id: apiProduct.id,
                        name: apiProduct.name,
                        price: apiProduct.price,
                        originalPrice: apiProduct.originalPrice,
                        description: apiProduct.description,
                        longDescription: apiProduct.description,
                        images: Array.isArray(apiProduct.images) && apiProduct.images.length > 0 ? apiProduct.images : ['/placeholder.svg'],
                        category: typeof apiProduct.category === 'string' ? apiProduct.category : '',
                        stock: apiProduct.stock,
                        rating: apiProduct.averageRating || 4.5,
                        reviewCount: apiProduct.totalReviews || 0,
                        featured: apiProduct.featured,
                        isNew: apiProduct.isNew,
                        discount: apiProduct.discount || 0,
                    }));
                    setRecommended(mappedRecommendations);
                }
            }
            catch (error) {
                console.error('Error fetching recommendations:', error);
            }
            finally {
                setLoading(false);
            }
        };
        if (category && excludeId) {
            fetchRecommendations();
        }
    }, [category, excludeId, favorites]);
    if (loading) {
        return ((0, jsx_runtime_1.jsxs)("section", { className: "mt-16", children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-display text-2xl font-bold text-purple-900 dark:text-purple-200 mb-8", children: "Productos Relacionados" }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6", children: [...Array(4)].map((_, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-[420px] animate-pulse flex flex-col justify-between p-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-40 bg-gray-200 dark:bg-gray-800 rounded mb-4" }), (0, jsx_runtime_1.jsx)("div", { className: "h-6 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-2" }), (0, jsx_runtime_1.jsx)("div", { className: "h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2" }), (0, jsx_runtime_1.jsx)("div", { className: "h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded" }), (0, jsx_runtime_1.jsx)("div", { className: "h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded" })] })] }, i))) })] }));
    }
    if (recommended.length === 0)
        return null;
    return ((0, jsx_runtime_1.jsxs)("section", { className: "mt-16", children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-display text-2xl font-bold text-purple-900 dark:text-purple-200 mb-8", children: "Productos Relacionados" }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6", children: recommended.map((product) => ((0, jsx_runtime_1.jsx)(product_card_1.default, { product: product }, product.id))) })] }));
}
