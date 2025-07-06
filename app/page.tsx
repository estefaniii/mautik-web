"use client"

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ProductCard from "@/components/product-card"
import FeaturedCollection from "@/components/featured-collection"
import { CategoryShowcase } from "@/components/category-showcase"
import { Newsletter } from "@/components/newsletter"
import { ArrowRight } from "lucide-react"
import type { Product } from "@/data/products"

// Tipo para productos de la API
interface ApiProduct {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  images: string[]
  stock: number
  averageRating?: number
  totalReviews?: number
  isFeatured?: boolean
  isNew?: boolean
  specifications?: Record<string, any>
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Función para mapear productos de la API al formato esperado
  const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
    return {
      id: parseInt(apiProduct._id.replace(/[^0-9]/g, '')) || Math.floor(Math.random() * 1000),
      name: apiProduct.name,
      price: apiProduct.price,
      originalPrice: apiProduct.originalPrice,
      description: apiProduct.description,
      longDescription: apiProduct.description,
      images: apiProduct.images || ['/placeholder.svg'],
      category: apiProduct.category,
      stock: apiProduct.stock,
      rating: apiProduct.averageRating || 4.5,
      reviewCount: apiProduct.totalReviews || 0,
      featured: apiProduct.isFeatured || false,
      isNew: apiProduct.isNew || false,
      discount: apiProduct.originalPrice ? Math.round(((apiProduct.originalPrice - apiProduct.price) / apiProduct.originalPrice) * 100) : 0,
      attributes: apiProduct.specifications ? Object.entries(apiProduct.specifications).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: String(value)
      })) : [],
      details: apiProduct.specifications ? Object.entries(apiProduct.specifications).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: String(value)
      })) : []
    }
  }

  // Cargar productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products')
        if (response.ok) {
          const data = await response.json()
          const apiProducts: ApiProduct[] = data.products || data
          // Mapear productos y filtrar destacados
          const mappedProducts = apiProducts.map(mapApiProductToProduct)
          // Mostrar productos destacados si existen, sino mostrar los primeros 8 productos
          const featured = mappedProducts.filter((p: Product) => p.featured).slice(0, 8)
          const productsToShow = featured.length > 0 ? featured : mappedProducts.slice(0, 8)
          setFeaturedProducts(productsToShow)
        } else {
          console.error('Error fetching products')
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/fondonubes.jpg" alt="Joyería artesanal" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Artesanías Únicas
            <span className="block text-purple-300">Hechas a Mano</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Descubre piezas únicas de joyería, crochet, llaveros y más, elaboradas con amor y los mejores materiales. Cada artesanía cuenta una historia especial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-lg px-8 py-6 text-white border-none shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 dark:from-purple-400 dark:via-purple-500 dark:to-purple-600 dark:hover:from-purple-500 dark:hover:via-purple-600 dark:hover:to-purple-700">
              <Link href="/shop">
                Explorar Artesanías <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-white border-white hover:bg-white hover:text-purple-900 text-lg px-8 py-6 bg-transparent dark:bg-black/40 dark:border-white/80 dark:hover:bg-black/60 dark:text-white/90 dark:hover:text-white"
            >
              <Link href="/about">Nuestra Historia</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-purple-900 dark:text-purple-100 mb-4">Productos Destacados</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Descubre nuestras piezas más populares, seleccionadas especialmente para ti
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {featuredProducts.map((product) => (
                <Suspense key={product.id} fallback={<div className="h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />}>
                  <ProductCard product={product} />
                </Suspense>
              ))}
            </div>
          )}

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/shop">
                Ver Todos los Productos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <FeaturedCollection />

      {/* Category Showcase */}
      <CategoryShowcase />

      {/* Newsletter */}
      <Newsletter />
    </div>
  )
}
