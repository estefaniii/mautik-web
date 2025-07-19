"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProductPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const navigation_1 = require("next/navigation");
const image_1 = __importDefault(require("next/image"));
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
const use_toast_1 = require("@/hooks/use-toast");
const cart_context_1 = require("@/context/cart-context");
const favorites_context_1 = require("@/context/favorites-context");
const product_reviews_1 = __importDefault(require("@/components/product-reviews"));
const badge_1 = require("@/components/ui/badge");
const meta_tags_1 = __importDefault(require("@/components/seo/meta-tags"));
const breadcrumb_1 = require("@/components/ui/breadcrumb");
const product_recommendations_1 = __importDefault(require("@/components/product-recommendations"));
const skeleton_1 = require("@/components/ui/skeleton");
function ProductPage({ params }) {
    var _a, _b, _c, _d;
    const productId = params.id;
    const router = (0, navigation_1.useRouter)();
    const { toast } = (0, use_toast_1.useToast)();
    const { addToCart } = (0, cart_context_1.useCart)();
    const { isFavorite, toggleFavorite } = (0, favorites_context_1.useFavorites)();
    const [quantity, setQuantity] = (0, react_1.useState)(1);
    const [selectedImage, setSelectedImage] = (0, react_1.useState)(0);
    const [product, setProduct] = (0, react_1.useState)(null);
    const [relatedProducts, setRelatedProducts] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [stockMessage, setStockMessage] = (0, react_1.useState)(null);
    const prevStockRef = (0, react_1.useRef)((product === null || product === void 0 ? void 0 : product.stock) || 0);
    // Función para mapear productos de la API al formato esperado
    const mapApiProductToProduct = (apiProduct) => {
        return {
            id: apiProduct.id,
            name: apiProduct.name,
            price: apiProduct.price,
            originalPrice: typeof apiProduct.originalPrice === 'number' ? apiProduct.originalPrice : apiProduct.price,
            description: typeof apiProduct.description === 'string' ? apiProduct.description : '',
            images: Array.isArray(apiProduct.images) && apiProduct.images.length > 0 ? apiProduct.images : ['/placeholder.svg'],
            category: typeof apiProduct.category === 'string' ? apiProduct.category : '',
            stock: typeof apiProduct.stock === 'number' ? apiProduct.stock : 0,
            rating: typeof apiProduct.averageRating === 'number' ? apiProduct.averageRating : 4.5,
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
            })) : [],
            sku: typeof apiProduct.sku === 'string' ? apiProduct.sku : '',
        };
    };
    // Función para limpiar referencias a productos eliminados del localStorage
    const cleanDeletedProductReferences = (deletedProductId) => {
        try {
            // Limpiar de favoritos
            const user = JSON.parse(localStorage.getItem('mautik_user') || '{}');
            const favoritesKey = user.id ? `mautik_favorites_${user.id}` : 'mautik_favorites_temp';
            const favorites = JSON.parse(localStorage.getItem(favoritesKey) || '[]');
            const cleanedFavorites = favorites.filter((fav) => fav.id !== deletedProductId);
            localStorage.setItem(favoritesKey, JSON.stringify(cleanedFavorites));
            // Limpiar del carrito
            const cartKey = user.id ? `mautik_cart_${user.id}` : 'mautik_cart_temp';
            const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
            const cleanedCart = cart.filter((item) => item.id !== deletedProductId);
            localStorage.setItem(cartKey, JSON.stringify(cleanedCart));
            console.log(`🧹 Cleaned references to deleted product ${deletedProductId} from localStorage`);
        }
        catch (error) {
            console.error('Error cleaning localStorage references:', error);
        }
    };
    // Cargar producto específico y productos relacionados
    (0, react_1.useEffect)(() => {
        let isMounted = true;
        const fetchProduct = async () => {
            try {
                if (!isMounted)
                    return;
                setLoading(true);
                setError(null);
                console.log("🔍 Fetching product with ID:", productId);
                const response = await fetch(`/api/products/${productId}`);
                console.log("📡 Product response status:", response.status);
                if (!isMounted)
                    return;
                if (!response.ok) {
                    if (response.status === 404) {
                        cleanDeletedProductReferences(productId);
                        setError("Producto no encontrado");
                        setLoading(false);
                        return;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("📦 Product data received:", data);
                if (!isMounted)
                    return;
                if (!data || !data.product) {
                    throw new Error("No data received");
                }
                const mappedProduct = mapApiProductToProduct(data.product);
                setProduct(mappedProduct);
                // Fetch related products
                const relatedResponse = await fetch(`/api/products?category=${mappedProduct.category}&limit=4&exclude=${productId}`);
                if (relatedResponse.ok && isMounted) {
                    const relatedData = await relatedResponse.json();
                    setRelatedProducts(relatedData.map(mapApiProductToProduct));
                }
            }
            catch (error) {
                if (!isMounted)
                    return;
                let errorToUse = error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));
                console.error("❌ Fetch error details:", errorToUse);
                console.log("🔍 Error type:", typeof errorToUse);
                console.log("💬 Error message:", errorToUse.message);
                if (errorToUse instanceof Error && errorToUse.message === 'NEXT_NOT_FOUND') {
                    cleanDeletedProductReferences(productId);
                    setError("Producto no encontrado");
                }
                else {
                    setError("Error al cargar el producto");
                }
            }
            finally {
                if (isMounted) {
                    setLoading(false);
                    console.log("✅ === END DEBUGGING ===");
                }
            }
        };
        fetchProduct();
        return () => {
            isMounted = false;
        };
    }, [productId]);
    // Polling para actualizar stock cada 20 segundos
    (0, react_1.useEffect)(() => {
        const interval = setInterval(async () => {
            try {
                if (!product)
                    return;
                const res = await fetch(`/api/products/${product.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (typeof data.stock === 'number' && data.stock !== product.stock) {
                        setProduct((prev) => (Object.assign(Object.assign({}, prev), { stock: data.stock })));
                        if (data.stock < prevStockRef.current) {
                            setStockMessage('El stock ha bajado, actualiza tu selección.');
                        }
                        prevStockRef.current = data.stock;
                    }
                }
            }
            catch (_a) { }
        }, 20000);
        return () => clearInterval(interval);
    }, [product === null || product === void 0 ? void 0 : product.id, product === null || product === void 0 ? void 0 : product.stock]);
    // Validar stock antes de añadir al carrito o comprar
    const fetchLatestStock = async () => {
        if (!product)
            return 0;
        const res = await fetch(`/api/products/${product.id}`);
        if (res.ok) {
            const data = await res.json();
            if (typeof data.stock === 'number') {
                if (data.stock !== product.stock) {
                    setProduct((prev) => (Object.assign(Object.assign({}, prev), { stock: data.stock })));
                    if (data.stock < quantity) {
                        setQuantity(data.stock);
                        setStockMessage('El stock ha cambiado, ajustamos tu selección.');
                    }
                    return data.stock;
                }
                return data.stock;
            }
        }
        return product.stock;
    };
    const handleAddToCartWithStockCheck = async () => {
        const latestStock = await fetchLatestStock();
        if (latestStock < quantity) {
            setStockMessage('No hay suficiente stock disponible.');
            return;
        }
        setStockMessage(null);
        handleAddToCart();
    };
    const handleBuyNowWithStockCheck = async () => {
        const latestStock = await fetchLatestStock();
        if (latestStock < quantity) {
            setStockMessage('No hay suficiente stock disponible.');
            return;
        }
        setStockMessage(null);
        handleBuyNow();
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "bg-gradient-to-b from-purple-50 to-white min-h-screen py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "container mx-auto px-4", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-white rounded-lg shadow-md overflow-hidden", children: (0, jsx_runtime_1.jsxs)("div", { className: "md:flex", children: [(0, jsx_runtime_1.jsxs)("div", { className: "md:w-1/2 p-6", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-[400px] w-full mb-4" }), (0, jsx_runtime_1.jsx)("div", { className: "flex gap-2", children: [...Array(4)].map((_, i) => ((0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-20 w-20" }, i))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "md:w-1/2 p-6", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-8 w-3/4 mb-4" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-1/2 mb-4" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-full mb-2" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-full mb-2" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-3/4 mb-6" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-12 w-full mb-4" })] })] }) }) }) }));
    }
    if (error || !product) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "bg-gradient-to-b from-purple-50 to-white min-h-screen py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "container mx-auto px-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Producto no encontrado" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-6", children: "El producto que buscas no existe o ha sido eliminado." }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: () => router.push('/shop'), children: "Volver a la tienda" })] }) }) }));
    }
    const averageRating = product.rating || 0;
    const totalReviews = product.reviewCount || 0;
    const handleAddToCart = () => {
        addToCart(Object.assign(Object.assign({}, product), { quantity, attributes: product.attributes || [], stock: product.stock }));
        toast({
            title: "Producto añadido",
            description: `${product.name} se ha añadido a tu carrito.`,
        });
    };
    const handleToggleFavorite = () => {
        toggleFavorite(product.id);
    };
    const handleBuyNow = () => {
        addToCart(Object.assign(Object.assign({}, product), { quantity, attributes: product.attributes || [], stock: product.stock }));
        router.push("/cart");
    };
    const incrementQuantity = () => {
        setQuantity((prev) => (prev < product.stock ? prev + 1 : prev));
    };
    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(meta_tags_1.default, { title: product.name, description: product.description, keywords: `${product.name}, ${product.category}, artesanía panameña, mautik`, image: product.images[0], url: `/product/${product.id}`, type: "product", product: {
                    name: product.name,
                    price: product.price.toString(),
                    currency: "USD",
                    availability: product.stock > 0 ? "in stock" : "out of stock",
                    category: product.category
                } }), (0, jsx_runtime_1.jsx)("div", { className: "bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 min-h-screen py-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "container mx-auto px-4", children: [(0, jsx_runtime_1.jsx)(breadcrumb_1.Breadcrumb, { className: "mb-6", children: (0, jsx_runtime_1.jsxs)(breadcrumb_1.BreadcrumbList, { children: [(0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbItem, { children: (0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbLink, { href: "/", children: "Inicio" }) }), (0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbSeparator, {}), (0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbItem, { children: (0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbLink, { href: "/shop", children: "Tienda" }) }), (0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbSeparator, {}), (0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbItem, { children: (0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbLink, { href: `/shop?category=${product.category}`, children: product.category }) }), (0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbSeparator, {}), (0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbItem, { children: (0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbLink, { className: "text-purple-800 font-medium", children: product.name }) })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "md:flex", children: [(0, jsx_runtime_1.jsxs)("div", { className: "md:w-1/2 p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative h-[400px] w-full mb-4 rounded-lg overflow-hidden", children: [(0, jsx_runtime_1.jsx)(image_1.default, { src: product.images[selectedImage] || "/placeholder.svg", alt: product.name, fill: true, className: "object-contain" }), product.isNew && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { className: "absolute top-4 left-4 bg-green-500 hover:bg-green-600", children: "Nuevo" })), ((_a = product.discount) !== null && _a !== void 0 ? _a : 0) > 0 && ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { className: "absolute top-4 right-4 bg-red-500 hover:bg-red-600", children: ["-", (_b = product.discount) !== null && _b !== void 0 ? _b : 0, "%"] }))] }), (0, jsx_runtime_1.jsx)("div", { className: "flex gap-2 overflow-x-auto pb-2", children: product.images.map((image, index) => ((0, jsx_runtime_1.jsx)("button", { onClick: () => setSelectedImage(index), className: `relative h-20 w-20 rounded-md overflow-hidden border-2 ${selectedImage === index ? "border-purple-800" : "border-gray-200"}`, children: (0, jsx_runtime_1.jsx)(image_1.default, { src: image || "/placeholder.svg", alt: `${product.name} - vista ${index + 1}`, fill: true, className: "object-cover" }) }, index))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "md:w-1/2 p-6 md:p-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("h1", { className: "font-display text-3xl font-bold text-purple-900 dark:text-purple-200 mb-2", children: product.name }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "icon", className: `rounded-full ${isFavorite(product.id) ? "text-red-500 border-red-500" : "text-purple-800"}`, onClick: handleToggleFavorite, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Heart, { className: `h-5 w-5 ${isFavorite(product.id) ? "fill-current" : ""}` }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "icon", className: "rounded-full", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Share2, { className: "h-5 w-5 text-purple-800" }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "my-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-baseline gap-2 mb-4", children: ((_c = product.discount) !== null && _c !== void 0 ? _c : 0) > 0 ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-3xl font-bold text-purple-800", children: ["$", (product.price * (1 - ((_d = product.discount) !== null && _d !== void 0 ? _d : 0) / 100)).toFixed(2)] }), (0, jsx_runtime_1.jsxs)("span", { className: "text-xl text-gray-500 line-through", children: ["$", product.price.toFixed(2)] })] })) : ((0, jsx_runtime_1.jsxs)("span", { className: "text-3xl font-bold text-purple-800", children: ["$", product.price.toFixed(2)] })) }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-700 dark:text-gray-300 mb-6", children: product.description }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4 mb-6", children: product.attributes && product.attributes.length > 0 && ((0, jsx_runtime_1.jsx)("ul", { children: product.attributes.map((attr) => ((0, jsx_runtime_1.jsxs)("li", { children: [attr.name, ": ", attr.value] }, attr.name))) })) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4 mb-6", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium text-gray-700 dark:text-gray-300", children: "Cantidad:" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center border border-gray-300 dark:border-gray-600 rounded-md", children: [(0, jsx_runtime_1.jsx)("button", { onClick: decrementQuantity, className: "px-3 py-2 text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800/30 transition-colors", disabled: quantity <= 1 || product.stock === 0, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Minus, { className: "h-4 w-4" }) }), (0, jsx_runtime_1.jsx)("span", { className: "px-4 py-2 border-x border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100", children: quantity }), (0, jsx_runtime_1.jsx)("button", { onClick: incrementQuantity, className: "px-3 py-2 text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800/30 transition-colors", disabled: quantity >= product.stock || product.stock === 0, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4" }) })] }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: [product.stock, " disponibles"] }), quantity >= product.stock && product.stock > 0 && ((0, jsx_runtime_1.jsx)("span", { className: "ml-2 text-xs text-red-500", children: "No puedes seleccionar m\u00E1s de lo disponible" }))] }), stockMessage && ((0, jsx_runtime_1.jsx)("div", { className: "text-xs text-red-500 mb-2", children: stockMessage })), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row gap-4", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleAddToCartWithStockCheck, className: "flex-1 bg-purple-800 hover:bg-purple-900", disabled: product.stock === 0, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingCart, { className: "mr-2 h-5 w-5" }), " A\u00F1adir al Carrito"] }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleBuyNowWithStockCheck, variant: "outline", className: "flex-1 border-purple-800 dark:border-purple-300 text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors", disabled: product.stock === 0, children: "Comprar Ahora" })] })] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "p-6 border-t border-gray-200", children: (0, jsx_runtime_1.jsxs)(tabs_1.Tabs, { defaultValue: "description", children: [(0, jsx_runtime_1.jsxs)(tabs_1.TabsList, { className: "grid w-full grid-cols-3", children: [(0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "description", children: "Descripci\u00F3n" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "details", children: "Detalles" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "reviews", children: "Rese\u00F1as" })] }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "description", className: "p-4", children: (0, jsx_runtime_1.jsx)("div", { className: "prose max-w-none", children: (0, jsx_runtime_1.jsx)("p", { className: "text-gray-700 dark:text-gray-300", children: product.description }) }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "details", className: "p-4", children: (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: product.details && product.details.length > 0 ? (product.details.map((detail, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsxs)("span", { className: "w-32 font-medium text-gray-700 dark:text-gray-300", children: [detail.name, ":"] }), (0, jsx_runtime_1.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: detail.value })] }, index)))) : ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 dark:text-gray-400 col-span-2", children: "No hay detalles adicionales disponibles para este producto." })) }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "reviews", className: "p-4", children: (0, jsx_runtime_1.jsx)(product_reviews_1.default, { productId: product.id || String(product.id), productName: product.name }) })] }) })] }), (0, jsx_runtime_1.jsx)(product_recommendations_1.default, { category: product.category, excludeId: String(product.id) })] }) })] }));
}
