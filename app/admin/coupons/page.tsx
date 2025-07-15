"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Calendar, Users, Percent, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Coupon {
  _id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchase?: number
  maxDiscount?: number
  usageLimit: number
  usedCount: number
  validFrom: string
  validUntil?: string
  isActive: boolean
  applicableCategories?: string[]
  applicableProducts?: string[]
  description?: string
  createdAt: string
}

export default function CouponsPage() {
  const { toast } = useToast()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minPurchase: 0,
    maxDiscount: 0,
    usageLimit: 1,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    isActive: true,
    applicableCategories: [] as string[],
    applicableProducts: [] as string[],
    description: ''
  })

  const categories = ["crochet", "llaveros", "pulseras", "collares", "anillos", "aretes", "otros"]

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/coupons')
      if (response.ok) {
        const data = await response.json()
        setCoupons(data)
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los cupones",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCoupon ? `/api/coupons/${editingCoupon._id}` : '/api/coupons'
      const method = editingCoupon ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        toast({
          title: "Éxito",
          description: editingCoupon ? "Cupón actualizado" : "Cupón creado"
        })
        setIsDialogOpen(false)
        resetForm()
        fetchCoupons()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar el cupón",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cupón?')) return
    
    try {
      const response = await fetch(`/api/coupons/${id}`, { method: 'DELETE' })
      
      if (response.ok) {
        toast({ title: "Cupón eliminado" })
        fetchCoupons()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el cupón",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minPurchase: coupon.minPurchase || 0,
      maxDiscount: coupon.maxDiscount || 0,
      usageLimit: coupon.usageLimit,
      validFrom: coupon.validFrom.split('T')[0],
      validUntil: coupon.validUntil?.split('T')[0] || '',
      isActive: coupon.isActive,
      applicableCategories: coupon.applicableCategories || [],
      applicableProducts: coupon.applicableProducts || [],
      description: coupon.description || ''
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      minPurchase: 0,
      maxDiscount: 0,
      usageLimit: 1,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      isActive: true,
      applicableCategories: [],
      applicableProducts: [],
      description: ''
    })
    setEditingCoupon(null)
  }

  const getStatusColor = (coupon: Coupon) => {
    if (!coupon.isActive) return 'bg-gray-500'
    if (coupon.usedCount >= coupon.usageLimit) return 'bg-red-500'
    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusText = (coupon: Coupon) => {
    if (!coupon.isActive) return 'Inactivo'
    if (coupon.usedCount >= coupon.usageLimit) return 'Agotado'
    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) return 'Expirado'
    return 'Activo'
  }

  if (loading) {
    return <div className="p-8">Cargando cupones...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Cupones</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cupón
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? 'Editar Cupón' : 'Crear Nuevo Cupón'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Código del Cupón</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="EJEMPLO123"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value: 'percentage' | 'fixed') => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentaje</SelectItem>
                      <SelectItem value="fixed">Valor Fijo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">
                    {formData.type === 'percentage' ? 'Porcentaje (%)' : 'Valor ($)'}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                    min="0"
                    max={formData.type === 'percentage' ? "100" : undefined}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="usageLimit">Límite de Uso</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: parseInt(e.target.value) || 1})}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minPurchase">Compra Mínima ($)</Label>
                  <Input
                    id="minPurchase"
                    type="number"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({...formData, minPurchase: parseFloat(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="maxDiscount">Descuento Máximo ($)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({...formData, maxDiscount: parseFloat(e.target.value) || 0})}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validFrom">Válido Desde</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Válido Hasta (opcional)</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descripción del cupón"
                />
              </div>

              <div>
                <Label>Categorías Aplicables (opcional)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.applicableCategories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              applicableCategories: [...formData.applicableCategories, category]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              applicableCategories: formData.applicableCategories.filter(c => c !== category)
                            })
                          }
                        }}
                      />
                      <span className="capitalize">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                />
                <Label htmlFor="isActive">Cupón Activo</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCoupon ? 'Actualizar' : 'Crear'} Cupón
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {coupons.map((coupon) => (
          <Card key={coupon._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="font-mono text-lg">{coupon.code}</span>
                    <Badge className={getStatusColor(coupon)}>
                      {getStatusText(coupon)}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {coupon.description || 'Sin descripción'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(coupon)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(coupon._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  {coupon.type === 'percentage' ? (
                    <Percent className="h-4 w-4 text-purple-600" />
                  ) : (
                    <DollarSign className="h-4 w-4 text-green-600" />
                  )}
                  <span>
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>{coupon.usedCount}/{coupon.usageLimit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span>
                    {format(new Date(coupon.validFrom), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
                {(coupon.minPurchase ?? 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                    <span>Mín: ${coupon.minPurchase}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 