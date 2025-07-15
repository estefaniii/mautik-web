"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from '@/components/image-upload';

export default function NewProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    images: [""],
    stock: "",
    sku: "",
    discount: "0",
    isNew: false,
    featured: false,
  });
  const [formErrors, setFormErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    // Si el campo es numérico, mantener como string para evitar problemas de valores vacíos
    const numericFields = ["price", "stock", "discount"];
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? checked
        : numericFields.includes(name)
        ? value
        : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const { value } = e.target;
    setProduct((prev) => {
      const images = [...(prev.images || [""])]
      images[idx] = value;
      return { ...prev, images };
    });
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});
    try {
      // Convertir price, stock y discount a número antes de enviar
      const payload = {
        ...product,
        price: product.price === "" ? 0 : Number(product.price),
        stock: product.stock === "" ? 0 : Number(product.stock),
        discount: product.discount === "" ? 0 : Number(product.discount),
        sku: product.sku,
      };
      // Eliminar cualquier campo id del payload
      if ('id' in payload) {
        delete payload.id;
      }
      const res = await fetch(`/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        toast({ title: "Producto creado", description: "El producto ha sido creado." });
        // Redirigir a la edición del producto recién creado usando el ID real
        if (data.product && data.product.id) {
          router.push(`/admin/products/${data.product.id}/edit`);
        } else {
          router.push("/admin?page=products");
        }
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error || "No se pudo crear el producto", variant: "destructive" });
        if (data.error) {
          setFormErrors({ general: data.error });
        }
      }
    } catch (e) {
      toast({ title: "Error", description: "No se pudo crear el producto", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            {formErrors.general && <div className="text-red-500 text-sm mb-2">{formErrors.general}</div>}
            <label className="block text-sm font-medium mb-1" htmlFor="name">Nombre</label>
            <Input id="name" name="name" placeholder="Nombre" value={product.name} onChange={handleChange} required />
            <label className="block text-sm font-medium mb-1" htmlFor="description">Descripción</label>
            <Input id="description" name="description" placeholder="Descripción" value={product.description} onChange={handleChange} required />
            <label className="block text-sm font-medium mb-1" htmlFor="price">Precio</label>
            <Input id="price" name="price" type="number" min="0" step="0.01" value={product.price} onChange={handleChange} required />
            <label className="block text-sm font-medium mb-1" htmlFor="category">Categoría</label>
            <Input id="category" name="category" placeholder="Categoría" value={product.category} onChange={handleChange} required />
            <label className="block text-sm font-medium mb-1" htmlFor="stock">Stock</label>
            <Input id="stock" name="stock" type="number" min="0" value={product.stock} onChange={handleChange} required />
            <label className="block text-sm font-medium mb-1" htmlFor="discount">Descuento (%)</label>
            <Input id="discount" name="discount" type="number" min="0" max="100" value={product.discount} onChange={handleChange} />
            <label className="block text-sm font-medium mb-1" htmlFor="sku">SKU</label>
            <Input id="sku" name="sku" placeholder="SKU único" value={product.sku} onChange={handleChange} required minLength={2} />
            <div>
              <label className="block text-sm font-medium mb-1">Imágenes</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(product.images || []).map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt={`Imagen ${idx + 1}`} className="w-20 h-20 object-cover rounded border" />
                    <button type="button" onClick={() => {
                      setProduct(prev => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== idx)
                      }))
                    }}
                    className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <ImageUpload onImageUpload={url => setProduct(prev => ({ ...prev, images: [...(prev.images || []), url] }))} />
            </div>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="isNew" checked={!!product.isNew} onChange={handleChange} /> Nuevo
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="featured" checked={!!product.featured} onChange={handleChange} /> Destacado
              </label>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? <span className="animate-spin mr-2">⏳</span> : null}
              {saving ? "Guardando..." : "Crear Producto"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 