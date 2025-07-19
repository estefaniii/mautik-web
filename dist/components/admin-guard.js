"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminGuard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const auth_context_1 = require("@/context/auth-context");
const lucide_react_1 = require("lucide-react");
function AdminGuard({ children, fallback }) {
    const { user, isLoading } = (0, auth_context_1.useAuth)();
    const router = (0, navigation_1.useRouter)();
    (0, react_1.useEffect)(() => {
        if (!isLoading) {
            if (!user) {
                router.push("/login");
            }
            else if (!user.isAdmin) {
                router.push("/");
            }
        }
    }, [user, isLoading, router]);
    if (isLoading) {
        return (fallback || ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Verificando permisos..." })] }) })));
    }
    if (!user) {
        return null;
    }
    if (!user.isAdmin) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Shield, { className: "h-16 w-16 text-red-500 mx-auto mb-4" }), (0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Acceso Denegado" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-4", children: "No tienes permisos para acceder a esta p\u00E1gina." }), (0, jsx_runtime_1.jsx)("button", { onClick: () => router.push("/"), className: "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors", children: "Volver al Inicio" })] }) }));
    }
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: children });
}
