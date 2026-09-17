"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
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
  /*
    Selección por artículo, al estilo Temu: el carrito guarda todo, pero la
    clienta marca qué se lleva AHORA. Lo que queda sin marcar no se borra ni
    se cobra: sigue ahí para la próxima.

    La selección vive acá (y no solo en la página del carrito) porque el
    checkout tiene que cobrar exactamente lo marcado. Si viviera en la
    página, el checkout seguiría cobrando el carrito completo.
  */
  selectedIds: string[]
  selectedItems: CartItem[]
  isSelected: (id: string) => boolean
  toggleSelected: (id: string) => void
  setAllSelected: (todos: boolean) => void
  /*
    El cupón viaja del carrito al pago como CÓDIGO, nunca como monto. Cada
    pantalla le pregunta al servidor cuánto descuenta sobre lo que hay en ese
    momento, y el servidor lo vuelve a calcular al cobrar.
  */
  codigoCupon: string | null
  guardarCupon: (codigo: string | null) => void
}

// Create the cart context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Create a provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: cargandoSesion } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  // La mudanza del carrito de invitada se hace UNA vez por sesión. Ver abajo.
  const yaMigrado = useRef(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [codigoCupon, setCodigoCupon] = useState<string | null>(null)

  // El código se recuerda entre el carrito y el pago.
  useEffect(() => {
    if (typeof window === 'undefined') return
    setCodigoCupon(localStorage.getItem('mautik_cupon'))
  }, [])

  const guardarCupon = useCallback((codigo: string | null) => {
    setCodigoCupon(codigo)
    if (typeof window === 'undefined') return
    if (codigo) localStorage.setItem('mautik_cupon', codigo)
    else localStorage.removeItem('mautik_cupon')
  }, [])

  // Helper to get the correct localStorage key
  const getCartKey = () => (user ? `mautik_cart_${user.id}` : "mautik_cart_temp")

  /*
    Mudanza del carrito de invitada al de la cuenta, al iniciar sesión.

    ⚠️ ACÁ ESTABA EL BUG DE LAS CANTIDADES QUE CRECÍAN SOLAS.

    Estéfani tenía 3 productos y el carrito decía 11 artículos. En la base
    estaban en 4, 4 y 3; por la mañana eran 2, 2 y 2. Subían solas, sin que
    nadie agregara nada.

    El circuito era este, y se cerraba en CADA carga de página:

     1. Al cargar, la sesión todavía no está resuelta: `user` es null por un
        instante, pero el carrito en memoria aún tiene los productos de la
        vuelta anterior.
     2. El efecto de guardar decía "si no hay usuario, guardá en
        `mautik_cart_temp`" — y guardaba el carrito de la CLIENTA bajo la
        llave de invitada.
     3. Medio segundo después la sesión resuelve, este efecto ve esa llave,
        cree que es un carrito de invitada y lo manda al servidor.
     4. `POST /api/cart` no reemplaza: SUMA (`existing.quantity + quantity`).

    Resultado: cada visita le sumaba una unidad a cada producto.

    Tres cierres:
     · Mientras la sesión está cargando no se guarda nada (abajo).
     · La llave se borra ANTES de mandar nada, así dos ejecuciones
       simultáneas no pueden mandar lo mismo dos veces.
     · Y una bandera para que ocurra una sola vez por sesión.
  */
  useEffect(() => {
    const migrateGuestCart = async () => {
      if (user && !yaMigrado.current && typeof window !== 'undefined') {
        yaMigrado.current = true
        const guestCartRaw = localStorage.getItem('mautik_cart_temp')
        // Se reclama la llave de entrada: si otra ejecución entra al mismo
        // tiempo, ya no la encuentra.
        localStorage.removeItem('mautik_cart_temp')
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
    // Si la sesión todavía se está resolviendo, esperar: si no, se carga el
    // carrito de invitada y un instante después el de la cuenta, y por el
    // medio se dispara el efecto de guardar.
    if (!cargandoSesion) fetchCart()
  }, [user, cargandoSesion])

  /*
    Guardar en el navegador SOLO si de verdad no hay nadie conectado.

    `!user` no alcanza: mientras la sesión se resuelve también es null, y en
    ese instante esto escribía el carrito de la clienta bajo la llave de
    invitada. De ahí salía la suma infinita (ver el comentario de arriba).
  */
  useEffect(() => {
    if (cargandoSesion) return
    if (!user) {
      localStorage.setItem('mautik_cart_temp', JSON.stringify(cart))
    }
  }, [cart, user, cargandoSesion])

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

  /*
    Todo lo que entra al carrito empieza marcado, que es lo que espera
    cualquiera al agregar algo. Y si un artículo se va del carrito, su marca
    se va con él (si no, quedaban ids fantasma y el contador mentía).
  */
  useEffect(() => {
    setSelectedIds((previos) => {
      const idsEnCarrito = cart.map((i) => String(i.id))
      const vigentes = previos.filter((id) => idsEnCarrito.includes(id))
      const nuevos = idsEnCarrito.filter((id) => !previos.includes(id))
      const resultado = [...vigentes, ...nuevos]
      // Evita un re-render en bucle cuando no cambió nada.
      const igual =
        resultado.length === previos.length &&
        resultado.every((id, i) => id === previos[i])
      return igual ? previos : resultado
    })
  }, [cart])

  const isSelected = (id: string) => selectedIds.includes(String(id))

  const toggleSelected = (id: string) =>
    setSelectedIds((previos) =>
      previos.includes(String(id))
        ? previos.filter((x) => x !== String(id))
        : [...previos, String(id)]
    )

  const setAllSelected = (todos: boolean) =>
    setSelectedIds(todos ? cart.map((i) => String(i.id)) : [])

  const selectedItems = cart.filter((i) => selectedIds.includes(String(i.id)))

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
        selectedIds,
        selectedItems,
        isSelected,
        toggleSelected,
        setAllSelected,
        codigoCupon,
        guardarCupon,
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
