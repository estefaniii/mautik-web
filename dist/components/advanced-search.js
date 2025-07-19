"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdvancedSearch;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const navigation_1 = require("next/navigation");
const utils_1 = require("@/lib/utils");
function AdvancedSearch({ onSearch, placeholder = "Buscar productos...", className }) {
    const router = (0, navigation_1.useRouter)();
    const searchParams = (0, navigation_1.useSearchParams)();
    const [query, setQuery] = (0, react_1.useState)(searchParams.get('search') || '');
    const [suggestions, setSuggestions] = (0, react_1.useState)([]);
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [selectedIndex, setSelectedIndex] = (0, react_1.useState)(-1);
    const [recentSearches, setRecentSearches] = (0, react_1.useState)([]);
    const [trendingSearches, setTrendingSearches] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const inputRef = (0, react_1.useRef)(null);
    const timeoutRef = (0, react_1.useRef)();
    // Cargar búsquedas recientes y tendencias
    (0, react_1.useEffect)(() => {
        const recent = localStorage.getItem('mautik_recent_searches');
        if (recent) {
            setRecentSearches(JSON.parse(recent));
        }
        // Simular tendencias (en producción vendría de analytics)
        setTrendingSearches(['crochet', 'pulseras', 'llaveros', 'collares']);
    }, []);
    // Buscar sugerencias
    const searchSuggestions = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setSuggestions([]);
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
            if (response.ok) {
                const products = await response.json();
                const suggestions = [
                    // Productos
                    ...products.map((product) => ({
                        id: product.id,
                        name: product.name,
                        category: product.category,
                        price: product.price,
                        image: product.images[0] || '/placeholder.svg',
                        type: 'product'
                    })),
                    // Categorías que coinciden
                    ...['crochet', 'llaveros', 'pulseras', 'collares', 'anillos', 'aretes', 'otros']
                        .filter(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(cat => ({
                        id: `category-${cat}`,
                        name: `Ver ${cat}`,
                        category: cat,
                        price: 0,
                        image: '/placeholder.svg',
                        type: 'category'
                    }))
                ];
                setSuggestions(suggestions.slice(0, 8));
            }
        }
        catch (error) {
            console.error('Error fetching suggestions:', error);
        }
        finally {
            setLoading(false);
        }
    };
    // Debounce para búsqueda
    (0, react_1.useEffect)(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            searchSuggestions(query);
        }, 300);
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [query]);
    // Guardar búsqueda reciente
    const saveRecentSearch = (searchTerm) => {
        const recent = [...recentSearches.filter(s => s !== searchTerm), searchTerm].slice(0, 5);
        setRecentSearches(recent);
        localStorage.setItem('mautik_recent_searches', JSON.stringify(recent));
    };
    // Manejar búsqueda
    const handleSearch = (searchTerm = query) => {
        if (!searchTerm.trim())
            return;
        saveRecentSearch(searchTerm);
        setIsOpen(false);
        setSuggestions([]);
        // Navegar a la página de búsqueda
        const params = new URLSearchParams(searchParams);
        params.set('search', searchTerm);
        router.push(`/shop?${params.toString()}`);
        onSearch === null || onSearch === void 0 ? void 0 : onSearch(searchTerm, { query: searchTerm });
    };
    // Manejar selección de sugerencia
    const handleSuggestionSelect = (suggestion) => {
        if (suggestion.type === 'category') {
            const params = new URLSearchParams(searchParams);
            params.set('category', suggestion.category);
            router.push(`/shop?${params.toString()}`);
        }
        else {
            router.push(`/product/${suggestion.id}`);
        }
        setIsOpen(false);
        setSuggestions([]);
    };
    // Manejar navegación por teclado
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        }
        else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                handleSuggestionSelect(suggestions[selectedIndex]);
            }
            else {
                handleSearch();
            }
        }
        else if (e.key === 'Escape') {
            setIsOpen(false);
            setSuggestions([]);
        }
    };
    // Limpiar búsqueda
    const clearSearch = () => {
        var _a;
        setQuery('');
        setSuggestions([]);
        setIsOpen(false);
        (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("relative w-full max-w-2xl", className), children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), (0, jsx_runtime_1.jsx)(input_1.Input, { ref: inputRef, type: "text", placeholder: placeholder, value: query, onChange: (e) => setQuery(e.target.value), onFocus: () => setIsOpen(true), onKeyDown: handleKeyDown, className: "pl-10 pr-10 h-12 text-base" }), query && ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: clearSearch, className: "absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4" }) }))] }), isOpen && ((0, jsx_runtime_1.jsxs)("div", { className: "absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto", children: [!query && recentSearches.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "p-4 border-b border-gray-200 dark:border-gray-700", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-4 w-4 mr-2" }), "B\u00FAsquedas recientes"] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: recentSearches.map((search, index) => ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "secondary", className: "cursor-pointer hover:bg-purple-100", onClick: () => {
                                        setQuery(search);
                                        handleSearch(search);
                                    }, children: search }, index))) })] })), !query && trendingSearches.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "p-4 border-b border-gray-200 dark:border-gray-700", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { className: "h-4 w-4 mr-2" }), "Tendencias"] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: trendingSearches.map((search, index) => ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", className: "cursor-pointer hover:bg-purple-50", onClick: () => {
                                        setQuery(search);
                                        handleSearch(search);
                                    }, children: search }, index))) })] })), query && ((0, jsx_runtime_1.jsx)("div", { className: "p-2", children: loading ? ((0, jsx_runtime_1.jsx)("div", { className: "p-4 text-center text-gray-500", children: "Buscando..." })) : suggestions.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "space-y-1", children: suggestions.map((suggestion, index) => ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("flex items-center p-3 rounded-lg cursor-pointer transition-colors", selectedIndex === index
                                    ? "bg-purple-50 dark:bg-purple-900/20"
                                    : "hover:bg-gray-50 dark:hover:bg-gray-800"), onClick: () => handleSuggestionSelect(suggestion), onMouseEnter: () => setSelectedIndex(index), children: [(0, jsx_runtime_1.jsx)("div", { className: "relative h-10 w-10 rounded-md overflow-hidden mr-3 flex-shrink-0", children: (0, jsx_runtime_1.jsx)("img", { src: suggestion.image, alt: suggestion.name, className: "object-cover w-full h-full" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 truncate", children: suggestion.name }), suggestion.type === 'product' && ((0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: ["$", suggestion.price] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mt-1", children: [(0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", className: "text-xs capitalize", children: suggestion.category }), suggestion.type === 'category' && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "secondary", className: "text-xs", children: "Categor\u00EDa" }))] })] })] }, suggestion.id))) })) : ((0, jsx_runtime_1.jsxs)("div", { className: "p-4 text-center text-gray-500", children: ["No se encontraron resultados para \"", query, "\""] })) })), query && ((0, jsx_runtime_1.jsx)("div", { className: "p-3 border-t border-gray-200 dark:border-gray-700", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: () => handleSearch(), className: "w-full", disabled: !query.trim(), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "h-4 w-4 mr-2" }), "Buscar \"", query, "\""] }) }))] }))] }));
}
