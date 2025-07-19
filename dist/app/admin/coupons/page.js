"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CouponsPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const switch_1 = require("@/components/ui/switch");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const dialog_1 = require("@/components/ui/dialog");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
function CouponsPage() {
    const { toast } = (0, use_toast_1.useToast)();
    const [coupons, setCoupons] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [isDialogOpen, setIsDialogOpen] = (0, react_1.useState)(false);
    const [editingCoupon, setEditingCoupon] = (0, react_1.useState)(null);
    const [formData, setFormData] = (0, react_1.useState)({
        code: '',
        type: 'percentage',
        value: 0,
        minPurchase: 0,
        maxDiscount: 0,
        usageLimit: 1,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        isActive: true,
        applicableCategories: [],
        applicableProducts: [],
        description: ''
    });
    const categories = ["crochet", "llaveros", "pulseras", "collares", "anillos", "aretes", "otros"];
    (0, react_1.useEffect)(() => {
        fetchCoupons();
    }, []);
    const fetchCoupons = async () => {
        try {
            const response = await fetch('/api/coupons');
            if (response.ok) {
                const data = await response.json();
                setCoupons(data);
            }
        }
        catch (error) {
            console.error('Error fetching coupons:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los cupones",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingCoupon ? `/api/coupons/${editingCoupon._id}` : '/api/coupons';
            const method = editingCoupon ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                toast({
                    title: "Éxito",
                    description: editingCoupon ? "Cupón actualizado" : "Cupón creado"
                });
                setIsDialogOpen(false);
                resetForm();
                fetchCoupons();
            }
            else {
                const error = await response.json();
                toast({
                    title: "Error",
                    description: error.error,
                    variant: "destructive"
                });
            }
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Error al guardar el cupón",
                variant: "destructive"
            });
        }
    };
    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este cupón?'))
            return;
        try {
            const response = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast({ title: "Cupón eliminado" });
                fetchCoupons();
            }
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Error al eliminar el cupón",
                variant: "destructive"
            });
        }
    };
    const handleEdit = (coupon) => {
        var _a;
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            minPurchase: coupon.minPurchase || 0,
            maxDiscount: coupon.maxDiscount || 0,
            usageLimit: coupon.usageLimit,
            validFrom: coupon.validFrom.split('T')[0],
            validUntil: ((_a = coupon.validUntil) === null || _a === void 0 ? void 0 : _a.split('T')[0]) || '',
            isActive: coupon.isActive,
            applicableCategories: coupon.applicableCategories || [],
            applicableProducts: coupon.applicableProducts || [],
            description: coupon.description || ''
        });
        setIsDialogOpen(true);
    };
    const resetForm = () => {
        setFormData({
            code: '',
            type: 'percentage',
            value: 0,
            minPurchase: 0,
            maxDiscount: 0,
            usageLimit: 1,
            validFrom: new Date().toISOString().split('T')[0],
            validUntil: '',
            isActive: true,
            applicableCategories: [],
            applicableProducts: [],
            description: ''
        });
        setEditingCoupon(null);
    };
    const getStatusColor = (coupon) => {
        if (!coupon.isActive)
            return 'bg-gray-500';
        if (coupon.usedCount >= coupon.usageLimit)
            return 'bg-red-500';
        if (coupon.validUntil && new Date(coupon.validUntil) < new Date())
            return 'bg-yellow-500';
        return 'bg-green-500';
    };
    const getStatusText = (coupon) => {
        if (!coupon.isActive)
            return 'Inactivo';
        if (coupon.usedCount >= coupon.usageLimit)
            return 'Agotado';
        if (coupon.validUntil && new Date(coupon.validUntil) < new Date())
            return 'Expirado';
        return 'Activo';
    };
    if (loading) {
        return (0, jsx_runtime_1.jsx)("div", { className: "p-8", children: "Cargando cupones..." });
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-8", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold", children: "Gesti\u00F3n de Cupones" }), (0, jsx_runtime_1.jsxs)(dialog_1.Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: resetForm, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }), "Nuevo Cup\u00F3n"] }) }), (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogHeader, { children: (0, jsx_runtime_1.jsx)(dialog_1.DialogTitle, { children: editingCoupon ? 'Editar Cupón' : 'Crear Nuevo Cupón' }) }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "code", children: "C\u00F3digo del Cup\u00F3n" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "code", value: formData.code, onChange: (e) => setFormData(Object.assign(Object.assign({}, formData), { code: e.target.value })), placeholder: "EJEMPLO123", required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "type", children: "Tipo" }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: formData.type, onValueChange: (value) => setFormData(Object.assign(Object.assign({}, formData), { type: value })), children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "percentage", children: "Porcentaje" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "fixed", children: "Valor Fijo" })] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "value", children: formData.type === 'percentage' ? 'Porcentaje (%)' : 'Valor ($)' }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "value", type: "number", value: formData.value, onChange: (e) => setFormData(Object.assign(Object.assign({}, formData), { value: parseFloat(e.target.value) || 0 })), min: "0", max: formData.type === 'percentage' ? "100" : undefined, required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "usageLimit", children: "L\u00EDmite de Uso" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "usageLimit", type: "number", value: formData.usageLimit, onChange: (e) => setFormData(Object.assign(Object.assign({}, formData), { usageLimit: parseInt(e.target.value) || 1 })), min: "1", required: true })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "minPurchase", children: "Compra M\u00EDnima ($)" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "minPurchase", type: "number", value: formData.minPurchase, onChange: (e) => setFormData(Object.assign(Object.assign({}, formData), { minPurchase: parseFloat(e.target.value) || 0 })), min: "0" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "maxDiscount", children: "Descuento M\u00E1ximo ($)" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "maxDiscount", type: "number", value: formData.maxDiscount, onChange: (e) => setFormData(Object.assign(Object.assign({}, formData), { maxDiscount: parseFloat(e.target.value) || 0 })), min: "0" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "validFrom", children: "V\u00E1lido Desde" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "validFrom", type: "date", value: formData.validFrom, onChange: (e) => setFormData(Object.assign(Object.assign({}, formData), { validFrom: e.target.value })), required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "validUntil", children: "V\u00E1lido Hasta (opcional)" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "validUntil", type: "date", value: formData.validUntil, onChange: (e) => setFormData(Object.assign(Object.assign({}, formData), { validUntil: e.target.value })) })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "description", children: "Descripci\u00F3n" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "description", value: formData.description, onChange: (e) => setFormData(Object.assign(Object.assign({}, formData), { description: e.target.value })), placeholder: "Descripci\u00F3n del cup\u00F3n" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Categor\u00EDas Aplicables (opcional)" }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 gap-2 mt-2", children: categories.map((category) => ((0, jsx_runtime_1.jsxs)("label", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: formData.applicableCategories.includes(category), onChange: (e) => {
                                                                        if (e.target.checked) {
                                                                            setFormData(Object.assign(Object.assign({}, formData), { applicableCategories: [...formData.applicableCategories, category] }));
                                                                        }
                                                                        else {
                                                                            setFormData(Object.assign(Object.assign({}, formData), { applicableCategories: formData.applicableCategories.filter(c => c !== category) }));
                                                                        }
                                                                    } }), (0, jsx_runtime_1.jsx)("span", { className: "capitalize", children: category })] }, category))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(switch_1.Switch, { id: "isActive", checked: formData.isActive, onCheckedChange: (checked) => setFormData(Object.assign(Object.assign({}, formData), { isActive: checked })) }), (0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "isActive", children: "Cup\u00F3n Activo" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end space-x-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", variant: "outline", onClick: () => setIsDialogOpen(false), children: "Cancelar" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "submit", children: [editingCoupon ? 'Actualizar' : 'Crear', " Cup\u00F3n"] })] })] })] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid gap-4", children: coupons.map((coupon) => {
                    var _a;
                    return ((0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-mono text-lg", children: coupon.code }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { className: getStatusColor(coupon), children: getStatusText(coupon) })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 mt-1", children: coupon.description || 'Sin descripción' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", onClick: () => handleEdit(coupon), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "h-4 w-4" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", onClick: () => handleDelete(coupon._id), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4" }) })] })] }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [coupon.type === 'percentage' ? ((0, jsx_runtime_1.jsx)(lucide_react_1.Percent, { className: "h-4 w-4 text-purple-600" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { className: "h-4 w-4 text-green-600" })), (0, jsx_runtime_1.jsx)("span", { children: coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}` })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Users, { className: "h-4 w-4 text-blue-600" }), (0, jsx_runtime_1.jsxs)("span", { children: [coupon.usedCount, "/", coupon.usageLimit] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-4 w-4 text-orange-600" }), (0, jsx_runtime_1.jsx)("span", { children: (0, date_fns_1.format)(new Date(coupon.validFrom), 'dd/MM/yyyy', { locale: locale_1.es }) })] }), ((_a = coupon.minPurchase) !== null && _a !== void 0 ? _a : 0) > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { className: "h-4 w-4 text-gray-600" }), (0, jsx_runtime_1.jsxs)("span", { children: ["M\u00EDn: $", coupon.minPurchase] })] }))] }) })] }, coupon._id));
                }) })] }));
}
