"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CleanupPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
const admin_guard_1 = __importDefault(require("@/components/admin-guard"));
function CleanupPage() {
    const [productIds, setProductIds] = (0, react_1.useState)("");
    const [isCleaning, setIsCleaning] = (0, react_1.useState)(false);
    const [results, setResults] = (0, react_1.useState)(null);
    const { toast } = (0, use_toast_1.useToast)();
    const cleanProductReferences = async () => {
        if (!productIds.trim()) {
            toast({
                title: "Error",
                description: "Por favor ingresa al menos un ID de producto.",
                variant: "destructive"
            });
            return;
        }
        setIsCleaning(true);
        setResults(null);
        try {
            const ids = productIds.split(',').map(id => id.trim()).filter(id => id);
            // Función para limpiar localStorage
            const cleanLocalStorage = () => {
                const keysToClean = [
                    'mautik_favorites_temp',
                    'mautik_cart_temp'
                ];
                // Agregar claves específicas de usuario si existe
                const user = JSON.parse(localStorage.getItem('mautik_user') || '{}');
                if (user.id) {
                    keysToClean.push(`mautik_favorites_${user.id}`);
                    keysToClean.push(`mautik_cart_${user.id}`);
                }
                const results = {
                    totalCleaned: 0,
                    details: {}
                };
                keysToClean.forEach(key => {
                    const data = localStorage.getItem(key);
                    if (data) {
                        try {
                            const parsed = JSON.parse(data);
                            if (Array.isArray(parsed)) {
                                const originalLength = parsed.length;
                                const filtered = parsed.filter(item => !ids.includes(item.id));
                                const cleanedCount = originalLength - filtered.length;
                                if (cleanedCount > 0) {
                                    localStorage.setItem(key, JSON.stringify(filtered));
                                    results.totalCleaned += cleanedCount;
                                    results.details[key] = {
                                        original: originalLength,
                                        cleaned: filtered.length,
                                        removed: cleanedCount
                                    };
                                }
                                else {
                                    results.details[key] = {
                                        original: originalLength,
                                        cleaned: originalLength,
                                        removed: 0
                                    };
                                }
                            }
                        }
                        catch (error) {
                            results.details[key] = { error: error instanceof Error ? error.message : String(error) };
                        }
                    }
                    else {
                        results.details[key] = { error: "No existe" };
                    }
                });
                return results;
            };
            const cleanupResults = cleanLocalStorage();
            setResults(cleanupResults);
            if (cleanupResults.totalCleaned > 0) {
                toast({
                    title: "Limpieza completada",
                    description: `Se eliminaron ${cleanupResults.totalCleaned} referencias a productos eliminados.`,
                });
            }
            else {
                toast({
                    title: "Sin cambios",
                    description: "No se encontraron referencias a los productos especificados.",
                });
            }
        }
        catch (error) {
            console.error("Error durante la limpieza:", error);
            toast({
                title: "Error",
                description: "Ocurrió un error durante la limpieza.",
                variant: "destructive"
            });
        }
        finally {
            setIsCleaning(false);
        }
    };
    const clearAllLocalStorage = () => {
        if (confirm("¿Estás seguro de que quieres limpiar TODO el localStorage? Esta acción no se puede deshacer.")) {
            localStorage.clear();
            toast({
                title: "localStorage limpiado",
                description: "Se ha limpiado completamente el localStorage del navegador.",
            });
            setResults(null);
        }
    };
    return ((0, jsx_runtime_1.jsx)(admin_guard_1.default, { children: (0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-gradient-to-b from-purple-50 to-white py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "container mx-auto px-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-4xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-purple-900 mb-2", children: "Limpieza de localStorage" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Herramienta para limpiar referencias a productos eliminados del localStorage del navegador." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid gap-6", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-5 w-5 mr-2" }), "Limpiar referencias espec\u00EDficas"] }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Ingresa los IDs de productos eliminados separados por comas." })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "productIds", children: "IDs de productos eliminados" }), (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { id: "productIds", placeholder: "Ej: 679, 871, 123, 456", value: productIds, onChange: (e) => setProductIds(e.target.value), className: "mt-1" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-4", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { onClick: cleanProductReferences, disabled: isCleaning || !productIds.trim(), className: "bg-purple-800 hover:bg-purple-900", children: isCleaning ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: "h-4 w-4 mr-2 animate-spin" }), "Limpiando..."] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }), "Limpiar referencias"] })) }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: clearAllLocalStorage, className: "text-red-600 hover:text-red-700 hover:bg-red-50", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "h-4 w-4 mr-2" }), "Limpiar todo localStorage"] })] })] })] }), results && ((0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "h-5 w-5 mr-2 text-green-600" }), "Resultados de la limpieza"] }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-green-50 p-4 rounded-lg", children: (0, jsx_runtime_1.jsxs)("p", { className: "font-semibold text-green-800", children: ["Total de referencias eliminadas: ", results.totalCleaned] }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold mb-2", children: "Detalles por clave:" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: Object.entries(results.details).map(([key, detail]) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-gray-50 p-3 rounded", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-medium", children: key }), detail.error ? ((0, jsx_runtime_1.jsx)("p", { className: "text-red-600 text-sm", children: detail.error })) : ((0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600", children: ["Original: ", detail.original, " | Limpiado: ", detail.cleaned, " | Eliminados: ", detail.removed] }))] }, key))) })] })] }) })] })), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Informaci\u00F3n" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2 text-sm text-gray-600", children: [(0, jsx_runtime_1.jsx)("p", { children: "\u2022 Esta herramienta limpia referencias a productos eliminados del localStorage del navegador." }), (0, jsx_runtime_1.jsx)("p", { children: "\u2022 Los IDs deben estar separados por comas (ej: 679, 871, 123)." }), (0, jsx_runtime_1.jsx)("p", { children: "\u2022 Se limpian tanto favoritos como carrito de compras." }), (0, jsx_runtime_1.jsx)("p", { children: "\u2022 La limpieza afecta tanto a usuarios autenticados como an\u00F3nimos." }), (0, jsx_runtime_1.jsxs)("p", { children: ["\u2022 ", (0, jsx_runtime_1.jsx)("strong", { children: "\u00A1Cuidado!" }), " La opci\u00F3n \"Limpiar todo localStorage\" elimina TODOS los datos locales."] })] }) })] })] })] }) }) }) }));
}
