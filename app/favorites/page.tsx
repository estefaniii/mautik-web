"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Heart, 
  Trash2, 
  ShoppingCart, 
  Filter, 
  SortAsc, 
  SortDesc,
  Grid,
  List,
  Star,
  Eye
} from "lucide-react"
import { useFavorites } from "@/context/favorites-context"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"
import ProductCard from "@/components/product-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import AuthGuard from "@/components/auth-guard"

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "rating-desc" | "added-desc"
type ViewMode = "grid" | "list"

export default function FavoritesPage() {
  const { getFavoriteProducts, clearFavorites, favoritesCount } = useFavorites()
  const { addToCart } = useCart()
  const { toast } = useToast()
  
  const [sortBy, setSortBy] = useState<SortOption>("added-desc")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const favoriteProducts = getFavoriteProducts()

  // Get unique categories from favorite products
  const categories = Array.from(new Set(favoriteProducts.map(product => product.category)))

  // Filter products by category
  const filteredProducts = selectedCategory === "all" 
    ? favoriteProducts 
    : favoriteProducts.filter(product => product.category === selectedCategory)

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name)
      case "name-desc":
        return b.name.localeCompare(a.name)
      case "price-asc":
        return a.price - b.price
      case "price-desc":
        return b.price - a.price
      case "rating-desc":
        return (b.rating || 0) - (a.rating || 0)
      case "added-desc":
        return 0 // Already sorted by addition date in context
      default:
        return 0
    }
  })

  const handleAddToCart = (product: any) => {
    addToCart({
      ...product,
      quantity: 1,
    })

    toast({
      title: "Producto añadido",
      description: `${product.name} se ha añadido a tu carrito.`,
    })
  }

  const handleClearFavorites = () => {
    clearFavorites()
  }

  if (favoriteProducts.length === 0) {
  return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8">
      <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-purple-900 mb-4">No tienes favoritos</h1>
              <p className="text-gray-600 mb-8">
                Aún no has guardado ningún producto en tus favoritos. 
                Explora nuestra colección y guarda los productos que más te gusten.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-purple-800 hover:bg-purple-900">
                  <Link href="/shop">Explorar Productos</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Volver al Inicio</Link>
                </Button>
        </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-purple-900 mb-2">Mis Favoritos</h1>
                <p className="text-gray-600">
                  {favoritesCount} producto{favoritesCount !== 1 ? 's' : ''} guardado{favoritesCount !== 1 ? 's' : ''} en tus favoritos
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleClearFavorites}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Favoritos
              </Button>
            </div>
          </div>

          {/* Filters and Controls */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {/* Category Filter */}
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Options */}
                  <div className="flex items-center space-x-2">
                    <SortAsc className="h-4 w-4 text-gray-500" />
                    <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="added-desc">Más recientes</SelectItem>
                        <SelectItem value="name-asc">Nombre A-Z</SelectItem>
                        <SelectItem value="name-desc">Nombre Z-A</SelectItem>
                        <SelectItem value="price-asc">Precio menor</SelectItem>
                        <SelectItem value="price-desc">Precio mayor</SelectItem>
                        <SelectItem value="rating-desc">Mejor valorados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
            </div>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-600">
              Mostrando {sortedProducts.length} de {favoriteProducts.length} producto{favoriteProducts.length !== 1 ? 's' : ''}
              {selectedCategory !== "all" && ` en ${selectedCategory}`}
            </p>
          </div>

          {/* Products Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="flex">
                    {/* Product Image */}
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <img
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.isNew && (
                        <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600">
                          Nuevo
                        </Badge>
                      )}
                      {(product.discount ?? 0) > 0 && (
                        <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                                                      -{product.discount ?? 0}%
                        </Badge>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded-full">
                              {product.category}
                            </span>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                              <span>{product.rating} ({product.reviewCount})</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {(product.discount ?? 0) > 0 ? (
                            <div>
                              <p className="text-lg font-bold text-purple-800">
                                                                  ${(product.price * (1 - (product.discount ?? 0) / 100)).toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500 line-through">
                                ${product.price.toFixed(2)}
                              </p>
                            </div>
                          ) : (
                            <p className="text-lg font-bold text-purple-800">
                              ${product.price.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleAddToCart(product)}
                          className="bg-purple-800 hover:bg-purple-900"
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Añadir al Carrito
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/product/${product.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalles
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State for Filtered Results */}
          {sortedProducts.length === 0 && favoriteProducts.length > 0 && (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay resultados</h3>
              <p className="text-gray-600 mb-4">
                No se encontraron productos en la categoría seleccionada.
              </p>
              <Button variant="outline" onClick={() => setSelectedCategory("all")}>
                Ver todos los favoritos
              </Button>
            </div>
        )}
      </div>
    </div>
    </AuthGuard>
  )
}
