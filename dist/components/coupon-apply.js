"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CouponApply;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
function CouponApply({ subtotal, items, onCouponApplied, onCouponRemoved, appliedCoupon }) {
    const [couponCode, setCouponCode] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const { toast } = (0, use_toast_1.useToast)();
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast({
                title: "Error",
                description: "Ingresa un código de cupón",
                variant: "destructive"
            });
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: couponCode.trim(),
                    subtotal,
                    items
                })
            });
            const data = await response.json();
            if (response.ok) {
                onCouponApplied(data.discount, data.coupon.code);
                setCouponCode("");
                toast({
                    title: "¡Cupón aplicado!",
                    description: `Descuento de $${data.discount.toFixed(2)} aplicado`
                });
            }
            else {
                toast({
                    title: "Error",
                    description: data.error,
                    variant: "destructive"
                });
            }
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Error al validar el cupón",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleRemoveCoupon = () => {
        onCouponRemoved();
        toast({
            title: "Cupón removido",
            description: "El cupón ha sido removido de tu pedido"
        });
    };
    return ((0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "coupon", className: "text-sm font-medium", children: "\u00BFTienes un cup\u00F3n?" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mt-1", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { id: "coupon", placeholder: "Ingresa tu c\u00F3digo", value: couponCode, onChange: (e) => setCouponCode(e.target.value.toUpperCase()), disabled: !!appliedCoupon, className: "flex-1" }), !appliedCoupon ? ((0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleApplyCoupon, disabled: loading || !couponCode.trim(), size: "sm", children: loading ? "Aplicando..." : "Aplicar" })) : ((0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleRemoveCoupon, variant: "outline", size: "sm", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4" }) }))] })] }), appliedCoupon && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Check, { className: "h-4 w-4 text-green-600" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm font-medium text-green-800 dark:text-green-200", children: ["Cup\u00F3n aplicado: ", appliedCoupon.code] })] }), (0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "secondary", className: "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200", children: ["-$", appliedCoupon.discount.toFixed(2)] })] }))] }) }) }));
}
