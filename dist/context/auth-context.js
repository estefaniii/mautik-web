"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = useAuth;
exports.AuthProvider = AuthProvider;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_2 = require("next-auth/react");
const navigation_1 = require("next/navigation");
const AuthContext = (0, react_1.createContext)(undefined);
function useAuth() {
    const context = (0, react_1.useContext)(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
function AuthProvider({ children }) {
    const { data: session, status } = (0, react_2.useSession)();
    const router = (0, navigation_1.useRouter)();
    const [user, setUser] = (0, react_1.useState)(null);
    const [isAuthenticated, setIsAuthenticated] = (0, react_1.useState)(false);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    // Sync NextAuth session with our user state
    (0, react_1.useEffect)(() => {
        if (status === 'loading') {
            setIsLoading(true);
            return;
        }
        if (session === null || session === void 0 ? void 0 : session.user) {
            const userData = {
                id: session.user.id || "",
                name: session.user.name || "",
                email: session.user.email || "",
                avatar: session.user.image || session.user.avatar || "",
                isAdmin: session.user.isAdmin || false,
            };
            setUser(userData);
            setIsAuthenticated(true);
        }
        else {
            setUser(null);
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    }, [session, status]);
    const login = async (email, password) => {
        try {
            const result = await (0, react_2.signIn)('credentials', {
                email,
                password,
                redirect: false,
            });
            if (result === null || result === void 0 ? void 0 : result.error) {
                return { success: false, error: result.error };
            }
            return { success: true };
        }
        catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Error de conexión' };
        }
    };
    const loginWithGoogle = async () => {
        try {
            const result = await (0, react_2.signIn)('google', {
                redirect: false,
            });
            if (result === null || result === void 0 ? void 0 : result.error) {
                return { success: false, error: result.error };
            }
            return { success: true };
        }
        catch (error) {
            console.error('Google login error:', error);
            return { success: false, error: 'Error de conexión con Google' };
        }
    };
    const register = async (name, email, password) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                // After successful registration, sign in with credentials
                const loginResult = await (0, react_2.signIn)('credentials', {
                    email,
                    password,
                    redirect: false,
                });
                if (loginResult === null || loginResult === void 0 ? void 0 : loginResult.error) {
                    return { success: false, error: loginResult.error };
                }
                return { success: true };
            }
            else {
                return { success: false, error: data.error };
            }
        }
        catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Error de conexión' };
        }
    };
    const logout = async () => {
        try {
            await (0, react_2.signOut)({ redirect: false });
            setUser(null);
            setIsAuthenticated(false);
        }
        catch (error) {
            console.error('Logout error:', error);
        }
    };
    const checkAuth = async () => {
        // This is handled by NextAuth session
        setIsLoading(false);
    };
    const updateProfile = async (updates) => {
        try {
            if (!user) {
                return { success: false, error: 'Usuario no autenticado' };
            }
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });
            const data = await response.json();
            if (response.ok) {
                setUser(data.user);
                return { success: true, user: data.user };
            }
            else {
                return { success: false, error: data.error || 'Error al actualizar el perfil' };
            }
        }
        catch (error) {
            console.error('Update profile error:', error);
            return { success: false, error: 'Error de conexión al actualizar el perfil' };
        }
    };
    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        checkAuth,
        updateProfile,
    };
    return (0, jsx_runtime_1.jsx)(AuthContext.Provider, { value: value, children: children });
}
