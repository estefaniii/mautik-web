"use client"

import ProductCard from "@/components/product-card"
import { useState, useEffect } from "react"
import type { Product } from "@/types/product"

interface ApiProduct {
  id: string
  name: string
  price: number
  originalPrice?: number
  description: string
  images: string[]
  category: string
  stock: number
  featured?: boolean
  isNew?: boolean
  discount?: number
}

export default function ProductRecommendations({ category, excludeId }: { category: string, excludeId: string }) {
  const [recommended, setRecommended] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [recommendationReason, setRecommendationReason] = useState<string>("")

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        
        // Obtener productos de la misma categoría
        const categoryResponse = await fetch(`/api/products?category=${encodeURIComponent(category)}&limit=20`)
        const categoryProducts: ApiProduct[] = categoryResponse.ok ? await categoryResponse.json() : []
        
        // Obtener productos destacados
        const featuredResponse = await fetch('/api/products?featured=true&limit=20')
        const featuredProducts: ApiProduct[] = featuredResponse.ok ? await featuredResponse.json() : []
        
        // Obtener productos nuevos
        const newResponse = await fetch('/api/products?isNew=true&limit=20')
        const newProducts: ApiProduct[] = newResponse.ok ? await newResponse.json() : []
        
        // Antes acá se pedían los "populares" con
        // ?sortBy=totalReviews, un campo que salió de la base al quitar las
        // reseñas: la llamada devolvía 500 en cada ficha de producto
        // (verificado en producción). Con destacados y nuevos ya hay de sobra
        // para llenar las cuatro recomendaciones.
        const allProducts = [...categoryProducts, ...featuredProducts, ...newProducts]
        
        // Eliminar duplicados y el producto actual
        const uniqueProducts = allProducts.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id) && product.id !== excludeId
        )
        
        const filteredProducts = uniqueProducts
        
        // Algoritmo de recomendación mejorado
        let recommendations: ApiProduct[] = []
        let reason = ""
        
        // 1. Prioridad: productos de la misma categoría.
        // Antes se ordenaban por mejor valoración; sin reseñas se ordenan por
        // destacado y luego por novedad, que es lo que Estéfani sí controla.
        const sameCategoryHighRated = filteredProducts
          .filter(p => p.category.toLowerCase() === category.toLowerCase())
          .sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.isNew) - Number(a.isNew))
          .slice(0, 2)
        
        if (sameCategoryHighRated.length > 0) {
          recommendations.push(...sameCategoryHighRated)
          reason = "Más de la misma categoría"
        }
        
        // 2. Productos destacados de la misma categoría
        const sameCategoryFeatured = filteredProducts
          .filter(p => p.category.toLowerCase() === category.toLowerCase() && p.featured)
          .filter(p => !recommendations.some(r => r.id === p.id))
          .slice(0, 2)
        
        if (sameCategoryFeatured.length > 0) {
          recommendations.push(...sameCategoryFeatured)
          reason = reason || "Productos destacados de la misma categoría"
        }
        
        // 3. Productos nuevos de la misma categoría
        const sameCategoryNew = filteredProducts
          .filter(p => p.category.toLowerCase() === category.toLowerCase() && p.isNew)
          .filter(p => !recommendations.some(r => r.id === p.id))
          .slice(0, 1)
        
        if (sameCategoryNew.length > 0) {
          recommendations.push(...sameCategoryNew)
          reason = reason || "Nuevos productos de la misma categoría"
        }
        
        // 4. Si faltan productos, agregar productos destacados generales
        if (recommendations.length < 4) {
          const generalFeatured = filteredProducts
            .filter(p => p.featured && !recommendations.some(r => r.id === p.id))
            .slice(0, 4 - recommendations.length)
          
          recommendations.push(...generalFeatured)
          reason = reason || "Productos destacados"
        }
        
        // 5. Si aún faltan, completar con los destacados.
        // Este bloque medía "popular" por cantidad de reseñas, que nunca hubo.
        if (recommendations.length < 4) {
          const destacados = filteredProducts
            .filter(p => p.featured && !recommendations.some(r => r.id === p.id))
            .slice(0, 4 - recommendations.length)
          
          recommendations.push(...destacados)
          reason = reason || "Destacados de Mautik"
        }
        
        // 6. Si aún faltan, agregar cualquier producto
          if (recommendations.length < 4) {
          const others = filteredProducts
            .filter(p => !recommendations.some(r => r.id === p.id))
            .slice(0, 4 - recommendations.length)
            
          recommendations.push(...others)
          reason = reason || "Más productos"
          }

          // Mapear a formato Product
        const mappedRecommendations: Product[] = recommendations.slice(0, 4).map(apiProduct => ({
            id: apiProduct.id,
            name: apiProduct.name,
            price: apiProduct.price,
          originalPrice: apiProduct.originalPrice || apiProduct.price,
            description: apiProduct.description,
            longDescription: apiProduct.description,
            images: Array.isArray(apiProduct.images) && apiProduct.images.length > 0 ? apiProduct.images : ['/placeholder.jpg'],
            category: typeof apiProduct.category === 'string' ? apiProduct.category : '',
            stock: apiProduct.stock,
          featured: apiProduct.featured || false,
          isNew: apiProduct.isNew || false,
            discount: apiProduct.discount || 0,
          attributes: [],
          details: [],
          sku: '',
          }))

          setRecommended(mappedRecommendations)
        setRecommendationReason(reason)
        
      } catch (error) {
        console.error('Error fetching recommendations:', error)
        setRecommended([])
        setRecommendationReason("")
      } finally {
        setLoading(false)
      }
    }

    if (category && excludeId) {
      fetchRecommendations()
    }
  }, [category, excludeId])

  if (loading) {
    return (
      <section className="mt-12 bg-card rounded-2xl p-8 shadow-lg">
        <h2 className="font-display text-xl font-bold text-purple-900 dark:text-white mb-6 text-center">Productos relacionados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-white/10 h-[420px] animate-pulse flex flex-col justify-between p-4">
              <div className="h-40 bg-gray-200 dark:bg-white/5 rounded mb-4" />
              <div className="h-6 bg-gray-200 dark:bg-white/5 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-1/3 mb-4" />
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-gray-200 dark:bg-white/5 rounded" />
                <div className="h-8 w-24 bg-gray-200 dark:bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (recommended.length === 0) {
    return (
      <section className="mt-12 text-center text-gray-500">
        <h2 className="font-display text-xl font-bold text-purple-900 dark:text-white mb-4">Productos relacionados</h2>
        <p>No hay productos relacionados disponibles en este momento.</p>
      </section>
    )
  }

  return (
    <section className="mt-12 bg-card rounded-2xl p-8 shadow-lg">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-purple-900 dark:text-white mb-2">
          Productos relacionados
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommended.map((product, index) => (
          <div key={product.id}>
            {/*
              Acá había una insignia propia ("Destacado" / "Nuevo" /
              "Relacionado") posicionada en top-3 left-3. ProductCard ya pinta
              la suya en ese mismo punto, así que las dos quedaban una encima
              de la otra y no se leía ninguna. Se quedó la de la tarjeta, que
              es la que se ve en toda la tienda.
            */}
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
