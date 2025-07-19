"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingSpinner = LoadingSpinner;
exports.LoadingOverlay = LoadingOverlay;
exports.ProductCardSkeleton = ProductCardSkeleton;
exports.ProductGridSkeleton = ProductGridSkeleton;
exports.TableSkeleton = TableSkeleton;
exports.FormSkeleton = FormSkeleton;
exports.PageSkeleton = PageSkeleton;
exports.InlineLoading = InlineLoading;
exports.ButtonLoading = ButtonLoading;
const jsx_runtime_1 = require("react/jsx-runtime");
const skeleton_1 = require("@/components/ui/skeleton");
const lucide_react_1 = require("lucide-react");
// Loading spinner
function LoadingSpinner({ size = "default", className = "" }) {
    const sizeClasses = {
        sm: "h-4 w-4",
        default: "h-6 w-6",
        lg: "h-8 w-8"
    };
    return ((0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: `animate-spin ${sizeClasses[size]} ${className}` }));
}
// Loading overlay
function LoadingOverlay({ message = "Cargando...", className = "" }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: `fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${className}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-gray-900 rounded-lg p-6 flex flex-col items-center space-y-4", children: [(0, jsx_runtime_1.jsx)(LoadingSpinner, { size: "lg" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: message })] }) }));
}
// Product card skeleton
function ProductCardSkeleton() {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-64 w-full" }), (0, jsx_runtime_1.jsxs)("div", { className: "absolute top-3 left-3 space-y-2", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-16" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-20" })] }), (0, jsx_runtime_1.jsx)("div", { className: "absolute top-3 right-3", children: (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-8 w-8 rounded-full" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-5 flex flex-col flex-grow", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-20 mb-3" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-3/4 mb-2" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-full mb-4" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mt-auto pt-3 border-t border-gray-100 dark:border-gray-800", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-6 w-20" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-16" })] })] })] }));
}
// Product grid skeleton
function ProductGridSkeleton({ count = 8 }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6", children: [...Array(count)].map((_, i) => ((0, jsx_runtime_1.jsx)(ProductCardSkeleton, {}, i))) }));
}
// Table skeleton
function TableSkeleton({ rows = 5, columns = 4 }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: [...Array(rows)].map((_, i) => ((0, jsx_runtime_1.jsx)("div", { className: "flex space-x-4", children: [...Array(columns)].map((_, j) => ((0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 flex-1" }, j))) }, i))) }));
}
// Form skeleton
function FormSkeleton({ fields = 4 }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [[...Array(fields)].map((_, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-24" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-10 w-full" })] }, i))), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-2 pt-4", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-10 w-24" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-10 w-24" })] })] }));
}
// Page skeleton
function PageSkeleton() {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "container mx-auto px-4 py-8 space-y-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-8 w-64" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-4 w-96" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [(0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-32" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-32" }), (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-32" })] }), (0, jsx_runtime_1.jsx)(ProductGridSkeleton, { count: 8 })] }));
}
// Inline loading
function InlineLoading({ message = "Cargando..." }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2 text-gray-600 dark:text-gray-400", children: [(0, jsx_runtime_1.jsx)(LoadingSpinner, { size: "sm" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: message })] }));
}
// Button loading
function ButtonLoading(_a) {
    var { children, loading } = _a, props = __rest(_a, ["children", "loading"]);
    return ((0, jsx_runtime_1.jsxs)("button", Object.assign({}, props, { disabled: loading || props.disabled, className: `flex items-center space-x-2 ${props.className || ''}`, children: [loading && (0, jsx_runtime_1.jsx)(LoadingSpinner, { size: "sm" }), (0, jsx_runtime_1.jsx)("span", { children: children })] })));
}
