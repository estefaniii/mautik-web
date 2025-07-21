"use client"

import { useFavorites } from "@/context/favorites-context"
import ProductCard from "@/components/product-card"
import { useState, useEffect } from "react"
import { Award, Flame, Star, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
  averageRating?: number
  totalReviews?: number
  featured?: boolean
  isNew?: boolean
  discount?: number
}

export default function ProductRecommendations({ category, excludeId }: { category: string, excludeId: string }) {
  const { favorites } = useFavorites()
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
        
        // Obtener productos populares (con más reseñas)
        const popularResponse = await fetch('/api/products?sortBy=totalReviews&sortOrder=desc&limit=20')
        const popularProducts: ApiProduct[] = popularResponse.ok ? await popularResponse.json() : []
        
        // Combinar todos los productos
        const allProducts = [...categoryProducts, ...featuredProducts, ...newProducts, ...popularProducts]
        
        // Eliminar duplicados y el producto actual
        const uniqueProducts = allProducts.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id) && product.id !== excludeId
        )
        
        // Filtrar favoritos del usuario
          const favoriteIds = favorites.map(f => f.id)
        const filteredProducts = uniqueProducts.filter(product => !favoriteIds.includes(product.id))
        
        // Algoritmo de recomendación mejorado
        let recommendations: ApiProduct[] = []
        let reason = ""
        
        // 1. Prioridad: Productos de la misma categoría con mejor rating
        const sameCategoryHighRated = filteredProducts
          .filter(p => p.category.toLowerCase() === category.toLowerCase())
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, 2)
        
        if (sameCategoryHighRated.length > 0) {
          recommendations.push(...sameCategoryHighRated)
          reason = "Productos similares con mejor valoración"
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
        
        // 5. Si aún faltan, agregar productos populares
        if (recommendations.length < 4) {
          const popular = filteredProducts
            .filter(p => (p.totalReviews || 0) > 5 && !recommendations.some(r => r.id === p.id))
            .sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0))
            .slice(0, 4 - recommendations.length)
          
          recommendations.push(...popular)
          reason = reason || "Productos populares"
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
            images: Array.isArray(apiProduct.images) && apiProduct.images.length > 0 ? apiProduct.images : ['/placeholder.svg'],
            category: typeof apiProduct.category === 'string' ? apiProduct.category : '',
            stock: apiProduct.stock,
            rating: apiProduct.averageRating || 4.5,
            reviewCount: apiProduct.totalReviews || 0,
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
  }, [category, excludeId, favorites])

  if (loading) {
    return (
      <section className="mt-12 bg-gradient-to-br from-purple-50/80 to-white/80 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-8 shadow-lg">
        <h2 className="font-display text-xl font-bold text-purple-900 dark:text-white mb-6 text-center">Productos relacionados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-[420px] animate-pulse flex flex-col justify-between p-4">
              <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4" />
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
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
    <section className="mt-12 bg-gradient-to-br from-purple-50/80 to-white/80 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-8 shadow-lg">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-purple-900 dark:text-white mb-2">
          Productos relacionados
        </h2>
        {recommendationReason && (
          <p className="text-sm text-purple-600 dark:text-purple-400 flex items-center justify-center gap-2">
            <TrendingUp size={16} />
            {recommendationReason}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommended.map((product, index) => (
          <div key={product.id} className="relative">
            {/* Badge de recomendación */}
            <div className="absolute top-3 left-3 z-20">
              <Badge className="bg-gradient-to-r from-purple-600/90 to-purple-500/80 text-white flex items-center shadow-md backdrop-blur-sm">
                {product.featured ? (
                  <>
                    <Award size={12} className="mr-1" />
                    <span className="text-xs font-semibold">Destacado</span>
                  </>
                ) : product.isNew ? (
                  <>
                    <Star size={12} className="mr-1" />
                    <span className="text-xs font-semibold">Nuevo</span>
                  </>
                ) : (product.reviewCount || 0) > 10 ? (
                  <>
                    <Flame size={12} className="mr-1" />
                    <span className="text-xs font-semibold">Popular</span>
                  </>
                ) : (
                  <>
                    <TrendingUp size={12} className="mr-1" />
                    <span className="text-xs font-semibold">Relacionado</span>
                  </>
                )}
              </Badge>
            </div>
            
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
