"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryShowcase = CategoryShowcase;
const jsx_runtime_1 = require("react/jsx-runtime");
const link_1 = __importDefault(require("next/link"));
const lazy_image_1 = __importDefault(require("@/components/ui/lazy-image"));
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
const categories = [
    {
        name: "Crochet",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/crochet-category.jpg",
        link: "/shop?category=crochet",
        description: "Artesanías únicas hechas a mano con crochet",
    },
    {
        name: "Llaveros",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/keychain-1avERJBjLm9Nt2ETHxdpnW3hLTiVL5.jpg",
        link: "/shop?category=llaveros",
        description: "Llaveros únicos para tu día a día",
    },
    {
        name: "Pulseras",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jewelry-category-QUKILQx3QBULPGZeznexdmJXqPwdP7.jpg",
        link: "/shop?category=pulseras",
        description: "Pulseras elegantes y artesanales",
    },
    {
        name: "Collares",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jewelry-category-QUKILQx3QBULPGZeznexdmJXqPwdP7.jpg",
        link: "/shop?category=collares",
        description: "Collares únicos para complementar tu estilo",
    },
    {
        name: "Anillos",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jewelry-category-QUKILQx3QBULPGZeznexdmJXqPwdP7.jpg",
        link: "/shop?category=anillos",
        description: "Anillos artesanales con diseños únicos",
    },
    {
        name: "Aretes",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jewelry-category-QUKILQx3QBULPGZeznexdmJXqPwdP7.jpg",
        link: "/shop?category=aretes",
        description: "Aretes elegantes para cualquier ocasión",
    },
    {
        name: "Otros",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/plush-toys-Zzh5Kp8E4vRXZXdXc07DNcYxbVzWc0.jpg",
        link: "/shop?category=otros",
        description: "Productos únicos y especiales",
    },
];
function CategoryShowcase() {
    const scrollRef = (0, react_1.useRef)(null);
    const [canScrollLeft, setCanScrollLeft] = (0, react_1.useState)(false);
    const [canScrollRight, setCanScrollRight] = (0, react_1.useState)(false);
    // Checa si hay overflow para mostrar flechas
    const checkForScroll = () => {
        const el = scrollRef.current;
        if (!el)
            return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    (0, react_1.useEffect)(() => {
        checkForScroll();
        const el = scrollRef.current;
        if (!el)
            return;
        el.addEventListener("scroll", checkForScroll);
        window.addEventListener("resize", checkForScroll);
        return () => {
            el.removeEventListener("scroll", checkForScroll);
            window.removeEventListener("resize", checkForScroll);
        };
    }, []);
    const scroll = (dir) => {
        const el = scrollRef.current;
        if (!el)
            return;
        const scrollAmount = el.clientWidth * 0.8;
        el.scrollBy({ left: dir === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    };
    return ((0, jsx_runtime_1.jsx)("section", { className: "py-16 bg-white dark:bg-gray-900", children: (0, jsx_runtime_1.jsxs)("div", { className: "container mx-auto px-2 sm:px-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-display text-3xl font-bold text-purple-900 dark:text-purple-200 text-center mb-12", children: "Explora Nuestras Categor\u00EDas" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [canScrollLeft && ((0, jsx_runtime_1.jsx)("div", { className: "pointer-events-none absolute left-0 top-0 h-full w-10 z-10 bg-gradient-to-r from-white/90 dark:from-gray-900/90 to-transparent" })), canScrollRight && ((0, jsx_runtime_1.jsx)("div", { className: "pointer-events-none absolute right-0 top-0 h-full w-10 z-10 bg-gradient-to-l from-white/90 dark:from-gray-900/90 to-transparent" })), canScrollLeft && ((0, jsx_runtime_1.jsx)("button", { "aria-label": "Ver categor\u00EDas anteriores", onClick: () => scroll("left"), className: "absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-black/90 rounded-full p-2.5 hover:bg-purple-100 dark:hover:bg-purple-800/40 transition-colors focus:outline-none", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-6 w-6 text-purple-800 dark:text-purple-200" }) })), (0, jsx_runtime_1.jsx)("div", { ref: scrollRef, className: "flex gap-5 md:gap-7 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-1 py-2", style: { WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }, tabIndex: 0, "aria-label": "Carrusel de categor\u00EDas", children: categories.map((category, index) => ((0, jsx_runtime_1.jsxs)(link_1.default, { href: category.link, className: "group block relative min-w-[75vw] max-w-[90vw] sm:min-w-[45vw] sm:max-w-[50vw] md:min-w-[28vw] md:max-w-[32vw] lg:min-w-[220px] lg:max-w-[260px] w-full snap-start overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 focus:outline-none", style: { flex: "0 0 auto" }, tabIndex: 0, "aria-label": `Ver productos de la categoría ${category.name}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative h-44 sm:h-56 md:h-60 w-full", children: [(0, jsx_runtime_1.jsx)(lazy_image_1.default, { src: category.image || "/placeholder.svg", alt: category.name, fill: true, className: "object-cover transition-transform duration-500 group-hover:scale-105", priority: false }), (0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg md:text-2xl font-bold mb-1 md:mb-2 drop-shadow-lg", children: category.name }), (0, jsx_runtime_1.jsx)("p", { className: "mb-2 md:mb-4 text-white/90 text-sm md:text-base line-clamp-2 drop-shadow-md", children: category.description }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center text-white group-hover:text-purple-200 transition-colors text-sm md:text-base", children: [(0, jsx_runtime_1.jsx)("span", { children: "Ver Productos" }), (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" })] })] })] }, index))) }), canScrollRight && ((0, jsx_runtime_1.jsx)("button", { "aria-label": "Ver m\u00E1s categor\u00EDas", onClick: () => scroll("right"), className: "absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-black/90 rounded-full p-2.5 hover:bg-purple-100 dark:hover:bg-purple-800/40 transition-colors focus:outline-none", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowRight, { className: "h-6 w-6 text-purple-800 dark:text-purple-200" }) }))] })] }) }));
}
