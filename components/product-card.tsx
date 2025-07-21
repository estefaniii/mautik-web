"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import LazyImage from '@/components/ui/lazy-image'
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Star, Image as ImageIcon } from "lucide-react"
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
    // Si hay error de imagen o no hay imágenes, usar placeholder
    if (imageError || !product.images || product.images.length === 0) {
      return "/placeholder.jpg"
    }
    
    // Validar que la primera imagen sea una URL válida
    const firstImage = product.images[0]
    if (!firstImage || typeof firstImage !== 'string' || firstImage.trim() === '') {
      return "/placeholder.jpg"
    }
    
    // Verificar si es una URL válida
    try {
      new URL(firstImage)
      return firstImage
    } catch {
      // Si no es una URL válida, usar placeholder
      return "/placeholder.jpg"
    }
  }

  const renderImagePlaceholder = () => (
    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
      <div className="text-center">
        <ImageIcon size={48} className="text-purple-400 dark:text-purple-500 mx-auto mb-2" />
        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
          {product.name}
        </p>
      </div>
    </div>
  )

  return (
    <div className="group bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 product-card-hover h-full flex flex-col border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300/50 dark:hover:border-purple-500/50">
      <div className="relative">
        <Link href={`/product/${productId}`} className="block relative h-32 sm:h-40 md:h-48 lg:h-56 w-full overflow-hidden">
          {imageError ? (
            renderImagePlaceholder()
          ) : (
          <LazyImage
            src={getProductImage()}
            alt={product.name}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-110"
            onError={handleImageError}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            priority={false}
              fallbackSrc="/placeholder.jpg"
          />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>

        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 sm:gap-2">
          {(product.discount ?? 0) > 0 && (
            <Badge className="bg-gradient-to-r from-red-500/90 to-red-400/80 text-white flex items-center badge-anim shadow-md backdrop-blur-sm text-xs px-2 py-1">
              <span className="font-sans text-xs font-semibold">-{product.discount}%</span>
            </Badge>
          )}
          {product.isNew && (
            <Badge className="bg-gradient-to-r from-green-500/90 to-green-400/80 text-white flex items-center badge-anim shadow-md backdrop-blur-sm text-xs px-2 py-1">
              <Star size={10} className="mr-1" />
              <span className="font-sans text-xs font-semibold">Nuevo</span>
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge className="bg-gradient-to-r from-gray-400/90 to-gray-500/80 text-white flex items-center badge-anim shadow-md backdrop-blur-sm text-xs px-2 py-1">
              <span className="font-sans text-xs font-semibold">Agotado</span>
            </Badge>
          )}
        </div>

        <button
          onClick={handleToggleFavorite}
          className="absolute top-2 right-2 z-20 p-1.5 sm:p-2 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group/fav"
          aria-label={isFavorite(productId) ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart
            size={16}
            className={`transition-all duration-300 ${
              isFavorite(productId)
                ? "text-red-500 fill-current scale-110"
                : "text-gray-600 dark:text-gray-400 group-hover/fav:text-red-500"
            }`}
          />
        </button>

        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-purple-800 hover:bg-purple-900 dark:bg-purple-700 dark:hover:bg-purple-800 text-white shadow-lg text-xs sm:text-sm py-1.5 sm:py-2"
            size="sm"
          >
            <ShoppingCart size={14} className="mr-1.5 sm:mr-2" />
            {product.stock === 0 ? "Agotado" : "Añadir"}
          </Button>
        </div>
      </div>

      <div className="p-2 sm:p-3 md:p-4 lg:p-5 flex flex-col flex-grow">
        <Link href={`/product/${productId}`} className="block group/title">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1 line-clamp-2 group-hover/title:text-purple-800 dark:group-hover/title:text-purple-300 transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-2 line-clamp-2 flex-grow leading-tight">
          {product.description}
        </p>

        <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
          <div>
            {(product.discount ?? 0) > 0 ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-purple-800 dark:text-purple-300">
                  ${(
                    product.price *
                    (1 - ((product.discount ?? 0) / 100))
                  ).toFixed(2)}
                </span>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-purple-800 dark:text-purple-300">
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
                      size={12}
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
