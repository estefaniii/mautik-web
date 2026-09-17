"use client"

import { useState, useEffect } from "react"
import { coincide } from "@/lib/buscar"
import ProductCard from "@/components/product-card"
import CategoryChips from "@/components/category-chips"
import type { Product } from "@/types/product"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams, useRouter } from "next/navigation"
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
  discount?: number
}

export default function ShopPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortOption, setSortOption] = useState("featured")
  const [searchText, setSearchText] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Detect if the collection is oceano-panameno
  const collectionParam = searchParams.get("collection")
  const isOceanoPanameno = collectionParam === "oceano-panameno"

  // Función para mapear productos de la API al formato esperado
  const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
    return {
      id: apiProduct.id,
      name: apiProduct.name,
      price: apiProduct.price,
      originalPrice: apiProduct.originalPrice,
      description: apiProduct.description,
      images: Array.isArray(apiProduct.images) && apiProduct.images.length > 0 ? apiProduct.images : ['/placeholder.jpg'],
      category: typeof apiProduct.category === 'string' ? apiProduct.category : '',
      stock: apiProduct.stock,
      featured: apiProduct.featured || false,
      isNew: apiProduct.isNew || false,
      discount: apiProduct.discount || 0,
      attributes: [],
      details: [],
      sku: '',
    }
  }

  // Cargar productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        // El límite explícito importa: sin él la API devuelve 50 y la tienda
        // se quedaba corta (58 productos en la base, 50 en pantalla; los chips
        // de categoría, que sí piden más, delataban la diferencia).
        const response = await fetch('/api/products?limit=500')
        if (response.ok) {
          const data = await response.json()
          const apiProducts: ApiProduct[] = Array.isArray(data) ? data : []
          const mappedProducts = apiProducts.map(mapApiProductToProduct)
          setAllProducts(mappedProducts)
          setFilteredProducts(mappedProducts)
        } else {
          setError('No se pudieron cargar los productos. Intenta de nuevo más tarde.')
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setError('Error de conexión. Intenta de nuevo más tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  /*
    Los filtros se derivan de la URL, TAMBIEN cuando el parametro desaparece.

    Antes cada rama era `if (categoryParam) setSelectedCategories(...)`: si el
    parametro venia, filtraba; si NO venia, no hacia nada y quedaba puesto el
    filtro anterior. En la practica: tocabas "Aretes" (3 productos) y despues
    "Todo", la URL se limpiaba, el chip seguia marcado en Aretes y la tienda
    seguia mostrando 3 productos. Verificado en produccion.

    Ahora la ausencia del parametro tambien es informacion: quiere decir
    "sin filtro".
  */
  useEffect(() => {
    const categoria = searchParams.get("category")
    const busqueda = searchParams.get("search")
    const orden = searchParams.get("sort")

    setSelectedCategories(categoria ? categoria.split(",") : [])
    setSearchText(busqueda ?? "")
    setSortOption(orden ?? "featured")
  }, [searchParams])

  // Apply filters when products or filters change
  useEffect(() => {
    applyFilters()
  }, [allProducts, selectedCategories, sortOption, searchText])

  // Apply all filters
  const applyFilters = () => {
    let result = [...allProducts]

    // Búsqueda: sin tildes, sin importar el plural y con sinónimos.
    // Antes era un `includes` pelado, así que "capibara" no encontraba
    // "Capybara" ni "corazon" encontraba "corazón".
    if (searchText.trim()) {
      result = result.filter((product) => coincide(product, searchText))
    }

    // Filter by category.
    // La comparación va normalizada a minúsculas a propósito: en la base hay
    // categorías guardadas con mayúscula y sin ella ("Pulseras" y "pulseras"),
    // y comparando tal cual el filtro se comía la mitad de los productos.
    if (selectedCategories.length > 0) {
      const buscadas = selectedCategories.map((c) => c.toLowerCase().trim())
      result = result.filter((product) =>
        buscadas.includes((product.category || "").toLowerCase().trim())
      )
    }

    // Apply sorting
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "newest":
        result = result.filter((product) => product.isNew).concat(result.filter((product) => !product.isNew))
        break
      case "featured":
      default:
        result = result.filter((product) => product.featured).concat(result.filter((product) => !product.featured))
        break
    }

    setFilteredProducts(result)
  }

  /*
    La URL manda.

    Los filtros vivian en dos lugares a la vez: los chips navegaban a
    /shop?category=X y las casillas del panel cambiaban el estado de React sin
    tocar la URL. Resultado: marcabas "Pulseras" en el panel y los chips
    seguian mostrando "Todo" resaltado, porque cada uno miraba su propia
    fuente. Ahora todo pasa por la URL y las dos cosas coinciden siempre.

    De paso el filtro queda compartible: el enlace lleva la categoria puesta.
  */
  const escribirUrl = (cambios: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor === null || valor === "") params.delete(clave)
      else params.set(clave, valor)
    }
    const query = params.toString()
    router.replace(query ? `/shop?${query}` : "/shop", { scroll: false })
  }

  const cambiarOrden = (valor: string) => {
    // "featured" es el orden por defecto, no hace falta ensuciar la URL con el.
    escribirUrl({ sort: valor === "featured" ? null : valor })
  }

  const resetFilters = () => {
    // category, search y sort se limpian al vaciar la URL; el efecto de arriba
    // los vuelve a leer y los deja en su valor por defecto.
    router.replace("/shop", { scroll: false })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {[...Array(8)].map((_, i) => (
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
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-purple-50 mb-4">
            Error al cargar productos
          </h1>
          <p className="text-gray-600 dark:text-purple-100/60 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Intentar de nuevo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={isOceanoPanameno ? "relative min-h-screen" : undefined}>
      {isOceanoPanameno && (
        <div className="absolute inset-0 -z-10">
          <img src="/maar.png" alt="Fondo Océano Panameño" className="w-full h-full object-cover brightness-[0.7]" />
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        {/*
          Ya no hay panel de filtros fijo arriba de la tienda.

          En pantallas chicas la columna del sidebar se apilaba ARRIBA de los
          productos, así que lo primero que veía la clienta era una lista de
          casillas ("Anillos (4)", "Aretes (3)"...) y tenía que hacer scroll
          para llegar a la mercancía. Ahora las categorías viven en la fila de
          chips (CategoryChips) y el resto de los filtros en el panel lateral
          que se abre con el botón "Filtros", igual que en Pandora o Zara.
        */}
        {/*
          Título, chips y grid comparten ancho y centro.

          Antes el grid estaba centrado (`mx-auto`) pero el encabezado ocupaba
          todo el contenedor: las tarjetas quedaban flotando en el medio y el
          título pegado a la izquierda, como si fueran dos bloques distintos.
        */}
        {/*
          Ancho amplio: con 4 columnas en escritorio ya no hace falta
          estrangular el contenedor a max-w-4xl. Ese límite venía de cuando el
          grid era de 2 columnas fijas y dejaba 300px muertos a la derecha.
        */}
        <div className="mx-auto max-w-7xl">
          <div>
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-purple-50 mb-2">
                  Tienda
                </h1>
                <p className="text-gray-600 dark:text-purple-100/60">
                  {filteredProducts.length} productos encontrados
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Select value={sortOption} onValueChange={cambiarOrden}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Destacados</SelectItem>
                    <SelectItem value="newest">Más nuevos</SelectItem>
                    <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                    <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
                    <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
                    <SelectItem value="name-desc">Nombre: Z-A</SelectItem>
                  </SelectContent>
                </Select>
                {/*
                  Sin boton de "Filtros".

                  Las categorias ya estan a un clic en la fila de chips y el
                  orden en el desplegable de al lado, asi que el panel repetia
                  lo mismo detras de un boton. Lo unico que tenia de propio era
                  "solo productos en stock", y hoy los 58 productos tienen
                  stock, o sea que no filtraba nada.
                */}
              </div>
            </div>
            {/* Filtros rápidos por categoría, siempre visibles */}
            <CategoryChips activa={selectedCategories[0]?.toLowerCase() ?? null} />

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 dark:text-purple-50 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-600 dark:text-purple-100/60 mb-4">
                  Intenta ajustar los filtros o buscar algo diferente.
                </p>
                <Button onClick={resetFilters}>
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
