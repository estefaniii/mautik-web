"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProfilePage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const auth_context_1 = require("@/context/auth-context");
const favorites_context_1 = require("@/context/favorites-context");
const theme_context_1 = require("@/context/theme-context");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const card_1 = require("@/components/ui/card");
const tabs_1 = require("@/components/ui/tabs");
const separator_1 = require("@/components/ui/separator");
const badge_1 = require("@/components/ui/badge");
const switch_1 = require("@/components/ui/switch");
const dialog_1 = require("@/components/ui/dialog");
const lucide_react_1 = require("lucide-react");
const use_toast_1 = require("@/hooks/use-toast");
const auth_guard_1 = __importDefault(require("@/components/auth-guard"));
const link_1 = __importDefault(require("next/link"));
const product_card_1 = __importDefault(require("@/components/product-card"));
const profile_avatar_1 = __importDefault(require("@/components/profile-avatar"));
const address_form_1 = __importDefault(require("@/components/address-form"));
function ProfilePage() {
    var _a, _b, _c, _d, _e;
    const { user, isLoading, logout, updateProfile } = (0, auth_context_1.useAuth)();
    const { favorites, getFavoriteProducts } = (0, favorites_context_1.useFavorites)();
    const { isDarkMode, toggleDarkMode } = (0, theme_context_1.useTheme)();
    const { toast } = (0, use_toast_1.useToast)();
    // Profile editing states
    const [isEditing, setIsEditing] = (0, react_1.useState)(false);
    const [showDeleteDialog, setShowDeleteDialog] = (0, react_1.useState)(false);
    const [showPasswordDialog, setShowPasswordDialog] = (0, react_1.useState)(false);
    // Form states
    const [editForm, setEditForm] = (0, react_1.useState)({
        name: "",
        email: "",
        phone: "",
        address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: ""
        }
    });
    const [passwordForm, setPasswordForm] = (0, react_1.useState)({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [settings, setSettings] = (0, react_1.useState)({
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: true,
        orderUpdates: true,
        darkMode: isDarkMode
    });
    const [showPassword, setShowPassword] = (0, react_1.useState)({
        current: false,
        new: false,
        confirm: false
    });
    const [orders, setOrders] = (0, react_1.useState)([]);
    const [loadingOrders, setLoadingOrders] = (0, react_1.useState)(false);
    const [isSaving, setIsSaving] = (0, react_1.useState)(false);
    const [phoneError, setPhoneError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (user) {
            setLoadingOrders(true);
            fetch('/api/orders')
                .then(res => res.json())
                .then(data => {
                const userOrders = Array.isArray(data)
                    ? data.filter((order) => order.user && (order.user.id === user.id || order.user === user.id))
                    : [];
                setOrders(userOrders);
            })
                .catch(() => setOrders([]))
                .finally(() => setLoadingOrders(false));
        }
    }, [user]);
    (0, react_1.useEffect)(() => {
        var _a, _b, _c, _d, _e;
        if (user) {
            setEditForm({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                address: {
                    street: ((_a = user.address) === null || _a === void 0 ? void 0 : _a.street) || "",
                    city: ((_b = user.address) === null || _b === void 0 ? void 0 : _b.city) || "",
                    state: ((_c = user.address) === null || _c === void 0 ? void 0 : _c.state) || "",
                    zipCode: ((_d = user.address) === null || _d === void 0 ? void 0 : _d.zipCode) || "",
                    country: ((_e = user.address) === null || _e === void 0 ? void 0 : _e.country) || ""
                }
            });
        }
    }, [user]);
    (0, react_1.useEffect)(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode !== null) {
            const isDarkMode = savedDarkMode === 'true';
            setSettings(prev => (Object.assign(Object.assign({}, prev), { darkMode: isDarkMode })));
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
            }
            else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, []);
    const handleSave = async () => {
        try {
            if (!user) {
                toast({
                    title: "❌ Error",
                    description: "Usuario no autenticado",
                    variant: "destructive"
                });
                return;
            }
            if (!editForm.name.trim() || !editForm.email.trim()) {
                toast({
                    title: "❌ Error",
                    description: "Nombre y email son campos obligatorios",
                    variant: "destructive"
                });
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(editForm.email)) {
                toast({
                    title: "❌ Error",
                    description: "Formato de email inválido",
                    variant: "destructive"
                });
                return;
            }
            setPhoneError(null);
            if (editForm.phone.trim()) {
                const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
                if (!phoneRegex.test(editForm.phone.trim())) {
                    setPhoneError("Número de teléfono inválido. Usa solo dígitos, espacios, guiones, paréntesis y opcionalmente el prefijo +.");
                    toast({
                        title: "❌ Error",
                        description: "Número de teléfono inválido. Usa solo dígitos, espacios, guiones, paréntesis y opcionalmente el prefijo +.",
                        variant: "destructive"
                    });
                    return;
                }
            }
            const { street, city, state, zipCode, country } = editForm.address;
            if (!street.trim() || !city.trim() || !state.trim() || !zipCode.trim() || !country.trim()) {
                toast({
                    title: "❌ Error",
                    description: "Todos los campos de dirección son obligatorios",
                    variant: "destructive"
                });
                return;
            }
            const updateData = {
                name: editForm.name.trim(),
                email: editForm.email.trim(),
                phone: editForm.phone.trim(),
                address: {
                    street: street.trim(),
                    city: city.trim(),
                    state: state.trim(),
                    zipCode: zipCode.trim(),
                    country: country.trim()
                }
            };
            setIsSaving(true);
            const result = await updateProfile(updateData);
            setIsSaving(false);
            if (result && !result.error) {
                toast({
                    title: "✅ Guardado",
                    description: "Perfil actualizado exitosamente",
                    variant: "default"
                });
                setIsEditing(false);
            }
            else {
                toast({
                    title: "❌ Error",
                    description: (result === null || result === void 0 ? void 0 : result.error) || "No se pudo actualizar el perfil",
                    variant: "destructive"
                });
            }
        }
        catch (error) {
            setIsSaving(false);
            toast({
                title: "❌ Error",
                description: "Error inesperado al guardar el perfil",
                variant: "destructive"
            });
        }
    };
    const handlePasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast({
                title: "❌ Error",
                description: "Las contraseñas no coinciden.",
                variant: "destructive"
            });
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast({
                title: "❌ Error",
                description: "La contraseña debe tener al menos 6 caracteres.",
                variant: "destructive"
            });
            return;
        }
        try {
            if (!user) {
                toast({
                    title: "❌ Error",
                    description: "Usuario no autenticado",
                    variant: "destructive"
                });
                return;
            }
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                    userId: user === null || user === void 0 ? void 0 : user.id
                }),
            });
            const data = await response.json();
            const result = { success: response.ok, error: data.error };
            if (result.success) {
                toast({
                    title: "✅ Contraseña actualizada",
                    description: "Tu contraseña ha sido cambiada exitosamente.",
                });
                setShowPasswordDialog(false);
                setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
            }
            else {
                toast({
                    title: "❌ Error",
                    description: result.error || "No se pudo cambiar la contraseña. Inténtalo de nuevo.",
                    variant: "destructive"
                });
            }
        }
        catch (error) {
            console.error('Error changing password:', error);
            toast({
                title: "❌ Error",
                description: "Error de conexión al cambiar la contraseña",
                variant: "destructive"
            });
        }
    };
    const handleDeleteAccount = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast({
                title: "✅ Cuenta eliminada",
                description: "Tu cuenta ha sido eliminada permanentemente.",
            });
            logout();
        }
        catch (error) {
            toast({
                title: "❌ Error",
                description: "No se pudo eliminar la cuenta. Inténtalo de nuevo.",
                variant: "destructive"
            });
        }
    };
    const handleCancel = () => {
        if (user) {
            setEditForm({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || {
                    street: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: ""
                }
            });
        }
        setIsEditing(false);
    };
    const handleImageChange = async (imageUrl) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const result = await updateProfile({ avatar: imageUrl });
            if (result.success) {
                toast({
                    title: "✅ Imagen actualizada",
                    description: "Tu foto de perfil ha sido actualizada exitosamente.",
                });
            }
            else {
                toast({
                    title: "❌ Error",
                    description: result.error || "No se pudo actualizar la imagen. Inténtalo de nuevo.",
                    variant: "destructive"
                });
            }
        }
        catch (error) {
            toast({
                title: "❌ Error",
                description: "No se pudo actualizar la imagen. Inténtalo de nuevo.",
                variant: "destructive"
            });
        }
    };
    const handleDarkModeToggle = () => {
        toggleDarkMode();
        toast({
            title: !isDarkMode ? "🌙 Modo oscuro activado" : "☀️ Modo claro activado",
            description: `Has cambiado al ${!isDarkMode ? 'modo oscuro' : 'modo claro'}.`,
        });
    };
    const getUserInitials = (name) => {
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };
    const getMemberSince = () => {
        if (!(user === null || user === void 0 ? void 0 : user.createdAt))
            return "Reciente";
        const date = new Date(user.createdAt);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    const handleSaveAddress = async (address) => {
        try {
            if (!user)
                return;
            const updateData = Object.assign(Object.assign({}, editForm), { address });
            const result = await updateProfile(updateData);
            if (result && !result.error) {
                toast({
                    title: "✅ Guardado",
                    description: "Dirección actualizada exitosamente",
                    variant: "default"
                });
                setIsEditing(false);
            }
            else {
                toast({
                    title: "❌ Error",
                    description: (result === null || result === void 0 ? void 0 : result.error) || "No se pudo actualizar la dirección",
                    variant: "destructive"
                });
            }
        }
        catch (error) {
            toast({
                title: "❌ Error",
                description: "Error inesperado al guardar la dirección",
                variant: "destructive"
            });
        }
    };
    if (isLoading) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 font-medium", children: "Cargando tu perfil..." })] }) }));
    }
    return ((0, jsx_runtime_1.jsx)(auth_guard_1.default, { children: (0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-gradient-to-br from-purple-50 to-blue-50", children: (0, jsx_runtime_1.jsx)("div", { className: "container mx-auto px-4 py-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-6xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-8 text-center", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-4xl font-bold text-gray-900 mb-2", children: "Mi Cuenta" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 text-lg", children: "Gestiona tu perfil, pedidos y preferencias" })] }), (0, jsx_runtime_1.jsxs)(tabs_1.Tabs, { defaultValue: "profile", className: "space-y-8", children: [(0, jsx_runtime_1.jsxs)(tabs_1.TabsList, { className: "grid w-full grid-cols-6 bg-white shadow-lg", children: [(0, jsx_runtime_1.jsxs)(tabs_1.TabsTrigger, { value: "profile", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "h-4 w-4" }), "Perfil"] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsTrigger, { value: "orders", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingBag, { className: "h-4 w-4" }), "Pedidos"] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsTrigger, { value: "favorites", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Heart, { className: "h-4 w-4" }), "Favoritos"] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsTrigger, { value: "settings", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { className: "h-4 w-4" }), "Configuraci\u00F3n"] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsTrigger, { value: "security", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Shield, { className: "h-4 w-4" }), "Seguridad"] })] }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "profile", className: "space-y-6", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "shadow-lg border-0", children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { className: "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-white", children: "Informaci\u00F3n Personal" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { className: "text-purple-100", children: "Actualiza tu informaci\u00F3n personal y de contacto" })] }), !isEditing ? ((0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: () => setIsEditing(true), variant: "secondary", className: "bg-white/20 hover:bg-white/30", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "h-4 w-4 mr-2" }), "Editar"] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleSave, size: "sm", className: "bg-green-600 hover:bg-green-700", disabled: isSaving, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }), isSaving ? "Guardando..." : "Guardar"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleCancel, variant: "secondary", size: "sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4 mr-2" }), "Cancelar"] })] }))] }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-6 mb-8", children: [(0, jsx_runtime_1.jsx)(profile_avatar_1.default, { currentImage: user === null || user === void 0 ? void 0 : user.avatar, userName: (user === null || user === void 0 ? void 0 : user.name) || "Usuario", onImageChange: handleImageChange, size: "lg", isEditing: isEditing }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-2xl font-bold text-gray-900", children: user === null || user === void 0 ? void 0 : user.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Mail, { className: "h-4 w-4" }), user === null || user === void 0 ? void 0 : user.email] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4 mt-2", children: [(user === null || user === void 0 ? void 0 : user.isAdmin) && ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "secondary", className: "bg-purple-100 text-purple-800", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Shield, { className: "h-3 w-3 mr-1" }), "Administrador"] })), (0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "outline", className: "text-gray-600", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-3 w-3 mr-1" }), "Miembro desde ", getMemberSince()] })] })] })] }), (0, jsx_runtime_1.jsx)(separator_1.Separator, { className: "my-6" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "name", className: "text-sm font-medium", children: "Nombre completo" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "name", value: editForm.name, onChange: (e) => setEditForm(Object.assign(Object.assign({}, editForm), { name: e.target.value })), disabled: !isEditing, className: "pl-10 h-12" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "email", className: "text-sm font-medium", children: "Email" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "email", type: "email", value: editForm.email, onChange: (e) => setEditForm(Object.assign(Object.assign({}, editForm), { email: e.target.value })), disabled: !isEditing, className: "pl-10 h-12" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "phone", className: "text-sm font-medium", children: "Tel\u00E9fono" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Phone, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "phone", value: editForm.phone, onChange: (e) => {
                                                                                    setEditForm(Object.assign(Object.assign({}, editForm), { phone: e.target.value }));
                                                                                    setPhoneError(null);
                                                                                }, disabled: !isEditing, className: "pl-10 h-12" }), phoneError && ((0, jsx_runtime_1.jsx)("div", { className: "text-red-500 text-xs mt-1", children: phoneError }))] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4 mt-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MapPin, { className: "h-5 w-5 text-purple-600" }), (0, jsx_runtime_1.jsx)("h4", { className: "font-semibold text-lg", children: "Direcci\u00F3n de Env\u00EDo" })] }), isEditing ? ((0, jsx_runtime_1.jsx)(address_form_1.default, { initialAddress: editForm.address, onSave: async (address) => {
                                                                    await handleSaveAddress(address);
                                                                }, loading: isLoading, disabled: isLoading })) : ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-1", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Calle:" }), " ", ((_a = user === null || user === void 0 ? void 0 : user.address) === null || _a === void 0 ? void 0 : _a.street) || "-"] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Ciudad:" }), " ", ((_b = user === null || user === void 0 ? void 0 : user.address) === null || _b === void 0 ? void 0 : _b.city) || "-"] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Provincia/Estado:" }), " ", ((_c = user === null || user === void 0 ? void 0 : user.address) === null || _c === void 0 ? void 0 : _c.state) || "-"] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "C\u00F3digo Postal:" }), " ", ((_d = user === null || user === void 0 ? void 0 : user.address) === null || _d === void 0 ? void 0 : _d.zipCode) || "-"] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Pa\u00EDs:" }), " ", ((_e = user === null || user === void 0 ? void 0 : user.address) === null || _e === void 0 ? void 0 : _e.country) || "-"] })] }))] })] })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "orders", className: "space-y-6", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "shadow-lg border-0", children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg", children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center text-white", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingBag, { className: "h-6 w-6 mr-3" }), "Mis Pedidos"] }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { className: "text-green-100", children: "Historial de todos tus pedidos y su estado" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-6", children: loadingOrders ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Cargando pedidos..." })] })) : orders.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "space-y-6", children: orders.map((order) => {
                                                        var _a;
                                                        return ((0, jsx_runtime_1.jsxs)("div", { className: "border rounded-lg p-4 bg-gray-50", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-semibold", children: "Pedido:" }), " ", order.orderNumber || order.id, (0, jsx_runtime_1.jsx)("span", { className: "ml-4 font-semibold", children: "Fecha:" }), " ", order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", className: "capitalize", children: order.status }), order.isPaid && (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "secondary", className: "ml-2", children: "Pagado" })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "min-w-full text-sm", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { className: "text-left p-2", children: "Producto" }), (0, jsx_runtime_1.jsx)("th", { className: "text-left p-2", children: "Cantidad" }), (0, jsx_runtime_1.jsx)("th", { className: "text-left p-2", children: "Precio" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: order.items.map((item, idx) => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsxs)("td", { className: "p-2 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("img", { src: item.image || (item.product && item.product.images && item.product.images[0]) || '/placeholder.svg', alt: item.name, className: "w-10 h-10 object-cover rounded" }), (0, jsx_runtime_1.jsx)("span", { children: item.name || (item.product && item.product.name) })] }), (0, jsx_runtime_1.jsx)("td", { className: "p-2", children: item.quantity }), (0, jsx_runtime_1.jsxs)("td", { className: "p-2", children: ["$", item.price.toFixed(2)] })] }, idx))) })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-end mt-2", children: (0, jsx_runtime_1.jsxs)("span", { className: "font-semibold", children: ["Total: $", ((_a = order.total) === null || _a === void 0 ? void 0 : _a.toFixed(2)) || 'N/A'] }) })] }, order.id));
                                                    }) })) : ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingBag, { className: "h-12 w-12 text-green-600" }) }), (0, jsx_runtime_1.jsx)("h3", { className: "text-2xl font-bold text-gray-900 mb-3", children: "No hay pedidos a\u00FAn" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-6 max-w-md mx-auto", children: "Cuando hagas tu primer pedido, aparecer\u00E1 aqu\u00ED con todos los detalles y el estado de seguimiento." }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/shop", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { size: "lg", className: "bg-green-600 hover:bg-green-700", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingBag, { className: "h-5 w-5 mr-2" }), "Ir a la Tienda"] }) })] })) })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "favorites", className: "space-y-6", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "shadow-lg border-0", children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-t-lg", children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center text-white", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Heart, { className: "h-6 w-6 mr-3" }), "Mis Favoritos"] }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { className: "text-pink-100", children: "Productos que has marcado como favoritos" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-6", children: favorites && favorites.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: getFavoriteProducts().map((product) => ((0, jsx_runtime_1.jsx)(product_card_1.default, { product: product }, product.id))) })) : ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-pink-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Heart, { className: "h-12 w-12 text-pink-600" }) }), (0, jsx_runtime_1.jsx)("h3", { className: "text-2xl font-bold text-gray-900 mb-3", children: "No hay favoritos a\u00FAn" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-6 max-w-md mx-auto", children: "Marca productos como favoritos para verlos aqu\u00ED y acceder r\u00E1pidamente a ellos." }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/shop", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { size: "lg", className: "bg-pink-600 hover:bg-pink-700", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Heart, { className: "h-5 w-5 mr-2" }), "Explorar Productos"] }) })] })) })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "settings", className: "space-y-6", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "shadow-lg border-0", children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg", children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center text-white", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { className: "h-6 w-6 mr-3" }), "Configuraci\u00F3n de Notificaciones"] }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { className: "text-blue-100", children: "Gestiona c\u00F3mo recibes las notificaciones" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-6 space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-blue-100 p-2 rounded-lg", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Bell, { className: "h-5 w-5 text-blue-600" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold", children: "Notificaciones por email" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600", children: "Recibe actualizaciones sobre tus pedidos" })] })] }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { checked: settings.emailNotifications, onCheckedChange: (checked) => setSettings(Object.assign(Object.assign({}, settings), { emailNotifications: checked })) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-green-100 p-2 rounded-lg", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Phone, { className: "h-5 w-5 text-green-600" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold", children: "Notificaciones SMS" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600", children: "Recibe alertas por mensaje de texto" })] })] }), (0, jsx_runtime_1.jsx)(switch_1.Switch, { checked: settings.smsNotifications, onCheckedChange: (checked) => setSettings(Object.assign(Object.assign({}, settings), { smsNotifications: checked })) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 p-3 rounded-xl shadow-md", children: isDarkMode ? ((0, jsx_runtime_1.jsx)(lucide_react_1.Sun, { className: "h-6 w-6 text-yellow-500" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.Moon, { className: "h-6 w-6 text-gray-600 dark:text-gray-300" })) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold text-gray-900 dark:text-gray-100", children: "Modo oscuro" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: isDarkMode ? "Activa el modo claro para una experiencia más brillante" : "Activa el modo oscuro para una experiencia más suave" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(switch_1.Switch, { checked: isDarkMode, onCheckedChange: handleDarkModeToggle, className: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-blue-500" }), (0, jsx_runtime_1.jsx)("div", { className: "absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-0 transition-opacity duration-300 pointer-events-none" })] })] })] })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "security", className: "space-y-6", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "shadow-lg border-0", children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-t-lg", children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center text-white", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Shield, { className: "h-6 w-6 mr-3" }), "Seguridad de la Cuenta"] }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { className: "text-red-100", children: "Gestiona la seguridad de tu cuenta" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-6 space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-blue-100 p-2 rounded-lg", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { className: "h-5 w-5 text-blue-600" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold", children: "Cambiar contrase\u00F1a" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600", children: "Actualiza tu contrase\u00F1a de seguridad" })] })] }), (0, jsx_runtime_1.jsxs)(dialog_1.Dialog, { open: showPasswordDialog, onOpenChange: setShowPasswordDialog, children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", children: "Cambiar" }) }), (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { className: "sm:max-w-md", children: [(0, jsx_runtime_1.jsxs)(dialog_1.DialogHeader, { children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogTitle, { children: "Cambiar Contrase\u00F1a" }), (0, jsx_runtime_1.jsx)(dialog_1.DialogDescription, { children: "Ingresa tu contrase\u00F1a actual y la nueva contrase\u00F1a." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "currentPassword", children: "Contrase\u00F1a actual" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { id: "currentPassword", type: showPassword.current ? "text" : "password", value: passwordForm.currentPassword, onChange: (e) => setPasswordForm(Object.assign(Object.assign({}, passwordForm), { currentPassword: e.target.value })), className: "pr-10" }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", variant: "ghost", size: "sm", className: "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent", onClick: () => setShowPassword(Object.assign(Object.assign({}, showPassword), { current: !showPassword.current })), children: showPassword.current ? (0, jsx_runtime_1.jsx)(lucide_react_1.EyeOff, { className: "h-4 w-4" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "h-4 w-4" }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "newPassword", children: "Nueva contrase\u00F1a" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { id: "newPassword", type: showPassword.new ? "text" : "password", value: passwordForm.newPassword, onChange: (e) => setPasswordForm(Object.assign(Object.assign({}, passwordForm), { newPassword: e.target.value })), className: "pr-10" }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", variant: "ghost", size: "sm", className: "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent", onClick: () => setShowPassword(Object.assign(Object.assign({}, showPassword), { new: !showPassword.new })), children: showPassword.new ? (0, jsx_runtime_1.jsx)(lucide_react_1.EyeOff, { className: "h-4 w-4" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "h-4 w-4" }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "confirmPassword", children: "Confirmar nueva contrase\u00F1a" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { id: "confirmPassword", type: showPassword.confirm ? "text" : "password", value: passwordForm.confirmPassword, onChange: (e) => setPasswordForm(Object.assign(Object.assign({}, passwordForm), { confirmPassword: e.target.value })), className: "pr-10" }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", variant: "ghost", size: "sm", className: "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent", onClick: () => setShowPassword(Object.assign(Object.assign({}, showPassword), { confirm: !showPassword.confirm })), children: showPassword.confirm ? (0, jsx_runtime_1.jsx)(lucide_react_1.EyeOff, { className: "h-4 w-4" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "h-4 w-4" }) })] })] })] }), (0, jsx_runtime_1.jsxs)(dialog_1.DialogFooter, { children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: () => setShowPasswordDialog(false), children: "Cancelar" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handlePasswordChange, children: "Cambiar Contrase\u00F1a" })] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-red-100 p-2 rounded-lg", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-5 w-5 text-red-600" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold", children: "Eliminar cuenta" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600", children: "Elimina permanentemente tu cuenta" })] })] }), (0, jsx_runtime_1.jsxs)(dialog_1.Dialog, { open: showDeleteDialog, onOpenChange: setShowDeleteDialog, children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "destructive", size: "sm", children: "Eliminar" }) }), (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { children: [(0, jsx_runtime_1.jsxs)(dialog_1.DialogHeader, { children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogTitle, { children: "\u00BFEst\u00E1s seguro?" }), (0, jsx_runtime_1.jsx)(dialog_1.DialogDescription, { children: "Esta acci\u00F3n no se puede deshacer. Se eliminar\u00E1 permanentemente tu cuenta y todos tus datos." })] }), (0, jsx_runtime_1.jsxs)(dialog_1.DialogFooter, { children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: () => setShowDeleteDialog(false), children: "Cancelar" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "destructive", onClick: handleDeleteAccount, children: "S\u00ED, eliminar cuenta" })] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-gray-100 p-2 rounded-lg", children: (0, jsx_runtime_1.jsx)(lucide_react_1.LogOut, { className: "h-5 w-5 text-gray-600" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold", children: "Cerrar sesi\u00F3n" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600", children: "Cierra tu sesi\u00F3n actual" })] })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", onClick: logout, children: "Cerrar Sesi\u00F3n" })] })] })] }) })] })] }) }) }) }));
}
