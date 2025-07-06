"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { products } from "@/data/products"

interface FavoriteItem {
  id: number
  addedAt: string
}

interface FavoritesContextType {
  favorites: FavoriteItem[]
  isFavorite: (productId: number) => boolean
  addToFavorites: (productId: number) => void
  removeFromFavorites: (productId: number) => void
  toggleFavorite: (productId: number) => void
  clearFavorites: () => void
  getFavoriteProducts: () => typeof products
  favoritesCount: number
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const { user } = useAuth()
  const { toast } = useToast()

  // Load favorites from localStorage on mount and when user changes
  useEffect(() => {
    if (user) {
      const savedFavorites = localStorage.getItem(`mautik_favorites_${user.id}`)
      if (savedFavorites) {
        try {
          const parsedFavorites = JSON.parse(savedFavorites)
          setFavorites(parsedFavorites)
        } catch (error) {
          console.error("Error parsing saved favorites:", error)
          localStorage.removeItem(`mautik_favorites_${user.id}`)
        }
      } else {
        setFavorites([])
      }
    } else {
      // For non-authenticated users, use a temporary storage
      const tempFavorites = localStorage.getItem("mautik_favorites_temp")
      if (tempFavorites) {
        try {
          const parsedFavorites = JSON.parse(tempFavorites)
          setFavorites(parsedFavorites)
        } catch (error) {
          console.error("Error parsing temp favorites:", error)
          localStorage.removeItem("mautik_favorites_temp")
        }
      } else {
        setFavorites([])
      }
    }
  }, [user])

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`mautik_favorites_${user.id}`, JSON.stringify(favorites))
    } else {
      localStorage.setItem("mautik_favorites_temp", JSON.stringify(favorites))
    }
  }, [favorites, user])

  const isFavorite = (productId: number): boolean => {
    return favorites.some(fav => fav.id === productId)
  }

  const addToFavorites = (productId: number) => {
    if (isFavorite(productId)) {
      toast({
        title: "Ya está en favoritos",
        description: "Este producto ya está en tu lista de favoritos.",
      })
      return
    }

    const product = products.find(p => p.id === productId)
    if (!product) {
      toast({
        title: "Error",
        description: "Producto no encontrado.",
        variant: "destructive"
      })
      return
    }

    const newFavorite: FavoriteItem = {
      id: productId,
      addedAt: new Date().toISOString()
    }

    setFavorites(prev => [...prev, newFavorite])
    
    toast({
      title: "Añadido a favoritos",
      description: `${product.name} se ha añadido a tus favoritos.`,
    })
  }

  const removeFromFavorites = (productId: number) => {
    const product = products.find(p => p.id === productId)
    
    setFavorites(prev => prev.filter(fav => fav.id !== productId))
    
    if (product) {
      toast({
        title: "Eliminado de favoritos",
        description: `${product.name} se ha eliminado de tus favoritos.`,
      })
    }
  }

  const toggleFavorite = (productId: number) => {
    if (isFavorite(productId)) {
      removeFromFavorites(productId)
    } else {
      addToFavorites(productId)
    }
  }

  const clearFavorites = () => {
    setFavorites([])
    toast({
      title: "Favoritos eliminados",
      description: "Se han eliminado todos tus favoritos.",
    })
  }

  const getFavoriteProducts = () => {
    return products.filter(product => isFavorite(product.id))
  }

  const value: FavoritesContextType = {
    favorites,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    clearFavorites,
    getFavoriteProducts,
    favoritesCount: favorites.length
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
