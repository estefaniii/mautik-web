"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ShopPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const product_card_1 = __importDefault(require("@/components/product-card"));
const button_1 = require("@/components/ui/button");
const select_1 = require("@/components/ui/select");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const sheet_1 = require("@/components/ui/sheet");
const shop_filters_1 = __importDefault(require("@/components/shop-filters"));
const skeleton_1 = require("@/components/ui/skeleton");
function ShopPage() {
    const searchParams = (0, navigation_1.useSearchParams)();
    const router = (0, navigation_1.useRouter)();
    const [allProducts, setAllProducts] = (0, react_1.useState)([]);
    const [filteredProducts, setFilteredProducts] = (0, react_1.useState)([]);
    const [selectedCategories, setSelectedCategories] = (0, react_1.useState)([]);
    const [sortOption, setSortOption] = (0, react_1.useState)("featured");
    const [searchText, setSearchText] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    // Detect if the collection is oceano-panameno
    const collectionParam = searchParams.get("collection");
    const isOceanoPanameno = collectionParam === "oceano-panameno";
    // Función para mapear productos de la API al formato esperado
    const mapApiProductToProduct = (apiProduct) => {
        return {
            id: apiProduct.id,
            name: apiProduct.name,
            price: apiProduct.price,
            originalPrice: apiProduct.originalPrice,
            description: apiProduct.description,
            images: Array.isArray(apiProduct.images) && apiProduct.images.length > 0 ? apiProduct.images : ['/placeholder.svg'],
            category: typeof apiProduct.category === 'string' ? apiProduct.category : '',
            stock: apiProduct.stock,
            rating: apiProduct.averageRating || 4.5,
            reviewCount: apiProduct.totalReviews || 0,
            featured: apiProduct.featured || false,
            isNew: apiProduct.isNew || false,
            discount: apiProduct.discount || 0,
            attributes: [],
            details: [],
            sku: '',
        };
    };
    // Cargar productos desde la API
    (0, react_1.useEffect)(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('/api/products');
                if (response.ok) {
                    const data = await response.json();
                    const apiProducts = Array.isArray(data) ? data : [];
                    const mappedProducts = apiProducts.map(mapApiProductToProduct);
                    setAllProducts(mappedProducts);
                    setFilteredProducts(mappedProducts);
                }
                else {
                    setError('No se pudieron cargar los productos. Intenta de nuevo más tarde.');
                }
            }
            catch (error) {
                console.error('Error fetching products:', error);
                setError('Error de conexión. Intenta de nuevo más tarde.');
            }
            finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);
    // Initialize filters from URL params
    (0, react_1.useEffect)(() => {
        const categoryParam = searchParams.get("category");
        const searchParam = searchParams.get("search");
        const sort = searchParams.get("sort");
        if (categoryParam) {
            setSelectedCategories(categoryParam.split(","));
        }
        if (searchParam) {
            setSearchText(searchParam);
        }
        if (sort) {
            setSortOption(sort);
        }
    }, [searchParams]);
    // Apply filters when products or filters change
    (0, react_1.useEffect)(() => {
        applyFilters();
    }, [allProducts, selectedCategories, sortOption, searchText]);
    // Apply all filters
    const applyFilters = () => {
        let result = [...allProducts];
        // Filter by search text
        if (searchText.trim()) {
            const text = searchText.toLowerCase();
            result = result.filter((product) => product.name.toLowerCase().includes(text) ||
                product.description.toLowerCase().includes(text) ||
                product.category.toLowerCase().includes(text));
        }
        // Filter by category
        if (selectedCategories.length > 0) {
            result = result.filter((product) => selectedCategories.includes(product.category));
        }
        // Apply sorting
        switch (sortOption) {
            case "price-asc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "name-asc":
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "name-desc":
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case "newest":
                result = result.filter((product) => product.isNew).concat(result.filter((product) => !product.isNew));
                break;
            case "featured":
            default:
                result = result.filter((product) => product.featured).concat(result.filter((product) => !product.featured));
                break;
        }
        setFilteredProducts(result);
    };
    const handleCategoryChange = (category, checked) => {
        if (checked) {
            setSelectedCategories(prev => [...prev, category]);
        }
        else {
            setSelectedCategories(prev => prev.filter(c => c !== category));
        }
    };
    const resetFilters = () => {
        setSelectedCategories([]);
        setSearchText("");
        setSortOption("featured");
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "container mx-auto px-4 py-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-8 w-64 mb-4" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-96" })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6", children: [...Array(8)].map((_, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-[420px] animate-pulse flex flex-col justify-between p-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-40 bg-gray-200 dark:bg-gray-800 rounded mb-4" }), (0, jsx_runtime_1.jsx)("div", { className: "h-6 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-2" }), (0, jsx_runtime_1.jsx)("div", { className: "h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2" }), (0, jsx_runtime_1.jsx)("div", { className: "h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded" }), (0, jsx_runtime_1.jsx)("div", { className: "h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded" })] })] }, i))) })] }));
    }
    if (error) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "container mx-auto px-4 py-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4", children: "Error al cargar productos" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400 mb-4", children: error }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: () => window.location.reload(), children: "Intentar de nuevo" })] }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: isOceanoPanameno ? "relative min-h-screen" : undefined, children: [isOceanoPanameno && ((0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 -z-10", children: (0, jsx_runtime_1.jsx)("img", { src: "/maar.png", alt: "Fondo Oc\u00E9ano Paname\u00F1o", className: "w-full h-full object-cover brightness-[0.7]" }) })), (0, jsx_runtime_1.jsx)("div", { className: "container mx-auto px-4 py-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col lg:flex-row gap-8", children: [(0, jsx_runtime_1.jsx)("div", { className: "lg:w-64 flex-shrink-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "sticky top-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Filtros" }), (selectedCategories.length > 0 || searchText) && ((0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "ghost", size: "sm", onClick: resetFilters, className: "text-red-600 hover:text-red-700", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FilterX, { className: "h-4 w-4 mr-1" }), "Limpiar"] }))] }), (0, jsx_runtime_1.jsx)(shop_filters_1.default, { selectedCategories: selectedCategories, onCategoryChange: handleCategoryChange, onReset: resetFilters })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2", children: "Tienda" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600 dark:text-gray-400", children: [filteredProducts.length, " productos encontrados"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4", children: [(0, jsx_runtime_1.jsxs)(select_1.Select, { value: sortOption, onValueChange: setSortOption, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-[180px]", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Ordenar por" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "featured", children: "Destacados" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "newest", children: "M\u00E1s nuevos" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "price-asc", children: "Precio: menor a mayor" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "price-desc", children: "Precio: mayor a menor" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "name-asc", children: "Nombre: A-Z" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "name-desc", children: "Nombre: Z-A" })] })] }), (0, jsx_runtime_1.jsxs)(sheet_1.Sheet, { children: [(0, jsx_runtime_1.jsx)(sheet_1.SheetTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", className: "lg:hidden", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.SlidersHorizontal, { className: "h-4 w-4 mr-2" }), "Filtros"] }) }), (0, jsx_runtime_1.jsx)(sheet_1.SheetContent, { side: "left", className: "w-[300px]", children: (0, jsx_runtime_1.jsx)("div", { className: "mt-6", children: (0, jsx_runtime_1.jsx)(shop_filters_1.default, { selectedCategories: selectedCategories, onCategoryChange: handleCategoryChange, onReset: resetFilters }) }) })] })] })] }), filteredProducts.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6", children: filteredProducts.map((product) => ((0, jsx_runtime_1.jsx)(product_card_1.default, { product: product }, product.id))) })) : ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900 dark:text-gray-100 mb-2", children: "No se encontraron productos" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400 mb-4", children: "Intenta ajustar los filtros o buscar algo diferente." }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: resetFilters, children: "Limpiar filtros" })] }))] })] }) })] }));
}
