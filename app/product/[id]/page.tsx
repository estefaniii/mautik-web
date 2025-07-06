"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { notFound, useRouter } from "next/navigation"
import Image from "next/image"
import type { Product } from "@/data/products"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Share2, Star, Minus, Plus, ShoppingCart } from "lucide-react"
import ProductCard from "@/components/product-card"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/context/cart-context"
import { useFavorites } from "@/context/favorites-context"
import ProductReviews from "@/components/product-reviews"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import ProductRecommendations from "@/components/product-recommendations"
import { Skeleton } from "@/components/ui/skeleton"
import Head from 'next/head';
import { products as localProducts } from '@/data/products'

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
  sku?: string // Added sku to ApiProduct interface
}

interface ProductPageProps {
  params: {
    id: string
  }
}

// Mock reviews data - REMOVED - Now using real API
// const mockReviews = { ... } - REMOVED

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

  // Función para mapear productos de la API al formato esperado
  const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
    return {
      id: parseInt(apiProduct._id.replace(/[^0-9]/g, '')) || Math.floor(Math.random() * 1000),
      _id: apiProduct._id, // Mantener el _id original
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
      })) : [],
      sku: apiProduct.sku || '',
    }
  }

  // Cargar producto específico y productos relacionados
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        // Si el id no es un ObjectId válido, buscar en productos locales
        const isObjectId = /^[a-fA-F0-9]{24}$/.test(productId)
        if (!isObjectId) {
          const localProduct = localProducts.find(p => String(p.id) === String(productId))
          if (localProduct) {
            setProduct(localProduct)
            setLoading(false)
            return
          } else {
            setError('Producto no encontrado')
            setLoading(false)
            return
          }
        }
        console.log('=== DEBUGGING PRODUCT PAGE ===')
        console.log('Product ID from params:', productId)
        
        // Primero intentar obtener el producto específico
        const productResponse = await fetch(`/api/products/${productId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        console.log('Product response status:', productResponse.status)
        
        if (productResponse.ok) {
          const productData = await productResponse.json()
          console.log('Product data received:', productData)
          
          if (productData.product) {
            const mappedProduct = mapApiProductToProduct(productData.product)
            console.log('Mapped product:', mappedProduct)
            setProduct(mappedProduct)
            
            // Obtener productos relacionados de la misma categoría
            const relatedResponse = await fetch(`/api/products?category=${productData.product.category}&limit=4`)
            if (relatedResponse.ok) {
              const relatedData = await relatedResponse.json()
              const related = relatedData.products
                .filter((p: any) => p._id !== productId)
                .slice(0, 4)
                .map(mapApiProductToProduct)
              setRelatedProducts(related)
            }
          } else {
            setError('Producto no encontrado')
          }
        } else if (productResponse.status === 404) {
          setError('Producto no encontrado')
        } else if (productResponse.status === 400) {
          setError('ID de producto inválido')
        } else {
          const errorText = await productResponse.text()
          console.error('Error fetching product:', productResponse.status, productResponse.statusText)
          setError(`Error al cargar el producto (${productResponse.status}): ${productResponse.statusText}`)
        }
      } catch (error) {
        console.error('Fetch error details:', error)
        console.error('Error type:', typeof error)
        console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
        
        // Mensaje más específico basado en el tipo de error
        if (error instanceof TypeError && error.message.includes('fetch')) {
          setError('Error de conexión. Por favor, verifica tu conexión a internet.')
        } else {
          setError(`Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        }
      } finally {
        setLoading(false)
        console.log('=== END DEBUGGING ===')
      }
    }

    fetchProduct()
  }, [productId])

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

  if (error) {
    return (
      <div className="bg-gradient-to-b from-purple-50 to-white min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => window.location.reload()} className="bg-purple-800 hover:bg-purple-900">
                  Intentar de nuevo
                </Button>
                <Button onClick={() => router.push('/shop')} variant="outline" className="border-purple-800 text-purple-800 hover:bg-purple-100">
                  Volver a la tienda
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="bg-gradient-to-b from-purple-50 to-white min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-600 mb-4">Producto no encontrado</h1>
              <p className="text-gray-600 mb-6">El producto que buscas no existe o ha sido removido.</p>
              <Button onClick={() => router.push('/shop')} className="bg-purple-800 hover:bg-purple-900">
                Volver a la tienda
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get reviews for this product - REMOVED mock data usage
  // const productReviews = mockReviews[product.id as keyof typeof mockReviews] || []
  // const averageRating = productReviews.length > 0 
  //   ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length 
  //   : product.rating || 0
  // const totalReviews = productReviews.length

  // Use product's own rating data
  const averageRating = product.rating || 0
  const totalReviews = product.reviewCount || 0

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity,
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
    })
    router.push("/cart")
  }

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const seo = product ? {
    title: `${product.name} | Mautik`,
    description: product.description,
    image: product.images[0],
    url: `https://mautik.com/product/${product._id}`,
    price: product.price,
    sku: product.sku || '',
    category: product.category,
  } : null;

  return (
    <>
      {seo && (
        <Head>
          <title>{seo.title}</title>
          <meta name="description" content={seo.description} />
          <meta property="og:title" content={seo.title} />
          <meta property="og:description" content={seo.description} />
          <meta property="og:image" content={seo.image} />
          <meta property="og:url" content={seo.url} />
          <meta property="og:type" content="product" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={seo.title} />
          <meta name="twitter:description" content={seo.description} />
          <meta name="twitter:image" content={seo.image} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: seo.title,
            image: [seo.image],
            description: seo.description,
            sku: seo.sku,
            category: seo.category,
            offers: {
              "@type": "Offer",
              price: seo.price,
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: seo.url,
            },
          }) }} />
        </Head>
      )}
      <div className="bg-gradient-to-b from-purple-50 to-white min-h-screen py-8">
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

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                    <h1 className="font-display text-3xl font-bold text-purple-900 mb-2">{product.name}</h1>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < Math.floor(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({totalReviews} reseñas)</span>
                    </div>
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
                  <p className="text-gray-700 mb-6">{product.description}</p>

                  {/* Product Attributes */}
                  <div className="space-y-4 mb-6">
                    {product.attributes.map((attr, index) => (
                      <div key={index} className="flex">
                        <span className="w-24 font-medium text-gray-700">{attr.name}:</span>
                        <span className="text-gray-600">{attr.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-medium text-gray-700">Cantidad:</span>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={decrementQuantity}
                        className="px-3 py-2 text-purple-800 hover:bg-purple-50"
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                      <button onClick={incrementQuantity} className="px-3 py-2 text-purple-800 hover:bg-purple-50">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">{product.stock} disponibles</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleAddToCart} className="flex-1 bg-purple-800 hover:bg-purple-900">
                      <ShoppingCart className="mr-2 h-5 w-5" /> Añadir al Carrito
                    </Button>
                    <Button
                      onClick={handleBuyNow}
                      variant="outline"
                      className="flex-1 border-purple-800 text-purple-800 hover:bg-purple-100"
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
                    <p className="text-gray-700">{product.longDescription}</p>
                  </div>
                </TabsContent>
                <TabsContent value="details" className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.details.map((detail, index) => (
                      <div key={index} className="flex">
                        <span className="w-32 font-medium text-gray-700">{detail.name}:</span>
                        <span className="text-gray-600">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="reviews" className="p-4">
                  <ProductReviews 
                    productId={product._id || String(product.id)}
                    productName={product.name}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Related Products */}
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold text-purple-900 mb-8">Productos Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          <ProductRecommendations category={product.category} excludeId={product.id} />
        </div>
      </div>
    </>
  )
}
