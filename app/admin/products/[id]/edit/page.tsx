"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from '@/components/image-upload';

export default function EditProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    images: [""],
    stock: 0,
    discount: 0,
    isNew: false,
    featured: false,
  });
  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.product) setProduct(data.product);
      } catch (e) {
        toast({ title: "Error", description: "No se pudo cargar el producto", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const { value } = e.target;
    setProduct((prev) => {
      const images = [...(prev.images || [""])];
      images[idx] = value;
      return { ...prev, images };
    });
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        toast({ title: "Producto actualizado", description: "Los cambios se han guardado." });
        router.push("/admin?page=products");
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error || "No se pudo actualizar el producto", variant: "destructive" });
        // Mostrar errores de validación específicos
        if (data.error) {
          setFormErrors({ general: data.error });
        }
      }
    } catch (e) {
      toast({ title: "Error", description: "No se pudo actualizar el producto", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando producto...</div>;

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Editar Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            {formErrors.general && <div className="text-red-500 text-sm mb-2">{formErrors.general}</div>}
            <label className="block text-sm font-medium mb-1" htmlFor="name">Nombre</label>
            <Input id="name" name="name" placeholder="Nombre" value={product.name} onChange={handleChange} required />
            {/* Aquí podrías mostrar un error específico si lo deseas */}
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
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 