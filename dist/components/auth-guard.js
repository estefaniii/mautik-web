"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuthGuard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const auth_context_1 = require("@/context/auth-context");
const lucide_react_1 = require("lucide-react");
function AuthGuard({ children, fallback }) {
    const { user, isLoading } = (0, auth_context_1.useAuth)();
    const router = (0, navigation_1.useRouter)();
    (0, react_1.useEffect)(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);
    if (isLoading) {
        return (fallback || ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Cargando..." })] }) })));
    }
    if (!user) {
        return null;
    }
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: children });
}
