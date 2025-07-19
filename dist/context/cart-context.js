"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartProvider = CartProvider;
exports.useCart = useCart;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const auth_context_1 = require("@/context/auth-context");
// Create the cart context
const CartContext = (0, react_1.createContext)(undefined);
// Create a provider component
function CartProvider({ children }) {
    const { user, isAuthenticated } = (0, auth_context_1.useAuth)();
    const [cart, setCart] = (0, react_1.useState)([]);
    // Helper to get the correct localStorage key
    const getCartKey = () => (user ? `mautik_cart_${user.id}` : "mautik_cart_temp");
    // MIGRATION: Migrate guest cart to user cart on login
    (0, react_1.useEffect)(() => {
        const migrateGuestCart = async () => {
            if (user && typeof window !== 'undefined') {
                const guestCartRaw = localStorage.getItem('mautik_cart_temp');
                if (guestCartRaw) {
                    try {
                        const guestCart = JSON.parse(guestCartRaw);
                        // Merge each item into the user's cart via API
                        for (const item of guestCart) {
                            await fetch("/api/cart", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({ productId: item.id, quantity: item.quantity }),
                            });
                        }
                        // Limpiar carrito de invitado
                        localStorage.removeItem('mautik_cart_temp');
                        // Refrescar carrito desde API
                        const res = await fetch("/api/cart", { credentials: "include" });
                        if (res.ok) {
                            const data = await res.json();
                            setCart(data.map((item) => ({
                                id: item.productId,
                                name: item.product.name,
                                price: item.product.price,
                                quantity: item.quantity,
                                images: item.product.images,
                                attributes: item.product.attributes || [],
                                discount: item.product.discount,
                                stock: item.product.stock,
                            })));
                        }
                    }
                    catch (e) {
                        // Si hay error, solo limpia el carrito local
                        localStorage.removeItem('mautik_cart_temp');
                    }
                }
            }
        };
        migrateGuestCart();
    }, [user]);
    // Cargar carrito desde API o localStorage
    (0, react_1.useEffect)(() => {
        const fetchCart = async () => {
            if (user) {
                // Usuario autenticado: cargar desde API
                try {
                    const res = await fetch("/api/cart", { credentials: "include" });
                    if (res.ok) {
                        const data = await res.json();
                        // Mapear formato API a CartItem local
                        setCart(data.map((item) => ({
                            id: item.productId,
                            name: item.product.name,
                            price: item.product.price,
                            quantity: item.quantity,
                            images: item.product.images,
                            attributes: item.product.attributes || [],
                            discount: item.product.discount,
                            stock: item.product.stock, // Assuming stock is part of the product data
                        })));
                    }
                    else {
                        setCart([]);
                    }
                }
                catch (_a) {
                    setCart([]);
                }
            }
            else {
                // Invitado: cargar desde localStorage
                const key = getCartKey();
                const savedCart = localStorage.getItem(key);
                if (savedCart) {
                    try {
                        setCart(JSON.parse(savedCart));
                    }
                    catch (_b) {
                        setCart([]);
                    }
                }
                else {
                    setCart([]);
                }
            }
        };
        fetchCart();
    }, [user]);
    // Guardar en localStorage solo si no hay usuario
    (0, react_1.useEffect)(() => {
        if (!user) {
            const key = getCartKey();
            localStorage.setItem(key, JSON.stringify(cart));
        }
    }, [cart, user]);
    // Add item to cart
    const addToCart = (0, react_1.useCallback)(async (item) => {
        if (user) {
            // API: agregar producto
            await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ productId: item.id, quantity: item.quantity }),
            });
            // Refrescar carrito
            const res = await fetch("/api/cart", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setCart(data.map((item) => ({
                    id: item.productId,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    images: item.product.images,
                    attributes: item.product.attributes || [],
                    discount: item.product.discount,
                    stock: item.product.stock, // Assuming stock is part of the product data
                })));
            }
        }
        else {
            setCart((prevCart) => {
                const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id);
                if (existingItemIndex !== -1) {
                    const updatedCart = [...prevCart];
                    updatedCart[existingItemIndex].quantity += item.quantity;
                    return updatedCart;
                }
                else {
                    return [...prevCart, Object.assign(Object.assign({}, item), { stock: item.stock })];
                }
            });
        }
    }, [user]);
    // Remove item from cart
    const removeFromCart = (0, react_1.useCallback)(async (id) => {
        if (user) {
            await fetch("/api/cart", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ productId: id }),
            });
            // Refrescar carrito
            const res = await fetch("/api/cart", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setCart(data.map((item) => ({
                    id: item.productId,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    images: item.product.images,
                    attributes: item.product.attributes || [],
                    discount: item.product.discount,
                    stock: item.product.stock, // Assuming stock is part of the product data
                })));
            }
        }
        else {
            setCart((prevCart) => prevCart.filter((item) => item.id !== id));
        }
    }, [user]);
    // Update item quantity
    const updateQuantity = (0, react_1.useCallback)(async (id, quantity) => {
        if (user) {
            await fetch("/api/cart", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ productId: id, quantity }),
            });
            // Refrescar carrito
            const res = await fetch("/api/cart", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setCart(data.map((item) => ({
                    id: item.productId,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    images: item.product.images,
                    attributes: item.product.attributes || [],
                    discount: item.product.discount,
                    stock: item.product.stock, // Assuming stock is part of the product data
                })));
            }
        }
        else {
            setCart((prevCart) => prevCart.map((item) => (item.id === id ? Object.assign(Object.assign({}, item), { quantity: Math.max(1, quantity) }) : item)));
        }
    }, [user]);
    // Clear cart
    const clearCart = (0, react_1.useCallback)(async () => {
        if (user) {
            await fetch("/api/cart", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({}),
            });
            setCart([]);
        }
        else {
            setCart([]);
        }
    }, [user]);
    // Calculate cart subtotal (before discounts)
    const getCartSubtotal = (0, react_1.useCallback)(() => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cart]);
    // Calculate cart discount
    const getCartDiscount = (0, react_1.useCallback)(() => {
        return cart.reduce((total, item) => {
            if (item.discount) {
                return total + (item.price * item.quantity * item.discount) / 100;
            }
            return total;
        }, 0);
    }, [cart]);
    // Calculate cart total (after discounts)
    const getCartTotal = (0, react_1.useCallback)(() => {
        return getCartSubtotal() - getCartDiscount();
    }, [getCartSubtotal, getCartDiscount]);
    // Función para limpiar referencias a productos eliminados
    const cleanDeletedProductReferences = (deletedProductIds) => {
        setCart(prev => prev.filter(item => !deletedProductIds.includes(item.id)));
    };
    // Función para verificar y limpiar productos eliminados
    const verifyAndCleanDeletedProducts = async () => {
        if (cart.length === 0)
            return;
        try {
            const productIds = cart.map(item => item.id);
            const deletedIds = [];
            // Verificar cada producto del carrito
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
                console.log(`🧹 Limpiando ${deletedIds.length} productos eliminados del carrito:`, deletedIds);
                cleanDeletedProductReferences(deletedIds);
                // toast({
                //   title: "Carrito actualizado",
                //   description: `Se eliminaron ${deletedIds.length} producto(s) que ya no están disponibles.`,
                //   variant: "default"
                // })
            }
        }
        catch (error) {
            console.error("Error verificando productos eliminados:", error);
        }
    };
    // Verificar productos eliminados al cargar el carrito
    (0, react_1.useEffect)(() => {
        if (cart.length > 0) {
            verifyAndCleanDeletedProducts();
        }
    }, [cart.length]);
    return ((0, jsx_runtime_1.jsx)(CartContext.Provider, { value: {
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartSubtotal,
            getCartDiscount,
        }, children: children }));
}
// Custom hook to use the cart context
function useCart() {
    const context = (0, react_1.useContext)(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
