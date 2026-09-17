"use client"
import ProductCard from "@/components/product-card"
import { useCart } from "@/context/cart-context"
import { useState, useEffect } from "react"
import type { Product } from "@/types/product"

export default function CartRecommendations({ excludeIds = [] }: { excludeIds?: string[] }) {
  const { cart } = useCart()
  const cartIds = cart.map(item => item.id)
  const exclude = new Set([...(excludeIds || []), ...cartIds])
  const cartCategories = Array.from(
  new Set(cart.map(item => item.category).filter(Boolean))
) as string[];

  const [recommended, setRecommended] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/products?limit=100')
        if (!res.ok) throw new Error('No se pudieron obtener productos')
        const products: Product[] = await res.json()
        // Filtrar productos que ya están en el carrito
        const filtered = products.filter(p => !exclude.has(p.id))
        // 1. Recomendados de la misma categoría
        let recs: Product[] = []
        if (cartCategories.length > 0) {
          recs = filtered.filter(p => cartCategories.includes(p.category))
        }
        // 2. Si faltan, agregar destacados
        if (recs.length < 4) {
          const featured = filtered.filter(p => p.featured && !recs.some(r => r.id === p.id))
          recs = recs.concat(featured)
        }
        // 3. Si faltan, agregar nuevos
        if (recs.length < 4) {
          const isNew = filtered.filter(p => p.isNew && !recs.some(r => r.id === p.id))
          recs = recs.concat(isNew)
        }
        // 4. Si aún faltan, agregar cualquiera
        if (recs.length < 4) {
          const others = filtered.filter(p => !recs.some(r => r.id === p.id))
          recs = recs.concat(others)
        }
        setRecommended(recs.slice(0, 4))
      } catch (e) {
        setRecommended([])
      } finally {
        setLoading(false)
      }
    }
    fetchRecommendations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartCategories.join(','), excludeIds.join(',')])

  const { addToCart } = useCart()

  if (loading) {
    return (
      <section className="mt-12 bg-card rounded-2xl p-8 shadow-lg">
        <h2 className="font-display text-xl font-bold text-purple-900 dark:text-white mb-6 text-center">Quizá te interese</h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
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

  if (recommended.length === 0) return (
    <section className="mt-12 text-center text-gray-500">
      <h2 className="font-display text-xl font-bold text-purple-900 mb-4">Quizá te interese</h2>
      <p>No hay más productos para recomendarte en este momento.<br/>¡Ya tienes nuestros destacados en el carrito!</p>
    </section>
  )

  /*
    Acá había un bloque que, dentro del `.map()`, llamaba a `useState` dos
    veces por producto. Eso rompe las reglas de hooks: la cantidad de hooks
    cambiaba según cuántas recomendaciones hubiera, y React tiraba el error
    #310 tumbando la página del carrito entera (verificado en producción).

    Además dibujaba sus propias insignias y su propio botón "Añadir al
    carrito" ENCIMA de la tarjeta, duplicando lo que la tarjeta ya hace y
    tapando el diseño nuevo. Ahora usa ProductCard y nada más: mismo aspecto
    que el resto de la tienda y sin hooks sueltos.
  */
  return (
    <section className="mt-14 rounded-3xl bg-card p-6 shadow-[0_2px_16px_rgba(24,10,48,0.10)] ring-1 ring-purple-100/70 sm:p-8 dark:ring-purple-300/15">
      <h2 className="font-display mb-8 text-center text-2xl font-bold tracking-tight text-purple-900 dark:text-purple-100">
        Quizá te interese
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {recommended.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
