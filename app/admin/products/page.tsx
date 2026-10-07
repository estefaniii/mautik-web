"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Search, Package, Star, RefreshCw } from "lucide-react"
import Image from "next/image"
import AdminGuard from "@/components/admin-guard"

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  stock: number
  images: string[]
  category: string
  sku: string
  featured: boolean
  isNew: boolean
  discount: number
  createdAt: string
}

const CATEGORIES = ["crochet", "llaveros", "pulseras", "collares", "anillos", "aretes", "otros"]

const emptyForm = {
  name: "",
  description: "",
  price: 0,
  originalPrice: 0,
  stock: 0,
  images: "",
  category: "crochet",
  sku: "",
  featured: false,
  isNew: false,
  discount: 0,
}

function ProductsContent() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [guardandoStock, setGuardandoStock] = useState<string | null>(null)

  /** Guarda el stock de un producto sin abrir el formulario completo. */
  const guardarStock = async (id: string, valor: string, anterior: number) => {
    const n = parseInt(valor, 10)
    if (!Number.isInteger(n) || n < 0 || n === anterior) return
    setGuardandoStock(id)
    try {
      const res = await fetch("/api/admin/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, stock: n }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "No se pudo guardar.")
      setProducts((lista) => lista.map((p) => (p.id === id ? { ...p, stock: n } : p)))
      toast({ title: `Stock actualizado: ${n}` })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setGuardandoStock(null)
    }
  }
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/products?limit=200")
      if (res.ok) {
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : data.products || [])
      }
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los productos", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      stock: product.stock,
      images: product.images.join(", "),
      category: product.category,
      sku: product.sku,
      featured: product.featured,
      isNew: product.isNew,
      discount: product.discount,
    })
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setEditingProduct(null)
    setFormData(emptyForm)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...formData,
        images: formData.images.split(",").map((s) => s.trim()).filter(Boolean),
        price: parseFloat(String(formData.price)),
        originalPrice: formData.originalPrice ? parseFloat(String(formData.originalPrice)) : undefined,
        stock: parseInt(String(formData.stock)),
        discount: parseInt(String(formData.discount)) || 0,
      }

      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products"
      const method = editingProduct ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast({ title: editingProduct ? "Producto actualizado" : "Producto creado" })
        setIsDialogOpen(false)
        fetchProducts()
      } else {
        const err = await res.json()
        toast({ title: "Error", description: err.error || "Error al guardar", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Error inesperado", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast({ title: "Producto eliminado" })
        setProducts((prev) => prev.filter((p) => p.id !== id))
      } else {
        toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Error inesperado", variant: "destructive" })
    }
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Productos</h1>
          <p className="text-gray-500 dark:text-purple-100/60 mt-1">{products.length} productos en total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchProducts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNew} className="bg-purple-700 hover:bg-purple-800">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      required
                      disabled={!!editingProduct}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(val) => setFormData({ ...formData, category: val })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c} className="capitalize">
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="price">Precio ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Precio Original ($)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount">Descuento (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Descripción *</Label>
                    <Textarea
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="images">Imágenes (URLs separadas por coma)</Label>
                    <Textarea
                      id="images"
                      rows={2}
                      placeholder="https://..., https://..."
                      value={formData.images}
                      onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(v) => setFormData({ ...formData, featured: v })}
                    />
                    <Label htmlFor="featured">Destacado</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isNew"
                      checked={formData.isNew}
                      onCheckedChange={(v) => setFormData({ ...formData, isNew: v })}
                    />
                    <Label htmlFor="isNew">Nuevo</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-purple-700 hover:bg-purple-800">
                    {saving ? "Guardando..." : editingProduct ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por nombre, categoría o SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <RefreshCw className="animate-spin h-6 w-6 mr-2" />
          Cargando productos...
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Imagen</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.images[0] ? (
                        <div className="relative h-12 w-12 rounded overflow-hidden bg-gray-100">
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                      <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-sm">{product.category}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">${Number(product.price ?? 0).toFixed(2)}</span>
                      {product.discount > 0 && (
                        <span className="ml-1 text-xs text-green-600">-{product.discount}%</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {/*
                        Stock editable en el sitio. Antes había que abrir el
                        formulario completo del producto —con nombre, precio y
                        descripción obligatorios— solo para corregir "me quedan
                        2 y no 5". Ahora se escribe el número y se guarda solo
                        al salir del campo.
                      */}
                      <input
                        type="number"
                        min={0}
                        max={9999}
                        defaultValue={product.stock}
                        aria-label={`Stock de ${product.name}`}
                        disabled={guardandoStock === product.id}
                        onBlur={(e) => guardarStock(product.id, e.target.value, product.stock)}
                        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur() }}
                        className={`w-20 rounded-lg border bg-transparent px-2 py-1 text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 ${
                          product.stock === 0
                            ? "border-red-300 text-red-600"
                            : product.stock <= 5
                            ? "border-yellow-300 text-yellow-700"
                            : "border-gray-200 text-gray-700 dark:border-white/15 dark:text-purple-100/80"
                        }`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {product.featured && (
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Destacado
                          </Badge>
                        )}
                        {product.isNew && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                            Nuevo
                          </Badge>
                        )}
                        {product.stock === 0 && (
                          <Badge variant="destructive" className="text-xs">
                            Sin stock
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <AdminGuard>
      <ProductsContent />
    </AdminGuard>
  )
}