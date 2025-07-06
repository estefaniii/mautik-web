"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { products } from "@/data/products"
import dynamic from "next/dynamic"

const CartRecommendations = dynamic(() => import("@/components/cart-recommendations"), { ssr: false })

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart()
  const { toast } = useToast()
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const shipping = subtotal > 50 ? 0 : 10
  const total = subtotal - discount + shipping

  // Calcular cuánto falta para envío gratis
  const envioGratisMin = 50
  const faltaParaEnvioGratis = envioGratisMin - subtotal

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === "mautik10") {
      const discountAmount = subtotal * 0.1
      setDiscount(discountAmount)
      toast({
        title: "Cupón aplicado",
        description: "Se ha aplicado un 10% de descuento a tu compra.",
      })
    } else {
      setDiscount(0)
      toast({
        title: "Cupón inválido",
        description: "El código de cupón ingresado no es válido.",
        variant: "destructive",
      })
    }
  }

  const handleQuantityChange = (id: number, newQuantity: number) => {
    const product = products.find((p) => p.id === id)
    if (!product) return
    if (newQuantity < 1) newQuantity = 1
    if (newQuantity > product.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${product.stock} unidades disponibles de este producto.`,
        variant: "destructive",
      })
      return
    }
    updateQuantity(id, newQuantity)
  }

  const handleRemoveItem = (id: number) => {
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
                      className="flex flex-col sm:flex-row items-start sm:items-center border-b border-gray-200 py-4 last:border-b-0"
                    >
                      <div className="flex-shrink-0 relative h-24 w-24 rounded-md overflow-hidden mb-4 sm:mb-0">
                        <Image
                          src={item.images[0] || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 sm:ml-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">
                              {item.attributes.map((attr) => `${attr.name}: ${attr.value}`).join(", ")}
                            </p>
                          </div>
                          <div className="text-right mt-2 sm:mt-0">
                            <p className="text-lg font-semibold text-purple-800">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">${item.price.toFixed(2)} por unidad</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="px-3 py-1 text-purple-800 hover:bg-purple-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-1 border-x border-gray-300">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="px-3 py-1 text-purple-800 hover:bg-purple-50"
                              disabled={item.quantity >= (products.find((p) => p.id === item.id)?.stock || 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">Stock: {products.find((p) => p.id === item.id)?.stock}</span>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                          </button>
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

                {/* Mensaje de envío gratis */}
                {subtotal > 0 && (
                  <div className="mb-4">
                    {subtotal < envioGratisMin ? (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2">
                        ¡Faltan <span className="font-bold">${faltaParaEnvioGratis.toFixed(2)}</span> para envío gratis!
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2">
                        ¡Tienes envío gratis!
                      </div>
                    )}
                  </div>
                )}

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
                    <span className="font-medium">{shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Total</span>
                    <span className="font-bold text-xl text-purple-900">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="mb-6">
                  <p className="text-sm font-medium mb-2">¿Tienes un cupón?</p>
                  <div className="flex">
                    <Input
                      placeholder="Código de cupón"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="rounded-r-none"
                    />
                    <Button onClick={handleApplyCoupon} className="rounded-l-none bg-purple-800 hover:bg-purple-900">
                      Aplicar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Prueba con "MAUTIK10" para obtener un 10% de descuento</p>
                </div>

                <Link href="/checkout">
                  <Button className="w-full bg-purple-800 hover:bg-purple-900 py-6 text-lg">Proceder al Pago</Button>
                </Link>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">Envío gratis en compras mayores a $50</p>
                </div>
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
