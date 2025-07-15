"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Check, X, Percent, DollarSign } from "lucide-react"

interface CouponApplyProps {
  subtotal: number
  items: any[]
  onCouponApplied: (discount: number, couponCode: string) => void
  onCouponRemoved: () => void
  appliedCoupon?: {
    code: string
    discount: number
  }
}

export default function CouponApply({
  subtotal,
  items,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon
}: CouponApplyProps) {
  const [couponCode, setCouponCode] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Ingresa un código de cupón",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal,
          items
        })
      })

      const data = await response.json()

      if (response.ok) {
        onCouponApplied(data.discount, data.coupon.code)
        setCouponCode("")
        toast({
          title: "¡Cupón aplicado!",
          description: `Descuento de $${data.discount.toFixed(2)} aplicado`
        })
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al validar el cupón",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    onCouponRemoved()
    toast({
      title: "Cupón removido",
      description: "El cupón ha sido removido de tu pedido"
    })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="coupon" className="text-sm font-medium">
              ¿Tienes un cupón?
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="coupon"
                placeholder="Ingresa tu código"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={!!appliedCoupon}
                className="flex-1"
              />
              {!appliedCoupon ? (
                <Button
                  onClick={handleApplyCoupon}
                  disabled={loading || !couponCode.trim()}
                  size="sm"
                >
                  {loading ? "Aplicando..." : "Aplicar"}
                </Button>
              ) : (
                <Button
                  onClick={handleRemoveCoupon}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {appliedCoupon && (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Cupón aplicado: {appliedCoupon.code}
                </span>
              </div>
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                -${appliedCoupon.discount.toFixed(2)}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 