"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  X, 
  Filter, 
  TrendingUp,
  Clock,
  Star,
  DollarSign
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface SearchSuggestion {
  id: string
  name: string
  category: string
  price: number
  image: string
  type: 'product' | 'category' | 'trending'
}

interface AdvancedSearchProps {
  onSearch?: (query: string, filters: SearchFilters) => void
  placeholder?: string
  className?: string
}

export interface SearchFilters {
  query: string
  category?: string
  priceRange?: [number, number]
  rating?: number
  inStock?: boolean
  featured?: boolean
  sortBy?: string
}

export default function AdvancedSearch({ 
  onSearch, 
  placeholder = "Buscar productos...",
  className 
}: AdvancedSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('search') || '')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [trendingSearches, setTrendingSearches] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Cargar búsquedas recientes y tendencias
  useEffect(() => {
    const recent = localStorage.getItem('mautik_recent_searches')
    if (recent) {
      setRecentSearches(JSON.parse(recent))
    }

    // Simular tendencias (en producción vendría de analytics)
    setTrendingSearches(['crochet', 'pulseras', 'llaveros', 'collares'])
  }, [])

  // Buscar sugerencias
  const searchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`)
      if (response.ok) {
        const products = await response.json()
        
        const suggestions: SearchSuggestion[] = [
          // Productos
          ...products.map((product: any) => ({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            image: product.images[0] || '/placeholder.svg',
            type: 'product' as const
          })),
          // Categorías que coinciden
          ...['crochet', 'llaveros', 'pulseras', 'collares', 'anillos', 'aretes', 'otros']
            .filter(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(cat => ({
              id: `category-${cat}`,
              name: `Ver ${cat}`,
              category: cat,
              price: 0,
              image: '/placeholder.svg',
              type: 'category' as const
            }))
        ]

        setSuggestions(suggestions.slice(0, 8))
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounce para búsqueda
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      searchSuggestions(query)
    }, 300)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query])

  // Guardar búsqueda reciente
  const saveRecentSearch = (searchTerm: string) => {
    const recent = [...recentSearches.filter(s => s !== searchTerm), searchTerm].slice(0, 5)
    setRecentSearches(recent)
    localStorage.setItem('mautik_recent_searches', JSON.stringify(recent))
  }

  // Manejar búsqueda
  const handleSearch = (searchTerm: string = query) => {
    if (!searchTerm.trim()) return

    saveRecentSearch(searchTerm)
    setIsOpen(false)
    setSuggestions([])
    
    // Navegar a la página de búsqueda
    const params = new URLSearchParams(searchParams)
    params.set('search', searchTerm)
    router.push(`/shop?${params.toString()}`)
    
    onSearch?.(searchTerm, { query: searchTerm })
  }

  // Manejar selección de sugerencia
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'category') {
      const params = new URLSearchParams(searchParams)
      params.set('category', suggestion.category)
      router.push(`/shop?${params.toString()}`)
    } else {
      router.push(`/product/${suggestion.id}`)
    }
    setIsOpen(false)
    setSuggestions([])
  }

  // Manejar navegación por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSuggestionSelect(suggestions[selectedIndex])
      } else {
        handleSearch()
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSuggestions([])
    }
  }

  // Limpiar búsqueda
  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 h-12 text-base"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Panel de sugerencias */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Búsquedas recientes */}
          {!query && recentSearches.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Búsquedas recientes
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-purple-100"
                    onClick={() => {
                      setQuery(search)
                      handleSearch(search)
                    }}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tendencias */}
          {!query && trendingSearches.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Tendencias
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-purple-50"
                    onClick={() => {
                      setQuery(search)
                      handleSearch(search)
                    }}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sugerencias de productos */}
          {query && (
            <div className="p-2">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Buscando...
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.id}
                      className={cn(
                        "flex items-center p-3 rounded-lg cursor-pointer transition-colors",
                        selectedIndex === index
                          ? "bg-purple-50 dark:bg-purple-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="relative h-10 w-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                        <img
                          src={suggestion.image}
                          alt={suggestion.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {suggestion.name}
                          </p>
                          {suggestion.type === 'product' && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              ${suggestion.price}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {suggestion.category}
                          </Badge>
                          {suggestion.type === 'category' && (
                            <Badge variant="secondary" className="text-xs">
                              Categoría
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No se encontraron resultados para "{query}"
                </div>
              )}
            </div>
          )}

          {/* Botón de búsqueda */}
          {query && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => handleSearch()}
                className="w-full"
                disabled={!query.trim()}
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar "{query}"
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 