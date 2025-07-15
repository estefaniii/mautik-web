"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import type { Product } from "@/types/product"

interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  isNew: boolean;
  discount?: number;
  addedAt: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  isFavorite: (productId: string) => boolean;
  addToFavorites: (productId: string) => void;
  removeFromFavorites: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  clearFavorites: () => void;
  getFavoriteProducts: () => FavoriteItem[];
  favoritesCount: number;
  cleanDeletedProductReferences: (deletedProductIds: string[]) => void;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  // Load favorites from API or localStorage
  const loadFavorites = async () => {
    setLoading(true)
    try {
      if (user) {
        // Load from API for authenticated users
        const response = await fetch('/api/wishlist')
        if (response.ok) {
          const apiFavorites = await response.json()
          setFavorites(apiFavorites)
        } else {
          console.error('Error loading favorites from API:', response.status)
          setFavorites([])
        }
      } else {
        // Load from localStorage for non-authenticated users
        const tempFavorites = localStorage.getItem("mautik_favorites_temp")
        if (tempFavorites) {
          try {
            const parsedFavorites = JSON.parse(tempFavorites)
            setFavorites(parsedFavorites)
          } catch (error) {
            console.error("Error parsing temp favorites:", error)
            localStorage.removeItem("mautik_favorites_temp")
            setFavorites([])
          }
        } else {
          setFavorites([])
        }
      }
    } catch (error) {
      console.error("Error loading favorites:", error)
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }

  // Load favorites on mount and when user changes
  useEffect(() => {
    loadFavorites()
  }, [user])

  // Save favorites to localStorage for non-authenticated users
  useEffect(() => {
    if (!user && favorites.length > 0) {
      localStorage.setItem("mautik_favorites_temp", JSON.stringify(favorites))
    }
  }, [favorites, user])

  const isFavorite = (productId: string): boolean => {
    return favorites.some(fav => fav.id === productId)
  }

  const addToFavorites = async (productId: string) => {
    if (isFavorite(productId)) {
      toast({
        title: "Ya está en favoritos",
        description: "Este producto ya está en tu lista de favoritos.",
      })
      return
    }

    try {
      if (user) {
        // Add to API for authenticated users
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([{
            id: productId,
            addedAt: new Date().toISOString()
          }]),
        })

        if (response.ok) {
          // Reload favorites from API
          await loadFavorites()
          toast({
            title: "Añadido a favoritos",
            description: "Producto añadido a tus favoritos.",
          })
        } else {
          throw new Error('Failed to add to favorites')
        }
      } else {
        // Add to localStorage for non-authenticated users
        const newFavorite: FavoriteItem = {
          id: productId,
          name: '', // Will be filled when product data is available
          price: 0,
          description: '',
          images: [],
          category: '',
          stock: 0,
          rating: 0,
          reviewCount: 0,
          featured: false,
          isNew: false,
          addedAt: new Date().toISOString()
        }

        setFavorites(prev => [...prev, newFavorite])
        toast({
          title: "Añadido a favoritos",
          description: "Producto añadido a tus favoritos.",
        })
      }
    } catch (error) {
      console.error("Error adding to favorites:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir a favoritos.",
        variant: "destructive"
      })
    }
  }

  const removeFromFavorites = async (productId: string) => {
    try {
      if (user) {
        // Remove from API for authenticated users
        const response = await fetch('/api/wishlist', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        })

        if (response.ok) {
          // Reload favorites from API
          await loadFavorites()
          toast({
            title: "Eliminado de favoritos",
            description: "Producto eliminado de tus favoritos.",
          })
        } else {
          throw new Error('Failed to remove from favorites')
        }
      } else {
        // Remove from localStorage for non-authenticated users
        setFavorites(prev => prev.filter(fav => fav.id !== productId))
        toast({
          title: "Eliminado de favoritos",
          description: "Producto eliminado de tus favoritos.",
        })
      }
    } catch (error) {
      console.error("Error removing from favorites:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar de favoritos.",
        variant: "destructive"
      })
    }
  }

  const toggleFavorite = (productId: string) => {
    if (isFavorite(productId)) {
      removeFromFavorites(productId)
    } else {
      addToFavorites(productId)
    }
  }

  const clearFavorites = async () => {
    try {
      if (user) {
        // Clear from API for authenticated users
        const response = await fetch('/api/wishlist', {
          method: 'DELETE',
        })

        if (response.ok) {
          setFavorites([])
          toast({
            title: "Favoritos eliminados",
            description: "Se han eliminado todos tus favoritos.",
          })
        } else {
          throw new Error('Failed to clear favorites')
        }
      } else {
        // Clear from localStorage for non-authenticated users
        setFavorites([])
        localStorage.removeItem("mautik_favorites_temp")
        toast({
          title: "Favoritos eliminados",
          description: "Se han eliminado todos tus favoritos.",
        })
      }
    } catch (error) {
      console.error("Error clearing favorites:", error)
      toast({
        title: "Error",
        description: "No se pudieron eliminar los favoritos.",
        variant: "destructive"
      })
    }
  }

  const getFavoriteProducts = () => {
    return favorites
  }

  // Función para limpiar referencias a productos eliminados
  const cleanDeletedProductReferences = (deletedProductIds: string[]) => {
    setFavorites(prev => prev.filter(fav => !deletedProductIds.includes(fav.id)))
  }

  // Función para verificar y limpiar productos eliminados
  const verifyAndCleanDeletedProducts = async () => {
    if (favorites.length === 0) return
    
    try {
      const productIds = favorites.map(fav => fav.id)
      const deletedIds: string[] = []
      
      // Verificar cada producto favorito
      for (const productId of productIds) {
        try {
          const response = await fetch(`/api/products/${productId}`)
          if (response.status === 404) {
            deletedIds.push(productId)
          }
        } catch (error) {
          console.error(`Error verificando producto ${productId}:`, error)
        }
      }
      
      if (deletedIds.length > 0) {
        console.log(`🧹 Limpiando ${deletedIds.length} productos eliminados de favoritos:`, deletedIds)
        cleanDeletedProductReferences(deletedIds)
        toast({
          title: "Favoritos actualizados",
          description: `Se eliminaron ${deletedIds.length} producto(s) que ya no están disponibles.`,
          variant: "default"
        })
      }
    } catch (error) {
      console.error("Error verificando productos eliminados:", error)
    }
  }

  // Verificar productos eliminados al cargar favoritos
  useEffect(() => {
    if (favorites.length > 0) {
      verifyAndCleanDeletedProducts()
    }
  }, [favorites.length])

  const value: FavoritesContextType = {
    favorites,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    clearFavorites,
    getFavoriteProducts,
    favoritesCount: favorites.length,
    cleanDeletedProductReferences,
    loading
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
