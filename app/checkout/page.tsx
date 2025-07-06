"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { saveOrder } from "@/lib/utils"
import dynamic from "next/dynamic"
import AuthGuard from "@/components/auth-guard"

const CartRecommendations = dynamic(() => import("@/components/cart-recommendations"), { ssr: false })

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "México",
    payment: "card"
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 50 ? 0 : 10
  const total = subtotal + shipping

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim() || !form.state.trim() || !form.zip.trim() || !form.country.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos.",
        variant: "destructive"
      })
      return false
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido.",
        variant: "destructive"
      })
      return false
    }
    if (!/^\+?\d{7,15}$/.test(form.phone.replace(/\s/g, ""))) {
      toast({
        title: "Teléfono inválido",
        description: "Por favor ingresa un teléfono válido.",
        variant: "destructive"
      })
      return false
    }
    return true
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    clearCart()
      toast({
        title: "¡Pedido realizado!",
        description: "Tu pedido ha sido registrado exitosamente.",
      })
      setTimeout(() => {
        router.push("/orders")
      }, 2000)
    }, 1500)
  }

  if (cart.length === 0 && !submitted) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white">
          <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-8">Agrega productos antes de proceder al checkout.</p>
            <Link href="/shop">
              <Button className="bg-purple-800 hover:bg-purple-900 px-8 py-6 text-lg">Explorar Productos</Button>
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (submitted) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white">
          <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-xl">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">¡Gracias por tu compra!</h2>
            <p className="text-gray-700 mb-6">Tu pedido ha sido registrado exitosamente. Pronto recibirás un correo con los detalles.</p>
            <Button asChild className="bg-purple-800 hover:bg-purple-900">
              <Link href="/orders">Ver mis pedidos</Link>
            </Button>
        </div>
      </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-purple-900 mb-8 text-center">Checkout</h1>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-md p-8">
            {/* Formulario de envío */}
            <div>
              <h2 className="text-xl font-semibold text-purple-800 mb-4">Datos de Envío</h2>
              <div className="space-y-4">
                <Input name="name" placeholder="Nombre completo" value={form.name} onChange={handleChange} required />
                <Input name="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} required type="email" />
                <Input name="phone" placeholder="Teléfono" value={form.phone} onChange={handleChange} required />
                <Input name="address" placeholder="Dirección" value={form.address} onChange={handleChange} required />
                <div className="flex gap-4">
                  <Input name="city" placeholder="Ciudad" value={form.city} onChange={handleChange} required />
                  <Input name="state" placeholder="Estado" value={form.state} onChange={handleChange} required />
                </div>
                <div className="flex gap-4">
                  <Input name="zip" placeholder="Código Postal" value={form.zip} onChange={handleChange} required />
                  <Input name="country" placeholder="País" value={form.country} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
                  <select
                    name="payment"
                    value={form.payment}
                            onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                              required
                  >
                    <option value="card">Tarjeta de crédito/débito</option>
                    <option value="cod">Pago contra entrega</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Resumen de compra */}
            <div>
              <h2 className="text-xl font-semibold text-purple-800 mb-4">Resumen de Compra</h2>
              <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                        </div>
                    <p className="font-semibold text-purple-800">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
              <Separator />
              <div className="flex justify-between mt-4">
                      <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
              <div className="flex justify-between mt-2">
                      <span className="text-gray-600">Envío</span>
                <span className="font-medium">{shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}</span>
                    </div>
              <div className="flex justify-between mt-2 text-lg">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="font-bold text-purple-900">${total.toFixed(2)}</span>
                    </div>
              <Button
                type="submit"
                className="w-full mt-8 bg-purple-800 hover:bg-purple-900"
                disabled={loading}
              >
                Confirmar Pedido
              </Button>
              <Button asChild variant="outline" className="w-full mt-2">
                <Link href="/cart">Volver al Carrito</Link>
              </Button>
            </div>
          </form>
        </div>
        <CartRecommendations excludeIds={cart.map(i => i.id)} />
      </div>
    </AuthGuard>
  )
}
