"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeIndicator = ThemeIndicator;
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_react_1 = require("lucide-react");
const theme_context_1 = require("@/context/theme-context");
function ThemeIndicator({ size = "md", showText = false, className = "" }) {
    const { isDarkMode } = (0, theme_context_1.useTheme)();
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6"
    };
    const textSizeClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base"
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: `flex items-center gap-2 ${className}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("div", { className: `${sizeClasses[size]} transition-all duration-500 transform ${isDarkMode ? 'rotate-180' : 'rotate-0'}`, children: isDarkMode ? ((0, jsx_runtime_1.jsx)(lucide_react_1.Sun, { className: `${sizeClasses[size]} text-yellow-500 animate-pulse` })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.Moon, { className: `${sizeClasses[size]} text-gray-600 dark:text-gray-300` })) }), (0, jsx_runtime_1.jsx)("div", { className: `absolute inset-0 ${sizeClasses[size]} bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full opacity-0 ${isDarkMode ? 'opacity-100' : ''} transition-opacity duration-300` })] }), showText && ((0, jsx_runtime_1.jsx)("span", { className: `${textSizeClasses[size]} font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300`, children: isDarkMode ? "Oscuro" : "Claro" }))] }));
}
