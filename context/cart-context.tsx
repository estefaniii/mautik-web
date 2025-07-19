"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { ReactNode } from "react"
import { useAuth } from "@/context/auth-context"

// Define the cart item type
export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  images: string[]
  attributes: { name: string; value: string }[]
  discount?: number
  stock: number
  category?: string // <-- Agregado para compatibilidad con recomendaciones
}

// Define the cart context type
interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartSubtotal: () => number
  getCartDiscount: () => number
}

// Create the cart context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Create a provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])

  // Helper to get the correct localStorage key
  const getCartKey = () => (user ? `mautik_cart_${user.id}` : "mautik_cart_temp")

  // MIGRATION: Migrate guest cart to user cart on login
  useEffect(() => {
    const migrateGuestCart = async () => {
      if (user && typeof window !== 'undefined') {
        const guestCartRaw = localStorage.getItem('mautik_cart_temp')
        if (guestCartRaw) {
          try {
            const guestCart: CartItem[] = JSON.parse(guestCartRaw)
            // Merge each item into the user's cart via API
            for (const item of guestCart) {
              await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ productId: item.id, quantity: item.quantity }),
              })
            }
            // Limpiar carrito de invitado
            localStorage.removeItem('mautik_cart_temp')
            // Refrescar carrito desde API
            const res = await fetch("/api/cart", { credentials: "include" })
            if (res.ok) {
              const data = await res.json()
              setCart(
                data.map((item: any) => ({
                  id: item.productId,
                  name: item.product.name,
                  price: item.product.price,
                  quantity: item.quantity,
                  images: item.product.images,
                  attributes: item.product.attributes || [],
                  discount: item.product.discount,
                  stock: item.product.stock,
                }))
              )
            }
          } catch (e) {
            // Si hay error, solo limpia el carrito local
            localStorage.removeItem('mautik_cart_temp')
          }
        }
      }
    }
    migrateGuestCart()
  }, [user])

  // Cargar carrito desde API o localStorage
  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        // Usuario autenticado: cargar desde API
        try {
          const res = await fetch("/api/cart", { credentials: "include" })
          if (res.ok) {
            const data = await res.json()
            // Mapear formato API a CartItem local
            setCart(
              data.map((item: any) => ({
                id: item.productId,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                images: item.product.images,
                attributes: item.product.attributes || [],
                discount: item.product.discount,
                stock: item.product.stock, // Assuming stock is part of the product data
              }))
            )
          } else {
            setCart([])
          }
        } catch {
          setCart([])
        }
      } else {
        // Invitado: cargar desde localStorage
        const key = getCartKey()
        const savedCart = localStorage.getItem(key)
        if (savedCart) {
          try {
            setCart(JSON.parse(savedCart))
          } catch {
            setCart([])
          }
        } else {
          setCart([])
        }
      }
    }
    fetchCart()
  }, [user])

  // Guardar en localStorage solo si no hay usuario
  useEffect(() => {
    if (!user) {
      const key = getCartKey()
      localStorage.setItem(key, JSON.stringify(cart))
    }
  }, [cart, user])

  // Add item to cart
  const addToCart = useCallback(async (item: CartItem) => {
    if (user) {
      // API: agregar producto
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: item.id, quantity: item.quantity }),
      })
      // Refrescar carrito
      const res = await fetch("/api/cart", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setCart(
          data.map((item: any) => ({
            id: item.productId,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            images: item.product.images,
            attributes: item.product.attributes || [],
            discount: item.product.discount,
            stock: item.product.stock, // Assuming stock is part of the product data
          }))
        )
      }
    } else {
      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id)
        if (existingItemIndex !== -1) {
          const updatedCart = [...prevCart]
          updatedCart[existingItemIndex].quantity += item.quantity
          return updatedCart
        } else {
          return [...prevCart, { ...item, stock: item.stock }]
        }
      })
    }
  }, [user])

  // Remove item from cart
  const removeFromCart = useCallback(async (id: string) => {
    if (user) {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: id }),
      })
      // Refrescar carrito
      const res = await fetch("/api/cart", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setCart(
          data.map((item: any) => ({
            id: item.productId,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            images: item.product.images,
            attributes: item.product.attributes || [],
            discount: item.product.discount,
            stock: item.product.stock, // Assuming stock is part of the product data
          }))
        )
      }
    } else {
      setCart((prevCart) => prevCart.filter((item) => item.id !== id))
    }
  }, [user])

  // Update item quantity
  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    if (user) {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: id, quantity }),
      })
      // Refrescar carrito
      const res = await fetch("/api/cart", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setCart(
          data.map((item: any) => ({
            id: item.productId,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            images: item.product.images,
            attributes: item.product.attributes || [],
            discount: item.product.discount,
            stock: item.product.stock, // Assuming stock is part of the product data
          }))
        )
      }
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)),
      )
    }
  }, [user])

  // Clear cart
  const clearCart = useCallback(async () => {
    if (user) {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      })
      setCart([])
    } else {
      setCart([])
    }
  }, [user])

  // Calculate cart subtotal (before discounts)
  const getCartSubtotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [cart])

  // Calculate cart discount
  const getCartDiscount = useCallback(() => {
    return cart.reduce((total, item) => {
      if (item.discount) {
        return total + (item.price * item.quantity * item.discount) / 100
      }
      return total
    }, 0)
  }, [cart])

  // Calculate cart total (after discounts)
  const getCartTotal = useCallback(() => {
    return getCartSubtotal() - getCartDiscount()
  }, [getCartSubtotal, getCartDiscount])

  // Función para limpiar referencias a productos eliminados
  const cleanDeletedProductReferences = (deletedProductIds: string[]) => {
    setCart(prev => prev.filter(item => !deletedProductIds.includes(item.id)))
  }

  // Función para verificar y limpiar productos eliminados
  const verifyAndCleanDeletedProducts = async () => {
    if (cart.length === 0) return
    
    try {
      const productIds = cart.map(item => item.id)
      const deletedIds: string[] = []
      
      // Verificar cada producto del carrito
      for (const productId of productIds) {
        try {
          const response = await fetch(`/api/products/${productId}`)
          if (response.status === 404) {
            deletedIds.push(productId)
          }
        } catch (error) {
          console.error(`Error verificando producto ${productId}:`, error)
        }
      }
      
      if (deletedIds.length > 0) {
        console.log(`🧹 Limpiando ${deletedIds.length} productos eliminados del carrito:`, deletedIds)
        cleanDeletedProductReferences(deletedIds)
        // toast({
        //   title: "Carrito actualizado",
        //   description: `Se eliminaron ${deletedIds.length} producto(s) que ya no están disponibles.`,
        //   variant: "default"
        // })
      }
    } catch (error) {
      console.error("Error verificando productos eliminados:", error)
    }
  }

  // Verificar productos eliminados al cargar el carrito
  useEffect(() => {
    if (cart.length > 0) {
      verifyAndCleanDeletedProducts()
    }
  }, [cart.length])

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartSubtotal,
        getCartDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use the cart context
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
