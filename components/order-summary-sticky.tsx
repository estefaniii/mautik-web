"use client"
import { useCart } from "@/context/cart-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CreditCard, ShoppingCart } from "lucide-react"
import { useEffect, useState } from "react"

interface OrderSummaryStickyProps {
  subtotal: number
  shipping: number
  total: number
  loading: boolean
  paymentMethod?: string
  onEditCart?: () => void
}

export default function OrderSummarySticky({ subtotal, shipping, total, loading, paymentMethod, onEditCart }: OrderSummaryStickyProps) {
  const { cart } = useCart()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (!isMobile || cart.length === 0) return null

  const handleScrollToForm = () => {
    const form = document.getElementById("checkout-main-form")
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="fixed bottom-0 left-0 w-full z-40 bg-white border-t border-indigo-200 shadow-lg md:hidden animate-fade-in-up">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <ShoppingCart className="h-5 w-5 text-indigo-600" />
            <span className="font-semibold">{cart.length} producto{cart.length > 1 ? 's' : ''}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Subtotal: <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span> &bull; Envío: <span className="font-medium text-gray-900">${shipping.toFixed(2)}</span>
          </div>
          <div className="text-base font-bold text-indigo-800 mt-1">Total: ${total.toFixed(2)}</div>
          {paymentMethod && (
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
              <CreditCard className="h-4 w-4 text-indigo-500" />
              <span>{paymentMethod}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 ml-4">
          <Button variant="outline" size="sm" onClick={onEditCart || (() => router.push('/cart'))} className="border-indigo-400 text-indigo-700">Editar carrito</Button>
          <Button disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white w-32 flex items-center justify-center" onClick={handleScrollToForm}>
            {loading && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>}
            {loading ? "Procesando..." : "Finalizar compra"}
          </Button>
        </div>
      </div>
    </div>
  )
} 