"use client"

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ProductCard from "@/components/product-card"
import FeaturedCollection from "@/components/featured-collection"
import { CategoryShowcase } from "@/components/category-showcase"
import MetaTags from "@/components/seo/meta-tags"
import { ArrowRight, Heart, Sparkles, Star } from "lucide-react"
import type { Product } from "@/types/product"

// Tipo para productos de la API
interface ApiProduct {
  id: string
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
  discount?: number // Nuevo campo para el descuento
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Función para mapear productos de la API al formato esperado
  const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
    return {
      id: apiProduct.id, // Usar directamente el ID de la API
      name: apiProduct.name,
      price: apiProduct.price,
      originalPrice: apiProduct.originalPrice,
      description: apiProduct.description,
      images: apiProduct.images || ['/placeholder.svg'],
      category: apiProduct.category,
      stock: apiProduct.stock,
      rating: apiProduct.averageRating || 4.5,
      reviewCount: apiProduct.totalReviews || 0,
      featured: apiProduct.isFeatured || false,
      isNew: apiProduct.isNew || false,
      discount: apiProduct.discount || 0, // Usar el descuento manual configurado
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
    <>
      <MetaTags 
        title="Mautik - Artesanía Panameña Hecha con Amor"
        description="Descubre la belleza única de la artesanía panameña. Cada pieza está hecha a mano con pasión, dedicación y el toque especial de Mautik. Joyería artesanal, crochet, llaveros y más."
        keywords="artesanía panameña, joyería artesanal, crochet panamá, llaveros artesanales, pulseras hechas a mano, collares artesanales, anillos panameños, aretes artesanales, handmade panamá, artesanía la chorrera, mautik"
        image="/fondonubes.jpg"
        url="/"
      />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image src="/fondonubes.jpg" alt="Artesanías panameñas Mautik" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
          </div>

          <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge className="bg-purple-600/90 text-white border-none">
                <Sparkles size={14} className="mr-1" />
                Hecho a Mano en Panamá
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-3">
              Mautik
            </h1>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight text-purple-300 mb-6">
              Artesanías y Joyas Hechas con Amor
            </h2>
            
            <p className="text-lg md:text-xl lg:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Cada pieza cuenta una historia única. Desde la creatividad artesanal hasta la selección cuidadosa de tendencias que te harán brillar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-lg px-8 py-6 text-white border-none shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <Link href="/shop">
                  Explorar Colección <ArrowRight className="ml-2 h-5 w-5" />
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
            
            <div className="flex items-center justify-center gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-red-400" />
                <span>Hecho con Amor</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={16} className="text-yellow-400" />
                <span>Calidad Artesanal</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                <span>Único y Especial</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20 bg-gradient-to-b from-white to-purple-50/30 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 mb-4">
                <Star size={14} className="mr-1" />
                Selección Especial
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-purple-900 dark:text-purple-100 mb-6">
                Piezas Destacadas
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Nuestras creaciones más populares, seleccionadas especialmente para ti. Cada pieza refleja la pasión y dedicación de la artesanía panameña.
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {featuredProducts.map((product) => (
                  <Suspense key={product.id} fallback={<div className="h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl" />}>
                    <ProductCard product={product} />
                  </Suspense>
                ))}
              </div>
            )}

            <div className="text-center">
              <Button asChild variant="outline" size="lg" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-400 dark:hover:text-white">
                <Link href="/shop">
                  Ver Toda la Colección <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Collection */}
        <FeaturedCollection />

        {/* Category Showcase */}
        <CategoryShowcase />
      </div>
    </>
  )
}
