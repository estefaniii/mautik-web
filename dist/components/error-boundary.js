"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = void 0;
exports.useErrorHandler = useErrorHandler;
exports.ErrorFallback = ErrorFallback;
exports.withErrorBoundary = withErrorBoundary;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
class ErrorBoundary extends react_1.Component {
    constructor() {
        super(...arguments);
        this.state = {
            hasError: false
        };
        this.handleRetry = () => {
            this.setState({ hasError: false, error: undefined, errorInfo: undefined });
        };
        this.handleReload = () => {
            window.location.reload();
        };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        var _a, _b;
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
        (_b = (_a = this.props).onError) === null || _b === void 0 ? void 0 : _b.call(_a, error, errorInfo);
        // En producción, enviar error a servicio de monitoreo
        if (process.env.NODE_ENV === 'production') {
            // TODO: Implementar servicio de monitoreo de errores
            // reportError(error, errorInfo)
        }
    }
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900", children: (0, jsx_runtime_1.jsx)("div", { className: "max-w-md w-full mx-auto text-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-center mb-6", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-red-100 dark:bg-red-900/20 rounded-full p-3", children: (0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-8 w-8 text-red-600 dark:text-red-400" }) }) }), (0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4", children: "Algo sali\u00F3 mal" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400 mb-6", children: "Ha ocurrido un error inesperado. Por favor, intenta de nuevo o contacta al soporte si el problema persiste." }), process.env.NODE_ENV === 'development' && this.state.error && ((0, jsx_runtime_1.jsxs)("details", { className: "mb-6 text-left", children: [(0, jsx_runtime_1.jsx)("summary", { className: "cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2", children: "Detalles del error (solo desarrollo)" }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-gray-100 dark:bg-gray-700 rounded p-3 text-xs font-mono text-red-600 dark:text-red-400 overflow-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-2", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Error:" }), " ", this.state.error.message] }), this.state.errorInfo && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Stack:" }), (0, jsx_runtime_1.jsx)("pre", { className: "whitespace-pre-wrap mt-1", children: this.state.errorInfo.componentStack })] }))] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row gap-3", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: this.handleRetry, className: "flex-1", variant: "outline", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: "h-4 w-4 mr-2" }), "Intentar de nuevo"] }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: this.handleReload, className: "flex-1", children: "Recargar p\u00E1gina" })] }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "ghost", className: "w-full", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Home, { className: "h-4 w-4 mr-2" }), "Ir al inicio"] }) }) })] }) }) }));
        }
        return this.props.children;
    }
}
exports.ErrorBoundary = ErrorBoundary;
// Hook para usar error boundary en componentes funcionales
function useErrorHandler() {
    const [error, setError] = react_1.default.useState(null);
    const handleError = react_1.default.useCallback((error) => {
        console.error('Error caught by useErrorHandler:', error);
        setError(error);
    }, []);
    const clearError = react_1.default.useCallback(() => {
        setError(null);
    }, []);
    return { error, handleError, clearError };
}
// Componente para mostrar errores en componentes funcionales
function ErrorFallback({ error, resetErrorBoundary }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center p-8 text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-12 w-12 text-red-500 mb-4" }), (0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2", children: "Algo sali\u00F3 mal" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400 mb-4", children: error.message || 'Ha ocurrido un error inesperado.' }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: resetErrorBoundary, children: "Intentar de nuevo" })] }));
}
// HOC para envolver componentes con error boundary
function withErrorBoundary(Component, fallback) {
    return function WithErrorBoundary(props) {
        return ((0, jsx_runtime_1.jsx)(ErrorBoundary, { fallback: fallback, children: (0, jsx_runtime_1.jsx)(Component, Object.assign({}, props)) }));
    };
}
