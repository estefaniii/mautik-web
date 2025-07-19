"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistProvider = WishlistProvider;
exports.useWishlist = useWishlist;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const auth_context_1 = require("./auth-context");
const use_toast_1 = require("@/hooks/use-toast");
const WishlistContext = (0, react_1.createContext)(undefined);
function WishlistProvider({ children }) {
    const [wishlist, setWishlist] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const { user } = (0, auth_context_1.useAuth)();
    const { toast } = (0, use_toast_1.useToast)();
    // Cargar wishlist desde localStorage
    const loadWishlistFromStorage = (0, react_1.useCallback)(() => {
        try {
            const stored = localStorage.getItem('mautik_wishlist');
            if (stored) {
                const items = JSON.parse(stored);
                return items.map((item) => (Object.assign(Object.assign({}, item), { addedAt: new Date(item.addedAt) })));
            }
        }
        catch (error) {
            console.error('Error loading wishlist from storage:', error);
        }
        return [];
    }, []);
    // Guardar wishlist en localStorage
    const saveWishlistToStorage = (0, react_1.useCallback)((items) => {
        try {
            localStorage.setItem('mautik_wishlist', JSON.stringify(items));
        }
        catch (error) {
            console.error('Error saving wishlist to storage:', error);
        }
    }, []);
    // Sincronizar wishlist con el servidor
    const syncWishlist = (0, react_1.useCallback)(async () => {
        if (!user)
            return;
        try {
            // Obtener wishlist del servidor
            const response = await fetch('/api/wishlist', {
                credentials: 'include'
            });
            if (response.ok) {
                const serverWishlist = await response.json();
                // Combinar wishlist local y del servidor
                const localWishlist = loadWishlistFromStorage();
                const combinedWishlist = [...localWishlist, ...serverWishlist];
                // Eliminar duplicados
                const uniqueWishlist = combinedWishlist.filter((item, index, self) => index === self.findIndex(t => t.id === item.id));
                setWishlist(uniqueWishlist);
                saveWishlistToStorage(uniqueWishlist);
                // Enviar wishlist combinada al servidor
                await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(uniqueWishlist)
                });
            }
        }
        catch (error) {
            console.error('Error syncing wishlist:', error);
        }
    }, [user, loadWishlistFromStorage, saveWishlistToStorage]);
    // Cargar wishlist inicial
    (0, react_1.useEffect)(() => {
        const localWishlist = loadWishlistFromStorage();
        setWishlist(localWishlist);
        setLoading(false);
    }, [loadWishlistFromStorage]);
    // Sincronizar cuando el usuario se autentica
    (0, react_1.useEffect)(() => {
        if (user) {
            syncWishlist();
        }
    }, [user, syncWishlist]);
    // Agregar a wishlist
    const addToWishlist = (0, react_1.useCallback)(async (product) => {
        const newItem = Object.assign(Object.assign({}, product), { addedAt: new Date() });
        setWishlist(prev => {
            const updated = [...prev, newItem];
            saveWishlistToStorage(updated);
            return updated;
        });
        // Sincronizar con servidor si el usuario está autenticado
        if (user) {
            try {
                await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify([newItem])
                });
            }
            catch (error) {
                console.error('Error syncing wishlist to server:', error);
            }
        }
        toast({
            title: "Agregado a favoritos",
            description: `${product.name} se ha agregado a tu lista de deseos.`,
        });
    }, [user, saveWishlistToStorage, toast]);
    // Remover de wishlist
    const removeFromWishlist = (0, react_1.useCallback)(async (productId) => {
        const product = wishlist.find(item => item.id === productId);
        setWishlist(prev => {
            const updated = prev.filter(item => item.id !== productId);
            saveWishlistToStorage(updated);
            return updated;
        });
        // Sincronizar con servidor si el usuario está autenticado
        if (user) {
            try {
                await fetch(`/api/wishlist/${productId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
            }
            catch (error) {
                console.error('Error removing from server wishlist:', error);
            }
        }
        if (product) {
            toast({
                title: "Removido de favoritos",
                description: `${product.name} se ha removido de tu lista de deseos.`,
            });
        }
    }, [wishlist, user, saveWishlistToStorage, toast]);
    // Verificar si está en wishlist
    const isInWishlist = (0, react_1.useCallback)((productId) => {
        return wishlist.some(item => item.id === productId);
    }, [wishlist]);
    // Limpiar wishlist
    const clearWishlist = (0, react_1.useCallback)(async () => {
        setWishlist([]);
        saveWishlistToStorage([]);
        if (user) {
            try {
                await fetch('/api/wishlist', {
                    method: 'DELETE',
                    credentials: 'include'
                });
            }
            catch (error) {
                console.error('Error clearing server wishlist:', error);
            }
        }
        toast({
            title: "Lista de deseos limpiada",
            description: "Se han removido todos los productos de tu lista de deseos.",
        });
    }, [user, saveWishlistToStorage, toast]);
    const value = {
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount: wishlist.length,
        loading,
        syncWishlist
    };
    return ((0, jsx_runtime_1.jsx)(WishlistContext.Provider, { value: value, children: children }));
}
function useWishlist() {
    const context = (0, react_1.useContext)(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
