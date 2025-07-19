"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LookbookPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const image_1 = __importDefault(require("next/image"));
const link_1 = __importDefault(require("next/link"));
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const lookbookCollections = [
    {
        id: 1,
        name: "Océano Panameño 2025",
        description: "Inspirada en las hermosas costas y mares de Panamá, esta colección captura la esencia de las aguas cristalinas y la diversidad marina del país.",
        coverImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lookbook-cover-kHe9fZGTKYhW8qoAxM5ysYJV5gQ3zZ.jpg",
        images: [
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lookbook-1-F3EPWY72QiV91HYaMEFWEBfQxC1a1Z.jpg",
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lookbook-2-uImKS1LIpupAJhVGJ1aUJ47nCNpMvD.jpg",
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lookbook-3-EsUoRhNIvKdMrp8ygzZYXvB7EhkQUB.jpg",
        ],
    },
    {
        id: 2,
        name: "Artesanía Tradicional",
        description: "Un homenaje a las técnicas artesanales tradicionales de Panamá, combinando métodos ancestrales con un toque moderno y elegante.",
        coverImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/traditional-craft-pxmf4xHNdMnEXGQ2l5Xr6o8ZPZdHwT.jpg",
        images: [
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/craft-1-SYMdSvoBHOoTYJvwRfbP9JrVORktmm.jpg",
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/craft-2-AY9y8vjfSXhiGW49mQFOw9D6XhI42X.jpg",
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/craft-3-IB8ssMK1J4xSgVfBQQWVNXeOgMV5VW.jpg",
        ],
    },
];
function LookbookPage() {
    return ((0, jsx_runtime_1.jsx)("div", { className: "bg-gradient-to-b from-purple-50 to-white min-h-screen py-12", children: (0, jsx_runtime_1.jsxs)("div", { className: "container mx-auto px-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "max-w-3xl mx-auto text-center mb-12", children: [(0, jsx_runtime_1.jsx)("h1", { className: "font-display text-4xl md:text-5xl font-bold text-purple-900 mb-4", children: "Lookbook Mautik" }), (0, jsx_runtime_1.jsx)("p", { className: "text-lg text-gray-700", children: "Explora nuestras colecciones y descubre la historia detr\u00E1s de cada pieza artesanal." })] }), lookbookCollections.map((collection) => ((0, jsx_runtime_1.jsxs)("div", { className: "mb-20", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative h-[50vh] rounded-xl overflow-hidden mb-8", children: [(0, jsx_runtime_1.jsx)(image_1.default, { src: collection.coverImage || "/placeholder.svg", alt: collection.name, fill: true, className: "object-cover" }), (0, jsx_runtime_1.jsxs)("div", { className: "absolute inset-0 bg-gradient-to-t from-purple-900/90 to-transparent flex flex-col justify-end p-8", children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-display text-3xl md:text-4xl font-bold text-white mb-3", children: collection.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-white/90 max-w-2xl mb-6", children: collection.description }), (0, jsx_runtime_1.jsx)(link_1.default, { href: `/shop?collection=${collection.id}`, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { className: "bg-white text-purple-900 hover:bg-purple-100 dark:bg-gray-700 dark:text-purple-200 dark:hover:bg-gray-600", children: ["Explorar Colecci\u00F3n ", (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4" })] }) })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: collection.images.map((image, index) => ((0, jsx_runtime_1.jsx)("div", { className: "relative h-80 rounded-lg overflow-hidden shadow-md", children: (0, jsx_runtime_1.jsx)(image_1.default, { src: image || "/placeholder.svg", alt: `${collection.name} - Imagen ${index + 1}`, fill: true, className: "object-cover hover:scale-105 transition-transform duration-500" }) }, index))) })] }, collection.id))), (0, jsx_runtime_1.jsxs)("div", { className: "bg-purple-100 rounded-xl p-8 text-center mt-12", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-display text-2xl font-bold text-purple-900 mb-3", children: "\u00BFTe inspira nuestra colecci\u00F3n?" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-700 mb-6 max-w-2xl mx-auto", children: "Visita nuestra tienda para descubrir todas las piezas artesanales que tenemos disponibles para ti." }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/shop", children: (0, jsx_runtime_1.jsx)(button_1.Button, { size: "lg", className: "bg-purple-800 hover:bg-purple-900 dark:bg-gray-700 dark:text-purple-200 dark:hover:bg-gray-600", children: "Visitar Tienda" }) })] })] }) }));
}
