"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomePage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const image_1 = __importDefault(require("next/image"));
const link_1 = __importDefault(require("next/link"));
const button_1 = require("@/components/ui/button");
const product_card_1 = __importDefault(require("@/components/product-card"));
const featured_collection_1 = __importDefault(require("@/components/featured-collection"));
const category_showcase_1 = require("@/components/category-showcase");
const meta_tags_1 = __importDefault(require("@/components/seo/meta-tags"));
const lucide_react_1 = require("lucide-react");
function HomePage() {
    const [featuredProducts, setFeaturedProducts] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    // Función para mapear productos de la API al formato esperado
    const mapApiProductToProduct = (apiProduct) => {
        return {
            id: apiProduct.id, // Usar directamente el ID de la API
            name: apiProduct.name,
            price: apiProduct.price,
            originalPrice: apiProduct.originalPrice,
            description: apiProduct.description,
            images: apiProduct.images || ['/placeholder.svg'],
            category: apiProduct.category,
            stock: apiProduct.stock,
            rating: apiProduct.averageRating || 4.5,
            reviewCount: apiProduct.totalReviews || 0,
            featured: apiProduct.isFeatured || false,
            isNew: apiProduct.isNew || false,
            discount: apiProduct.discount || 0, // Usar el descuento manual configurado
            attributes: apiProduct.specifications ? Object.entries(apiProduct.specifications).map(([key, value]) => ({
                name: key.charAt(0).toUpperCase() + key.slice(1),
                value: String(value)
            })) : [],
            details: apiProduct.specifications ? Object.entries(apiProduct.specifications).map(([key, value]) => ({
                name: key.charAt(0).toUpperCase() + key.slice(1),
                value: String(value)
            })) : []
        };
    };
    // Cargar productos desde la API
    (0, react_1.useEffect)(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/products');
                if (response.ok) {
                    const data = await response.json();
                    const apiProducts = data.products || data;
                    // Mapear productos y filtrar destacados
                    const mappedProducts = apiProducts.map(mapApiProductToProduct);
                    // Mostrar productos destacados si existen, sino mostrar los primeros 8 productos
                    const featured = mappedProducts.filter((p) => p.featured).slice(0, 8);
                    const productsToShow = featured.length > 0 ? featured : mappedProducts.slice(0, 8);
                    setFeaturedProducts(productsToShow);
                }
                else {
                    console.error('Error fetching products');
                }
            }
            catch (error) {
                console.error('Error:', error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(meta_tags_1.default, { title: "Mautik - Artesan\u00EDa Paname\u00F1a", description: "Descubre la belleza de la artesan\u00EDa paname\u00F1a. Productos \u00FAnicos hechos a mano con pasi\u00F3n y dedicaci\u00F3n. Joyer\u00EDa, crochet, llaveros y m\u00E1s.", keywords: "artesan\u00EDa paname\u00F1a, joyer\u00EDa artesanal, crochet, llaveros, pulseras, collares, anillos, aretes, handmade panam\u00E1, artesan\u00EDa la chorrera", image: "/fondonubes.jpg", url: "/" }), (0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen", children: [(0, jsx_runtime_1.jsxs)("section", { className: "relative h-screen flex items-center justify-center overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "absolute inset-0 z-0", children: [(0, jsx_runtime_1.jsx)(image_1.default, { src: "/fondonubes.jpg", alt: "Joyer\u00EDa artesanal", fill: true, className: "object-cover", priority: true }), (0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 bg-black/60" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "relative z-10 text-center text-white max-w-4xl mx-auto px-4", children: [(0, jsx_runtime_1.jsxs)("h1", { className: "text-5xl md:text-7xl font-bold mb-6 leading-tight", children: ["Artesan\u00EDas \u00DAnicas", (0, jsx_runtime_1.jsx)("span", { className: "block text-purple-300", children: "Hechas a Mano" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto", children: "Descubre piezas \u00FAnicas de joyer\u00EDa, crochet, llaveros y m\u00E1s, elaboradas con amor y los mejores materiales. Cada artesan\u00EDa cuenta una historia especial." }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { asChild: true, size: "lg", className: "bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-lg px-8 py-6 text-white border-none shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 dark:from-purple-400 dark:via-purple-500 dark:to-purple-600 dark:hover:from-purple-500 dark:hover:via-purple-600 dark:hover:to-purple-700", children: (0, jsx_runtime_1.jsxs)(link_1.default, { href: "/shop", children: ["Explorar Artesan\u00EDas ", (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowRight, { className: "ml-2 h-5 w-5" })] }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { asChild: true, variant: "outline", size: "lg", className: "text-white border-white hover:bg-white hover:text-purple-900 text-lg px-8 py-6 bg-transparent dark:bg-black/40 dark:border-white/80 dark:hover:bg-black/60 dark:text-white/90 dark:hover:text-white", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/about", children: "Nuestra Historia" }) })] })] })] }), (0, jsx_runtime_1.jsx)("section", { className: "py-16", children: (0, jsx_runtime_1.jsxs)("div", { className: "container mx-auto px-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center mb-12", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-3xl md:text-4xl font-bold text-purple-900 dark:text-purple-100 mb-4", children: "Productos Destacados" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-300 max-w-2xl mx-auto", children: "Descubre nuestras piezas m\u00E1s populares, seleccionadas especialmente para ti" })] }), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8", children: [...Array(8)].map((_, i) => ((0, jsx_runtime_1.jsx)("div", { className: "h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" }, i))) })) : ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8", children: featuredProducts.map((product) => ((0, jsx_runtime_1.jsx)(react_1.Suspense, { fallback: (0, jsx_runtime_1.jsx)("div", { className: "h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" }), children: (0, jsx_runtime_1.jsx)(product_card_1.default, { product: product }) }, product.id))) })), (0, jsx_runtime_1.jsx)("div", { className: "text-center", children: (0, jsx_runtime_1.jsx)(button_1.Button, { asChild: true, variant: "outline", size: "lg", children: (0, jsx_runtime_1.jsxs)(link_1.default, { href: "/shop", children: ["Ver Todos los Productos ", (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4" })] }) }) })] }) }), (0, jsx_runtime_1.jsx)(featured_collection_1.default, {}), (0, jsx_runtime_1.jsx)(category_showcase_1.CategoryShowcase, {})] })] }));
}
