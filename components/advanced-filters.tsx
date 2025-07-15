"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Filter, 
  X, 
  Star, 
  DollarSign, 
  Package, 
  Sparkles,
  TrendingUp,
  Clock
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void
  currentFilters: FilterState
  totalProducts: number
  filteredCount: number
}

export interface FilterState {
  categories: string[]
  priceRange: [number, number]
  rating: number
  inStock: boolean
  featured: boolean
  isNew: boolean
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

const defaultFilters: FilterState = {
  categories: [],
  priceRange: [0, 1000],
  rating: 0,
  inStock: false,
  featured: false,
  isNew: false,
  sortBy: 'createdAt',
  sortOrder: 'desc'
}

const sortOptions = [
  { value: 'createdAt', label: 'Más recientes', icon: Clock },
  { value: 'price', label: 'Precio', icon: DollarSign },
  { value: 'name', label: 'Nombre', icon: TrendingUp },
  { value: 'rating', label: 'Rating', icon: Star },
  { value: 'stock', label: 'Stock', icon: Package }
]

export default function AdvancedFilters({
  onFiltersChange,
  currentFilters,
  totalProducts,
  filteredCount
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters)
  const [isOpen, setIsOpen] = useState(false)

  const categories = ["crochet", "llaveros", "pulseras", "collares", "anillos", "aretes", "otros"]

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
  }

  const hasActiveFilters = () => {
    return (
      filters.categories.length > 0 ||
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < 1000 ||
      filters.rating > 0 ||
      filters.inStock ||
      filters.featured ||
      filters.isNew ||
      filters.sortBy !== 'createdAt' ||
      filters.sortOrder !== 'desc'
    )
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.categories.length > 0) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++
    if (filters.rating > 0) count++
    if (filters.inStock) count++
    if (filters.featured) count++
    if (filters.isNew) count++
    return count
  }

  return (
    <div className="space-y-4">
      {/* Filtros móviles */}
      <div className="flex items-center justify-between lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={16} />
              Filtros
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filtros Avanzados</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <FilterContent
                filters={filters}
                updateFilter={updateFilter}
                toggleCategory={toggleCategory}
                categories={categories}
                sortOptions={sortOptions}
              />
            </div>
          </SheetContent>
        </Sheet>

        <div className="text-sm text-gray-600">
          {filteredCount} de {totalProducts} productos
        </div>
      </div>

      {/* Filtros desktop */}
      <div className="hidden lg:block">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Filtros Avanzados
            </h3>
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X size={16} className="mr-1" />
                Limpiar
              </Button>
            )}
          </div>

          <FilterContent
            filters={filters}
            updateFilter={updateFilter}
            toggleCategory={toggleCategory}
            categories={categories}
            sortOptions={sortOptions}
          />
        </div>
      </div>

      {/* Filtros activos */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2">
          {filters.categories.map(category => (
            <Badge
              key={category}
              variant="secondary"
              className="cursor-pointer hover:bg-red-100"
              onClick={() => toggleCategory(category)}
            >
              {category}
              <X size={12} className="ml-1" />
            </Badge>
          ))}
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
            <Badge variant="secondary">
              ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </Badge>
          )}
          {filters.rating > 0 && (
            <Badge variant="secondary">
              {filters.rating}+ estrellas
            </Badge>
          )}
          {filters.inStock && (
            <Badge variant="secondary">
              En stock
            </Badge>
          )}
          {filters.featured && (
            <Badge variant="secondary">
              Destacados
            </Badge>
          )}
          {filters.isNew && (
            <Badge variant="secondary">
              Nuevos
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

function FilterContent({
  filters,
  updateFilter,
  toggleCategory,
  categories,
  sortOptions
}: {
  filters: FilterState
  updateFilter: (key: keyof FilterState, value: any) => void
  toggleCategory: (category: string) => void
  categories: string[]
  sortOptions: any[]
}) {
  return (
    <div className="space-y-6">
      {/* Categorías */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Categorías
        </h4>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={filters.categories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <Label
                htmlFor={category}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Rango de precio */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Rango de Precio
        </h4>
        <div className="px-2">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => updateFilter('priceRange', value)}
            max={1000}
            min={0}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Rating mínimo */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Rating Mínimo
        </h4>
        <div className="px-2">
          <Slider
            value={[filters.rating]}
            onValueChange={(value) => updateFilter('rating', value[0])}
            max={5}
            min={0}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>0</span>
            <span>{filters.rating}+ estrellas</span>
            <span>5</span>
          </div>
        </div>
      </div>

      {/* Opciones adicionales */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Opciones
        </h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={filters.inStock}
              onCheckedChange={(checked) => updateFilter('inStock', checked)}
            />
            <Label htmlFor="inStock" className="text-sm font-medium leading-none">
              Solo en stock
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={filters.featured}
              onCheckedChange={(checked) => updateFilter('featured', checked)}
            />
            <Label htmlFor="featured" className="text-sm font-medium leading-none">
              Solo destacados
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isNew"
              checked={filters.isNew}
              onCheckedChange={(checked) => updateFilter('isNew', checked)}
            />
            <Label htmlFor="isNew" className="text-sm font-medium leading-none">
              Solo nuevos
            </Label>
          </div>
        </div>
      </div>

      {/* Ordenamiento */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Ordenar por
        </h4>
        <div className="space-y-2">
          {sortOptions.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="radio"
                id={option.value}
                name="sortBy"
                value={option.value}
                checked={filters.sortBy === option.value}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="text-purple-600"
              />
              <Label htmlFor={option.value} className="text-sm font-medium leading-none">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            variant={filters.sortOrder === 'asc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('sortOrder', 'asc')}
          >
            Ascendente
          </Button>
          <Button
            variant={filters.sortOrder === 'desc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('sortOrder', 'desc')}
          >
            Descendente
          </Button>
        </div>
      </div>
    </div>
  )
} 