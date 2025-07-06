"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/components/product-card"
import type { Product } from "@/data/products"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useSearchParams, useRouter } from "next/navigation"
import { FilterX, SlidersHorizontal, Star } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import ShopFilters from "@/components/shop-filters"
import { Skeleton } from "@/components/ui/skeleton"

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
  sku?: string // <-- agregado
}

export default function ShopPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [priceRange, setPriceRange] = useState([0, 500])
  const [minMaxPrice, setMinMaxPrice] = useState<[number, number]>([0, 500])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortOption, setSortOption] = useState("featured")
  const [searchText, setSearchText] = useState("")
  const [minRating, setMinRating] = useState(0)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para mapear productos de la API al formato esperado
  const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
    return {
      id: parseInt(apiProduct._id.replace(/[^0-9]/g, '')) || Math.floor(Math.random() * 1000),
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
      sku: apiProduct.sku || '', // <-- usar directamente
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
          const apiProducts: ApiProduct[] = data.products || data
          const mappedProducts = apiProducts.map(mapApiProductToProduct)
          setAllProducts(mappedProducts)
          setFilteredProducts(mappedProducts)
        } else {
          setError('No se pudieron cargar los productos. Intenta de nuevo más tarde.')
        }
      } catch (error) {
        setError('Error de conexión. Intenta de nuevo más tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Get all unique categories
  const categories = Array.from(new Set(allProducts.map((product) => product.category)))

  // Initialize filters from URL params
  useEffect(() => {
    const categoryParam = searchParams.get("category")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sort = searchParams.get("sort")

    if (categoryParam) {
      setSelectedCategories(categoryParam.split(","))
    }

    if (minPrice && maxPrice) {
      setPriceRange([Number.parseInt(minPrice), Number.parseInt(maxPrice)])
    }

    if (sort) {
      setSortOption(sort)
    }

    applyFilters()
  }, [searchParams, allProducts])

  // Update price range based on loaded products
  useEffect(() => {
    if (allProducts.length > 0) {
      const prices = allProducts.map(p => p.price)
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      setMinMaxPrice([min, max])
      setPriceRange([min, max])
    }
  }, [allProducts])

  // Apply all filters
  const applyFilters = () => {
    let result = [...allProducts]

    // Filter by search text
    if (searchText.trim()) {
      const text = searchText.toLowerCase()
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(text) ||
          product.description.toLowerCase().includes(text)
      )
    }

    // Filter by category
    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(product.category))
    }

    // Filter by price range
    result = result.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1])

    // Filter by rating
    if (minRating > 0) {
      result = result.filter((product) => (product.rating || 0) >= minRating)
    }

    // Filter by stock
    if (inStockOnly) {
      result = result.filter((product) => product.stock > 0)
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

  // Update URL with filters
  const updateUrlWithFilters = () => {
    const params = new URLSearchParams()

    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","))
    }

    params.set("minPrice", priceRange[0].toString())
    params.set("maxPrice", priceRange[1].toString())
    params.set("sort", sortOption)

    router.push(`/shop?${params.toString()}`)
  }

  // Handle category selection
  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    }
  }

  // Handle filter application
  const handleApplyFilters = () => {
    updateUrlWithFilters()
    applyFilters()
    setShowFilters(false)
  }

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 500])
    setSortOption("featured")
    router.push("/shop")
  }

  return (
    <div className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
          {/* Desktop & Tablet Filters (md: arriba, lg: izquierda) */}
          <div className="hidden md:block w-full lg:w-1/4 mb-6 lg:mb-0 md:order-1 lg:order-none">
            <ShopFilters
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
              inStockOnly={inStockOnly}
              onStockChange={checked => setInStockOnly(!!checked)}
              onReset={resetFilters}
            />
            <div className="w-full mt-4">
              <Button onClick={handleApplyFilters} className="w-full bg-purple-800 hover:bg-purple-900">
                Aplicar Filtros
              </Button>
            </div>
          </div>

          {/* Mobile Filters (siempre visibles en mobile) */}
          <div className="block md:hidden w-full mb-6">
            <ShopFilters
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
              inStockOnly={inStockOnly}
              onStockChange={checked => setInStockOnly(!!checked)}
              onReset={resetFilters}
            />
            <Button onClick={handleApplyFilters} className="w-full bg-purple-800 hover:bg-purple-900 mt-4">
              Aplicar Filtros
            </Button>
          </div>

          {/* Products Grid (md: abajo, lg: derecha) */}
          <div className="w-full lg:w-3/4 md:order-2 lg:order-none">
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-display text-3xl font-bold text-purple-900 dark:text-purple-200">Nuestra Tienda</h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-600 dark:text-gray-400">{filteredProducts.length} productos</p>
                <Select
                  value={sortOption}
                  onValueChange={(value) => {
                    setSortOption(value)
                    setTimeout(() => {
                      updateUrlWithFilters()
                      applyFilters()
                    }, 100)
                  }}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Destacados</SelectItem>
                    <SelectItem value="newest">Más Nuevos</SelectItem>
                    <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
                    <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                    <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
                    <SelectItem value="name-desc">Nombre: Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <Skeleton key={i} className="h-72 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {error && <div className="col-span-full text-center text-red-600 dark:text-red-400 py-16">{error}</div>}
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-16">No se encontraron productos.</div>
                ) : (
                  filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
