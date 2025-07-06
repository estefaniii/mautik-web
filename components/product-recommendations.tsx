"use client"
import { products } from "@/data/products"
import { useFavorites } from "@/context/favorites-context"
import ProductCard from "@/components/product-card"

export default function ProductRecommendations({ category, excludeId }: { category: string, excludeId: number }) {
  const { favorites } = useFavorites()
  const favoriteIds = favorites.map(f => f.id)

  // Recomendados: misma categoría, no el actual, no favoritos
  let recommended = products.filter(
    p => p.category === category && p.id !== excludeId && !favoriteIds.includes(p.id)
  ).slice(0, 4)

  // Si no hay suficientes, rellena con destacados de la categoría
  if (recommended.length < 4) {
    const destacados = products.filter(
      p => p.category === category && p.featured && p.id !== excludeId && !favoriteIds.includes(p.id)
    )
    recommended = [...recommended, ...destacados].slice(0, 4)
  }

  if (recommended.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-bold text-purple-900 mb-8">Productos Relacionados</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {recommended.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
