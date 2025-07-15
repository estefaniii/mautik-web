"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/components/product-card"
import type { Product } from "@/types/product"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams, useRouter } from "next/navigation"
import { FilterX, SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import ShopFilters from "@/components/shop-filters"
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
      images: Array.isArray(apiProduct.images) && apiProduct.images.length > 0 ? apiProduct.images : ['/placeholder.svg'],
      category: typeof apiProduct.category === 'string' ? apiProduct.category : '',
      stock: apiProduct.stock,
      rating: apiProduct.averageRating || 4.5,
      reviewCount: apiProduct.totalReviews || 0,
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
        const response = await fetch('/api/products')
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

  // Initialize filters from URL params
  useEffect(() => {
    const categoryParam = searchParams.get("category")
    const searchParam = searchParams.get("search")
    const sort = searchParams.get("sort")

    if (categoryParam) {
      setSelectedCategories(categoryParam.split(","))
    }

    if (searchParam) {
      setSearchText(searchParam)
    }

    if (sort) {
      setSortOption(sort)
    }
  }, [searchParams])

  // Apply filters when products or filters change
  useEffect(() => {
    applyFilters()
  }, [allProducts, selectedCategories, sortOption, searchText])

  // Apply all filters
  const applyFilters = () => {
    let result = [...allProducts]

    // Filter by search text
    if (searchText.trim()) {
      const text = searchText.toLowerCase()
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(text) ||
          product.description.toLowerCase().includes(text) ||
          product.category.toLowerCase().includes(text)
      )
    }

    // Filter by category
    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(product.category))
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

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, category])
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== category))
    }
  }

  const resetFilters = () => {
    setSelectedCategories([])
    setSearchText("")
    setSortOption("featured")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Error al cargar productos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Filtros
                </h2>
                {(selectedCategories.length > 0 || searchText) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FilterX className="h-4 w-4 mr-1" />
                    Limpiar
                  </Button>
                )}
              </div>
              <ShopFilters
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                onReset={resetFilters}
              />
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Tienda
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {filteredProducts.length} productos encontrados
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Select value={sortOption} onValueChange={setSortOption}>
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
                {/* Mobile Filters */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px]">
                    <div className="mt-6">
                      <ShopFilters
                        selectedCategories={selectedCategories}
                        onCategoryChange={handleCategoryChange}
                        onReset={resetFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
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
