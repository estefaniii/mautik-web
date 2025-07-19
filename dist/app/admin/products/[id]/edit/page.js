"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EditProductPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const input_1 = require("@/components/ui/input");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const use_toast_1 = require("@/hooks/use-toast");
const image_upload_1 = __importDefault(require("@/components/image-upload"));
const link_1 = __importDefault(require("next/link"));
function EditProductPage() {
    const { toast } = (0, use_toast_1.useToast)();
    const router = (0, navigation_1.useRouter)();
    const params = (0, navigation_1.useParams)();
    const { id } = params;
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [product, setProduct] = (0, react_1.useState)({
        name: "",
        description: "",
        price: "",
        category: "",
        images: [""],
        stock: "",
        discount: "0",
        isNew: false,
        featured: false,
    });
    const [formErrors, setFormErrors] = (0, react_1.useState)({});
    (0, react_1.useEffect)(() => {
        async function fetchProduct() {
            var _a, _b, _c;
            setLoading(true);
            try {
                const res = await fetch(`/api/products/${id}`);
                const data = await res.json();
                if (data.product) {
                    setProduct(Object.assign(Object.assign({}, data.product), { price: ((_a = data.product.price) === null || _a === void 0 ? void 0 : _a.toString()) || "", stock: ((_b = data.product.stock) === null || _b === void 0 ? void 0 : _b.toString()) || "", discount: ((_c = data.product.discount) === null || _c === void 0 ? void 0 : _c.toString()) || "0" }));
                }
            }
            catch (e) {
                toast({ title: "Error", description: "No se pudo cargar el producto", variant: "destructive" });
            }
            finally {
                setLoading(false);
            }
        }
        if (id)
            fetchProduct();
    }, [id]);
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
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
            const payload = Object.assign(Object.assign({}, product), { price: product.price === "" ? 0 : Number(product.price), stock: product.stock === "" ? 0 : Number(product.stock), discount: product.discount === "" ? 0 : Number(product.discount) });
            const res = await fetch(`/api/products/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                toast({ title: "Producto actualizado", description: "Los cambios se han guardado." });
                router.push("/admin?page=products");
            }
            else {
                const data = await res.json();
                toast({ title: "Error", description: data.error || "No se pudo actualizar el producto", variant: "destructive" });
                // Mostrar errores de validación específicos
                if (data.error) {
                    setFormErrors({ general: data.error });
                }
            }
        }
        catch (e) {
            toast({ title: "Error", description: "No se pudo actualizar el producto", variant: "destructive" });
        }
        finally {
            setSaving(false);
        }
    };
    if (loading)
        return (0, jsx_runtime_1.jsx)("div", { className: "p-8 text-center", children: "Cargando producto..." });
    return ((0, jsx_runtime_1.jsx)("div", { className: "max-w-xl mx-auto py-8", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Editar Producto" }), (0, jsx_runtime_1.jsx)(link_1.default, { href: `/product/${id}`, target: "_blank", rel: "noopener noreferrer", children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", children: "Ver producto" }) })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSave, className: "space-y-4", children: [formErrors.general && (0, jsx_runtime_1.jsx)("div", { className: "text-red-500 text-sm mb-2", children: formErrors.general }), (0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", htmlFor: "name", children: "Nombre" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "name", name: "name", placeholder: "Nombre", value: product.name, onChange: handleChange, required: true }), (0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", htmlFor: "description", children: "Descripci\u00F3n" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "description", name: "description", placeholder: "Descripci\u00F3n", value: product.description, onChange: handleChange, required: true }), (0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", htmlFor: "price", children: "Precio" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "price", name: "price", type: "number", min: "0", step: "0.01", value: product.price, onChange: handleChange, required: true }), (0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", htmlFor: "category", children: "Categor\u00EDa" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "category", name: "category", placeholder: "Categor\u00EDa", value: product.category, onChange: handleChange, required: true }), (0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", htmlFor: "stock", children: "Stock" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "stock", name: "stock", type: "number", min: "0", value: product.stock, onChange: handleChange, required: true }), (0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", htmlFor: "discount", children: "Descuento (%)" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "discount", name: "discount", type: "number", min: "0", max: "100", value: product.discount, onChange: handleChange }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Im\u00E1genes" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2 mb-2", children: (product.images || []).map((img, idx) => ((0, jsx_runtime_1.jsxs)("div", { className: "relative group", children: [(0, jsx_runtime_1.jsx)("img", { src: img, alt: `Imagen ${idx + 1}`, className: "w-20 h-20 object-cover rounded border" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => {
                                                        setProduct(prev => (Object.assign(Object.assign({}, prev), { images: prev.images.filter((_, i) => i !== idx) })));
                                                    }, className: "absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity", children: "\u00D7" })] }, idx))) }), (0, jsx_runtime_1.jsx)(image_upload_1.default, { onImageUpload: url => setProduct(prev => (Object.assign(Object.assign({}, prev), { images: [...(prev.images || []), url] }))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-4 items-center", children: [(0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", name: "isNew", checked: !!product.isNew, onChange: handleChange }), " Nuevo"] }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", name: "featured", checked: !!product.featured, onChange: handleChange }), " Destacado"] })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "submit", disabled: saving, className: "w-full mt-4", children: [saving ? (0, jsx_runtime_1.jsx)("span", { className: "animate-spin mr-2", children: "\u23F3" }) : null, saving ? "Guardando..." : "Guardar Cambios"] }), saving === false && !formErrors.general && ((0, jsx_runtime_1.jsx)("div", { className: "text-green-600 text-sm mt-2", children: "Cambios guardados correctamente." }))] }) })] }) }));
}
