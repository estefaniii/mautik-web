"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoritesProvider = FavoritesProvider;
exports.useFavorites = useFavorites;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const use_toast_1 = require("@/hooks/use-toast");
const auth_context_1 = require("@/context/auth-context");
const FavoritesContext = (0, react_1.createContext)(undefined);
function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const { user } = (0, auth_context_1.useAuth)();
    const { toast } = (0, use_toast_1.useToast)();
    // Load favorites from API or localStorage
    const loadFavorites = async () => {
        setLoading(true);
        try {
            if (user) {
                // Load from API for authenticated users
                const response = await fetch('/api/wishlist');
                if (response.ok) {
                    const apiFavorites = await response.json();
                    setFavorites(apiFavorites);
                }
                else {
                    console.error('Error loading favorites from API:', response.status);
                    setFavorites([]);
                }
            }
            else {
                // Load from localStorage for non-authenticated users
                const tempFavorites = localStorage.getItem("mautik_favorites_temp");
                if (tempFavorites) {
                    try {
                        const parsedFavorites = JSON.parse(tempFavorites);
                        setFavorites(parsedFavorites);
                    }
                    catch (error) {
                        console.error("Error parsing temp favorites:", error);
                        localStorage.removeItem("mautik_favorites_temp");
                        setFavorites([]);
                    }
                }
                else {
                    setFavorites([]);
                }
            }
        }
        catch (error) {
            console.error("Error loading favorites:", error);
            setFavorites([]);
        }
        finally {
            setLoading(false);
        }
    };
    // Load favorites on mount and when user changes
    (0, react_1.useEffect)(() => {
        loadFavorites();
    }, [user]);
    // Save favorites to localStorage for non-authenticated users
    (0, react_1.useEffect)(() => {
        if (!user && favorites.length > 0) {
            localStorage.setItem("mautik_favorites_temp", JSON.stringify(favorites));
        }
    }, [favorites, user]);
    const isFavorite = (productId) => {
        return favorites.some(fav => fav.id === productId);
    };
    const addToFavorites = async (productId) => {
        if (isFavorite(productId)) {
            toast({
                title: "Ya está en favoritos",
                description: "Este producto ya está en tu lista de favoritos.",
            });
            return;
        }
        try {
            if (user) {
                // Add to API for authenticated users
                const response = await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify([{
                            id: productId,
                            addedAt: new Date().toISOString()
                        }]),
                });
                if (response.ok) {
                    // Reload favorites from API
                    await loadFavorites();
                    toast({
                        title: "Añadido a favoritos",
                        description: "Producto añadido a tus favoritos.",
                    });
                }
                else {
                    throw new Error('Failed to add to favorites');
                }
            }
            else {
                // Add to localStorage for non-authenticated users
                const newFavorite = {
                    id: productId,
                    name: '', // Will be filled when product data is available
                    price: 0,
                    description: '',
                    images: [],
                    category: '',
                    stock: 0,
                    rating: 0,
                    reviewCount: 0,
                    featured: false,
                    isNew: false,
                    addedAt: new Date().toISOString()
                };
                setFavorites(prev => [...prev, newFavorite]);
                toast({
                    title: "Añadido a favoritos",
                    description: "Producto añadido a tus favoritos.",
                });
            }
        }
        catch (error) {
            console.error("Error adding to favorites:", error);
            toast({
                title: "Error",
                description: "No se pudo añadir a favoritos.",
                variant: "destructive"
            });
        }
    };
    const removeFromFavorites = async (productId) => {
        try {
            if (user) {
                // Remove from API for authenticated users
                const response = await fetch('/api/wishlist', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productId }),
                });
                if (response.ok) {
                    // Reload favorites from API
                    await loadFavorites();
                    toast({
                        title: "Eliminado de favoritos",
                        description: "Producto eliminado de tus favoritos.",
                    });
                }
                else {
                    throw new Error('Failed to remove from favorites');
                }
            }
            else {
                // Remove from localStorage for non-authenticated users
                setFavorites(prev => prev.filter(fav => fav.id !== productId));
                toast({
                    title: "Eliminado de favoritos",
                    description: "Producto eliminado de tus favoritos.",
                });
            }
        }
        catch (error) {
            console.error("Error removing from favorites:", error);
            toast({
                title: "Error",
                description: "No se pudo eliminar de favoritos.",
                variant: "destructive"
            });
        }
    };
    const toggleFavorite = (productId) => {
        if (isFavorite(productId)) {
            removeFromFavorites(productId);
        }
        else {
            addToFavorites(productId);
        }
    };
    const clearFavorites = async () => {
        try {
            if (user) {
                // Clear from API for authenticated users
                const response = await fetch('/api/wishlist', {
                    method: 'DELETE',
                });
                if (response.ok) {
                    setFavorites([]);
                    toast({
                        title: "Favoritos eliminados",
                        description: "Se han eliminado todos tus favoritos.",
                    });
                }
                else {
                    throw new Error('Failed to clear favorites');
                }
            }
            else {
                // Clear from localStorage for non-authenticated users
                setFavorites([]);
                localStorage.removeItem("mautik_favorites_temp");
                toast({
                    title: "Favoritos eliminados",
                    description: "Se han eliminado todos tus favoritos.",
                });
            }
        }
        catch (error) {
            console.error("Error clearing favorites:", error);
            toast({
                title: "Error",
                description: "No se pudieron eliminar los favoritos.",
                variant: "destructive"
            });
        }
    };
    const getFavoriteProducts = () => {
        return favorites;
    };
    // Función para limpiar referencias a productos eliminados
    const cleanDeletedProductReferences = (deletedProductIds) => {
        setFavorites(prev => prev.filter(fav => !deletedProductIds.includes(fav.id)));
    };
    // Función para verificar y limpiar productos eliminados
    const verifyAndCleanDeletedProducts = async () => {
        if (favorites.length === 0)
            return;
        try {
            const productIds = favorites.map(fav => fav.id);
            const deletedIds = [];
            // Verificar cada producto favorito
            for (const productId of productIds) {
                try {
                    const response = await fetch(`/api/products/${productId}`);
                    if (response.status === 404) {
                        deletedIds.push(productId);
                    }
                }
                catch (error) {
                    console.error(`Error verificando producto ${productId}:`, error);
                }
            }
            if (deletedIds.length > 0) {
                console.log(`🧹 Limpiando ${deletedIds.length} productos eliminados de favoritos:`, deletedIds);
                cleanDeletedProductReferences(deletedIds);
                toast({
                    title: "Favoritos actualizados",
                    description: `Se eliminaron ${deletedIds.length} producto(s) que ya no están disponibles.`,
                    variant: "default"
                });
            }
        }
        catch (error) {
            console.error("Error verificando productos eliminados:", error);
        }
    };
    // Verificar productos eliminados al cargar favoritos
    (0, react_1.useEffect)(() => {
        if (favorites.length > 0) {
            verifyAndCleanDeletedProducts();
        }
    }, [favorites.length]);
    const value = {
        favorites,
        isFavorite,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        clearFavorites,
        getFavoriteProducts,
        favoritesCount: favorites.length,
        cleanDeletedProductReferences,
        loading
    };
    return ((0, jsx_runtime_1.jsx)(FavoritesContext.Provider, { value: value, children: children }));
}
function useFavorites() {
    const context = (0, react_1.useContext)(FavoritesContext);
    if (context === undefined) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
}
