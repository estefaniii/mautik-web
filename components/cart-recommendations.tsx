"use client"
import { useFavorites } from "@/context/favorites-context"
import ProductCard from "@/components/product-card"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Star, ShoppingCart, Eye, Award, Flame, Box, Check } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import type { Product } from "@/types/product"

export default function CartRecommendations({ excludeIds = [] }: { excludeIds?: string[] }) {
  const { favorites } = useFavorites()
  const { cart } = useCart()
  const favoriteIds = favorites.map(f => f.id)
  const cartIds = cart.map(item => item.id)
  const exclude = new Set([...(excludeIds || []), ...favoriteIds, ...cartIds])
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
        // Filtrar productos que no estén en el carrito ni en favoritos
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
  }, [cartCategories.join(','), favorites.map(f => f.id).join(','), excludeIds.join(',')])

  const { addToCart } = useCart()
  const { toast } = useToast()

  if (loading) {
    return (
      <section className="mt-12 bg-gradient-to-br from-purple-50/80 to-white/80 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-8 shadow-lg">
        <h2 className="font-display text-xl font-bold text-purple-900 dark:text-white mb-6 text-center">Quizá te interese</h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
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

  if (recommended.length === 0) return (
    <section className="mt-12 text-center text-gray-500">
      <h2 className="font-display text-xl font-bold text-purple-900 mb-4">Quizá te interese</h2>
      <p>No hay más productos para recomendarte en este momento.<br/>¡Ya tienes todos nuestros destacados o populares en tu carrito o favoritos!</p>
    </section>
  )

  return (
    <section className="mt-14 bg-gradient-to-br from-purple-100/80 to-white/90 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 shadow-xl ring-1 ring-purple-100/40 dark:ring-gray-800/60">
      <h2 className="font-display text-2xl font-extrabold text-purple-900 dark:text-white mb-10 text-center tracking-tight">Quizá te interese</h2>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        {recommended.map((product, idx) => {
          // Determinar motivo de recomendación
          let motivo = product.featured ? "Destacado" : "Popular"
          let motivoIcon = product.featured ? <Award size={14} className="mr-1" /> : <Flame size={14} className="mr-1" />
          const [isBouncing, setIsBouncing] = useState(false)
          const [added, setAdded] = useState(false)
          const handleAddToCart = () => {
            if (product.stock === 0) return
            addToCart({ ...product, quantity: 1, stock: product.stock, attributes: product.attributes || [] })
            toast({
              title: "Producto añadido",
              description: `${product.name} se ha añadido a tu carrito.`,
            })
            setIsBouncing(true)
            setAdded(true)
            setTimeout(() => setIsBouncing(false), 500)
            setTimeout(() => setAdded(false), 1200)
          }
          return (
            <div
              key={product.id}
              className="relative bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 overflow-visible group animate-fade-in-up focus-within:ring-2 focus-within:ring-purple-400 scale-100 hover:scale-[1.025] outline-none"
              style={{ animationDelay: `${idx * 80}ms` }}
              tabIndex={0}
            >
              {/* Badge de motivo de recomendación */}
              <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 w-[7.5rem] sm:w-auto">
                <Badge className={product.featured ? "bg-gradient-to-r from-purple-700/90 to-purple-500/80 dark:from-purple-900/90 dark:to-purple-700/80 text-white flex items-center badge-anim shadow-md backdrop-blur-sm" : "bg-gradient-to-r from-yellow-500/90 to-yellow-400/80 text-white flex items-center badge-anim shadow-md backdrop-blur-sm"}>
                  {motivoIcon}<span className="font-sans text-xs font-semibold truncate">{motivo}</span>
                </Badge>
                {product.isNew && (
                  <Badge className="bg-gradient-to-r from-green-500/90 to-green-400/80 text-white flex items-center badge-anim shadow-md backdrop-blur-sm"><Star size={12} className="mr-1" /><span className="font-sans text-xs font-semibold truncate">Nuevo</span></Badge>
                )}
                {product.stock === 0 && (
                  <Badge className="bg-gradient-to-r from-gray-400/90 to-gray-500/80 text-white flex items-center badge-anim shadow-md backdrop-blur-sm"><Box size={12} className="mr-1" /><span className="font-sans text-xs font-semibold truncate">Agotado</span></Badge>
                )}
              </div>
              {/* Badge de categoría */}
              <div className="absolute top-3 right-3 z-20 max-w-[7.5rem]">
                <Badge className="bg-gradient-to-r from-gray-200/80 to-gray-100/60 dark:from-gray-800/80 dark:to-gray-700/60 text-gray-700 dark:text-gray-200 flex items-center badge-anim shadow-md backdrop-blur-sm"><Box size={12} className="mr-1" /><span className="font-sans text-xs font-semibold truncate">{product.category}</span></Badge>
              </div>
              <ProductCard product={{ ...product, name: product.name.length > 40 ? product.name.slice(0, 37) + '…' : product.name }} />
              {/* Mostrar ahorro si hay descuento */}
              {(product.discount ?? 0) > 0 && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-green-700 dark:text-green-200 text-xs font-semibold bg-green-50/90 dark:bg-green-900/80 px-2 py-1 rounded shadow badge-anim flex items-center font-sans whitespace-nowrap">
                                      <Flame size={12} className="mr-1" />Ahorra ${((product.price * (product.discount ?? 0)) / 100).toFixed(2)}
                </div>
              )}
              {/* Mostrar popularidad si tiene más de 10 ventas */}
              {(product.reviewCount ?? 0) > 10 && (
                <div className="absolute bottom-32 left-1/2 -translate-x-1/2 text-yellow-700 dark:text-yellow-200 text-xs font-bold bg-yellow-50/90 dark:bg-yellow-900/80 px-2 py-1 rounded shadow badge-anim flex items-center font-sans whitespace-nowrap">
                  <Star size={12} className="mr-1" />Popular: {product.reviewCount} vendidos
                </div>
              )}
              {/* Badge de stock disponible */}
              <div className={`absolute bottom-4 left-4 z-10 max-w-[8rem]`}>
                <Badge className={product.stock > 5 ? 'bg-gradient-to-r from-green-500/90 to-green-400/80 dark:from-green-700/90 dark:to-green-600/80 flex items-center badge-anim shadow-md backdrop-blur-sm' : 'bg-gradient-to-r from-gray-400/90 to-gray-500/80 dark:from-gray-700/90 dark:to-gray-600/80 flex items-center badge-anim shadow-md backdrop-blur-sm'}>
                  <Box size={12} className="mr-1" /><span className="font-sans text-xs font-semibold truncate">Stock: {product.stock}</span>
                </Badge>
              </div>
              {/* Rating como estrellas */}
              <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 px-2 py-1 rounded-lg shadow font-sans">
                {product.reviewCount && product.reviewCount > 0 ? (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.floor(product.rating ?? 0) ? "text-yellow-400 fill-current" : "text-gray-300"}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
                  </>
                ) : null}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleAddToCart}
                      className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-2xl shadow-xl z-10 transition-all font-semibold flex items-center gap-2
                        ${product.stock === 0 ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-purple-800 to-purple-600 dark:from-purple-900 dark:to-purple-700 hover:from-purple-900 hover:to-purple-800 dark:hover:from-purple-800 dark:hover:to-purple-900 text-white'}
                        ${isBouncing ? 'animate-bounce' : ''}`}
                      style={{ minWidth: 160 }}
                      disabled={product.stock === 0}
                      aria-label={product.stock === 0 ? 'Agotado' : 'Añadir al carrito'}
                      tabIndex={0}
                    >
                      {added ? <Check size={18} className="animate-scale-in" /> : <ShoppingCart size={18} />}
                      {product.stock === 0 ? 'Agotado' : added ? 'Añadido' : 'Añadir al carrito'}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="dark:bg-gray-900 dark:text-gray-100">
                    Añadir este producto a tu carrito
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <a
                href={`/product/${product.id}`}
                className="absolute bottom-4 right-24 bg-white/90 dark:bg-gray-900/90 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200 px-5 py-2 rounded-2xl shadow font-bold z-10 text-xs hover:bg-purple-50/80 dark:hover:bg-purple-900/80 transition-all flex items-center gap-2 focus:ring-2 focus:ring-purple-400 outline-none"
                style={{ minWidth: 130 }}
                aria-label={`Ver detalles de ${product.name}`}
                tabIndex={0}
              >
                <Eye size={16} />Ver detalles
              </a>
            </div>
          )
        })}
      </div>
    </section>
  )
}
