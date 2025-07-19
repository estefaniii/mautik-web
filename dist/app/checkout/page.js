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
exports.default = CheckoutPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const cart_context_1 = require("@/context/cart-context");
const auth_context_1 = require("@/context/auth-context");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const use_toast_1 = require("@/hooks/use-toast");
const link_1 = __importDefault(require("next/link"));
const dynamic_1 = __importDefault(require("next/dynamic"));
const auth_guard_1 = __importDefault(require("@/components/auth-guard"));
const address_form_1 = __importDefault(require("@/components/address-form"));
const lucide_react_1 = require("lucide-react");
const paypal_button_1 = __importDefault(require("@/components/paypal-button"));
const react_stripe_js_1 = require("@stripe/react-stripe-js");
const stripe_js_1 = require("@stripe/stripe-js");
const payment_form_1 = __importDefault(require("@/components/payment-form"));
const order_summary_sticky_1 = __importDefault(require("@/components/order-summary-sticky"));
const CartRecommendations = (0, dynamic_1.default)(() => Promise.resolve().then(() => __importStar(require("@/components/cart-recommendations"))), { ssr: false });
function getCardIcon(brand) {
    switch ((brand || "").toLowerCase()) {
        case "visa": return (0, jsx_runtime_1.jsx)("img", { src: "/payment-visa.png", alt: "Visa", className: "h-6 inline" });
        case "mastercard": return (0, jsx_runtime_1.jsx)("img", { src: "/payment-mastercard.png", alt: "Mastercard", className: "h-6 inline" });
        case "paypal": return (0, jsx_runtime_1.jsx)("img", { src: "/payment-paypal.png", alt: "Paypal", className: "h-6 inline" });
        default: return (0, jsx_runtime_1.jsx)(lucide_react_1.CreditCard, { className: "h-5 w-5 text-indigo-600 inline" });
    }
}
function CheckoutPage() {
    const { cart, updateQuantity, clearCart } = (0, cart_context_1.useCart)();
    const { user } = (0, auth_context_1.useAuth)();
    const { toast } = (0, use_toast_1.useToast)();
    const router = (0, navigation_1.useRouter)();
    const [form, setForm] = (0, react_1.useState)({
        name: "",
        email: "",
        phone: "",
        address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "México"
        },
        payment: "card"
    });
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [submitted, setSubmitted] = (0, react_1.useState)(false);
    const [paymentMethods, setPaymentMethods] = (0, react_1.useState)([]);
    const [selectedPaymentId, setSelectedPaymentId] = (0, react_1.useState)(null);
    const [showNewCard, setShowNewCard] = (0, react_1.useState)(false);
    const [newCardForm, setNewCardForm] = (0, react_1.useState)({
        brand: "Visa",
        last4: "",
        expMonth: "",
        expYear: "",
        isDefault: false,
    });
    const [savingCard, setSavingCard] = (0, react_1.useState)(false);
    const [newCardError, setNewCardError] = (0, react_1.useState)(null);
    const [addresses, setAddresses] = (0, react_1.useState)([]);
    const [selectedAddressId, setSelectedAddressId] = (0, react_1.useState)(null);
    const [showNewAddress, setShowNewAddress] = (0, react_1.useState)(false);
    const [addressLoading, setAddressLoading] = (0, react_1.useState)(false);
    const [addressError, setAddressError] = (0, react_1.useState)(null);
    const nameRef = (0, react_1.useRef)(null);
    const [editingPayment, setEditingPayment] = (0, react_1.useState)(null);
    const [deletingPaymentId, setDeletingPaymentId] = (0, react_1.useState)(null);
    const [editForm, setEditForm] = (0, react_1.useState)({ brand: "Visa", last4: "", expMonth: "", expYear: "", isDefault: false });
    const [savingEdit, setSavingEdit] = (0, react_1.useState)(false);
    const [cardForm, setCardForm] = (0, react_1.useState)({
        number: "",
        name: "",
        expMonth: "",
        expYear: "",
        cvv: "",
        isDefault: false,
    });
    const [cardBrand, setCardBrand] = (0, react_1.useState)("");
    const [cardErrors, setCardErrors] = (0, react_1.useState)({});
    const [showStripeSuccess, setShowStripeSuccess] = (0, react_1.useState)(null);
    const [stockMessages, setStockMessages] = (0, react_1.useState)({});
    const prevStocks = (0, react_1.useRef)({});
    // 1. Add state for editing address
    const [editingAddress, setEditingAddress] = (0, react_1.useState)(null);
    // Add state for real-time validation
    const [personalErrors, setPersonalErrors] = (0, react_1.useState)({});
    const [personalTouched, setPersonalTouched] = (0, react_1.useState)({});
    // Add state for real-time validation of new card form
    const [cardTouched, setCardTouched] = (0, react_1.useState)({});
    // 1. Estado para edición inline de direcciones
    const [editingAddressId, setEditingAddressId] = (0, react_1.useState)(null);
    const [editAddressForm, setEditAddressForm] = (0, react_1.useState)(null);
    // 2. Función para iniciar edición inline
    const startEditAddress = (address) => {
        setEditingAddressId(address.id);
        setEditAddressForm(Object.assign({}, address));
    };
    // 3. Función para cancelar edición
    const cancelEditAddress = () => {
        setEditingAddressId(null);
        setEditAddressForm(null);
    };
    // 4. Función para guardar edición inline
    const saveEditAddress = async () => {
        setAddressLoading(true);
        setAddressError(null);
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
            const res = await fetch(`/api/addresses/${editingAddressId}`, {
                method: "PUT",
                headers: Object.assign({ "Content-Type": "application/json" }, (token ? { Authorization: `Bearer ${token}` } : {})),
                body: JSON.stringify(editAddressForm),
            });
            if (!res.ok)
                throw new Error("Error al editar dirección");
            const updated = await res.json();
            setAddresses((prev) => prev.map(a => a.id === updated.id ? updated : a));
            setEditingAddressId(null);
            setEditAddressForm(null);
            toast && toast({ title: "Dirección actualizada", description: "La dirección fue actualizada correctamente.", variant: "default" });
        }
        catch (err) {
            const errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
            setAddressError(errorToUse.message || "Error desconocido");
            toast && toast({ title: "Error", description: errorToUse.message || "Error desconocido", variant: "destructive" });
        }
        finally {
            setAddressLoading(false);
        }
    };
    // 1. Estado para edición inline de métodos de pago
    const [editingPaymentId, setEditingPaymentId] = (0, react_1.useState)(null);
    const [editPaymentForm, setEditPaymentForm] = (0, react_1.useState)(null);
    // 2. Función para iniciar edición inline
    const startEditPayment = (m) => {
        setEditingPaymentId(m.id);
        setEditPaymentForm(Object.assign({}, m));
    };
    // 3. Función para cancelar edición
    const cancelEditPayment = () => {
        setEditingPaymentId(null);
        setEditPaymentForm(null);
    };
    // 4. Función para guardar edición inline
    const saveEditPayment = async () => {
        setSavingEdit(true);
        try {
            const res = await fetch(`/api/payment-methods/${editingPaymentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editPaymentForm),
            });
            if (!res.ok)
                throw new Error("Error al editar método de pago");
            const updated = await res.json();
            setPaymentMethods((prev) => prev.map(m => m.id === updated.id ? updated : m));
            setEditingPaymentId(null);
            setEditPaymentForm(null);
            toast && toast({ title: "Método actualizado", description: "El método de pago fue actualizado correctamente.", variant: "default" });
        }
        catch (err) {
            toast && toast({ title: "Error", description: (err === null || err === void 0 ? void 0 : err.message) || "Error desconocido", variant: "destructive" });
        }
        finally {
            setSavingEdit(false);
        }
    };
    const validatePersonal = (field, value) => {
        switch (field) {
            case 'name':
                if (!value.trim())
                    return 'El nombre es obligatorio';
                break;
            case 'email':
                if (!value.trim())
                    return 'El email es obligatorio';
                if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value))
                    return 'Email inválido';
                break;
            case 'phone':
                if (!value.trim())
                    return 'El teléfono es obligatorio';
                if (!/^\+?\d{7,15}$/.test(value.replace(/\s/g, "")))
                    return 'Teléfono inválido';
                break;
        }
        return '';
    };
    const handlePersonalBlur = (e) => {
        const { name, value } = e.target;
        setPersonalTouched(prev => (Object.assign(Object.assign({}, prev), { [name]: true })));
        const error = validatePersonal(name, value);
        setPersonalErrors(prev => (Object.assign(Object.assign({}, prev), { [name]: error })));
    };
    const handlePersonalChange = (e) => {
        handleChange(e);
        const { name, value } = e.target;
        if (personalTouched[name]) {
            const error = validatePersonal(name, value);
            setPersonalErrors(prev => (Object.assign(Object.assign({}, prev), { [name]: error })));
        }
    };
    // Validación Luhn
    function isValidCardNumber(number) {
        const n = number.replace(/\D/g, "");
        let sum = 0, shouldDouble = false;
        for (let i = n.length - 1; i >= 0; i--) {
            let digit = parseInt(n.charAt(i));
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9)
                    digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
    }
    // Nueva función para detectar marca de tarjeta
    function detectCardBrand(number) {
        const n = number.replace(/\D/g, "");
        if (/^4/.test(n))
            return "Visa";
        if (/^5[1-5]/.test(n))
            return "Mastercard";
        return "";
    }
    // Manejar cambios en el formulario de tarjeta
    const handleCardInput = (e) => {
        const { name, value } = e.target;
        setCardForm(f => (Object.assign(Object.assign({}, f), { [name]: value })));
        if (name === "number") {
            setCardBrand(detectCardBrand(value));
        }
        setCardErrors((prev) => (Object.assign(Object.assign({}, prev), { [name]: undefined })));
    };
    // Validar y guardar nueva tarjeta
    const handleAddNewCardModern = async (e) => {
        e.preventDefault();
        const errors = {};
        const n = cardForm.number.replace(/\D/g, "");
        if (!n || n.length < 16 || !isValidCardNumber(n))
            errors.number = "Número inválido";
        if (!cardBrand || !["Visa", "Mastercard"].includes(cardBrand))
            errors.number = "Solo Visa o Mastercard";
        if (!cardForm.name.trim())
            errors.name = "Nombre requerido";
        if (!cardForm.expMonth.match(/^\d{2}$/) || +cardForm.expMonth < 1 || +cardForm.expMonth > 12)
            errors.expMonth = "Mes inválido";
        if (!cardForm.expYear.match(/^\d{2}$/))
            errors.expYear = "Año inválido (2 dígitos)";
        if (!cardForm.cvv.match(/^\d{3}$/))
            errors.cvv = "CVV inválido";
        setCardErrors(errors);
        if (Object.keys(errors).length > 0)
            return;
        setSavingCard(true);
        try {
            const res = await fetch("/api/payment-methods", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "card",
                    brand: cardBrand,
                    last4: n.slice(-4),
                    expMonth: +cardForm.expMonth,
                    expYear: +cardForm.expYear,
                    isDefault: cardForm.isDefault,
                    name: cardForm.name,
                })
            });
            if (!res.ok)
                throw new Error("Error al guardar tarjeta");
            const data = await res.json();
            setPaymentMethods((prev) => [...prev, data]);
            setSelectedPaymentId(data.id);
            setShowNewCard(false);
            setCardForm({ number: "", name: "", expMonth: "", expYear: "", cvv: "", isDefault: false });
            setCardBrand("");
            toast({ title: "Tarjeta guardada", description: "Tarjeta agregada correctamente.", variant: "default" });
        }
        catch (err) {
            const errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
            toast({ title: "Error", description: errorToUse.message || "Error desconocido", variant: "destructive" });
        }
        finally {
            setSavingCard(false);
        }
    };
    // Cargar datos del usuario autenticado al inicializar
    (0, react_1.useEffect)(() => {
        var _a, _b, _c, _d, _e;
        if (user) {
            setForm({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                address: {
                    street: ((_a = user.address) === null || _a === void 0 ? void 0 : _a.street) || "",
                    city: ((_b = user.address) === null || _b === void 0 ? void 0 : _b.city) || "",
                    state: ((_c = user.address) === null || _c === void 0 ? void 0 : _c.state) || "",
                    zipCode: ((_d = user.address) === null || _d === void 0 ? void 0 : _d.zipCode) || "",
                    country: ((_e = user.address) === null || _e === void 0 ? void 0 : _e.country) || "México"
                },
                payment: "card"
            });
        }
    }, [user]);
    // Enfocar el primer campo editable al cargar
    (0, react_1.useEffect)(() => {
        if (nameRef.current) {
            nameRef.current.focus();
        }
    }, []);
    // Obtener direcciones guardadas
    (0, react_1.useEffect)(() => {
        async function fetchAddresses() {
            if (!user)
                return;
            setAddressLoading(true);
            setAddressError(null);
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
                const res = await fetch("/api/addresses", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok)
                    throw new Error("Error al cargar direcciones");
                const data = await res.json();
                setAddresses(data);
                // Seleccionar la predeterminada
                const def = data.find((a) => a.isDefault) || data[0];
                if (def)
                    setSelectedAddressId(def.id);
            }
            catch (err) {
                const errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
                setAddressError(errorToUse.message || "Error desconocido");
            }
            finally {
                setAddressLoading(false);
            }
        }
        fetchAddresses();
    }, [user]);
    // Cargar métodos de pago guardados
    (0, react_1.useEffect)(() => {
        async function fetchMethods() {
            if (!user)
                return;
            try {
                const res = await fetch("/api/payment-methods");
                if (!res.ok)
                    return;
                const data = await res.json();
                setPaymentMethods(data);
                // Seleccionar default automáticamente
                const def = data.find((m) => m.isDefault) || data[0];
                if (def) {
                    setSelectedPaymentId(def.id);
                    setForm(f => (Object.assign(Object.assign({}, f), { payment: def.id })));
                }
            }
            catch (_a) { }
        }
        fetchMethods();
    }, [user]);
    (0, react_1.useEffect)(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(addresses[0].id);
        }
    }, [addresses, selectedAddressId]);
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 10; // Fixed shipping cost
    const total = subtotal + shipping;
    const validate = () => {
        if (!form.name.trim() || !form.email.trim() || !form.phone.trim() ||
            !form.address.street.trim() || !form.address.city.trim() ||
            !form.address.state.trim() || !form.address.zipCode.trim() ||
            !form.address.country.trim()) {
            toast({
                title: "Campos requeridos",
                description: "Por favor completa todos los campos.",
                variant: "destructive"
            });
            return false;
        }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
            toast({
                title: "Email inválido",
                description: "Por favor ingresa un email válido.",
                variant: "destructive"
            });
            return false;
        }
        if (!/^\+?\d{7,15}$/.test(form.phone.replace(/\s/g, ""))) {
            toast({
                title: "Teléfono inválido",
                description: "Por favor ingresa un teléfono válido.",
                variant: "destructive"
            });
            return false;
        }
        return true;
    };
    const handleChange = (e) => {
        setForm(Object.assign(Object.assign({}, form), { [e.target.name]: e.target.value }));
    };
    const handleAddressChange = (address) => {
        setForm(Object.assign(Object.assign({}, form), { address }));
    };
    const handlePaymentChange = (e) => {
        if (e.target.name === "paymentMethodRadio") {
            setSelectedPaymentId(e.target.value);
            setShowNewCard(false);
            setForm(f => (Object.assign(Object.assign({}, f), { payment: e.target.value })));
        }
        else if (e.target.name === "payment") {
            setForm(Object.assign(Object.assign({}, form), { payment: e.target.value }));
            if (e.target.value === "new") {
                setShowNewCard(true);
                setSelectedPaymentId(null);
            }
            else {
                setShowNewCard(false);
            }
        }
        else {
            handleChange(e);
        }
    };
    const handleNewCardChange = (e) => {
        setNewCardForm(Object.assign(Object.assign({}, newCardForm), { [e.target.name]: e.target.value }));
    };
    const handleAddNewCard = async (e) => {
        e.preventDefault();
        setNewCardError(null);
        // Validación básica
        if (!newCardForm.last4.match(/^\d{4}$/)) {
            setNewCardError("Los últimos 4 dígitos deben ser 4 números");
            return;
        }
        if (!newCardForm.expMonth.match(/^\d{1,2}$/) || +newCardForm.expMonth < 1 || +newCardForm.expMonth > 12) {
            setNewCardError("Mes inválido");
            return;
        }
        if (!newCardForm.expYear.match(/^\d{2,4}$/)) {
            setNewCardError("Año inválido");
            return;
        }
        setSavingCard(true);
        try {
            const res = await fetch("/api/payment-methods", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "card",
                    brand: newCardForm.brand,
                    last4: newCardForm.last4,
                    expMonth: +newCardForm.expMonth,
                    expYear: +newCardForm.expYear,
                    isDefault: false,
                }),
            });
            if (!res.ok)
                throw new Error("Error al guardar la tarjeta");
            const data = await res.json();
            setPaymentMethods((prev) => [...prev, data]);
            setSelectedPaymentId(data.id);
            setForm(f => (Object.assign(Object.assign({}, f), { payment: data.id })));
            setShowNewCard(false);
            setNewCardForm({ brand: "Visa", last4: "", expMonth: "", expYear: "", isDefault: false });
        }
        catch (err) {
            const errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
            setNewCardError(errorToUse.message || "Error desconocido");
        }
        finally {
            setSavingCard(false);
        }
    };
    // Nueva función para agregar dirección desde el checkout
    const handleSaveNewAddress = async (address) => {
        setAddressLoading(true);
        setAddressError(null);
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
            const res = await fetch("/api/addresses", {
                method: "POST",
                headers: Object.assign({ "Content-Type": "application/json" }, (token ? { Authorization: `Bearer ${token}` } : {})),
                body: JSON.stringify({
                    alias: "Checkout",
                    recipientName: form.name,
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    zipCode: address.zipCode,
                    country: address.country,
                    phone: form.phone,
                    isDefault: addresses.length === 0,
                })
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Error al guardar dirección");
            }
            const data = await res.json();
            setAddresses((prev) => [...prev, data]);
            setSelectedAddressId(data.id);
            setShowNewAddress(false);
            toast({ title: "Dirección guardada", description: "La dirección fue guardada correctamente.", variant: "default" });
        }
        catch (err) {
            const errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
            setAddressError(errorToUse.message || "Error desconocido");
            toast({ title: "Error", description: errorToUse.message || "Error desconocido", variant: "destructive" });
        }
        finally {
            setAddressLoading(false);
        }
    };
    // 1. Eliminar dirección desde el checkout
    const handleDeleteAddress = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta dirección?"))
            return;
        setAddressLoading(true);
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
            const res = await fetch(`/api/addresses/${id}`, {
                method: "DELETE",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok)
                throw new Error("Error al eliminar dirección");
            const updated = addresses.filter((a) => a.id !== id);
            setAddresses(updated);
            toast({ title: "Dirección eliminada", description: "La dirección fue eliminada correctamente.", variant: "default" });
            // Si la dirección eliminada era la seleccionada, seleccionar otra
            if (selectedAddressId === id && updated.length > 0) {
                setSelectedAddressId(updated[0].id);
            }
            else if (updated.length === 0) {
                setSelectedAddressId(null);
            }
        }
        catch (err) {
            const errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
            toast({ title: "Error", description: errorToUse.message || "Error desconocido", variant: "destructive" });
        }
        finally {
            setAddressLoading(false);
        }
    };
    // Polling para actualizar stock de todos los productos cada 20s
    (0, react_1.useEffect)(() => {
        const interval = setInterval(async () => {
            var _a;
            const updates = {};
            for (const item of cart) {
                try {
                    const res = await fetch(`/api/products/${item.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (typeof data.stock === 'number' && data.stock !== item.stock) {
                            updates[item.id] = data.stock;
                            if (data.stock < ((_a = prevStocks.current[item.id]) !== null && _a !== void 0 ? _a : item.stock)) {
                                setStockMessages(msgs => (Object.assign(Object.assign({}, msgs), { [item.id]: 'El stock ha bajado, ajustamos tu carrito.' })));
                            }
                            prevStocks.current[item.id] = data.stock;
                        }
                    }
                }
                catch (_b) { }
            }
            if (Object.keys(updates).length > 0) {
                for (const id in updates) {
                    const item = cart.find(i => i.id === id);
                    if (item && item.quantity > updates[id]) {
                        updateQuantity(id, updates[id]);
                    }
                }
            }
        }, 20000);
        return () => clearInterval(interval);
    }, [cart]);
    // Validar stock antes de enviar el pedido
    const fetchLatestStocks = async () => {
        let ok = true;
        for (const item of cart) {
            const res = await fetch(`/api/products/${item.id}`);
            if (res.ok) {
                const data = await res.json();
                if (typeof data.stock === 'number') {
                    if (data.stock !== item.stock) {
                        if (data.stock < item.quantity) {
                            updateQuantity(item.id, data.stock);
                            setStockMessages(msgs => (Object.assign(Object.assign({}, msgs), { [item.id]: 'El stock ha cambiado, ajustamos tu carrito.' })));
                            ok = false;
                        }
                    }
                }
            }
        }
        return ok;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validar stock antes de continuar
        const ok = await fetchLatestStocks();
        if (!ok) {
            toast({
                title: "Stock insuficiente",
                description: `Algunos productos han cambiado de stock. Ajusta tu carrito antes de continuar.`,
                variant: "destructive"
            });
            return;
        }
        if (!selectedAddressId) {
            toast({ title: "Selecciona una dirección", description: "Debes seleccionar una dirección de envío.", variant: "destructive" });
            return;
        }
        if (!selectedPaymentId) {
            toast({ title: "Selecciona un método de pago", description: "Debes seleccionar un método de pago.", variant: "destructive" });
            return;
        }
        // Buscar la dirección seleccionada
        const shippingAddress = addresses.find((a) => a.id === selectedAddressId);
        if (!shippingAddress) {
            toast({ title: "Error", description: "Dirección seleccionada no encontrada.", variant: "destructive" });
            return;
        }
        if (!validate())
            return;
        setLoading(true);
        try {
            // Preparar los datos del pedido
            const orderData = {
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                })),
                address: shippingAddress, // Usar la dirección seleccionada
                name: form.name,
                email: form.email,
                phone: form.phone,
                payment: selectedPaymentId || form.payment,
                totalAmount: total,
            };
            // Hacer POST al backend
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderData),
            });
            if (!res.ok) {
                const error = await res.json();
                toast({
                    title: "Error al registrar el pedido",
                    description: error.message || "Intenta de nuevo más tarde.",
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }
            setLoading(false);
            setSubmitted(true);
            clearCart();
            toast({
                title: "¡Pedido realizado!",
                description: "Tu pedido ha sido registrado exitosamente.",
            });
            setTimeout(() => {
                router.push("/orders");
            }, 2000);
        }
        catch (err) {
            setLoading(false);
            toast({
                title: "Error de red",
                description: "No se pudo conectar con el servidor. Intenta de nuevo.",
                variant: "destructive"
            });
        }
    };
    // Editar método de pago
    const handleEditPayment = (m) => {
        setEditForm({
            brand: m.brand || "Visa",
            last4: m.last4 || "",
            expMonth: m.expMonth ? String(m.expMonth) : "",
            expYear: m.expYear ? String(m.expYear) : "",
            isDefault: !!m.isDefault,
        });
        setEditingPayment(m);
    };
    const handleEditFormChange = (e) => {
        setEditForm(Object.assign(Object.assign({}, editForm), { [e.target.name]: e.target.value }));
    };
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setSavingEdit(true);
        try {
            const res = await fetch(`/api/payment-methods/${editingPayment.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "card",
                    brand: editForm.brand,
                    last4: editForm.last4,
                    expMonth: +editForm.expMonth,
                    expYear: +editForm.expYear,
                    isDefault: editForm.isDefault,
                }),
            });
            if (!res.ok)
                throw new Error("Error al editar método de pago");
            toast({ title: "Método actualizado", description: "La tarjeta fue actualizada.", variant: "default" });
            setEditingPayment(null);
            // Refrescar métodos
            const data = await fetch("/api/payment-methods").then(r => r.json());
            setPaymentMethods(data);
        }
        catch (err) {
            const errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
            toast({ title: "Error", description: errorToUse.message || "Error desconocido", variant: "destructive" });
        }
        finally {
            setSavingEdit(false);
        }
    };
    // Eliminar método de pago
    const handleDeletePayment = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta tarjeta?"))
            return;
        setDeletingPaymentId(id);
        try {
            const res = await fetch(`/api/payment-methods/${id}`, { method: "DELETE" });
            if (!res.ok)
                throw new Error("Error al eliminar método de pago");
            toast({ title: "Tarjeta eliminada", description: "La tarjeta fue eliminada.", variant: "default" });
            // Refrescar métodos
            const data = await fetch("/api/payment-methods").then(r => r.json());
            setPaymentMethods(data);
            // Si el método eliminado era el seleccionado, seleccionar otro
            if (selectedPaymentId === id && data.length > 0) {
                setSelectedPaymentId(data[0].id);
            }
            else if (data.length === 0) {
                setSelectedPaymentId(null);
            }
        }
        catch (err) {
            const errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
            toast({ title: "Error", description: errorToUse.message || "Error desconocido", variant: "destructive" });
        }
        finally {
            setDeletingPaymentId(null);
        }
    };
    // Add state for real-time validation of new card form
    const validateCardField = (field, value) => {
        switch (field) {
            case 'number': {
                const n = value.replace(/\D/g, "");
                if (!n || n.length < 16 || !isValidCardNumber(n))
                    return 'Número inválido';
                if (!detectCardBrand(value) || !["Visa", "Mastercard"].includes(detectCardBrand(value)))
                    return 'Solo Visa o Mastercard';
                break;
            }
            case 'name':
                if (!value.trim())
                    return 'Nombre requerido';
                break;
            case 'expMonth':
                if (!value.match(/^\d{2}$/) || +value < 1 || +value > 12)
                    return 'Mes inválido';
                break;
            case 'expYear':
                if (!value.match(/^\d{2}$/))
                    return 'Año inválido (2 dígitos)';
                break;
            case 'cvv':
                if (!value.match(/^\d{3}$/))
                    return 'CVV inválido';
                break;
        }
        return '';
    };
    const handleCardBlur = (e) => {
        const { name, value } = e.target;
        setCardTouched(prev => (Object.assign(Object.assign({}, prev), { [name]: true })));
        const error = validateCardField(name, value);
        setCardErrors(prev => (Object.assign(Object.assign({}, prev), { [name]: error })));
    };
    const handleCardInputRealtime = (e) => {
        handleCardInput(e);
        const { name, value } = e.target;
        if (cardTouched[name]) {
            const error = validateCardField(name, value);
            setCardErrors(prev => (Object.assign(Object.assign({}, prev), { [name]: error })));
        }
    };
    // 1. Constantes para la clave de localStorage
    const CHECKOUT_PROGRESS_KEY = "checkout-progress-v1";
    // 2. Al cargar el componente, restaurar progreso si existe
    (0, react_1.useEffect)(() => {
        const saved = typeof window !== "undefined" ? localStorage.getItem(CHECKOUT_PROGRESS_KEY) : null;
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setForm(f => (Object.assign(Object.assign({}, f), parsed.form)));
                if (parsed.selectedAddressId)
                    setSelectedAddressId(parsed.selectedAddressId);
                if (parsed.selectedPaymentId)
                    setSelectedPaymentId(parsed.selectedPaymentId);
                // Feedback visual sutil (opcional):
                toast && toast({ title: "Progreso restaurado", description: "Se restauraron los datos del checkout." });
            }
            catch (_a) { }
        }
    }, []);
    // 3. Guardar automáticamente en localStorage al cambiar datos relevantes
    (0, react_1.useEffect)(() => {
        if (typeof window === "undefined")
            return;
        const data = {
            form,
            selectedAddressId,
            selectedPaymentId
        };
        localStorage.setItem(CHECKOUT_PROGRESS_KEY, JSON.stringify(data));
    }, [form, selectedAddressId, selectedPaymentId]);
    // 4. Limpiar progreso al finalizar el pedido exitosamente
    (0, react_1.useEffect)(() => {
        if (submitted && typeof window !== "undefined") {
            localStorage.removeItem(CHECKOUT_PROGRESS_KEY);
        }
    }, [submitted]);
    // Al inicio del componente CheckoutPage:
    if (cart.length === 0) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-lg p-8 text-center", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold mb-4 text-purple-800", children: "Tu carrito est\u00E1 vac\u00EDo" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-6", children: "Agrega productos a tu carrito para continuar con el checkout." }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/shop", children: (0, jsx_runtime_1.jsx)(button_1.Button, { className: "bg-indigo-600 hover:bg-indigo-700", children: "Volver a la tienda" }) })] }) }));
    }
    if (submitted) {
        // Buscar datos del pedido para el resumen
        const shippingAddress = addresses.find((a) => a.id === selectedAddressId);
        const paymentMethod = paymentMethods.find((m) => m.id === selectedPaymentId);
        return ((0, jsx_runtime_1.jsx)(auth_guard_1.default, { children: (0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white py-12", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center border border-indigo-100", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-3xl font-extrabold text-purple-900 mb-2", children: "\u00A1Gracias por tu compra!" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-700 mb-6", children: ["Tu pedido ha sido registrado exitosamente.", (0, jsx_runtime_1.jsx)("br", {}), "Pronto recibir\u00E1s un correo con los detalles."] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-6 text-left", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-bold text-indigo-800 mb-2", children: "Resumen del pedido" }), (0, jsx_runtime_1.jsx)("ul", { className: "divide-y divide-indigo-100 mb-2", children: cart.map(item => ((0, jsx_runtime_1.jsxs)("li", { className: "py-2 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("span", { className: "font-medium text-gray-900", children: [item.name, " ", (0, jsx_runtime_1.jsxs)("span", { className: "text-xs text-gray-500", children: ["x", item.quantity] })] }), (0, jsx_runtime_1.jsxs)("span", { className: "text-gray-700", children: ["$", (item.price * item.quantity).toFixed(2)] })] }, item.id))) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm mb-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Subtotal" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-gray-900 font-medium", children: ["$", cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm mb-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Env\u00EDo" }), (0, jsx_runtime_1.jsx)("span", { className: "text-gray-900 font-medium", children: "$10.00" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-base font-bold border-t pt-2 mt-2", children: [(0, jsx_runtime_1.jsx)("span", { children: "Total" }), (0, jsx_runtime_1.jsxs)("span", { children: ["$", (cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + 10).toFixed(2)] })] }), shippingAddress && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-4 p-3 rounded bg-indigo-50 border border-indigo-100", children: [(0, jsx_runtime_1.jsx)("div", { className: "font-semibold text-indigo-800 mb-1", children: "Enviado a:" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-sm text-gray-700", children: [shippingAddress.street, ", ", shippingAddress.city, ", ", shippingAddress.state, ", ", shippingAddress.zipCode, ", ", shippingAddress.country] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500", children: ["Tel: ", shippingAddress.phone] })] })), paymentMethod && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-2 p-3 rounded bg-indigo-50 border border-indigo-100 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-semibold text-indigo-800", children: "Pago:" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-gray-900", children: [paymentMethod.brand, " \u2022\u2022\u2022\u2022 ", paymentMethod.last4] })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row gap-3 justify-center mt-6", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { asChild: true, className: "bg-purple-800 hover:bg-purple-900 w-full sm:w-auto", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/orders", children: "Ver mis pedidos" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { asChild: true, variant: "outline", className: "border-indigo-400 text-indigo-700 w-full sm:w-auto", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/shop", children: "Seguir comprando" }) })] })] }) }) }));
    }
    // Filtrar métodos de pago permitidos
    const allowedBrands = ["visa", "mastercard", "paypal"];
    const filteredPaymentMethods = paymentMethods.filter(m => allowedBrands.includes((m.brand || m.type || "").toLowerCase()));
    const stripePromise = (0, stripe_js_1.loadStripe)(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    // 1. Estado para campos tocados y errores de dirección
    const [addressErrors, setAddressErrors] = (0, react_1.useState)({});
    const [addressTouched, setAddressTouched] = (0, react_1.useState)({});
    // 2. Función de validación de dirección
    const validateAddressField = (field, value) => {
        if (!value.trim())
            return 'Este campo es obligatorio';
        if (field === 'zipCode' && !/^\d{4,10}$/.test(value))
            return 'Código postal inválido';
        if (field === 'phone' && !/^\+?\d{7,15}$/.test(value.replace(/\s/g, "")))
            return 'Teléfono inválido';
        return '';
    };
    // 3. Handlers para blur y change de dirección
    const handleAddressInputBlur = (e) => {
        const { name, value } = e.target;
        setAddressTouched((prev) => (Object.assign(Object.assign({}, prev), { [name]: true })));
        const error = validateAddressField(name, value);
        setAddressErrors((prev) => (Object.assign(Object.assign({}, prev), { [name]: error })));
    };
    const handleAddressInputChange = (e) => {
        handleAddressChange(Object.assign(Object.assign({}, form.address), { [e.target.name]: e.target.value }));
        if (addressTouched[e.target.name]) {
            const error = validateAddressField(e.target.name, e.target.value);
            setAddressErrors((prev) => (Object.assign(Object.assign({}, prev), { [e.target.name]: error })));
        }
    };
    // 1. Estado para campos tocados y errores de método de pago
    const [paymentErrors, setPaymentErrors] = (0, react_1.useState)({});
    const [paymentTouched, setPaymentTouched] = (0, react_1.useState)({});
    // 2. Función de validación de método de pago
    const validatePaymentField = (field, value) => {
        if (!value.trim())
            return 'Este campo es obligatorio';
        if (field === 'number' && (!/^\d{16}$/.test(value.replace(/\s/g, ""))))
            return 'Número inválido';
        if (field === 'expMonth' && (!/^\d{2}$/.test(value) || +value < 1 || +value > 12))
            return 'Mes inválido';
        if (field === 'expYear' && !/^\d{2,4}$/.test(value))
            return 'Año inválido';
        if (field === 'cvv' && !/^\d{3}$/.test(value))
            return 'CVV inválido';
        return '';
    };
    // 3. Handlers para blur y change de método de pago
    const handlePaymentInputBlur = (e) => {
        const { name, value } = e.target;
        setPaymentTouched((prev) => (Object.assign(Object.assign({}, prev), { [name]: true })));
        const error = validatePaymentField(name, value);
        setPaymentErrors((prev) => (Object.assign(Object.assign({}, prev), { [name]: error })));
    };
    const handlePaymentInputChange = (e) => {
        handleCardInput(e);
        if (paymentTouched[e.target.name]) {
            const error = validatePaymentField(e.target.name, e.target.value);
            setPaymentErrors((prev) => (Object.assign(Object.assign({}, prev), { [e.target.name]: error })));
        }
    };
    return ((0, jsx_runtime_1.jsxs)(auth_guard_1.default, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-gradient-to-b from-purple-50 to-white py-12", children: [(0, jsx_runtime_1.jsxs)("div", { className: "container mx-auto px-4 max-w-4xl", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-purple-900 mb-8 text-center", children: "Checkout" }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsxs)("h2", { className: "text-lg font-semibold mb-2 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MapPin, { className: "h-5 w-5" }), " Direcci\u00F3n de Env\u00EDo"] }), addressLoading ? ((0, jsx_runtime_1.jsx)("div", { className: "text-gray-500", children: "Cargando direcciones..." })) : addressError ? ((0, jsx_runtime_1.jsx)("div", { className: "text-red-500", children: addressError })) : addresses.length === 0 ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "mb-2 text-gray-500", children: "No tienes direcciones guardadas." }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4 border rounded-lg p-4 bg-gray-50", children: (0, jsx_runtime_1.jsx)(address_form_1.default, { initialAddress: {
                                                        street: "",
                                                        city: "",
                                                        state: "",
                                                        zipCode: "",
                                                        country: "México"
                                                    }, onSave: async (address) => {
                                                        await handleSaveNewAddress({
                                                            street: address.street,
                                                            city: address.city,
                                                            state: address.state,
                                                            zipCode: address.zipCode,
                                                            country: address.country
                                                        });
                                                    }, loading: addressLoading, disabled: addressLoading }) })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2 mb-2", children: addresses.map((a) => ((0, jsx_runtime_1.jsx)("div", { className: `flex flex-col gap-2 p-3 rounded border transition-all ${selectedAddressId === a.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`, children: editingAddressId === a.id ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-2", children: [(0, jsx_runtime_1.jsx)("input", { className: "input input-sm border rounded px-2 py-1", value: (editAddressForm === null || editAddressForm === void 0 ? void 0 : editAddressForm.alias) || '', onChange: e => setEditAddressForm((f) => (Object.assign(Object.assign({}, f), { alias: e.target.value }))), placeholder: "Alias" }), (0, jsx_runtime_1.jsx)("input", { className: "input input-sm border rounded px-2 py-1", value: (editAddressForm === null || editAddressForm === void 0 ? void 0 : editAddressForm.recipientName) || '', onChange: e => setEditAddressForm((f) => (Object.assign(Object.assign({}, f), { recipientName: e.target.value }))), placeholder: "Destinatario" }), (0, jsx_runtime_1.jsx)("input", { className: "input input-sm border rounded px-2 py-1", value: (editAddressForm === null || editAddressForm === void 0 ? void 0 : editAddressForm.street) || '', onChange: e => setEditAddressForm((f) => (Object.assign(Object.assign({}, f), { street: e.target.value }))), placeholder: "Calle" }), (0, jsx_runtime_1.jsx)("input", { className: "input input-sm border rounded px-2 py-1", value: (editAddressForm === null || editAddressForm === void 0 ? void 0 : editAddressForm.city) || '', onChange: e => setEditAddressForm((f) => (Object.assign(Object.assign({}, f), { city: e.target.value }))), placeholder: "Ciudad" }), (0, jsx_runtime_1.jsx)("input", { className: "input input-sm border rounded px-2 py-1", value: (editAddressForm === null || editAddressForm === void 0 ? void 0 : editAddressForm.state) || '', onChange: e => setEditAddressForm((f) => (Object.assign(Object.assign({}, f), { state: e.target.value }))), placeholder: "Estado" }), (0, jsx_runtime_1.jsx)("input", { className: "input input-sm border rounded px-2 py-1", value: (editAddressForm === null || editAddressForm === void 0 ? void 0 : editAddressForm.zipCode) || '', onChange: e => setEditAddressForm((f) => (Object.assign(Object.assign({}, f), { zipCode: e.target.value }))), placeholder: "C\u00F3digo Postal" }), (0, jsx_runtime_1.jsx)("input", { className: "input input-sm border rounded px-2 py-1", value: (editAddressForm === null || editAddressForm === void 0 ? void 0 : editAddressForm.country) || '', onChange: e => setEditAddressForm((f) => (Object.assign(Object.assign({}, f), { country: e.target.value }))), placeholder: "Pa\u00EDs" }), (0, jsx_runtime_1.jsx)("input", { className: "input input-sm border rounded px-2 py-1", value: (editAddressForm === null || editAddressForm === void 0 ? void 0 : editAddressForm.phone) || '', onChange: e => setEditAddressForm((f) => (Object.assign(Object.assign({}, f), { phone: e.target.value }))), placeholder: "Tel\u00E9fono" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mt-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { size: "sm", variant: "outline", onClick: cancelEditAddress, disabled: addressLoading, children: "Cancelar" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { size: "sm", className: "bg-indigo-600 hover:bg-indigo-700 text-white", onClick: saveEditAddress, disabled: addressLoading, children: [addressLoading && (0, jsx_runtime_1.jsx)("span", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Guardar"] })] })] })) : ((0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-3 cursor-pointer", children: [(0, jsx_runtime_1.jsx)("input", { type: "radio", name: "addressRadio", value: a.id, checked: selectedAddressId === a.id, onChange: () => {
                                                            setSelectedAddressId(a.id);
                                                            setForm(f => (Object.assign(Object.assign({}, f), { address: a })));
                                                        }, className: "accent-indigo-600" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "font-semibold text-gray-900 flex items-center", children: [a.alias || "Dirección", " ", (0, jsx_runtime_1.jsxs)("span", { className: "text-xs text-gray-500 ml-2", children: ["(", a.recipientName || "Destinatario", ")"] }), " ", a.isDefault && (0, jsx_runtime_1.jsxs)("span", { className: "ml-2 text-xs px-2 py-1 rounded bg-indigo-600 text-white flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Star, { className: "h-3 w-3" }), " Principal"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500", children: [a.street, ", ", a.city, ", ", a.state, ", ", a.zipCode, ", ", a.country] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500", children: ["Tel: ", a.phone] })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { size: "icon", variant: "ghost", onClick: e => { e.preventDefault(); startEditAddress(a); }, title: "Editar", disabled: addressLoading, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "h-4 w-4 text-indigo-600" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { size: "icon", variant: "ghost", onClick: e => { e.preventDefault(); handleDeleteAddress(a.id); }, title: "Eliminar", disabled: addressLoading, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4 text-red-500" }) })] })) }, a.id))) })), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", className: "mt-2 flex items-center gap-2", onClick: () => setShowNewAddress(v => !v), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4" }), " ", showNewAddress ? "Cancelar" : "Agregar nueva dirección"] }), showNewAddress && ((0, jsx_runtime_1.jsx)("div", { className: "mt-4 border rounded-lg p-4 bg-gray-50", children: (0, jsx_runtime_1.jsx)(address_form_1.default, { initialAddress: {
                                                street: "",
                                                city: "",
                                                state: "",
                                                zipCode: "",
                                                country: "México"
                                            }, onSave: async (address) => {
                                                // Solo pasar los campos requeridos al backend
                                                await handleSaveNewAddress({
                                                    street: address.street,
                                                    city: address.city,
                                                    state: address.state,
                                                    zipCode: address.zipCode,
                                                    country: address.country
                                                });
                                            }, loading: addressLoading, disabled: addressLoading }) }))] }), selectedAddressId && ((0, jsx_runtime_1.jsxs)("div", { className: "mb-8 border rounded-lg p-4 bg-indigo-50 border-indigo-200", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "font-semibold text-indigo-800 mb-1 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Home, { className: "h-4 w-4" }), " Direcci\u00F3n seleccionada"] }), (() => {
                                        const a = addresses.find((a) => a.id === selectedAddressId);
                                        if (!a)
                                            return null;
                                        return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "font-semibold text-gray-900 flex items-center", children: [a.alias || "Dirección", " ", (0, jsx_runtime_1.jsxs)("span", { className: "text-xs text-gray-500 ml-2", children: ["(", a.recipientName || "Destinatario", ")"] }), " ", a.isDefault && (0, jsx_runtime_1.jsxs)("span", { className: "ml-2 text-xs px-2 py-1 rounded bg-indigo-600 text-white flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Star, { className: "h-3 w-3" }), " Principal"] }), (0, jsx_runtime_1.jsx)(button_1.Button, { size: "sm", variant: "outline", className: "ml-2", onClick: () => setEditingAddress(a), children: "Editar" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-700", children: [a.street, ", ", a.city, ", ", a.state, ", ", a.zipCode, ", ", a.country] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-700", children: ["Tel: ", a.phone] })] }));
                                    })()] })), editingAddress && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black/30 flex items-center justify-center z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-lg p-6 w-full max-w-md", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "font-semibold text-lg mb-4 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Pencil, { className: "h-5 w-5" }), " Editar direcci\u00F3n"] }), (0, jsx_runtime_1.jsx)(address_form_1.default, { initialAddress: editingAddress, onSave: async (address) => {
                                                setAddressLoading(true);
                                                setAddressError(null);
                                                try {
                                                    const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
                                                    const res = await fetch(`/api/addresses/${editingAddress.id}`, {
                                                        method: "PUT",
                                                        headers: Object.assign({ "Content-Type": "application/json" }, (token ? { Authorization: `Bearer ${token}` } : {})),
                                                        body: JSON.stringify(address),
                                                    });
                                                    if (!res.ok)
                                                        throw new Error("Error al editar dirección");
                                                    const updated = await res.json();
                                                    // Actualizar addresses en el estado
                                                    setAddresses((prev) => prev.map(a => a.id === updated.id ? updated : a));
                                                    setEditingAddress(null);
                                                    toast({ title: "Dirección actualizada", description: "La dirección fue actualizada correctamente.", variant: "default" });
                                                }
                                                catch (err) {
                                                    const errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
                                                    setAddressError(errorToUse.message || "Error desconocido");
                                                    toast({ title: "Error", description: errorToUse.message || "Error desconocido", variant: "destructive" });
                                                }
                                                finally {
                                                    setAddressLoading(false);
                                                }
                                            }, loading: addressLoading, disabled: addressLoading, noFormWrapper: true }), (0, jsx_runtime_1.jsx)("div", { className: "flex gap-2 justify-end mt-4", children: (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", variant: "outline", onClick: () => setEditingAddress(null), children: "Cancelar" }) })] }) })), (0, jsx_runtime_1.jsxs)("form", { id: "checkout-main-form", onSubmit: handleSubmit, className: "grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-md p-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Nombre completo" }), (0, jsx_runtime_1.jsx)(input_1.Input, { ref: nameRef, name: "name", value: form.name, onChange: handlePersonalChange, onBlur: handlePersonalBlur, required: true, autoComplete: "name", className: personalErrors.name && personalTouched.name ? "border-red-500" : "" }), personalErrors.name && personalTouched.name && (0, jsx_runtime_1.jsx)("div", { className: "text-red-500 text-xs mt-1", children: personalErrors.name })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Email" }), (0, jsx_runtime_1.jsx)(input_1.Input, { name: "email", value: form.email, onChange: handlePersonalChange, onBlur: handlePersonalBlur, required: true, autoComplete: "email", className: personalErrors.email && personalTouched.email ? "border-red-500" : "" }), personalErrors.email && personalTouched.email && (0, jsx_runtime_1.jsx)("div", { className: "text-red-500 text-xs mt-1", children: personalErrors.email })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Tel\u00E9fono" }), (0, jsx_runtime_1.jsx)(input_1.Input, { name: "phone", value: form.phone, onChange: handlePersonalChange, onBlur: handlePersonalBlur, required: true, autoComplete: "tel", className: personalErrors.phone && personalTouched.phone ? "border-red-500" : "" }), personalErrors.phone && personalTouched.phone && (0, jsx_runtime_1.jsx)("div", { className: "text-red-500 text-xs mt-1", children: personalErrors.phone })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-medium text-gray-700", children: "Direcci\u00F3n de Env\u00EDo" }), (0, jsx_runtime_1.jsx)(input_1.Input, { name: "street", value: form.address.street, onChange: handleAddressInputChange, onBlur: handleAddressInputBlur, required: true, placeholder: "Calle", className: addressErrors.street && addressTouched.street ? "border-red-500" : "" }), addressErrors.street && addressTouched.street && (0, jsx_runtime_1.jsx)("div", { className: "text-red-500 text-xs mt-1", children: addressErrors.street }), (0, jsx_runtime_1.jsx)(input_1.Input, { name: "city", value: form.address.city, onChange: handleAddressInputChange, onBlur: handleAddressInputBlur, required: true, placeholder: "Ciudad", className: addressErrors.city && addressTouched.city ? "border-red-500" : "" }), addressErrors.city && addressTouched.city && (0, jsx_runtime_1.jsx)("div", { className: "text-red-500 text-xs mt-1", children: addressErrors.city }), (0, jsx_runtime_1.jsx)(input_1.Input, { name: "state", value: form.address.state, onChange: handleAddressInputChange, onBlur: handleAddressInputBlur, required: true, placeholder: "Estado", className: addressErrors.state && addressTouched.state ? "border-red-500" : "" }), addressErrors.state && addressTouched.state && (0, jsx_runtime_1.jsx)("div", { className: "text-red-500 text-xs mt-1", children: addressErrors.state }), (0, jsx_runtime_1.jsx)(input_1.Input, { name: "zipCode", value: form.address.zipCode, onChange: handleAddressInputChange, onBlur: handleAddressInputBlur, required: true, placeholder: "C\u00F3digo Postal", className: addressErrors.zipCode && addressTouched.zipCode ? "border-red-500" : "" }), addressErrors.zipCode && addressTouched.zipCode && (0, jsx_runtime_1.jsx)("div", { className: "text-red-500 text-xs mt-1", children: addressErrors.zipCode }), (0, jsx_runtime_1.jsx)(input_1.Input, { name: "country", value: form.address.country, onChange: handleAddressInputChange, onBlur: handleAddressInputBlur, required: true, placeholder: "Pa\u00EDs", className: addressErrors.country && addressTouched.country ? "border-red-500" : "" }), addressErrors.country && addressTouched.country && (0, jsx_runtime_1.jsx)("div", { className: "text-red-500 text-xs mt-1", children: addressErrors.country })] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsxs)("h2", { className: "text-lg font-bold mb-2 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CreditCard, { className: "h-5 w-5" }), " M\u00E9todo de Pago"] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-4 mb-4", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: form.payment === "card" ? "default" : "outline", onClick: () => { setForm(f => (Object.assign(Object.assign({}, f), { payment: "card" }))); setShowNewCard(false); }, children: "Tarjeta" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: form.payment === "paypal" ? "default" : "outline", onClick: () => { setForm(f => (Object.assign(Object.assign({}, f), { payment: "paypal" }))); setShowNewCard(false); }, children: "Paypal" })] }), form.payment === "card" && ((0, jsx_runtime_1.jsx)(react_stripe_js_1.Elements, { stripe: stripePromise, children: (0, jsx_runtime_1.jsx)(payment_form_1.default, { amount: total, onSuccess: async (paymentIntentId, cardEmail) => {
                                                                    if (!user) {
                                                                        toast({ title: "Debes iniciar sesión", description: "Inicia sesión para completar la compra.", variant: "destructive" });
                                                                        return;
                                                                    }
                                                                    if (!selectedAddressId) {
                                                                        toast({ title: "Selecciona una dirección", description: "Debes seleccionar una dirección de envío.", variant: "destructive" });
                                                                        return;
                                                                    }
                                                                    const shippingAddress = addresses.find((a) => a.id === selectedAddressId);
                                                                    if (!shippingAddress) {
                                                                        toast({ title: "Error", description: "Dirección seleccionada no encontrada.", variant: "destructive" });
                                                                        return;
                                                                    }
                                                                    setLoading(true);
                                                                    try {
                                                                        const res = await fetch("/api/orders", {
                                                                            method: "POST",
                                                                            headers: { "Content-Type": "application/json" },
                                                                            body: JSON.stringify({
                                                                                userId: user.id,
                                                                                items: cart.map(item => ({
                                                                                    productId: item.id,
                                                                                    quantity: item.quantity,
                                                                                    price: item.price
                                                                                })),
                                                                                totalAmount: total,
                                                                                shippingAddress,
                                                                                paymentMethod: "card",
                                                                                paymentId: paymentIntentId,
                                                                                paidAt: new Date().toISOString()
                                                                            })
                                                                        });
                                                                        if (!res.ok) {
                                                                            const error = await res.json();
                                                                            toast({ title: "Error al registrar el pedido", description: error.message || "Intenta de nuevo más tarde.", variant: "destructive" });
                                                                            setLoading(false);
                                                                            return;
                                                                        }
                                                                        setLoading(false);
                                                                        setSubmitted(true);
                                                                        clearCart();
                                                                        setShowStripeSuccess({ paymentId: paymentIntentId, email: cardEmail });
                                                                    }
                                                                    catch (err) {
                                                                        setLoading(false);
                                                                        toast({ title: "Error de red", description: (err === null || err === void 0 ? void 0 : err.message) || "No se pudo conectar con el servidor.", variant: "destructive" });
                                                                    }
                                                                }, onError: (err) => {
                                                                    toast({ title: "Error en Stripe", description: (err === null || err === void 0 ? void 0 : err.toString()) || "Error desconocido", variant: "destructive" });
                                                                }, noFormWrapper: true }) })), form.payment === "paypal" && ((0, jsx_runtime_1.jsx)("div", { className: "mt-4 border rounded-lg p-4 bg-gray-50", children: (0, jsx_runtime_1.jsx)(paypal_button_1.default, { amount: total, currency: "USD", onSuccess: async (orderId, payerEmail) => {
                                                                    if (!user) {
                                                                        toast({ title: "Debes iniciar sesión", description: "Inicia sesión para completar la compra.", variant: "destructive" });
                                                                        return;
                                                                    }
                                                                    if (!selectedAddressId) {
                                                                        toast({ title: "Selecciona una dirección", description: "Debes seleccionar una dirección de envío.", variant: "destructive" });
                                                                        return;
                                                                    }
                                                                    const shippingAddress = addresses.find((a) => a.id === selectedAddressId);
                                                                    if (!shippingAddress) {
                                                                        toast({ title: "Error", description: "Dirección seleccionada no encontrada.", variant: "destructive" });
                                                                        return;
                                                                    }
                                                                    setLoading(true);
                                                                    try {
                                                                        const res = await fetch("/api/orders", {
                                                                            method: "POST",
                                                                            headers: { "Content-Type": "application/json" },
                                                                            body: JSON.stringify({
                                                                                userId: user.id,
                                                                                items: cart.map(item => ({
                                                                                    productId: item.id,
                                                                                    quantity: item.quantity,
                                                                                    price: item.price
                                                                                })),
                                                                                totalAmount: total,
                                                                                shippingAddress,
                                                                                paymentMethod: "paypal",
                                                                                paymentId: orderId,
                                                                                paidAt: new Date().toISOString()
                                                                            })
                                                                        });
                                                                        if (!res.ok) {
                                                                            const error = await res.json();
                                                                            toast({ title: "Error al registrar el pedido", description: error.message || "Intenta de nuevo más tarde.", variant: "destructive" });
                                                                            setLoading(false);
                                                                            return;
                                                                        }
                                                                        setLoading(false);
                                                                        setSubmitted(true);
                                                                        clearCart();
                                                                        toast({
                                                                            title: "¡Pago exitoso!",
                                                                            description: `Tu pedido ha sido registrado.\nID de PayPal: ${orderId}${payerEmail ? `\nEmail de PayPal: ${payerEmail}` : ""}`,
                                                                            variant: "default"
                                                                        });
                                                                        setTimeout(() => {
                                                                            router.push("/orders");
                                                                        }, 2000);
                                                                    }
                                                                    catch (err) {
                                                                        setLoading(false);
                                                                        toast({ title: "Error de red", description: (err === null || err === void 0 ? void 0 : err.message) || "No se pudo conectar con el servidor.", variant: "destructive" });
                                                                    }
                                                                }, onError: (err) => {
                                                                    toast({ title: "Error en PayPal", description: (err === null || err === void 0 ? void 0 : err.toString()) || "Error desconocido", variant: "destructive" });
                                                                } }) }))] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-indigo-50 rounded-lg p-6 shadow-inner", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "font-semibold text-lg mb-4 text-indigo-800 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CreditCard, { className: "h-5 w-5" }), " Resumen del pedido"] }), (0, jsx_runtime_1.jsx)("ul", { className: "divide-y divide-indigo-100 mb-4", children: cart.map(item => ((0, jsx_runtime_1.jsxs)("li", { className: "py-2 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("span", { className: "font-medium text-gray-900", children: [item.name, " ", (0, jsx_runtime_1.jsxs)("span", { className: "text-xs text-gray-500", children: ["x", item.quantity] })] }), (0, jsx_runtime_1.jsxs)("span", { className: "text-gray-700", children: ["$", (item.price * item.quantity).toFixed(2)] })] }, item.id))) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm mb-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Subtotal" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-gray-900 font-medium", children: ["$", subtotal.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm mb-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Env\u00EDo" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-gray-900 font-medium", children: ["$", shipping.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-base font-bold border-t pt-2 mt-2", children: [(0, jsx_runtime_1.jsx)("span", { children: "Total" }), (0, jsx_runtime_1.jsxs)("span", { children: ["$", total.toFixed(2)] })] }), selectedPaymentId && ((0, jsx_runtime_1.jsx)("div", { className: "mt-4 p-3 rounded bg-white border flex items-center gap-3", children: (() => {
                                                    const m = paymentMethods.find((m) => m.id === selectedPaymentId);
                                                    if (!m)
                                                        return null;
                                                    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [getCardIcon(m.brand), (0, jsx_runtime_1.jsxs)("span", { className: "font-medium text-gray-900", children: [m.brand, " \u2022\u2022\u2022\u2022 ", m.last4] }), (0, jsx_runtime_1.jsx)(button_1.Button, { size: "sm", variant: "outline", className: "ml-2", onClick: () => setEditingPayment(m), children: "Editar" })] }));
                                                })() })), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "submit", className: "w-full mt-6 bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center", disabled: loading, children: [loading && (0, jsx_runtime_1.jsx)("span", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), loading ? "Procesando..." : "Confirmar compra"] })] })] })] }), (0, jsx_runtime_1.jsx)(CartRecommendations, { excludeIds: cart.map(i => i.id) })] }), editingPayment && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black/30 flex items-center justify-center z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-lg p-6 w-full max-w-md", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "font-semibold text-lg mb-4 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Pencil, { className: "h-5 w-5" }), " Editar tarjeta"] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSaveEdit, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Marca" }), (0, jsx_runtime_1.jsxs)("select", { name: "brand", value: editForm.brand, onChange: handleEditFormChange, className: "w-full border rounded px-3 py-2", children: [(0, jsx_runtime_1.jsx)("option", { value: "Visa", children: "Visa" }), (0, jsx_runtime_1.jsx)("option", { value: "Mastercard", children: "Mastercard" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "\u00DAltimos 4 d\u00EDgitos" }), (0, jsx_runtime_1.jsx)(input_1.Input, { name: "last4", maxLength: 4, value: editForm.last4, onChange: handleEditFormChange, required: true, pattern: "\\d{4}" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Mes" }), (0, jsx_runtime_1.jsx)(input_1.Input, { name: "expMonth", maxLength: 2, value: editForm.expMonth, onChange: handleEditFormChange, required: true, pattern: "\\d{1,2}" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "A\u00F1o" }), (0, jsx_runtime_1.jsx)(input_1.Input, { name: "expYear", maxLength: 4, value: editForm.expYear, onChange: handleEditFormChange, required: true, pattern: "\\d{2,4}" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mt-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", name: "isDefault", checked: editForm.isDefault, onChange: e => setEditForm(f => (Object.assign(Object.assign({}, f), { isDefault: e.target.checked }))) }), (0, jsx_runtime_1.jsx)("span", { children: "Usar como m\u00E9todo principal" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 justify-end mt-4", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", variant: "outline", onClick: () => setEditingPayment(null), children: "Cancelar" }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "submit", className: "bg-indigo-600 hover:bg-indigo-700", disabled: savingEdit, children: savingEdit ? "Guardando..." : "Guardar cambios" })] })] })] }) })), showStripeSuccess && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black/40 flex items-center justify-center z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-green-700 mb-4", children: "\u00A1Pago exitoso!" }), (0, jsx_runtime_1.jsx)("p", { className: "mb-2 text-gray-700", children: "Tu pedido ha sido registrado correctamente." }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-2 text-sm text-gray-600", children: ["ID de pago: ", (0, jsx_runtime_1.jsx)("span", { className: "font-mono", children: showStripeSuccess.paymentId })] }), showStripeSuccess.email && (0, jsx_runtime_1.jsxs)("div", { className: "mb-4 text-sm text-gray-600", children: ["Email: ", (0, jsx_runtime_1.jsx)("span", { className: "font-mono", children: showStripeSuccess.email })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { className: "bg-indigo-600 hover:bg-indigo-700 w-full", onClick: () => { setShowStripeSuccess(null); router.push("/orders"); }, children: "Ver mis pedidos" })] }) })), cart.map(item => stockMessages[item.id] && ((0, jsx_runtime_1.jsx)("div", { className: "text-xs text-red-500 mb-2", children: stockMessages[item.id] }, item.id))), (0, jsx_runtime_1.jsx)(order_summary_sticky_1.default, { subtotal: subtotal, shipping: shipping, total: total, loading: loading, paymentMethod: (() => {
                    const m = paymentMethods.find((m) => m.id === selectedPaymentId);
                    return m ? `${m.brand} •••• ${m.last4}` : undefined;
                })(), onEditCart: () => router.push('/cart') })] }));
}
