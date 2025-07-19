"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ShopFilters;
const jsx_runtime_1 = require("react/jsx-runtime");
const checkbox_1 = require("@/components/ui/checkbox");
const label_1 = require("@/components/ui/label");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
function ShopFilters({ selectedCategories = [], onCategoryChange = () => { }, inStockOnly = false, onStockChange = () => { }, onReset = () => { }, }) {
    // Obtener categorías únicas
    // Eliminar: const categories = Array.from(new Set(products.map((product) => product.category)))
    // TODO: Implementar fetch a la API para filtros reales
    const categories = ["crochet", "llaveros", "pulseras", "collares", "anillos", "aretes", "otros"];
    return ((0, jsx_runtime_1.jsxs)("aside", { className: "w-full max-w-full lg:w-80 bg-gradient-to-br from-purple-50/80 to-white/90 dark:from-gray-900 dark:to-gray-800 rounded-2xl lg:rounded-3xl shadow-xl ring-1 ring-purple-100/40 dark:ring-gray-800/60 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 mb-6 md:mb-0 animate-fade-in-up mx-auto lg:mx-0", "aria-label": "Filtros de productos", role: "complementary", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-6 md:mb-8", children: [(0, jsx_runtime_1.jsxs)("h2", { className: "text-lg md:text-xl font-extrabold text-purple-900 dark:text-white flex items-center gap-2 tracking-tight", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Box, { size: 20, className: "text-purple-700 dark:text-purple-300" }), " Filtros"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "ghost", size: "sm", onClick: onReset, className: "flex items-center text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-purple-400", "aria-label": "Limpiar filtros", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FilterX, { size: 16, className: "mr-1" }), " Limpiar"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-6 md:space-y-8", children: [(0, jsx_runtime_1.jsxs)("fieldset", { children: [(0, jsx_runtime_1.jsx)("legend", { className: "text-base md:text-lg font-semibold mb-2 md:mb-3 text-purple-800 dark:text-purple-200", children: "Categor\u00EDas" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: categories.map((category) => {
                                    const selected = selectedCategories.includes(category);
                                    return ((0, jsx_runtime_1.jsxs)("label", { className: `flex items-center gap-2 px-3 py-1 rounded-xl cursor-pointer transition-all font-sans text-sm font-medium
                    ${selected ? 'bg-gradient-to-r from-purple-700/90 to-purple-500/80 text-white shadow-md' : 'bg-purple-50 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100 hover:bg-purple-100 dark:hover:bg-purple-800'}
                  `, tabIndex: 0, style: { maxWidth: '100%' }, children: [(0, jsx_runtime_1.jsx)(checkbox_1.Checkbox, { id: `category-${category}`, checked: selected, onCheckedChange: (checked) => onCategoryChange(category, checked), className: "accent-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400" }), (0, jsx_runtime_1.jsx)("span", { className: "truncate max-w-[7rem] md:max-w-[10rem]", children: category }), selected && (0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 16, className: "ml-1" })] }, category));
                                }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(checkbox_1.Checkbox, { id: "inStockOnly", checked: inStockOnly, onCheckedChange: onStockChange, className: "accent-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400" }), (0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "inStockOnly", className: "text-sm text-gray-700 dark:text-gray-200", children: "Solo productos en stock" })] })] })] }));
}
