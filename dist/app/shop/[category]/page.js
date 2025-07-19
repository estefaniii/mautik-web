"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CategoryPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const navigation_1 = require("next/navigation");
const product_card_1 = __importDefault(require("@/components/product-card"));
const link_1 = __importDefault(require("next/link"));
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const breadcrumb_1 = require("@/components/ui/breadcrumb");
function CategoryPage({ params }) {
    // Decode the category from URL
    const categoryName = decodeURIComponent(params.category);
    // Get all products in this category
    // Eliminar: const categoryProducts = products.filter((product) => product.category.toLowerCase() === categoryName.toLowerCase())
    // TODO: Implementar fetch a la API para productos por categoría reales
    const categoryProducts = []; // Placeholder for now
    // If no products found, return 404
    if (categoryProducts.length === 0) {
        (0, navigation_1.notFound)();
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: "bg-gradient-to-b from-purple-50 to-white min-h-screen py-12", children: (0, jsx_runtime_1.jsxs)("div", { className: "container mx-auto px-4", children: [(0, jsx_runtime_1.jsx)(breadcrumb_1.Breadcrumb, { className: "mb-6", children: (0, jsx_runtime_1.jsxs)(breadcrumb_1.BreadcrumbList, { children: [(0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbItem, { children: (0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbLink, { href: "/", children: "Inicio" }) }), (0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbSeparator, {}), (0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbItem, { children: (0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbLink, { href: "/shop", children: "Tienda" }) }), (0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbSeparator, {}), (0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbItem, { children: (0, jsx_runtime_1.jsx)(breadcrumb_1.BreadcrumbLink, { className: "text-purple-800 font-medium", children: categoryName }) })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-8", children: [(0, jsx_runtime_1.jsx)("h1", { className: "font-display text-3xl font-bold text-purple-900", children: categoryName }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/shop", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", className: "flex items-center gap-2 border-purple-800 text-purple-800 hover:bg-purple-100", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { size: 16 }), " Volver a la Tienda"] }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: categoryProducts.map((product) => ((0, jsx_runtime_1.jsx)(product_card_1.default, { product: product }, product.id))) })] }) }));
}
