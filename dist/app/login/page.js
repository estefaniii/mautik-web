"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const card_1 = require("@/components/ui/card");
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const auth_context_1 = require("@/context/auth-context");
const use_toast_1 = require("@/hooks/use-toast");
const head_1 = __importDefault(require("next/head"));
// Component that handles search params
function LoginForm() {
    const router = (0, navigation_1.useRouter)();
    const searchParams = (0, navigation_1.useSearchParams)();
    const { login, register, isLoading, loginWithGoogle } = (0, auth_context_1.useAuth)();
    const { toast } = (0, use_toast_1.useToast)();
    const [activeTab, setActiveTab] = (0, react_1.useState)("login");
    const [showPassword, setShowPassword] = (0, react_1.useState)(false);
    const [showConfirmPassword, setShowConfirmPassword] = (0, react_1.useState)(false);
    const [formError, setFormError] = (0, react_1.useState)(null);
    // Check for register parameter on mount
    (0, react_1.useEffect)(() => {
        const registerParam = searchParams.get("register");
        if (registerParam === "true") {
            setActiveTab("register");
        }
    }, [searchParams]);
    // Login form state
    const [loginForm, setLoginForm] = (0, react_1.useState)({
        email: "",
        password: ""
    });
    // Register form state
    const [registerForm, setRegisterForm] = (0, react_1.useState)({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const handleLogin = async (e) => {
        e.preventDefault();
        setFormError(null);
        if (!loginForm.email || !loginForm.password) {
            toast({
                title: "Campos requeridos",
                description: "Por favor completa todos los campos.",
                variant: "destructive"
            });
            return;
        }
        const result = await login(loginForm.email, loginForm.password);
        if (result.success) {
            toast({
                title: "¡Bienvenido!",
                description: "Has iniciado sesión exitosamente.",
            });
            router.push("/");
        }
        else {
            setFormError(result.error || "Credenciales incorrectas.");
            toast({
                title: "Error de inicio de sesión",
                description: result.error || "Credenciales incorrectas.",
                variant: "destructive"
            });
        }
    };
    const handleRegister = async (e) => {
        e.preventDefault();
        setFormError(null);
        if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
            toast({
                title: "Campos requeridos",
                description: "Por favor completa todos los campos.",
                variant: "destructive"
            });
            return;
        }
        if (registerForm.password !== registerForm.confirmPassword) {
            toast({
                title: "Contraseñas no coinciden",
                description: "Las contraseñas deben ser iguales.",
                variant: "destructive"
            });
            return;
        }
        if (registerForm.password.length < 6) {
            toast({
                title: "Contraseña muy corta",
                description: "La contraseña debe tener al menos 6 caracteres.",
                variant: "destructive"
            });
            return;
        }
        const result = await register(registerForm.name, registerForm.email, registerForm.password);
        if (result.success) {
            toast({
                title: "¡Cuenta creada!",
                description: "Tu cuenta ha sido creada exitosamente.",
            });
            router.push("/");
        }
        else {
            setFormError(result.error || "Error al crear la cuenta.");
            toast({
                title: "Error de registro",
                description: result.error || "Error al crear la cuenta.",
                variant: "destructive"
            });
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "w-full max-w-md", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center mb-8", children: [(0, jsx_runtime_1.jsxs)(link_1.default, { href: "/", className: "inline-flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Sparkles, { className: "h-8 w-8 text-purple-600" }), (0, jsx_runtime_1.jsx)("span", { className: "text-3xl font-bold text-purple-900", children: "Mautik" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mt-2", children: "Accede a tu cuenta o crea una nueva" })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "shadow-xl border-0", children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "space-y-1", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-2xl font-bold text-center", children: "Bienvenido" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { className: "text-center", children: "Ingresa tus credenciales para acceder a tu cuenta" }), formError && ((0, jsx_runtime_1.jsx)("div", { className: "text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 text-center mt-4", children: formError }))] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [(0, jsx_runtime_1.jsxs)(tabs_1.TabsList, { className: "grid w-full grid-cols-2", children: [(0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "login", children: "Iniciar Sesi\u00F3n" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "register", children: "Registrarse" })] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsContent, { value: "login", className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("form", { onSubmit: handleLogin, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "login-email", children: "Email" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "login-email", type: "email", placeholder: "tu@email.com", value: loginForm.email, onChange: (e) => setLoginForm(Object.assign(Object.assign({}, loginForm), { email: e.target.value })), className: "pl-10", required: true, disabled: isLoading, "aria-label": "Correo electr\u00F3nico" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "login-password", children: "Contrase\u00F1a" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "login-password", type: showPassword ? "text" : "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: loginForm.password, onChange: (e) => setLoginForm(Object.assign(Object.assign({}, loginForm), { password: e.target.value })), className: "pl-10 pr-10", required: true, disabled: isLoading, "aria-label": "Contrase\u00F1a", autoComplete: "current-password" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600", "aria-label": showPassword ? "Ocultar contraseña" : "Mostrar contraseña", children: showPassword ? (0, jsx_runtime_1.jsx)(lucide_react_1.EyeOff, { className: "h-4 w-4" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "h-4 w-4" }) })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-between", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/forgot-password", className: "text-sm text-purple-600 hover:text-purple-700", children: "\u00BFOlvidaste tu contrase\u00F1a?" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "submit", className: "w-full bg-purple-800 hover:bg-purple-900", disabled: isLoading, children: isLoading ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), (0, jsx_runtime_1.jsx)("span", { children: "Iniciando sesi\u00F3n..." })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("span", { children: "Iniciar Sesi\u00F3n" }), (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowRight, { className: "h-4 w-4" })] })) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "relative my-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 flex items-center", children: (0, jsx_runtime_1.jsx)("span", { className: "w-full border-t" }) }), (0, jsx_runtime_1.jsx)("div", { className: "relative flex justify-center text-xs uppercase", children: (0, jsx_runtime_1.jsx)("span", { className: "bg-white px-2 text-gray-500", children: "O contin\u00FAa con" }) })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", className: "w-full", onClick: async () => {
                                                    const result = await loginWithGoogle();
                                                    if (result.success) {
                                                        toast({
                                                            title: "¡Bienvenido!",
                                                            description: "Has iniciado sesión con Google exitosamente.",
                                                        });
                                                        router.push("/");
                                                    }
                                                    else {
                                                        toast({
                                                            title: "Error de inicio de sesión",
                                                            description: result.error || "Error al conectar con Google.",
                                                            variant: "destructive"
                                                        });
                                                    }
                                                }, disabled: isLoading, children: [(0, jsx_runtime_1.jsxs)("svg", { className: "mr-2 h-4 w-4", viewBox: "0 0 24 24", children: [(0, jsx_runtime_1.jsx)("path", { fill: "#4285F4", d: "M21.35 11.1h-9.18v2.92h5.27c-.23 1.23-1.4 3.6-5.27 3.6-3.17 0-5.76-2.62-5.76-5.82s2.59-5.82 5.76-5.82c1.81 0 3.03.77 3.73 1.43l2.55-2.48C17.09 3.59 15.01 2.5 12.17 2.5c-3.7 0-6.84 2.13-8.28 5z" }), (0, jsx_runtime_1.jsx)("path", { fill: "#34A853", d: "M3.89 7.5l2.4 1.76c.65-1.23 2.01-2.7 5.88-2.7 1.81 0 3.03.77 3.73 1.43l2.55-2.48C17.09 3.59 15.01 2.5 12.17 2.5c-3.7 0-6.84 2.13-8.28 5l3.23 2.5c.4-.75 1.13-1.52 2.05-1.52.89 0 1.62.73 1.62 1.62 0 .89-.73 1.62-1.62 1.62-.92 0-1.65-.77-2.05-1.52l-3.23 2.5c1.44 2.87 4.58 5 8.28 5z" }), (0, jsx_runtime_1.jsx)("path", { fill: "#FBBC05", d: "M12.17 21.83c2.84 0 5.22-.94 6.96-2.56l-3.21-2.63c-.89.6-2.09.96-3.75.96-3.17 0-5.76-2.62-5.76-5.82 0-.91.23-1.77.63-2.52l-3.23-2.5C2.59 8.35 2.5 10.22 2.5 12.17c0 5.19 4.48 9.66 9.67 9.66z" }), (0, jsx_runtime_1.jsx)("path", { fill: "#EA4335", d: "M21.35 11.1h-9.18v2.92h5.27c-.23 1.23-1.4 3.6-5.27 3.6-3.17 0-5.76-2.62-5.76-5.82s2.59-5.82 5.76-5.82c1.81 0 3.03.77 3.73 1.43l2.55-2.48C17.09 3.59 15.01 2.5 12.17 2.5c-3.7 0-6.84 2.13-8.28 5l3.23 2.5c.4-.75 1.13-1.52 2.05-1.52.89 0 1.62.73 1.62 1.62 0 .89-.73 1.62-1.62 1.62-.92 0-1.65-.77-2.05-1.52l-3.23 2.5c1.44 2.87 4.58 5 8.28 5z" })] }), "Iniciar sesi\u00F3n con Google"] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center text-sm text-gray-600 mt-4", children: ["Al crear una cuenta, aceptas nuestros", " ", (0, jsx_runtime_1.jsx)(link_1.default, { href: "/terms-of-service", className: "text-purple-600 hover:text-purple-700", children: "T\u00E9rminos de Servicio" }), " ", "y", " ", (0, jsx_runtime_1.jsx)(link_1.default, { href: "/privacy-policy", className: "text-purple-600 hover:text-purple-700", children: "Pol\u00EDtica de Privacidad" })] })] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsContent, { value: "register", className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("form", { onSubmit: handleRegister, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "register-name", children: "Nombre completo" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "register-name", type: "text", placeholder: "Tu nombre completo", value: registerForm.name, onChange: (e) => setRegisterForm(Object.assign(Object.assign({}, registerForm), { name: e.target.value })), className: "pl-10", required: true, disabled: isLoading, "aria-label": "Nombre completo" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "register-email", children: "Email" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "register-email", type: "email", placeholder: "tu@email.com", value: registerForm.email, onChange: (e) => setRegisterForm(Object.assign(Object.assign({}, registerForm), { email: e.target.value })), className: "pl-10", required: true, disabled: isLoading, "aria-label": "Correo electr\u00F3nico" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "register-password", children: "Contrase\u00F1a" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "register-password", type: showConfirmPassword ? "text" : "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: registerForm.password, onChange: (e) => setRegisterForm(Object.assign(Object.assign({}, registerForm), { password: e.target.value })), className: "pl-10 pr-10", required: true, disabled: isLoading, "aria-label": "Contrase\u00F1a", autoComplete: "new-password" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setShowConfirmPassword(!showConfirmPassword), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600", "aria-label": showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña", children: showConfirmPassword ? (0, jsx_runtime_1.jsx)(lucide_react_1.EyeOff, { className: "h-4 w-4" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "h-4 w-4" }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "register-confirm-password", children: "Confirmar contrase\u00F1a" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "register-confirm-password", type: showConfirmPassword ? "text" : "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: registerForm.confirmPassword, onChange: (e) => setRegisterForm(Object.assign(Object.assign({}, registerForm), { confirmPassword: e.target.value })), className: "pl-10", required: true, disabled: isLoading, "aria-label": "Confirmar contrase\u00F1a", autoComplete: "new-password" })] })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "submit", className: "w-full bg-purple-800 hover:bg-purple-900", disabled: isLoading, children: isLoading ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), (0, jsx_runtime_1.jsx)("span", { children: "Creando cuenta..." })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("span", { children: "Crear Cuenta" }), (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowRight, { className: "h-4 w-4" })] })) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "relative my-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 flex items-center", children: (0, jsx_runtime_1.jsx)("span", { className: "w-full border-t" }) }), (0, jsx_runtime_1.jsx)("div", { className: "relative flex justify-center text-xs uppercase", children: (0, jsx_runtime_1.jsx)("span", { className: "bg-white px-2 text-gray-500", children: "O contin\u00FAa con" }) })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", className: "w-full", onClick: async () => {
                                                    const result = await loginWithGoogle();
                                                    if (result.success) {
                                                        toast({
                                                            title: "¡Bienvenido!",
                                                            description: "Has iniciado sesión con Google exitosamente.",
                                                        });
                                                        router.push("/");
                                                    }
                                                    else {
                                                        toast({
                                                            title: "Error de inicio de sesión",
                                                            description: result.error || "Error al conectar con Google.",
                                                            variant: "destructive"
                                                        });
                                                    }
                                                }, disabled: isLoading, children: [(0, jsx_runtime_1.jsxs)("svg", { className: "mr-2 h-4 w-4", viewBox: "0 0 24 24", children: [(0, jsx_runtime_1.jsx)("path", { fill: "#4285F4", d: "M21.35 11.1h-9.18v2.92h5.27c-.23 1.23-1.4 3.6-5.27 3.6-3.17 0-5.76-2.62-5.76-5.82s2.59-5.82 5.76-5.82c1.81 0 3.03.77 3.73 1.43l2.55-2.48C17.09 3.59 15.01 2.5 12.17 2.5c-3.7 0-6.84 2.13-8.28 5z" }), (0, jsx_runtime_1.jsx)("path", { fill: "#34A853", d: "M3.89 7.5l2.4 1.76c.65-1.23 2.01-2.7 5.88-2.7 1.81 0 3.03.77 3.73 1.43l2.55-2.48C17.09 3.59 15.01 2.5 12.17 2.5c-3.7 0-6.84 2.13-8.28 5l3.23 2.5c.4-.75 1.13-1.52 2.05-1.52.89 0 1.62.73 1.62 1.62 0 .89-.73 1.62-1.62 1.62-.92 0-1.65-.77-2.05-1.52l-3.23 2.5c1.44 2.87 4.58 5 8.28 5z" }), (0, jsx_runtime_1.jsx)("path", { fill: "#FBBC05", d: "M12.17 21.83c2.84 0 5.22-.94 6.96-2.56l-3.21-2.63c-.89.6-2.09.96-3.75.96-3.17 0-5.76-2.62-5.76-5.82 0-.91.23-1.77.63-2.52l-3.23-2.5C2.59 8.35 2.5 10.22 2.5 12.17c0 5.19 4.48 9.66 9.67 9.66z" }), (0, jsx_runtime_1.jsx)("path", { fill: "#EA4335", d: "M21.35 11.1h-9.18v2.92h5.27c-.23 1.23-1.4 3.6-5.27 3.6-3.17 0-5.76-2.62-5.76-5.82s2.59-5.82 5.76-5.82c1.81 0 3.03.77 3.73 1.43l2.55-2.48C17.09 3.59 15.01 2.5 12.17 2.5c-3.7 0-6.84 2.13-8.28 5l3.23 2.5c.4-.75 1.13-1.52 2.05-1.52.89 0 1.62.73 1.62 1.62 0 .89-.73 1.62-1.62 1.62-.92 0-1.65-.77-2.05-1.52l-3.23 2.5c1.44 2.87 4.58 5 8.28 5z" })] }), "Registrarse con Google"] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center text-sm text-gray-600 mt-4", children: ["Al crear una cuenta, aceptas nuestros", " ", (0, jsx_runtime_1.jsx)(link_1.default, { href: "/terms-of-service", className: "text-purple-600 hover:text-purple-700", children: "T\u00E9rminos de Servicio" }), " ", "y", " ", (0, jsx_runtime_1.jsx)(link_1.default, { href: "/privacy-policy", className: "text-purple-600 hover:text-purple-700", children: "Pol\u00EDtica de Privacidad" })] })] })] }) })] })] }) }));
}
// Main component with Suspense boundary
function LoginPage() {
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(head_1.default, { children: [(0, jsx_runtime_1.jsx)("title", { children: "Iniciar sesi\u00F3n o registrarse | Mautik" }), (0, jsx_runtime_1.jsx)("meta", { name: "description", content: "Accede a tu cuenta o crea una nueva en Mautik. Compra productos \u00FAnicos y gestiona tus pedidos f\u00E1cilmente." })] }), (0, jsx_runtime_1.jsx)(react_1.Suspense, { fallback: (0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" }) }), children: (0, jsx_runtime_1.jsx)(LoginForm, {}) })] }));
}
