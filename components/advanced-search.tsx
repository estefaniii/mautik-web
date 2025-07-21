"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, Star, TrendingUp } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Category {
  name: string
  count: number
}

interface AdvancedSearchProps {
  onSearch?: (results: any[]) => void
  className?: string
}

export default function AdvancedSearch({ onSearch, className }: AdvancedSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [rating, setRating] = useState<number | undefined>()
  const [sortBy, setSortBy] = useState('relevance')
  const [filters, setFilters] = useState({
    inStock: false,
    onSale: false,
    newArrivals: false,
    featured: false,
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  // Cargar categorías disponibles
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/products/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  // Aplicar filtros desde URL
  useEffect(() => {
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minRating = searchParams.get('rating')
    const sort = searchParams.get('sort')

    if (category) setSelectedCategories([category])
    if (minPrice && maxPrice) setPriceRange([parseInt(minPrice), parseInt(maxPrice)])
    if (minRating) setRating(parseInt(minRating))
    if (sort) setSortBy(sort)
  }, [searchParams])

  const handleSearch = async () => {
    setLoading(true)
    
    try {
      const params = new URLSearchParams()
      
      if (searchTerm) params.set('search', searchTerm)
      if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','))
      if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString())
      if (priceRange[1] < 1000) params.set('maxPrice', priceRange[1].toString())
      if (rating) params.set('rating', rating.toString())
      if (sortBy !== 'relevance') params.set('sort', sortBy)
      
      // Filtros booleanos
      if (filters.inStock) params.set('inStock', 'true')
      if (filters.onSale) params.set('onSale', 'true')
      if (filters.newArrivals) params.set('newArrivals', 'true')
      if (filters.featured) params.set('featured', 'true')

      const queryString = params.toString()
      const url = queryString ? `/shop?${queryString}` : '/shop'
      
      router.push(url)
      setIsOpen(false)
      
      // Si hay callback, ejecutar búsqueda directa
      if (onSearch) {
        const response = await fetch(`/api/products?${queryString}`)
        if (response.ok) {
          const results = await response.json()
          onSearch(results)
        }
      }
    } catch (error) {
      console.error('Error performing search:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategories([])
    setPriceRange([0, 1000])
    setRating(undefined)
    setSortBy('relevance')
    setFilters({
      inStock: false,
      onSale: false,
      newArrivals: false,
      featured: false,
    })
  }

  const hasActiveFilters = searchTerm || 
    selectedCategories.length > 0 || 
    priceRange[0] > 0 || 
    priceRange[1] < 1000 || 
    rating || 
    Object.values(filters).some(Boolean)

  const activeFiltersCount = [
    searchTerm ? 1 : 0,
    selectedCategories.length,
    priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0,
    rating ? 1 : 0,
    Object.values(filters).filter(Boolean).length
  ].reduce((sum, count) => sum + count, 0)

  return (
    <div className={className}>
      {/* Botón de búsqueda avanzada */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter size={16} className="mr-2" />
            Búsqueda avanzada
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Búsqueda avanzada</SheetTitle>
            <SheetDescription>
              Encuentra exactamente lo que buscas con nuestros filtros avanzados
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Búsqueda por texto */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Buscar productos
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre, descripción, categoría..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categorías */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Categorías
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.name}
                      checked={selectedCategories.includes(category.name)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories(prev => [...prev, category.name])
                        } else {
                          setSelectedCategories(prev => prev.filter(c => c !== category.name))
                        }
                      }}
                    />
                    <label
                      htmlFor={category.name}
                      className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
                    >
                      {category.name}
                    </label>
                    <Badge variant="outline" className="text-xs">
                      {category.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Rango de precios */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Rango de precios: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={1000}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>$0</span>
                <span>$1000+</span>
              </div>
            </div>

            {/* Calificación mínima */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Calificación mínima
              </label>
              <Select value={rating?.toString() || ''} onValueChange={(value) => setRating(value ? parseInt(value) : undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Cualquier calificación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Cualquier calificación</SelectItem>
                  <SelectItem value="4">4+ estrellas</SelectItem>
                  <SelectItem value="3">3+ estrellas</SelectItem>
                  <SelectItem value="2">2+ estrellas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ordenar por */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ordenar por
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevancia</SelectItem>
                  <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
                  <SelectItem value="rating">Mejor calificados</SelectItem>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="popular">Más populares</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtros adicionales */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filtros adicionales
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inStock"
                    checked={filters.inStock}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, inStock: !!checked }))
                    }
                  />
                  <label htmlFor="inStock" className="text-sm text-gray-700 dark:text-gray-300">
                    Solo productos en stock
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="onSale"
                    checked={filters.onSale}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, onSale: !!checked }))
                    }
                  />
                  <label htmlFor="onSale" className="text-sm text-gray-700 dark:text-gray-300">
                    Solo productos en oferta
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newArrivals"
                    checked={filters.newArrivals}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, newArrivals: !!checked }))
                    }
                  />
                  <label htmlFor="newArrivals" className="text-sm text-gray-700 dark:text-gray-300">
                    Solo nuevos productos
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={filters.featured}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, featured: !!checked }))
                    }
                  />
                  <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300">
                    Solo productos destacados
                  </label>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? "Buscando..." : "Buscar"}
              </Button>
              
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="px-3"
                >
                  <X size={16} />
                </Button>
              )}
            </div>

            {/* Filtros activos */}
            {hasActiveFilters && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filtros activos:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      "{searchTerm}"
                    </Badge>
                  )}
                  {selectedCategories.map(category => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                  {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                    <Badge variant="secondary" className="text-xs">
                      ${priceRange[0]} - ${priceRange[1]}
                    </Badge>
                  )}
                  {rating && (
                    <Badge variant="secondary" className="text-xs">
                      {rating}+ estrellas
                    </Badge>
                  )}
                  {Object.entries(filters).map(([key, value]) => 
                    value && (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key === 'inStock' && 'En stock'}
                        {key === 'onSale' && 'En oferta'}
                        {key === 'newArrivals' && 'Nuevos'}
                        {key === 'featured' && 'Destacados'}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
} 