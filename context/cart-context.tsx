"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { ReactNode } from "react"
import { useAuth } from "@/context/auth-context"

// Define the cart item type
export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  images: string[]
  attributes: { name: string; value: string }[]
  discount?: number
}

// Define the cart context type
interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartSubtotal: () => number
  getCartDiscount: () => number
}

// Create the cart context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Create a provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])

  // Helper to get the correct localStorage key
  const getCartKey = () => (user ? `mautik_cart_${user.id}` : "mautik_cart_temp")

  // Load cart from localStorage on mount and when user changes
  useEffect(() => {
    const key = getCartKey()
    const savedCart = localStorage.getItem(key)
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
        localStorage.removeItem(key)
        setCart([])
      }
    } else {
      setCart([])
    }
  }, [user])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const key = getCartKey()
    localStorage.setItem(key, JSON.stringify(cart))
  }, [cart, user])

  // Migrate temp cart to user cart on login
  useEffect(() => {
    if (user) {
      const tempCart = localStorage.getItem("mautik_cart_temp")
      const userCartKey = `mautik_cart_${user.id}`
      if (tempCart && !localStorage.getItem(userCartKey)) {
        localStorage.setItem(userCartKey, tempCart)
        setCart(JSON.parse(tempCart))
        localStorage.removeItem("mautik_cart_temp")
      }
    }
  }, [user])

  // Add item to cart
  const addToCart = useCallback((item: CartItem) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id)

      if (existingItemIndex !== -1) {
        // Item already exists, update quantity
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex].quantity += item.quantity
        return updatedCart
      } else {
        // Item doesn't exist, add it
        return [...prevCart, item]
      }
    })
  }, [])

  // Remove item from cart
  const removeFromCart = useCallback((id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }, [])

  // Update item quantity
  const updateQuantity = useCallback((id: number, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)),
    )
  }, [])

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([])
  }, [])

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
