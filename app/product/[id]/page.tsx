"use client"

import { useState, useEffect, useRef, use } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { Product } from "@/types/product"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Share2, Minus, Plus, ShoppingCart } from "lucide-react"
import ProductCard from "@/components/product-card"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
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
  featured?: boolean
  isNew?: boolean
  specifications?: Record<string, any>
  sku?: string
  discount?: number
}

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id: productId } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { addToCart } = useCart()
  const { user } = useAuth()

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
      images: Array.isArray(apiProduct.images) && apiProduct.images.length > 0 ? apiProduct.images : ['/placeholder.jpg'],
      category: typeof apiProduct.category === 'string' ? apiProduct.category : '',
      stock: typeof apiProduct.stock === 'number' ? apiProduct.stock : 0,
      featured: apiProduct.featured || false,
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
          /*
            503 = la base no contesta. NO se limpia la referencia del producto
            ni se dice "no encontrado": la pieza existe, lo que falla es la
            tienda. Decirle a la clienta que el producto no existe cuando en
            realidad es un problema nuestro la manda a buscar a otro lado.
          */
          if (response.status === 503) {
            setError("La tienda está con un problema técnico. Vuelve a intentarlo en unos minutos.")
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
    /*
      Sondeo de stock cada 2 minutos y SOLO con la pestaña a la vista.

      Antes era cada 20 segundos y seguía corriendo con la pestaña de fondo:
      una clienta que dejaba el carrito abierto toda la tarde generaba 180
      consultas por hora, por cada producto del carrito. En el plan gratis de
      Neon eso se paga en horas de base despierta, que es justo lo que agotó
      la cuota y tumbó la tienda. Dos minutos alcanza de sobra para avisar que
      algo se agotó.
    */
    const interval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return
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
    }, 120000)
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
      <div className="bg-background min-h-screen py-8">
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
      <div className="bg-background min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-purple-50 mb-4">{error || "Producto no encontrado"}</h1>
            <p className="text-gray-600 dark:text-purple-100/70 mb-6">El producto que buscas no existe o ha sido eliminado.</p>
            <Button onClick={() => router.push('/shop')}>
              Volver a la tienda
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const requireAuth = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para continuar.",
        variant: "destructive",
      })
      router.push(`/login?callbackUrl=/product/${product.id}`)
      return false
    }
    return true
  }

  /*
    Agregar al carrito no pide sesión: antes te sacaba a /login en el acto,
    que es la forma más rápida de perder una venta. La sesión se pide en el
    checkout, que es donde hace falta de verdad.
  */
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


  const handleBuyNow = () => {
    if (!requireAuth()) return
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
      <div className="bg-background min-h-screen py-8">
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

          {/*
            Misma superficie y mismas esquinas que las tarjetas de la tienda.
            Antes era `bg-white dark:bg-card` con `rounded-lg`: en modo
            oscuro quedaba de un gris azulado distinto al resto y las esquinas
            no coincidian con nada mas de la app.
          */}
          <div className="overflow-hidden rounded-3xl bg-card shadow-[0_2px_16px_rgba(24,10,48,0.10)] ring-1 ring-purple-100/70 dark:ring-purple-300/15">
            <div className="md:flex">
              {/* Product Images */}
              <div className="md:w-1/2 p-6">
                {/*
                  Proporcion 3:4, la misma en la que estan tomadas todas las
                  fotos, con `object-cover`: asi la pieza llena el cuadro sin
                  recortarse. Antes era una caja fija de 400px de alto con
                  `object-contain`, o sea la pieza chica y flotando en el
                  medio con franjas vacias a los lados.
                */}
                <div className="relative mb-4 aspect-[3/4] w-full overflow-hidden rounded-3xl bg-purple-50/60 dark:bg-purple-950/30">
                  <Image
                    src={product.images[selectedImage] || "/placeholder.jpg"}
                    alt={
                      product.images.length > 1
                        ? `${product.name}, vista ${selectedImage + 1} de ${product.images.length}`
                        : product.name
                    }
                    fill
                    className="object-cover"
                    // Sin `sizes` en una imagen con `fill`, Next se trae el
                    // archivo más grande que tenga.
                    sizes="(max-width: 768px) 100vw, 480px"
                    priority
                  />
                  {product.isNew && (
                    <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-purple-900 shadow-sm">Nuevo</span>
                  )}
                  {(product.discount ?? 0) > 0 && (
                    <span className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">-{product.discount ?? 0}%</span>
                  )}
                </div>

                {/*
                  Miniaturas: solo si hay más de una foto. Con una sola se
                  dibujaba igual un botón suelto debajo de la imagen, que no
                  hacía nada y parecía un error.
                */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Fotos del producto">
                    {product.images.map((image, index) => (
                      <button
                        key={image || index}
                        type="button"
                        onClick={() => setSelectedImage(index)}
                        aria-pressed={selectedImage === index}
                        aria-label={`Ver foto ${index + 1} de ${product.images.length}`}
                        className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-colors ${
                          selectedImage === index
                            ? "border-purple-800 dark:border-purple-400"
                            : "border-gray-200 hover:border-purple-300 dark:border-white/10"
                        }`}
                      >
                        <Image
                          src={image || "/placeholder.jpg"}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="md:w-1/2 p-6 md:p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="font-display text-3xl font-bold text-purple-900 dark:text-purple-200 mb-2">{product.name}</h1>
                    {/*
                      Etiquetas en pastilla, las mismas que en la tarjeta de la
                      tienda: la clienta viene de ahi y encuentra lo mismo.
                    */}
                    <div className="mb-1 flex flex-wrap gap-1.5">
                      {product.category && (
                        <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-medium text-purple-900 dark:bg-purple-400/15 dark:text-purple-100">
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase()}
                        </span>
                      )}
                      {/* "Hecho a mano" salía en todos los productos sin
                          distinguir ninguno; se quitó también acá para que las
                          dos vistas digan lo mismo. Queda el origen, que sí
                          aporta. */}
                      <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-medium text-purple-900 dark:bg-purple-400/15 dark:text-purple-100">
                        La Chorrera, Panamá
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
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
                  <p className="text-gray-700 dark:text-purple-100/80 mb-6">{product.description}</p>

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
                    <span className="font-medium text-gray-700 dark:text-purple-100/80">Cantidad:</span>
                    <div className="flex items-center border border-gray-300 dark:border-white/15 rounded-md">
                      <button
                        onClick={decrementQuantity}
                        className="px-3 py-2 text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800/30 transition-colors"
                        disabled={quantity <= 1 || product.stock === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300 dark:border-white/15 text-gray-900 dark:text-purple-50">{quantity}</span>
                      <button
                        onClick={incrementQuantity}
                        className="px-3 py-2 text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800/30 transition-colors"
                        disabled={quantity >= product.stock || product.stock === 0}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-purple-100/60">{product.stock} disponibles</span>
                    {/*
                      El aviso, solo cuando de verdad se toca el techo y hay
                      más de una unidad. Antes la condicion era
                      `quantity >= product.stock`, que con stock 1 se cumple en
                      cuanto se abre la ficha: las piezas únicas salían con un
                      texto rojo de error sin que nadie hubiera tocado nada.
                    */}
                    {product.stock === 1 ? (
                      <span className="ml-2 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-400/15 dark:text-purple-200">
                        Pieza única
                      </span>
                    ) : quantity >= product.stock ? (
                      <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                        Es todo lo que queda
                      </span>
                    ) : null}
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="description">Descripción</TabsTrigger>
                  <TabsTrigger value="details">Detalles</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="p-4">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 dark:text-purple-100/80">{product.description}</p>
                  </div>
                </TabsContent>
                <TabsContent value="details" className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.details && product.details.length > 0 ? (
                      product.details.map((detail, index) => (
                        <div key={index} className="flex">
                          <span className="w-32 font-medium text-gray-700 dark:text-purple-100/80">{detail.name}:</span>
                          <span className="text-gray-600 dark:text-purple-100/60">{detail.value}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-purple-100/60 col-span-2">No hay detalles adicionales disponibles para este producto.</p>
                    )}
                  </div>
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
