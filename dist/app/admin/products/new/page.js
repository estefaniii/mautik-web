"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NewProductPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const input_1 = require("@/components/ui/input");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const use_toast_1 = require("@/hooks/use-toast");
const image_upload_1 = __importDefault(require("@/components/image-upload"));
function NewProductPage() {
    const { toast } = (0, use_toast_1.useToast)();
    const router = (0, navigation_1.useRouter)();
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [product, setProduct] = (0, react_1.useState)({
        name: "",
        description: "",
        price: "",
        category: "",
        images: [""],
        stock: "",
        sku: "",
        discount: "0",
        isNew: false,
        featured: false,
    });
    const [formErrors, setFormErrors] = (0, react_1.useState)({});
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        // Si el campo es numérico, mantener como string para evitar problemas de valores vacíos
        const numericFields = ["price", "stock", "discount"];
        setProduct((prev) => (Object.assign(Object.assign({}, prev), { [name]: type === "checkbox"
                ? checked
                : numericFields.includes(name)
                    ? value
                    : value })));
    };
    const handleImageChange = (e, idx) => {
        const { value } = e.target;
        setProduct((prev) => {
            const images = [...(prev.images || [""])];
            images[idx] = value;
            return Object.assign(Object.assign({}, prev), { images });
        });
    };
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormErrors({});
        try {
            // Convertir price, stock y discount a número antes de enviar
            const payload = Object.assign(Object.assign({}, product), { price: product.price === "" ? 0 : Number(product.price), stock: product.stock === "" ? 0 : Number(product.stock), discount: product.discount === "" ? 0 : Number(product.discount), sku: product.sku });
            // Eliminar cualquier campo id del payload
            if ('id' in payload) {
                delete payload.id;
            }
            const res = await fetch(`/api/products`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                const data = await res.json();
                toast({ title: "Producto creado", description: "El producto ha sido creado." });
                // Redirigir a la edición del producto recién creado usando el ID real
                if (data.product && data.product.id) {
                    router.push(`/admin/products/${data.product.id}/edit`);
                }
                else {
                    router.push("/admin?page=products");
                }
            }
            else {
                const data = await res.json();
                toast({ title: "Error", description: data.error || "No se pudo crear el producto", variant: "destructive" });
                if (data.error) {
                    setFormErrors({ general: data.error });
                }
            }
        }
        catch (e) {
            toast({ title: "Error", description: "No se pudo crear el producto", variant: "destructive" });
        }
        finally {
            setSaving(false);
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "max-w-xl mx-auto py-8", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Nuevo Producto" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSave, className: "space-y-4", children: [formErrors.general && (0, jsx_runtime_1.jsx)("div", { className: "text-red-500 text-sm mb-2", children: formErrors.general }), (0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", htmlFor: "name", children: "Nombre" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "name", name: "name", placeholder: "Nombre", value: product.name, onChange: handleChange, required: true }), (0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", htmlFor: "description", children: "Descripci\u00F3n" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "description", name: "description", placeholder: "Descripci\u00F3n", value: product.description, onChange: handleChange, required: true }), (0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", htmlFor: "price", children: "Precio" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "price", name: "price", type: "number", min: "0", step: "0.01", value: product.price, onChange: handleChange, required: true }), (0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", htmlFor: "category", children: "Categor\u00EDa" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "category", name: "category", placeholder: "Categor\u00EDa", value: product.category, onChange: handleChange, required: true }), (0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", htmlFor: "stock", children: "Stock" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "stock", name: "stock", type: "number", min: "0", value: product.stock, onChange: handleChange, required: true }), (0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", htmlFor: "discount", children: "Descuento (%)" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "discount", name: "discount", type: "number", min: "0", max: "100", value: product.discount, onChange: handleChange }), (0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", htmlFor: "sku", children: "SKU" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "sku", name: "sku", placeholder: "SKU \u00FAnico", value: product.sku, onChange: handleChange, required: true, minLength: 2 }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Im\u00E1genes" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2 mb-2", children: (product.images || []).map((img, idx) => ((0, jsx_runtime_1.jsxs)("div", { className: "relative group", children: [(0, jsx_runtime_1.jsx)("img", { src: img, alt: `Imagen ${idx + 1}`, className: "w-20 h-20 object-cover rounded border" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => {
                                                        setProduct(prev => (Object.assign(Object.assign({}, prev), { images: prev.images.filter((_, i) => i !== idx) })));
                                                    }, className: "absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity", children: "\u00D7" })] }, idx))) }), (0, jsx_runtime_1.jsx)(image_upload_1.default, { onImageUpload: url => setProduct(prev => (Object.assign(Object.assign({}, prev), { images: [...(prev.images || []), url] }))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-4 items-center", children: [(0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", name: "isNew", checked: !!product.isNew, onChange: handleChange }), " Nuevo"] }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", name: "featured", checked: !!product.featured, onChange: handleChange }), " Destacado"] })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "submit", disabled: saving, children: [saving ? (0, jsx_runtime_1.jsx)("span", { className: "animate-spin mr-2", children: "\u23F3" }) : null, saving ? "Guardando..." : "Crear Producto"] })] }) })] }) }));
}
