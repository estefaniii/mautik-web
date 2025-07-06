"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Eye, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/context/cart-context"
import { useFavorites } from "@/context/favorites-context"
import type { Product } from "@/data/products"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast()
  const { addToCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  // Usar _id si está disponible (productos de API) o id (productos estáticos)
  const productId = product._id || product.id

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addToCart({
      ...product,
      quantity: 1,
    })

    toast({
      title: "Producto añadido",
      description: `${product.name} se ha añadido a tu carrito.`,
    })
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(product.id)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  return (
    <div className="group bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 product-card-hover h-full flex flex-col border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300/50 dark:hover:border-purple-500/50">
      <div className="relative">
        {/* Make the image clickable */}
        <Link href={`/product/${productId}`} className="block relative h-64 w-full overflow-hidden">
          {imageLoading && (
            <Skeleton className="absolute inset-0 h-full w-full bg-gray-200 dark:bg-gray-700" />
          )}
          <Image 
            src={imageError ? "/placeholder.svg" : (product.images[0] || "/placeholder.svg")} 
            alt={product.name} 
            fill 
            className={`object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={false}
          />
          
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>

        {/* Product badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <Badge className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg animate-pulse">
              Nuevo
            </Badge>
          )}
          {(product.discount ?? 0) > 0 && (
            <Badge className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg">
              -{product.discount ?? 0}%
            </Badge>
          )}
        </div>

        {/* Quick action buttons */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={handleToggleFavorite}
            className={`p-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 mb-2 group/btn ${
              isFavorite(product.id) 
                ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" 
                : "text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            }`}
            aria-label={isFavorite(product.id) ? "Eliminar de favoritos" : "Añadir a favoritos"}
            aria-pressed={isFavorite(product.id)}
            tabIndex={0}
            type="button"
          >
            <Heart 
              size={18} 
              className={`${
                isFavorite(product.id) 
                  ? "fill-current animate-pulse" 
                  : "group-hover/btn:scale-110"
              } transition-all duration-200`} 
            />
          </button>
        </div>

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-purple-800 dark:text-purple-200 hover:bg-white dark:hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleAddToCart}
            >
              <ShoppingCart size={16} className="mr-1" /> Añadir
            </Button>
            <Link href={`/product/${productId}`}>
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-purple-800 dark:text-purple-200 hover:bg-white dark:hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Eye size={16} className="mr-1" /> Ver
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-3 flex items-center">
          <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full font-medium">
            {product.category}
          </span>
        </div>

        {/* Make the title clickable */}
        <Link href={`/product/${productId}`} className="block group/title">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 line-clamp-1 group-hover/title:text-purple-800 dark:group-hover/title:text-purple-300 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
          {product.description}
        </p>

        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
          <div>
            {(product.discount ?? 0) > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-purple-800 dark:text-purple-300">
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
              <span className="text-xl font-bold text-purple-800 dark:text-purple-300">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center">
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
          </div>
        </div>
      </div>
    </div>
  )
}
