"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"

const CartRecommendations = dynamic(() => import("@/components/cart-recommendations"), { ssr: false })

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart()
  const { toast } = useToast()
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [stockMessages, setStockMessages] = useState<{ [id: string]: string }>({})
  const prevStocks = useRef<{ [id: string]: number }>({})

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 10 // Fixed shipping cost
  const total = subtotal - discount + shipping

  // Polling para actualizar stock de todos los productos cada 20s
  useEffect(() => {
    const interval = setInterval(async () => {
      const updates: { [id: string]: number } = {}
      for (const item of cart) {
        try {
          const res = await fetch(`/api/products/${item.id}`)
          if (res.ok) {
            const data = await res.json()
            if (typeof data.stock === 'number' && data.stock !== item.stock) {
              updates[item.id] = data.stock
              if (data.stock < (prevStocks.current[item.id] ?? item.stock)) {
                setStockMessages(msgs => ({ ...msgs, [item.id]: 'El stock ha bajado, ajustamos tu carrito.' }))
              }
              prevStocks.current[item.id] = data.stock
            }
          }
        } catch {}
      }
      if (Object.keys(updates).length > 0) {
        for (const id in updates) {
          const cartItem = cart.find(i => i.id === id)
          if (cartItem && cartItem.quantity > updates[id]) {
            updateQuantity(id, updates[id])
          }
        }
      }
    }, 20000)
    return () => clearInterval(interval)
  }, [cart])

  // Validar stock antes de aumentar cantidad
  const fetchLatestStock = async (id: string) => {
    const res = await fetch(`/api/products/${id}`)
    if (res.ok) {
      const data = await res.json()
      if (typeof data.stock === 'number') {
        const cartItem = cart.find(i => i.id === id)
        if (data.stock !== cartItem?.stock) {
          if (data.stock < (cartItem?.quantity ?? 0)) {
            updateQuantity(id, data.stock)
            setStockMessages(msgs => ({ ...msgs, [id]: 'El stock ha cambiado, ajustamos tu carrito.' }))
          }
        }
        return data.stock
      }
    }
    return cart.find(i => i.id === id)?.stock || 0
  }

  const handleIncreaseWithStockCheck = async (id: string) => {
    const latestStock = await fetchLatestStock(id)
    const item = cart.find(i => i.id === id)
    if (item && item.quantity < latestStock) {
      updateQuantity(id, item.quantity + 1)
      setStockMessages(msgs => ({ ...msgs, [id]: '' }))
    } else {
      setStockMessages(msgs => ({ ...msgs, [id]: 'No hay más stock disponible.' }))
    }
  }

  const handleApplyCoupon = () => {
    setDiscount(0)
    toast({
      title: "Cupón inválido",
      description: "El código de cupón ingresado no es válido.",
      variant: "destructive",
    })
  }

  const handleDecrease = (id: string) => {
    const item = cart.find(i => i.id === id)
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1)
    }
  }

  const handleIncrease = (id: string) => {
    const item = cart.find(i => i.id === id)
    if (item && item.quantity < item.stock) {
      updateQuantity(id, item.quantity + 1)
    }
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    const item = cart.find(i => i.id === id)
    if (newQuantity < 1) newQuantity = 1
    if (item && newQuantity > item.stock) newQuantity = item.stock
    updateQuantity(id, newQuantity)
  }

  const handleRemoveItem = (id: string) => {
    removeFromCart(id)
    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado de tu carrito.",
    })
  }

  return (
    <div className="bg-gradient-to-b from-purple-50 to-white min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-purple-900 text-center mb-8">Tu Carrito</h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <ShoppingBag className="h-20 w-20 text-purple-200" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-8">Parece que aún no has añadido productos a tu carrito.</p>
            <Link href="/shop">
              <Button className="bg-purple-800 hover:bg-purple-900 px-8 py-6 text-lg">Explorar Productos</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-purple-900">Productos ({cart.length})</h2>
                  <Button
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      clearCart()
                      toast({
                        title: "Carrito vacío",
                        description: "Se han eliminado todos los productos del carrito.",
                      })
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Vaciar Carrito
                  </Button>
                </div>

                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-2 border-b border-gray-200 py-0 last:border-b-0 sm:flex-row flex-row"
                    >
                      <div className="flex-shrink-0 relative h-32 w-32 sm:h-36 sm:w-36 rounded-md overflow-hidden bg-gray-100">
                        <Image
                          src={item.images && item.images.length > 0 ? item.images[0] : "/placeholder.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between gap-0">
                        <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.name}
                        </div>
                        {item.attributes && item.attributes.length > 0 && (
                          <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {item.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ')}
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-base text-purple-700 dark:text-purple-300">
                            ${item.price.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-1">
                            {/* Cantidad y controles */}
                            <button
                              onClick={() => handleDecrease(item.id)}
                              disabled={item.quantity <= 1}
                              className="px-2 py-1 text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800/30 rounded-l"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={item.stock}
                              value={item.quantity}
                              onChange={e => handleQuantityChange(item.id, Number(e.target.value))}
                              className="w-12 text-center border-x border-gray-300 dark:border-gray-600 bg-transparent"
                              disabled={item.stock === 0}
                            />
                            <button
                              onClick={() => handleIncreaseWithStockCheck(item.id)}
                              disabled={item.quantity >= item.stock}
                              className="px-2 py-1 text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800/30 rounded-r"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            {item.quantity >= item.stock && item.stock > 0 && (
                              <span className="ml-2 text-xs text-red-500">Stock máximo disponible</span>
                            )}
                            {stockMessages[item.id] && (
                              <span className="block text-xs text-red-500 mt-1">{stockMessages[item.id]}</span>
                            )}
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="ml-1 p-1 rounded bg-transparent hover:bg-red-100 dark:hover:bg-red-900"
                              aria-label="Eliminar"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="mt-6">
                  <Link href="/shop">
                    <Button
                      variant="outline"
                      className="flex items-center border-purple-800 text-purple-800 hover:bg-purple-100"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" /> Seguir Comprando
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-purple-900 mb-6">Resumen de Compra</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>

                  {/* Coupon Code - solo input y botón, más grande, sin fondo ni borde */}
                  <div className="mb-6 flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-600 mb-1" htmlFor="cart-coupon">¿Tienes un cupón?</label>
                    <div className="flex gap-2">
                      <Input
                        id="cart-coupon"
                        placeholder="Ingresa tu código"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="h-11 text-base focus:border-purple-400 focus:ring-0 rounded"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        className="h-11 px-6 text-base bg-purple-100 text-purple-800 hover:bg-purple-200 border-none shadow-none"
                        type="button"
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Total</span>
                    <span className="font-bold text-xl text-purple-900">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Link href="/checkout">
                  <Button className="w-full bg-purple-800 hover:bg-purple-900 py-6 text-lg">Proceder al Pago</Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {cart.length > 0 && (
          <CartRecommendations excludeIds={cart.map(i => i.id)} />
        )}
      </div>
    </div>
  )
}
