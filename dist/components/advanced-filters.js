"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdvancedFilters;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const slider_1 = require("@/components/ui/slider");
const checkbox_1 = require("@/components/ui/checkbox");
const label_1 = require("@/components/ui/label");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const sheet_1 = require("@/components/ui/sheet");
const defaultFilters = {
    categories: [],
    priceRange: [0, 1000],
    rating: 0,
    inStock: false,
    featured: false,
    isNew: false,
    sortBy: 'createdAt',
    sortOrder: 'desc'
};
const sortOptions = [
    { value: 'createdAt', label: 'Más recientes', icon: lucide_react_1.Clock },
    { value: 'price', label: 'Precio', icon: lucide_react_1.DollarSign },
    { value: 'name', label: 'Nombre', icon: lucide_react_1.TrendingUp },
    { value: 'rating', label: 'Rating', icon: lucide_react_1.Star },
    { value: 'stock', label: 'Stock', icon: lucide_react_1.Package }
];
function AdvancedFilters({ onFiltersChange, currentFilters, totalProducts, filteredCount }) {
    const [filters, setFilters] = (0, react_1.useState)(currentFilters);
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const categories = ["crochet", "llaveros", "pulseras", "collares", "anillos", "aretes", "otros"];
    (0, react_1.useEffect)(() => {
        onFiltersChange(filters);
    }, [filters, onFiltersChange]);
    const updateFilter = (key, value) => {
        setFilters(prev => (Object.assign(Object.assign({}, prev), { [key]: value })));
    };
    const toggleCategory = (category) => {
        setFilters(prev => (Object.assign(Object.assign({}, prev), { categories: prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category] })));
    };
    const clearFilters = () => {
        setFilters(defaultFilters);
    };
    const hasActiveFilters = () => {
        return (filters.categories.length > 0 ||
            filters.priceRange[0] > 0 ||
            filters.priceRange[1] < 1000 ||
            filters.rating > 0 ||
            filters.inStock ||
            filters.featured ||
            filters.isNew ||
            filters.sortBy !== 'createdAt' ||
            filters.sortOrder !== 'desc');
    };
    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.categories.length > 0)
            count++;
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000)
            count++;
        if (filters.rating > 0)
            count++;
        if (filters.inStock)
            count++;
        if (filters.featured)
            count++;
        if (filters.isNew)
            count++;
        return count;
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between lg:hidden", children: [(0, jsx_runtime_1.jsxs)(sheet_1.Sheet, { open: isOpen, onOpenChange: setIsOpen, children: [(0, jsx_runtime_1.jsx)(sheet_1.SheetTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Filter, { size: 16 }), "Filtros", getActiveFiltersCount() > 0 && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "secondary", className: "ml-1", children: getActiveFiltersCount() }))] }) }), (0, jsx_runtime_1.jsxs)(sheet_1.SheetContent, { side: "left", className: "w-[300px] sm:w-[400px]", children: [(0, jsx_runtime_1.jsx)(sheet_1.SheetHeader, { children: (0, jsx_runtime_1.jsx)(sheet_1.SheetTitle, { children: "Filtros Avanzados" }) }), (0, jsx_runtime_1.jsx)("div", { className: "mt-6 space-y-6", children: (0, jsx_runtime_1.jsx)(FilterContent, { filters: filters, updateFilter: updateFilter, toggleCategory: toggleCategory, categories: categories, sortOptions: sortOptions }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-sm text-gray-600", children: [filteredCount, " de ", totalProducts, " productos"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "hidden lg:block", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Filtros Avanzados" }), hasActiveFilters() && ((0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "ghost", size: "sm", onClick: clearFilters, className: "text-red-600 hover:text-red-700", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 16, className: "mr-1" }), "Limpiar"] }))] }), (0, jsx_runtime_1.jsx)(FilterContent, { filters: filters, updateFilter: updateFilter, toggleCategory: toggleCategory, categories: categories, sortOptions: sortOptions })] }) }), hasActiveFilters() && ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-2", children: [filters.categories.map(category => ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "secondary", className: "cursor-pointer hover:bg-red-100", onClick: () => toggleCategory(category), children: [category, (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 12, className: "ml-1" })] }, category))), (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "secondary", children: ["$", filters.priceRange[0], " - $", filters.priceRange[1]] })), filters.rating > 0 && ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "secondary", children: [filters.rating, "+ estrellas"] })), filters.inStock && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "secondary", children: "En stock" })), filters.featured && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "secondary", children: "Destacados" })), filters.isNew && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "secondary", children: "Nuevos" }))] }))] }));
}
function FilterContent({ filters, updateFilter, toggleCategory, categories, sortOptions }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium text-gray-900 dark:text-gray-100 mb-3", children: "Categor\u00EDas" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: categories.map(category => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(checkbox_1.Checkbox, { id: category, checked: filters.categories.includes(category), onCheckedChange: () => toggleCategory(category) }), (0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: category, className: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize", children: category })] }, category))) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium text-gray-900 dark:text-gray-100 mb-3", children: "Rango de Precio" }), (0, jsx_runtime_1.jsxs)("div", { className: "px-2", children: [(0, jsx_runtime_1.jsx)(slider_1.Slider, { value: filters.priceRange, onValueChange: (value) => updateFilter('priceRange', value), max: 1000, min: 0, step: 10, className: "w-full" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm text-gray-600 mt-2", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["$", filters.priceRange[0]] }), (0, jsx_runtime_1.jsxs)("span", { children: ["$", filters.priceRange[1]] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium text-gray-900 dark:text-gray-100 mb-3", children: "Rating M\u00EDnimo" }), (0, jsx_runtime_1.jsxs)("div", { className: "px-2", children: [(0, jsx_runtime_1.jsx)(slider_1.Slider, { value: [filters.rating], onValueChange: (value) => updateFilter('rating', value[0]), max: 5, min: 0, step: 0.5, className: "w-full" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm text-gray-600 mt-2", children: [(0, jsx_runtime_1.jsx)("span", { children: "0" }), (0, jsx_runtime_1.jsxs)("span", { children: [filters.rating, "+ estrellas"] }), (0, jsx_runtime_1.jsx)("span", { children: "5" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium text-gray-900 dark:text-gray-100 mb-3", children: "Opciones" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(checkbox_1.Checkbox, { id: "inStock", checked: filters.inStock, onCheckedChange: (checked) => updateFilter('inStock', checked) }), (0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "inStock", className: "text-sm font-medium leading-none", children: "Solo en stock" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(checkbox_1.Checkbox, { id: "featured", checked: filters.featured, onCheckedChange: (checked) => updateFilter('featured', checked) }), (0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "featured", className: "text-sm font-medium leading-none", children: "Solo destacados" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(checkbox_1.Checkbox, { id: "isNew", checked: filters.isNew, onCheckedChange: (checked) => updateFilter('isNew', checked) }), (0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "isNew", className: "text-sm font-medium leading-none", children: "Solo nuevos" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium text-gray-900 dark:text-gray-100 mb-3", children: "Ordenar por" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: sortOptions.map(option => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "radio", id: option.value, name: "sortBy", value: option.value, checked: filters.sortBy === option.value, onChange: (e) => updateFilter('sortBy', e.target.value), className: "text-purple-600" }), (0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: option.value, className: "text-sm font-medium leading-none", children: option.label })] }, option.value))) }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-3 flex gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: filters.sortOrder === 'asc' ? 'default' : 'outline', size: "sm", onClick: () => updateFilter('sortOrder', 'asc'), children: "Ascendente" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: filters.sortOrder === 'desc' ? 'default' : 'outline', size: "sm", onClick: () => updateFilter('sortOrder', 'desc'), children: "Descendente" })] })] })] }));
}
