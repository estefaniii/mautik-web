"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AddressForm;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const button_1 = require("@/components/ui/button");
const use_toast_1 = require("@/hooks/use-toast");
const data_umd_1 = __importDefault(require("country-region-data/dist/data-umd"));
function AddressForm({ initialAddress, onSave, loading, disabled, noFormWrapper = false }) {
    const { toast } = (0, use_toast_1.useToast)();
    const [address, setAddress] = (0, react_1.useState)({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: ""
    });
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [errors, setErrors] = (0, react_1.useState)({});
    const [success, setSuccess] = (0, react_1.useState)(false);
    const [touched, setTouched] = (0, react_1.useState)({});
    // Estados para selects dependientes
    const [country, setCountry] = (0, react_1.useState)('');
    const [region, setRegion] = (0, react_1.useState)('');
    const [city, setCity] = (0, react_1.useState)('');
    const [regionList, setRegionList] = (0, react_1.useState)([]);
    const [cityList, setCityList] = (0, react_1.useState)([]);
    // Initialize country, region, and city from initialAddress if provided
    (0, react_1.useEffect)(() => {
        if (initialAddress) {
            setAddress(initialAddress);
            setCountry(initialAddress.country || '');
            setRegion(initialAddress.state || '');
            setCity(initialAddress.city || '');
        }
    }, [initialAddress]);
    // Actualizar regiones al cambiar país
    (0, react_1.useEffect)(() => {
        if (country) {
            const found = (data_umd_1.default || []).find((c) => Array.isArray(c) && typeof c[0] === 'string' && c[0] === country);
            setRegionList(found ? found[2].map((r) => Array.isArray(r) && typeof r[0] === 'string' ? r[0] : '') : []);
            setRegion('');
            setCity('');
            setCityList([]);
        }
        else {
            setRegionList([]);
            setRegion('');
            setCity('');
            setCityList([]);
        }
    }, [country]);
    // Actualizar ciudades al cambiar región (si hay datos)
    (0, react_1.useEffect)(() => {
        if (country && region) {
            const found = (data_umd_1.default || []).find((c) => Array.isArray(c) && typeof c[0] === 'string' && c[0] === country);
            const reg = found && Array.isArray(found[2])
                ? found[2].find((r) => Array.isArray(r) && typeof r[0] === 'string' && r[0] === region)
                : undefined;
            if (reg && Array.isArray(reg[2])) {
                setCityList(reg[2]);
            }
            else {
                setCityList([]);
            }
            setCity('');
        }
        else {
            setCityList([]);
            setCity('');
        }
    }, [country, region]);
    const validate = (addr) => {
        const newErrors = {};
        if (!addr.street.trim())
            newErrors.street = "La calle es obligatoria";
        if (!addr.city.trim())
            newErrors.city = "La ciudad es obligatoria";
        if (!addr.state.trim())
            newErrors.state = "La provincia/estado es obligatoria";
        if (!addr.zipCode.trim())
            newErrors.zipCode = "El código postal es obligatorio";
        else if (!/^[A-Za-z0-9]{4,}$/.test(addr.zipCode.trim()))
            newErrors.zipCode = "El código postal debe tener al menos 4 caracteres (letras o números)";
        if (!addr.country.trim())
            newErrors.country = "El país es obligatorio";
        else if (addr.country.trim().length < 2)
            newErrors.country = "El país debe tener al menos 2 caracteres";
        return newErrors;
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => (Object.assign(Object.assign({}, prev), { [name]: value })));
        setErrors(prev => (Object.assign(Object.assign({}, prev), { [name]: undefined })));
    };
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => (Object.assign(Object.assign({}, prev), { [name]: true })));
        const validationErrors = validate(Object.assign(Object.assign({}, address), { [name]: address[name] }));
        setErrors(prev => (Object.assign(Object.assign({}, prev), { [name]: validationErrors[name] })));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess(false);
        const validationErrors = validate(address);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            toast({
                title: "❌ Error",
                description: "Corrige los errores en el formulario.",
                variant: "destructive"
            });
            return;
        }
        setSaving(true);
        try {
            await onSave({
                street: address.street.trim(),
                city: address.city.trim(),
                state: address.state.trim(),
                zipCode: address.zipCode.trim(),
                country: address.country.trim()
            });
            setSuccess(true);
            toast({
                title: "✅ Dirección guardada",
                description: "Tu dirección se guardó correctamente.",
                variant: "default"
            });
        }
        finally {
            setSaving(false);
        }
    };
    const formFields = ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "street", children: "Calle y n\u00FAmero" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "street", name: "street", value: address.street, onChange: handleChange, onBlur: handleBlur, disabled: loading || disabled || saving, autoComplete: "street-address", required: true, className: errors.street && touched.street ? "border-red-500" : "" }), errors.street && (0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-xs mt-1", children: errors.street })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "country", children: "Pa\u00EDs" }), (0, jsx_runtime_1.jsx)(input_1.Input, { list: "country-list", id: "country", name: "country", value: country, onChange: e => {
                            setCountry(e.target.value);
                            setAddress(prev => (Object.assign(Object.assign({}, prev), { country: e.target.value })));
                        }, onBlur: handleBlur, disabled: loading || disabled || saving, autoComplete: "country", required: true, className: `mb-1 border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.country && touched.country ? "border-red-500" : ""}` }), (0, jsx_runtime_1.jsx)("datalist", { id: "country-list", children: (data_umd_1.default || []).map((c, i) => {
                            if (Array.isArray(c) && typeof c[0] === 'string' && typeof c[1] === 'string') {
                                return (0, jsx_runtime_1.jsx)("option", { value: c[0] }, c[1]);
                            }
                            return null;
                        }) }), errors.country && (0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-xs mt-1", children: errors.country })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "state", children: "Provincia/Estado" }), (0, jsx_runtime_1.jsx)(input_1.Input, { list: "region-list", id: "state", name: "state", value: region, onChange: e => {
                            setRegion(e.target.value);
                            setAddress(prev => (Object.assign(Object.assign({}, prev), { state: e.target.value })));
                        }, onBlur: handleBlur, disabled: loading || disabled || saving || !country, autoComplete: "address-level1", required: true, className: `mb-1 border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.state && touched.state ? "border-red-500" : ""}` }), (0, jsx_runtime_1.jsx)("datalist", { id: "region-list", children: regionList.map(r => (0, jsx_runtime_1.jsx)("option", { value: r }, r)) }), errors.state && (0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-xs mt-1", children: errors.state })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "city", children: "Ciudad/Distrito" }), (0, jsx_runtime_1.jsx)(input_1.Input, { list: "city-list", id: "city", name: "city", value: city, onChange: e => {
                            setCity(e.target.value);
                            setAddress(prev => (Object.assign(Object.assign({}, prev), { city: e.target.value })));
                        }, onBlur: handleBlur, disabled: loading || disabled || saving || !region, autoComplete: "address-level2", required: true, className: `mb-1 border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.city && touched.city ? "border-red-500" : ""}` }), (0, jsx_runtime_1.jsx)("datalist", { id: "city-list", children: cityList.map(city => (0, jsx_runtime_1.jsx)("option", { value: city }, city)) }), errors.city && (0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-xs mt-1", children: errors.city })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "zipCode", children: "C\u00F3digo Postal" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "zipCode", name: "zipCode", value: address.zipCode, onChange: handleChange, onBlur: handleBlur, disabled: loading || disabled || saving, autoComplete: "postal-code", required: true, className: errors.zipCode && touched.zipCode ? "border-red-500" : "" }), errors.zipCode && (0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-xs mt-1", children: errors.zipCode })] }), !noFormWrapper && ((0, jsx_runtime_1.jsx)(button_1.Button, { type: "submit", disabled: loading || disabled || saving, className: "w-full mt-2", children: saving || loading ? "Guardando..." : "Guardar dirección" })), success && (0, jsx_runtime_1.jsx)("p", { className: "text-green-600 text-sm mt-2", children: "\u00A1Direcci\u00F3n guardada correctamente!" })] }));
    if (noFormWrapper) {
        return (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: formFields });
    }
    return ((0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, className: "space-y-4", children: formFields }));
}
