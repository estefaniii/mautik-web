"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import LazyImage from '@/components/ui/lazy-image'
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/context/cart-context"
import { useFavorites } from "@/context/favorites-context"
import type { Product } from "@/types/product"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast()
  const { addToCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [imageError, setImageError] = useState(false)

  const productId = product.id

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addToCart({
      ...product,
      quantity: 1,
      stock: product.stock,
      attributes: product.attributes || [],
    })

    toast({
      title: "Producto añadido",
      description: `${product.name} se ha añadido a tu carrito.`,
    })
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(String(product.id))
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const getProductImage = () => {
    if (imageError || !product.images || product.images.length === 0) {
      return "/placeholder.jpg"
    }
    return product.images[0]
  }

  return (
    <div className="group bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 product-card-hover h-full flex flex-col border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300/50 dark:hover:border-purple-500/50">
      <div className="relative">
        <Link href={`/product/${productId}`} className="block relative h-40 md:h-64 w-full overflow-hidden">
          <LazyImage
            src={getProductImage()}
            alt={product.name}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-110"
            onError={handleImageError}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={false}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>

        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          {(product.discount ?? 0) > 0 && (
            <Badge className="bg-gradient-to-r from-red-500/90 to-red-400/80 text-white flex items-center badge-anim shadow-md backdrop-blur-sm">
              <span className="font-sans text-xs font-semibold">-{product.discount}%</span>
            </Badge>
          )}
          {product.isNew && (
            <Badge className="bg-gradient-to-r from-green-500/90 to-green-400/80 text-white flex items-center badge-anim shadow-md backdrop-blur-sm">
              <Star size={12} className="mr-1" />
              <span className="font-sans text-xs font-semibold">Nuevo</span>
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge className="bg-gradient-to-r from-gray-400/90 to-gray-500/80 text-white flex items-center badge-anim shadow-md backdrop-blur-sm">
              <span className="font-sans text-xs font-semibold">Agotado</span>
            </Badge>
          )}
        </div>

        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 z-20 p-2 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group/fav"
          aria-label={isFavorite(productId) ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart
            size={20}
            className={`transition-all duration-300 ${
              isFavorite(productId)
                ? "text-red-500 fill-current scale-110"
                : "text-gray-600 dark:text-gray-400 group-hover/fav:text-red-500"
            }`}
          />
        </button>

        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-purple-800 hover:bg-purple-900 dark:bg-purple-700 dark:hover:bg-purple-800 text-white shadow-lg"
            size="sm"
          >
            <ShoppingCart size={16} className="mr-2" />
            {product.stock === 0 ? "Agotado" : "Añadir al carrito"}
          </Button>
        </div>
      </div>

      <div className="p-3 md:p-5 flex flex-col flex-grow">
        <Link href={`/product/${productId}`} className="block group/title">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1 line-clamp-1 group-hover/title:text-purple-800 dark:group-hover/title:text-purple-300 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 dark:text-gray-300 text-xs mb-2 line-clamp-2 flex-grow leading-tight">
          {product.description}
        </p>

        <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
          <div>
            {(product.discount ?? 0) > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-xl font-bold text-purple-800 dark:text-purple-300">
                  ${(
                    product.price *
                    (1 - ((product.discount ?? 0) / 100))
                  ).toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-lg md:text-xl font-bold text-purple-800 dark:text-purple-300">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center">
            {product.reviewCount && product.reviewCount > 0 ? (
              <>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={`${
                        i < Math.floor(product.rating!) 
                          ? "text-yellow-400 dark:text-yellow-300 fill-current" 
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  ({product.reviewCount})
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
