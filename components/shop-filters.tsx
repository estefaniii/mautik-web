import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FilterX, Box, Check, Loader2 } from "lucide-react"

interface Category {
  name: string
  count: number
}

export default function ShopFilters({
  selectedCategories = [],
  onCategoryChange = () => {},
  inStockOnly = false,
  onStockChange = () => {},
  onReset = () => {},
}: {
  selectedCategories?: string[]
  onCategoryChange?: (category: string, checked: boolean) => void
  inStockOnly?: boolean
  onStockChange?: (checked: boolean) => void
  onReset?: () => void
}) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Obtener categorías únicas de la API de productos con conteo
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Obtener todos los productos para contar por categoría
        const res = await fetch('/api/products?limit=1000')
        if (!res.ok) {
          throw new Error('No se pudieron obtener los productos')
        }
        
        const products = await res.json()
        
        // Crear mapa de categorías con conteo
        const categoryMap = new Map<string, number>()
        
        products.forEach((product: any) => {
          const category = product.category || product.product?.category
          if (category && typeof category === 'string') {
            const normalizedCategory = category.trim().toLowerCase()
            categoryMap.set(normalizedCategory, (categoryMap.get(normalizedCategory) || 0) + 1)
          }
        })
        
        // Convertir a array y ordenar por nombre
        const categoryArray: Category[] = Array.from(categoryMap.entries())
          .map(([name, count]) => ({ 
            name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalizar primera letra
            count 
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
        
        setCategories(categoryArray)
        
        // Si no hay categorías, usar categorías por defecto
        if (categoryArray.length === 0) {
          const defaultCategories: Category[] = [
            { name: "Crochet", count: 0 },
            { name: "Llaveros", count: 0 },
            { name: "Pulseras", count: 0 },
            { name: "Collares", count: 0 },
            { name: "Anillos", count: 0 },
            { name: "Aretes", count: 0 },
            { name: "Otros", count: 0 }
          ]
          setCategories(defaultCategories)
        }
        
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Error al cargar categorías')
        
        // Fallback a categorías por defecto
        const defaultCategories: Category[] = [
          { name: "Crochet", count: 0 },
          { name: "Llaveros", count: 0 },
          { name: "Pulseras", count: 0 },
          { name: "Collares", count: 0 },
          { name: "Anillos", count: 0 },
          { name: "Aretes", count: 0 },
          { name: "Otros", count: 0 }
        ]
        setCategories(defaultCategories)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
  }, [])

  return (
    <aside className="w-full max-w-full lg:w-80 bg-gradient-to-br from-purple-50/80 to-white/90 dark:from-gray-900 dark:to-gray-800 rounded-2xl lg:rounded-3xl shadow-xl ring-1 ring-purple-100/40 dark:ring-gray-800/60 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 mb-6 md:mb-0 animate-fade-in-up mx-auto lg:mx-0" aria-label="Filtros de productos" role="complementary">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-extrabold text-purple-900 dark:text-white flex items-center gap-2 tracking-tight">
          <Box size={20} className="text-purple-700 dark:text-purple-300" /> Filtros
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="flex items-center text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="Limpiar filtros"
        >
          <FilterX size={16} className="mr-1" /> Limpiar
        </Button>
      </div>
      
      <div className="space-y-6 md:space-y-8">
        <fieldset>
          <legend className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-purple-800 dark:text-purple-200">
            Categorías
            {loading && <Loader2 size={16} className="inline ml-2 animate-spin" />}
          </legend>
          
          {error && (
            <div className="text-red-500 text-sm mb-3">
              {error}
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Loader2 size={16} className="animate-spin" />
                Cargando categorías...
              </div>
            ) : categories.length === 0 ? (
              <span className="text-gray-500 text-sm">No hay categorías disponibles</span>
            ) : (
              categories.map((category) => {
                const selected = selectedCategories.includes(category.name)
                return (
                  <label
                    key={category.name}
                    className={`flex items-center gap-2 px-3 py-1 rounded-xl cursor-pointer transition-all font-sans text-sm font-medium
                      ${selected ? 'bg-gradient-to-r from-purple-700/90 to-purple-500/80 text-white shadow-md' : 'bg-purple-50 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100 hover:bg-purple-100 dark:hover:bg-purple-800'}
                    `}
                    tabIndex={0}
                    style={{maxWidth: '100%'}}>
                    <Checkbox
                      id={`category-${category.name}`}
                      checked={selected}
                      onCheckedChange={(checked) => onCategoryChange(category.name, checked as boolean)}
                      className="accent-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <span className="truncate max-w-[7rem] md:max-w-[10rem]">
                      {category.name}
                      {category.count > 0 && (
                        <span className="ml-1 text-xs opacity-75">({category.count})</span>
                      )}
                    </span>
                    {selected && <Check size={16} className="ml-1" />}
                  </label>
                )
              })
            )}
          </div>
        </fieldset>
        
        <div className="flex items-center gap-2">
          <Checkbox
            id="inStockOnly"
            checked={inStockOnly}
            onCheckedChange={onStockChange}
            className="accent-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <Label htmlFor="inStockOnly" className="text-sm text-gray-700 dark:text-gray-200">
            Solo productos en stock
          </Label>
        </div>
      </div>
    </aside>
  )
}
