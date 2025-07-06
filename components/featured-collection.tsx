"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { products } from "@/data/products"
import { useFavorites } from "@/context/favorites-context"
import ProductCard from "@/components/product-card"

export default function FeaturedCollection() {
  const { favorites, getFavoriteProducts } = useFavorites()
  let recommended: typeof products = []

  if (favorites && favorites.length > 0) {
    const favoriteIds = favorites.map(f => f.id)
    const favoriteCategories = getFavoriteProducts().map(p => p.category)
    recommended = products.filter(
      p => favoriteCategories.includes(p.category) && !favoriteIds.includes(p.id)
    ).slice(0, 8)
  }
  if (recommended.length === 0) {
    recommended = products.filter(p => p.featured).slice(0, 8)
  }

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/maar.png"
          alt="Featured Collection Background"
          fill
          className="object-cover brightness-[0.7]"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-lg bg-white/90 dark:bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-lg">
          <span className="text-purple-800 dark:text-purple-900 font-medium">Colección Destacada</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-purple-900 dark:text-purple-900 mt-2 mb-4">
            Océano Panameño 2025
          </h2>
          <p className="text-gray-700 dark:text-black mb-8">
            Descubre nuestra nueva colección inspirada en los maravillosos océanos de Panamá. Piezas únicas que capturan
            la belleza del mar con elegancia y creatividad artesanal.
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
        <h2 className="font-display text-2xl font-bold text-purple-900 dark:text-purple-100 mb-8">
          {favorites && favorites.length > 0 ? "Recomendados para ti" : "Colección Destacada"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {recommended.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
