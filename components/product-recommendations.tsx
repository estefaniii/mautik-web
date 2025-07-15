"use client"
import { useFavorites } from "@/context/favorites-context"
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
  averageRating?: number
  totalReviews?: number
  featured: boolean
  isNew: boolean
  discount?: number
}

export default function ProductRecommendations({ category, excludeId }: { category: string, excludeId: string }) {
  const { favorites } = useFavorites()
  const [recommended, setRecommended] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const products: ApiProduct[] = await response.json()
          
          // Filtrar productos de la misma categoría, excluyendo el actual y favoritos
          const favoriteIds = favorites.map(f => f.id)
          const recommendations = products.filter(product => 
            product.category.toLowerCase() === category.toLowerCase() &&
            product.id !== excludeId &&
            !favoriteIds.includes(product.id)
          ).slice(0, 4)

          // Si no hay suficientes de la misma categoría, agregar productos destacados
          if (recommendations.length < 4) {
            const featuredProducts = products.filter(product => 
              product.featured &&
              product.id !== excludeId &&
              !favoriteIds.includes(product.id) &&
              !recommendations.some(r => r.id === product.id)
            ).slice(0, 4 - recommendations.length)
            
            recommendations.push(...featuredProducts)
          }

          // Mapear a formato Product
          const mappedRecommendations: Product[] = recommendations.map(apiProduct => ({
            id: apiProduct.id,
            name: apiProduct.name,
            price: apiProduct.price,
            originalPrice: apiProduct.originalPrice,
            description: apiProduct.description,
            longDescription: apiProduct.description,
            images: Array.isArray(apiProduct.images) && apiProduct.images.length > 0 ? apiProduct.images : ['/placeholder.svg'],
            category: typeof apiProduct.category === 'string' ? apiProduct.category : '',
            stock: apiProduct.stock,
            rating: apiProduct.averageRating || 4.5,
            reviewCount: apiProduct.totalReviews || 0,
            featured: apiProduct.featured,
            isNew: apiProduct.isNew,
            discount: apiProduct.discount || 0,
          }))

          setRecommended(mappedRecommendations)
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
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
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-purple-900 dark:text-purple-200 mb-8">Productos Relacionados</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
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

  if (recommended.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-bold text-purple-900 dark:text-purple-200 mb-8">Productos Relacionados</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {recommended.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
