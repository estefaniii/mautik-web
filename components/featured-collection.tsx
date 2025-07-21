"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import LazyImage from '@/components/ui/lazy-image'
import { useFavorites } from "@/context/favorites-context"
import ProductCard from "@/components/product-card"
import { useState, useEffect } from "react"
import { ProductCardSkeleton } from '@/components/ui/loading-states'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  description: string
  images: string[]
  category: string
  stock: number
  rating: number
  reviewCount: number
  featured: boolean
  isNew: boolean
  discount?: number
}

export default function FeaturedCollection() {
  const { favorites } = useFavorites()
  const [recommended, setRecommended] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const products: Product[] = await response.json()
          let recs: Product[] = []
          if (favorites && favorites.length > 0) {
            const favoriteCategories = favorites.map(f => f.category)
            const favoriteIds = favorites.map(f => f.id)
            // 1. De la misma categoría, que no sean favoritos
            recs = products.filter(p => favoriteCategories.includes(p.category) && !favoriteIds.includes(p.id))
            // 2. Si faltan, destacados
            if (recs.length < 8) {
              const featured = products.filter(p => p.featured && !recs.some(r => r.id === p.id) && !favoriteIds.includes(p.id))
              recs = recs.concat(featured)
            }
            // 3. Si faltan, nuevos
            if (recs.length < 8) {
              const isNew = products.filter(p => p.isNew && !recs.some(r => r.id === p.id) && !favoriteIds.includes(p.id))
              recs = recs.concat(isNew)
            }
            // 4. Si aún faltan, cualquiera
            if (recs.length < 8) {
              const others = products.filter(p => !recs.some(r => r.id === p.id) && !favoriteIds.includes(p.id))
              recs = recs.concat(others)
            }
            setRecommended(recs.slice(0, 8))
          } else {
            // Si no hay favoritos, mostrar productos nuevos
            const newProducts = products.filter(p => p.isNew).slice(0, 8)
            setRecommended(newProducts)
          }
        }
      } catch (error) {
        const errorToUse = error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));
        console.error('Error fetching products:', errorToUse)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [favorites])

  if (loading) {
    return (
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <LazyImage
            src="/maar.png"
            alt="Featured Collection Background"
            fill
            className="object-cover brightness-[0.7]"
            priority={false}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-lg bg-white/90 dark:bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-lg">
            <span className="text-purple-800 dark:text-purple-900 font-medium">Colección Destacada</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-purple-900 dark:text-purple-900 mt-2 mb-4">
              Tus Personajes Favoritos
            </h2>
            <p className="text-gray-700 dark:text-black mb-8">
              Descubre una colección única inspirada en los personajes más icónicos del mundo de las series, anime, películas y caricaturas. Cada pieza está hecha a mano con amor y detalle para que lleves contigo un pedacito de tu universo favorito.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop?collection=oceano-panameno">
                <Button size="lg" className="bg-purple-800 hover:bg-purple-900 dark:bg-purple-700 dark:hover:bg-purple-800">
                  Ver Colección
                </Button>
              </Link>
              <Link href="/lookbook">
                <Button variant="outline" size="lg" className="border-purple-800 text-purple-800 hover:bg-purple-100 dark:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-50">
                  Ver Lookbook
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-16">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <LazyImage
          src="/maar.png"
          alt="Featured Collection Background"
          fill
          className="object-cover brightness-[0.7]"
          priority={false}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-lg bg-white/90 dark:bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-lg">
          <span className="text-purple-800 dark:text-purple-900 font-medium">Colección Destacada</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-purple-900 dark:text-purple-900 mt-2 mb-4">
            Personajes de tus Series Favoritas
          </h2>
          <p className="text-gray-700 dark:text-black mb-8">
            Descubre una colección única inspirada en los personajes más icónicos del mundo de las series, anime, películas y caricaturas. Cada pieza está hecha a mano con amor y detalle para que lleves contigo un pedacito de tu universo favorito.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="escu/shop?collection=oceano-panameno">
              <Button size="lg" className="bg-purple-800 hover:bg-purple-900 dark:bg-purple-700 dark:hover:bg-purple-800">
                Ver Colección
              </Button>
            </Link>
            <Link href="/lookbook">
              <Button variant="outline" size="lg" className="border-purple-800 text-purple-800 hover:bg-purple-100 dark:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-50">
                Ver Lookbook
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-16">
        <h2 className="font-display text-2xl font-bold text-purple-900 dark:text-purple-100 mb-8">
          {favorites && favorites.length > 0 ? "Recomendados para ti" : "Colección Destacada"}
        </h2>
        {recommended.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recommended.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No hay productos disponibles en este momento.</p>
          </div>
        )}
      </div>
    </section>
  )
}
