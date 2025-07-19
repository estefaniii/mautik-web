"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Navbar;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const badge_1 = require("@/components/ui/badge");
const cart_context_1 = require("@/context/cart-context");
const auth_context_1 = require("@/context/auth-context");
const favorites_context_1 = require("@/context/favorites-context");
const theme_context_1 = require("@/context/theme-context");
const navigation_1 = require("next/navigation");
const notification_bell_1 = require("@/components/ui/notification-bell");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
const avatar_1 = require("@/components/ui/avatar");
function Navbar() {
    var _a;
    const pathname = (0, navigation_1.usePathname)();
    const router = (0, navigation_1.useRouter)();
    const { cart } = (0, cart_context_1.useCart)();
    const { user, logout } = (0, auth_context_1.useAuth)();
    const { favoritesCount } = (0, favorites_context_1.useFavorites)();
    const { isDarkMode, toggleDarkMode } = (0, theme_context_1.useTheme)();
    const [searchTerm, setSearchTerm] = (0, react_1.useState)("");
    const [suggestions, setSuggestions] = (0, react_1.useState)([]);
    const [allProducts, setAllProducts] = (0, react_1.useState)([]);
    const [searchTimeout, setSearchTimeout] = (0, react_1.useState)(null);
    const [showCategories, setShowCategories] = (0, react_1.useState)(false);
    const [isScrolled, setIsScrolled] = (0, react_1.useState)(false);
    const [mobileMenuOpen, setMobileMenuOpen] = (0, react_1.useState)(false);
    const [selectedSuggestion, setSelectedSuggestion] = (0, react_1.useState)(-1);
    const mobileMenuButtonRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products');
                if (response.ok) {
                    const products = await response.json();
                    setAllProducts(products);
                }
            }
            catch (error) {
                console.error('Error fetching products for search:', error);
            }
        };
        fetchProducts();
    }, []);
    const categories = [
        { name: "Todos los Productos", href: "/shop" },
        { name: "Crochet", href: "/shop?category=crochet" },
        { name: "Llaveros", href: "/shop?category=llaveros" },
        { name: "Pulseras", href: "/shop?category=pulseras" },
        { name: "Collares", href: "/shop?category=collares" },
        { name: "Anillos", href: "/shop?category=anillos" },
        { name: "Aretes", href: "/shop?category=aretes" },
        { name: "Otros", href: "/shop?category=otros" },
    ];
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (searchTimeout)
            clearTimeout(searchTimeout);
        if (value.length > 0) {
            const timeout = setTimeout(() => {
                const filteredSuggestions = allProducts
                    .filter((product) => product.name.toLowerCase().includes(value.toLowerCase()) ||
                    product.description.toLowerCase().includes(value.toLowerCase()) ||
                    product.category.toLowerCase().includes(value.toLowerCase()))
                    .slice(0, 5);
                setSuggestions(filteredSuggestions);
            }, 1000);
            setSearchTimeout(timeout);
        }
        else {
            setSuggestions([]);
        }
    };
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim().length > 0) {
            setSuggestions([]);
            router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };
    const handleSearchKeyDown = (e) => {
        if (suggestions.length === 0)
            return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedSuggestion((prev) => (prev + 1) % suggestions.length);
        }
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedSuggestion((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        }
        else if (e.key === "Enter") {
            if (selectedSuggestion >= 0 && selectedSuggestion < suggestions.length) {
                router.push(`/product/${suggestions[selectedSuggestion].id}`);
                setSuggestions([]);
            }
        }
    };
    (0, react_1.useEffect)(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > 50) {
                setIsScrolled(true);
            }
            else {
                setIsScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    (0, react_1.useEffect)(() => {
        setMobileMenuOpen(false);
    }, [pathname]);
    (0, react_1.useEffect)(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden";
        }
        else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [mobileMenuOpen]);
    (0, react_1.useEffect)(() => {
        if (!showCategories)
            return;
        function handleClickOutside(event) {
            const menu = document.getElementById('navbar-categories-menu');
            const button = document.getElementById('navbar-categories-button');
            if (menu && !menu.contains(event.target) && button && !button.contains(event.target)) {
                setShowCategories(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showCategories]);
    (0, react_1.useEffect)(() => { setSelectedSuggestion(-1); }, [suggestions]);
    (0, react_1.useEffect)(() => {
        if (!mobileMenuOpen)
            return;
        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setMobileMenuOpen(false);
                setTimeout(() => {
                    var _a;
                    (_a = mobileMenuButtonRef.current) === null || _a === void 0 ? void 0 : _a.focus();
                }, 0);
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [mobileMenuOpen]);
    (0, react_1.useEffect)(() => {
        return () => {
            if (searchTimeout)
                clearTimeout(searchTimeout);
        };
    }, [searchTimeout]);
    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
    };
    const getUserInitials = (name) => {
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const navbarHeight = isScrolled ? 56 : 72;
    return ((0, jsx_runtime_1.jsxs)("header", { className: `w-full z-50 transition-all duration-300 ease-in-out will-change-transform fixed top-0 left-0 ${isScrolled ? "bg-white/95 dark:bg-gray-950/95 shadow-lg py-2" : "bg-white/90 dark:bg-gray-950/90 py-4"} backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 md:py-2`, style: {
            boxShadow: isScrolled
                ? '0 4px 24px 0 rgba(0,0,0,0.1), 0 1px 3px 0 rgba(0,0,0,0.05)'
                : '0 1px 3px 0 rgba(0,0,0,0.05)',
            minHeight: navbarHeight,
            left: 0,
            right: 0,
            transform: 'translateY(0)'
        }, children: [(0, jsx_runtime_1.jsx)("div", { className: "container mx-auto px-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between gap-2 md:gap-3 lg:gap-8 min-h-[56px]", children: [(0, jsx_runtime_1.jsx)(link_1.default, { href: "/", className: "flex items-center space-x-2 group", children: (0, jsx_runtime_1.jsx)("span", { className: "text-xl font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent dark:bg-none dark:text-purple-200", children: "Mautik" }) }), (0, jsx_runtime_1.jsxs)("nav", { className: "hidden md:flex items-center space-x-3 md:space-x-4 lg:space-x-10 xl:space-x-14", children: [(0, jsx_runtime_1.jsx)(link_1.default, { href: "/", className: `text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 transition-colors focus:outline-none ${pathname === "/" ? "font-semibold text-purple-800 dark:text-purple-300" : ""}`, children: "Inicio" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsxs)("button", { id: "navbar-categories-button", onClick: () => setShowCategories(!showCategories), className: `flex items-center text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 transition-colors focus:outline-none ${pathname === "/shop" ? "font-semibold text-purple-800 dark:text-purple-300" : ""}`, "aria-haspopup": "true", "aria-expanded": showCategories, "aria-label": "Abrir men\u00FA de categor\u00EDas", children: ["Tienda", showCategories ? (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronUp, { className: "ml-1 h-4 w-4" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { className: "ml-1 h-4 w-4" })] }), showCategories && ((0, jsx_runtime_1.jsx)("div", { id: "navbar-categories-menu", className: "absolute left-0 mt-2 w-56 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-600/50 py-2 z-20 animate-fade-in", children: categories.map((cat) => ((0, jsx_runtime_1.jsx)(link_1.default, { href: cat.href, className: "block px-4 py-2 text-gray-700 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-800/30 hover:text-purple-800 dark:hover:text-purple-200 rounded transition-colors", children: cat.name }, cat.name))) }))] }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/about", className: `text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 transition-colors focus:outline-none ${pathname === "/about" ? "font-semibold text-purple-800 dark:text-purple-300" : ""}`, children: "Nosotros" }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/contact", className: `text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 transition-colors focus:outline-none ${pathname === "/contact" ? "font-semibold text-purple-800 dark:text-purple-300" : ""}`, children: "Contacto" })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSearchSubmit, className: "hidden md:flex items-center relative w-64", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { type: "text", placeholder: "Buscar productos...", value: searchTerm, onChange: handleSearch, onKeyDown: handleSearchKeyDown, className: "pr-10", "aria-label": "Buscar productos" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-700 dark:hover:text-purple-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "h-5 w-5" }) }), suggestions.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "absolute left-0 top-12 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-30", children: suggestions.map((product, idx) => ((0, jsx_runtime_1.jsx)("button", { className: `block w-full text-left px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-800/30 ${selectedSuggestion === idx ? "bg-purple-100 dark:bg-purple-900/40" : ""}`, onClick: () => { router.push(`/product/${product.id}`); setSuggestions([]); }, children: product.name }, product.id))) }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 md:gap-4 lg:gap-5 xl:gap-6", children: [(0, jsx_runtime_1.jsxs)(link_1.default, { href: "/favorites", className: "relative group", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Heart, { className: "h-6 w-6 text-purple-800 dark:text-purple-300 group-hover:text-purple-700 dark:group-hover:text-purple-200 transition-colors" }), favoritesCount > 0 && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { className: "absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full", children: favoritesCount }))] }), (0, jsx_runtime_1.jsxs)(link_1.default, { href: "/cart", className: "relative group", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingCart, { className: "h-6 w-6 text-purple-800 dark:text-purple-300 group-hover:text-purple-700 dark:group-hover:text-purple-200 transition-colors" }), cart.length > 0 && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { className: "absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full", children: cart.length }))] }), (0, jsx_runtime_1.jsx)("span", { className: "h-6 w-6 text-purple-800 dark:text-purple-300", children: (0, jsx_runtime_1.jsx)(notification_bell_1.NotificationBell, {}) }), (0, jsx_runtime_1.jsx)("button", { onClick: toggleDarkMode, "aria-label": "Cambiar modo de color", className: "focus:outline-none", style: { display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: isDarkMode ? ((0, jsx_runtime_1.jsx)(lucide_react_1.Sun, { className: "h-6 w-6 text-purple-800 dark:text-purple-300" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.Moon, { className: "h-6 w-6 text-purple-800 dark:text-purple-300" })) }), user ? ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)("button", { className: "flex items-center space-x-2 focus:outline-none", children: [(0, jsx_runtime_1.jsx)(avatar_1.Avatar, { className: "h-8 w-8", children: user.avatar ? ((0, jsx_runtime_1.jsx)(avatar_1.AvatarImage, { src: user.avatar, alt: user.name || "Usuario" })) : ((0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { children: getUserInitials(user.name || "U") })) }), (0, jsx_runtime_1.jsx)("span", { className: "hidden md:inline text-gray-700 dark:text-gray-200 font-medium", children: (_a = user.name) === null || _a === void 0 ? void 0 : _a.split(" ")[0] })] }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { align: "end", children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuLabel, { children: "Mi cuenta" }), (0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuItem, { asChild: true, children: (0, jsx_runtime_1.jsxs)(link_1.default, { href: "/profile", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "h-6 w-6 text-purple-800 dark:text-purple-300" }), " Perfil"] }) }), (0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuItem, { asChild: true, children: (0, jsx_runtime_1.jsxs)(link_1.default, { href: "/orders", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Box, { className: "h-6 w-6 text-purple-800 dark:text-purple-300" }), " Pedidos"] }) }), (0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuItem, { asChild: true, children: (0, jsx_runtime_1.jsxs)(link_1.default, { href: "/admin", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { className: "h-6 w-6 text-purple-800 dark:text-purple-300" }), " Admin"] }) }), (0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuSeparator, {}), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: handleLogout, className: "flex items-center gap-2 text-red-600", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.LogOut, { className: "h-6 w-6" }), " Cerrar sesi\u00F3n"] })] })] })) : ((0, jsx_runtime_1.jsx)(button_1.Button, { asChild: true, variant: "outline", size: "sm", children: (0, jsx_runtime_1.jsxs)(link_1.default, { href: "/login", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "h-6 w-6 text-purple-800 dark:text-purple-300 mr-1" }), " Iniciar sesi\u00F3n"] }) })), (0, jsx_runtime_1.jsx)("button", { ref: mobileMenuButtonRef, className: "md:hidden flex items-center justify-center focus:outline-none", onClick: () => setMobileMenuOpen(!mobileMenuOpen), "aria-label": "Abrir men\u00FA m\u00F3vil", children: mobileMenuOpen ? ((0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-6 w-6 text-purple-800 dark:text-purple-300" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.Menu, { className: "h-6 w-6 text-purple-800 dark:text-purple-300" })) })] })] }) }), mobileMenuOpen && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-40 bg-black/40 dark:bg-black/60", onClick: () => setMobileMenuOpen(false), children: (0, jsx_runtime_1.jsxs)("nav", { className: "fixed top-0 left-0 w-4/5 max-w-xs h-full min-h-screen bg-white dark:bg-black shadow-lg z-50 flex flex-col p-0 animate-slide-in", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-2 px-2 pt-3 pb-2 rounded-t-lg bg-white dark:bg-black", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(link_1.default, { href: "/", className: "flex items-center space-x-2 group", onClick: () => setMobileMenuOpen(false), children: (0, jsx_runtime_1.jsx)("span", { className: "text-xl font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent dark:bg-none dark:text-purple-200", children: "Mautik" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setMobileMenuOpen(false), "aria-label": "Cerrar men\u00FA m\u00F3vil", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-6 w-6 text-gray-700 dark:text-gray-200" }) })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSearchSubmit, className: "flex items-center w-full relative", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { type: "text", placeholder: "Buscar productos...", value: searchTerm, onChange: handleSearch, onKeyDown: handleSearchKeyDown, className: "pr-10 text-base", "aria-label": "Buscar productos" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "-ml-8 text-gray-400 hover:text-purple-700 dark:hover:text-purple-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "h-5 w-5" }) }), suggestions.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "absolute left-0 top-12 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto", children: suggestions.map((product, idx) => ((0, jsx_runtime_1.jsx)("button", { className: `block w-full text-left px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-800/30 ${selectedSuggestion === idx ? "bg-purple-100 dark:bg-purple-900/40" : ""}`, onClick: () => { router.push(`/product/${product.id}`); setSuggestions([]); }, children: product.name }, product.id))) }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-1 px-2 py-4 bg-white dark:bg-black flex-1", children: [(0, jsx_runtime_1.jsx)(link_1.default, { href: "/", className: "py-2 text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 rounded", onClick: () => setMobileMenuOpen(false), children: "Inicio" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowCategories(!showCategories), className: "flex items-center w-full py-2 text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 rounded", "aria-haspopup": "true", "aria-expanded": showCategories, "aria-label": "Abrir men\u00FA de categor\u00EDas", children: ["Tienda", showCategories ? (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronUp, { className: "ml-1 h-4 w-4" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { className: "ml-1 h-4 w-4" })] }), showCategories && ((0, jsx_runtime_1.jsx)("div", { className: "ml-4 mt-2 flex flex-col gap-1", children: categories.map((cat) => ((0, jsx_runtime_1.jsx)(link_1.default, { href: cat.href, className: "block px-2 py-1 text-gray-700 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-800/30 hover:text-purple-800 dark:hover:text-purple-200 rounded transition-colors", onClick: () => setMobileMenuOpen(false), children: cat.name }, cat.name))) }))] }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/about", className: "py-2 text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 rounded", onClick: () => setMobileMenuOpen(false), children: "Nosotros" }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/contact", className: "py-2 text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-purple-800 dark:hover:text-purple-300 rounded", onClick: () => setMobileMenuOpen(false), children: "Contacto" })] })] }) }))] }));
}
