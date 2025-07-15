"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { notFound, useRouter } from "next/navigation"
import Image from "next/image"
import type { Product } from "@/types/product"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Share2, Star, Minus, Plus, ShoppingCart } from "lucide-react"
import ProductCard from "@/components/product-card"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/context/cart-context"
import { useFavorites } from "@/context/favorites-context"
import ProductReviews from "@/components/product-reviews"
import { Badge } from "@/components/ui/badge"
import MetaTags from "@/components/seo/meta-tags"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import ProductRecommendations from "@/components/product-recommendations"
import { Skeleton } from "@/components/ui/skeleton"

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
  sku?: string
  discount?: number
}

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const productId = params.id
  const router = useRouter()
  const { toast } = useToast()
  const { addToCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()

  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stockMessage, setStockMessage] = useState<string | null>(null)
  const prevStockRef = useRef(product?.stock || 0)

  // Función para mapear productos de la API al formato esperado
  const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
    return {
      id: apiProduct.id,
      name: apiProduct.name,
      price: apiProduct.price,
      originalPrice: typeof apiProduct.originalPrice === 'number' ? apiProduct.originalPrice : apiProduct.price,
      description: typeof apiProduct.description === 'string' ? apiProduct.description : '',
      images: Array.isArray(apiProduct.images) && apiProduct.images.length > 0 ? apiProduct.images : ['/placeholder.svg'],
      category: typeof apiProduct.category === 'string' ? apiProduct.category : '',
      stock: typeof apiProduct.stock === 'number' ? apiProduct.stock : 0,
      rating: typeof apiProduct.averageRating === 'number' ? apiProduct.averageRating : 4.5,
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
      })) : [],
      sku: typeof apiProduct.sku === 'string' ? apiProduct.sku : '',
    }
  }

  // Función para limpiar referencias a productos eliminados del localStorage
  const cleanDeletedProductReferences = (deletedProductId: string) => {
    try {
      // Limpiar de favoritos
      const user = JSON.parse(localStorage.getItem('mautik_user') || '{}')
      const favoritesKey = user.id ? `mautik_favorites_${user.id}` : 'mautik_favorites_temp'
      const favorites = JSON.parse(localStorage.getItem(favoritesKey) || '[]')
      const cleanedFavorites = favorites.filter((fav: any) => fav.id !== deletedProductId)
      localStorage.setItem(favoritesKey, JSON.stringify(cleanedFavorites))

      // Limpiar del carrito
      const cartKey = user.id ? `mautik_cart_${user.id}` : 'mautik_cart_temp'
      const cart = JSON.parse(localStorage.getItem(cartKey) || '[]')
      const cleanedCart = cart.filter((item: any) => item.id !== deletedProductId)
      localStorage.setItem(cartKey, JSON.stringify(cleanedCart))

      console.log(`🧹 Cleaned references to deleted product ${deletedProductId} from localStorage`)
    } catch (error) {
      console.error('Error cleaning localStorage references:', error)
    }
  }

  // Cargar producto específico y productos relacionados
  useEffect(() => {
    let isMounted = true

    const fetchProduct = async () => {
      try {
        if (!isMounted) return
        
        setLoading(true)
        setError(null)
        
        console.log("🔍 Fetching product with ID:", productId)
        const response = await fetch(`/api/products/${productId}`)
        console.log("📡 Product response status:", response.status)
        
        if (!isMounted) return
        
        if (!response.ok) {
          if (response.status === 404) {
            cleanDeletedProductReferences(productId)
            setError("Producto no encontrado")
            setLoading(false)
            return
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log("📦 Product data received:", data)
        
        if (!isMounted) return
        
        if (!data || !data.product) {
          throw new Error("No data received")
        }
        
        const mappedProduct = mapApiProductToProduct(data.product)
        setProduct(mappedProduct)
        
        // Fetch related products
        const relatedResponse = await fetch(`/api/products?category=${mappedProduct.category}&limit=4&exclude=${productId}`)
        if (relatedResponse.ok && isMounted) {
          const relatedData = await relatedResponse.json()
          setRelatedProducts(relatedData.map(mapApiProductToProduct))
        }
        
      } catch (error) {
        if (!isMounted) return
        let errorToUse = error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));
        console.error("❌ Fetch error details:", errorToUse)
        console.log("🔍 Error type:", typeof errorToUse)
        console.log("💬 Error message:", errorToUse.message)
        if (errorToUse instanceof Error && errorToUse.message === 'NEXT_NOT_FOUND') {
          cleanDeletedProductReferences(productId)
          setError("Producto no encontrado")
        } else {
          setError("Error al cargar el producto")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          console.log("✅ === END DEBUGGING ===")
        }
      }
    }

    fetchProduct()

    return () => {
      isMounted = false
    }
  }, [productId])

  // Polling para actualizar stock cada 20 segundos
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        if (!product) return
        const res = await fetch(`/api/products/${product.id}`)
        if (res.ok) {
          const data = await res.json()
          if (typeof data.stock === 'number' && data.stock !== product.stock) {
            setProduct((prev: any) => ({ ...prev, stock: data.stock }))
            if (data.stock < prevStockRef.current) {
              setStockMessage('El stock ha bajado, actualiza tu selección.')
            }
            prevStockRef.current = data.stock
          }
        }
      } catch {}
    }, 20000)
    return () => clearInterval(interval)
  }, [product?.id, product?.stock])

  // Validar stock antes de añadir al carrito o comprar
  const fetchLatestStock = async () => {
    if (!product) return 0
    const res = await fetch(`/api/products/${product.id}`)
    if (res.ok) {
      const data = await res.json()
      if (typeof data.stock === 'number') {
        if (data.stock !== product.stock) {
          setProduct((prev: any) => ({ ...prev, stock: data.stock }))
          if (data.stock < quantity) {
            setQuantity(data.stock)
            setStockMessage('El stock ha cambiado, ajustamos tu selección.')
          }
          return data.stock
        }
        return data.stock
      }
    }
    return product.stock
  }

  const handleAddToCartWithStockCheck = async () => {
    const latestStock = await fetchLatestStock()
    if (latestStock < quantity) {
      setStockMessage('No hay suficiente stock disponible.')
      return
    }
    setStockMessage(null)
    handleAddToCart()
  }

  const handleBuyNowWithStockCheck = async () => {
    const latestStock = await fetchLatestStock()
    if (latestStock < quantity) {
      setStockMessage('No hay suficiente stock disponible.')
      return
    }
    setStockMessage(null)
    handleBuyNow()
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-purple-50 to-white min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 p-6">
                <Skeleton className="h-[400px] w-full mb-4" />
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-20" />
                  ))}
                </div>
              </div>
              <div className="md:w-1/2 p-6">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-6" />
                <Skeleton className="h-12 w-full mb-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="bg-gradient-to-b from-purple-50 to-white min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
            <p className="text-gray-600 mb-6">El producto que buscas no existe o ha sido eliminado.</p>
            <Button onClick={() => router.push('/shop')}>
              Volver a la tienda
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const averageRating = product.rating || 0
  const totalReviews = product.reviewCount || 0

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity,
      attributes: product.attributes || [],
      stock: product.stock,
    })

    toast({
      title: "Producto añadido",
      description: `${product.name} se ha añadido a tu carrito.`,
    })
  }

  const handleToggleFavorite = () => {
    toggleFavorite(product.id)
  }

  const handleBuyNow = () => {
    addToCart({
      ...product,
      quantity,
      attributes: product.attributes || [],
      stock: product.stock,
    })
    router.push("/cart")
  }

  const incrementQuantity = () => {
    setQuantity((prev) => (prev < product.stock ? prev + 1 : prev))
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  return (
    <>
      <MetaTags 
        title={product.name}
        description={product.description}
        keywords={`${product.name}, ${product.category}, artesanía panameña, mautik`}
        image={product.images[0]}
        url={`/product/${product.id}`}
        type="product"
        product={{
          name: product.name,
          price: product.price.toString(),
          currency: "USD",
          availability: product.stock > 0 ? "in stock" : "out of stock",
          category: product.category
        }}
      />
      <div className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/shop">Tienda</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/shop?category=${product.category}`}>{product.category}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="text-purple-800 font-medium">{product.name}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              {/* Product Images */}
              <div className="md:w-1/2 p-6">
                <div className="relative h-[400px] w-full mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={product.images[selectedImage] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                  {product.isNew && (
                    <Badge className="absolute top-4 left-4 bg-green-500 hover:bg-green-600">Nuevo</Badge>
                  )}
                  {(product.discount ?? 0) > 0 && (
                    <Badge className="absolute top-4 right-4 bg-red-500 hover:bg-red-600">-{product.discount ?? 0}%</Badge>
                  )}
                </div>

                {/* Thumbnail Images */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-20 w-20 rounded-md overflow-hidden border-2 ${
                        selectedImage === index ? "border-purple-800" : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} - vista ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className="md:w-1/2 p-6 md:p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="font-display text-3xl font-bold text-purple-900 dark:text-purple-200 mb-2">{product.name}</h1>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className={`rounded-full ${isFavorite(product.id) ? "text-red-500 border-red-500" : "text-purple-800"}`}
                      onClick={handleToggleFavorite}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite(product.id) ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Share2 className="h-5 w-5 text-purple-800" />
                    </Button>
                  </div>
                </div>

                <div className="my-6">
                  <div className="flex items-baseline gap-2 mb-4">
                    {(product.discount ?? 0) > 0 ? (
                      <>
                        <span className="text-3xl font-bold text-purple-800">
                          ${(product.price * (1 - (product.discount ?? 0) / 100)).toFixed(2)}
                        </span>
                        <span className="text-xl text-gray-500 line-through">${product.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-purple-800">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">{product.description}</p>

                  {/* Product Attributes */}
                  <div className="space-y-4 mb-6">
                    {product.attributes && product.attributes.length > 0 && (
                      <ul>
                        {product.attributes.map((attr: { name: string; value: string }) => (
                          <li key={attr.name}>{attr.name}: {attr.value}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Cantidad:</span>
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                      <button
                        onClick={decrementQuantity}
                        className="px-3 py-2 text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800/30 transition-colors"
                        disabled={quantity <= 1 || product.stock === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">{quantity}</span>
                      <button
                        onClick={incrementQuantity}
                        className="px-3 py-2 text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800/30 transition-colors"
                        disabled={quantity >= product.stock || product.stock === 0}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{product.stock} disponibles</span>
                    {quantity >= product.stock && product.stock > 0 && (
                      <span className="ml-2 text-xs text-red-500">No puedes seleccionar más de lo disponible</span>
                    )}
                  </div>

                  {/* Mensaje de stock actualizado */}
                  {stockMessage && (
                    <div className="text-xs text-red-500 mb-2">{stockMessage}</div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleAddToCartWithStockCheck} className="flex-1 bg-purple-800 hover:bg-purple-900" disabled={product.stock === 0}>
                      <ShoppingCart className="mr-2 h-5 w-5" /> Añadir al Carrito
                    </Button>
                    <Button
                      onClick={handleBuyNowWithStockCheck}
                      variant="outline"
                      className="flex-1 border-purple-800 dark:border-purple-300 text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors"
                      disabled={product.stock === 0}
                    >
                      Comprar Ahora
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Tabs */}
            <div className="p-6 border-t border-gray-200">
              <Tabs defaultValue="description">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Descripción</TabsTrigger>
                  <TabsTrigger value="details">Detalles</TabsTrigger>
                  <TabsTrigger value="reviews">Reseñas</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="p-4">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 dark:text-gray-300">{product.description}</p>
                  </div>
                </TabsContent>
                <TabsContent value="details" className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.details && product.details.length > 0 ? (
                      product.details.map((detail, index) => (
                        <div key={index} className="flex">
                          <span className="w-32 font-medium text-gray-700 dark:text-gray-300">{detail.name}:</span>
                          <span className="text-gray-600 dark:text-gray-400">{detail.value}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 col-span-2">No hay detalles adicionales disponibles para este producto.</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="reviews" className="p-4">
                  <ProductReviews 
                    productId={product.id || String(product.id)}
                    productName={product.name}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <ProductRecommendations category={product.category} excludeId={String(product.id)} />
        </div>
      </div>
    </>
  )
}
