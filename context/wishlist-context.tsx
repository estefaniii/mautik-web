"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './auth-context'
import { useToast } from '@/hooks/use-toast'
import { persistentCache } from '@/lib/cache'

interface WishlistItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  description: string
  images: string[]
  category: string
  stock: number
  rating: number
  reviewCount: number
  featured: boolean
  isNew: boolean
  discount?: number
  addedAt: Date
}

interface WishlistContextType {
  wishlist: WishlistItem[]
  addToWishlist: (product: Omit<WishlistItem, 'addedAt'>) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => Promise<void>
  wishlistCount: number
  loading: boolean
  syncWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  // Cargar wishlist desde localStorage
  const loadWishlistFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('mautik_wishlist')
      if (stored) {
        const items = JSON.parse(stored)
        return items.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }))
      }
    } catch (error) {
      console.error('Error loading wishlist from storage:', error)
    }
    return []
  }, [])

  // Guardar wishlist en localStorage
  const saveWishlistToStorage = useCallback((items: WishlistItem[]) => {
    try {
      localStorage.setItem('mautik_wishlist', JSON.stringify(items))
    } catch (error) {
      console.error('Error saving wishlist to storage:', error)
    }
  }, [])

  // Sincronizar wishlist con el servidor
  const syncWishlist = useCallback(async () => {
    if (!user) return

    try {
      // Obtener wishlist del servidor
      const response = await fetch('/api/wishlist', {
        credentials: 'include'
      })

      if (response.ok) {
        const serverWishlist = await response.json()
        
        // Combinar wishlist local y del servidor
        const localWishlist = loadWishlistFromStorage()
        const combinedWishlist = [...localWishlist, ...serverWishlist]
        
        // Eliminar duplicados
        const uniqueWishlist = combinedWishlist.filter((item, index, self) => 
          index === self.findIndex(t => t.id === item.id)
        )

        setWishlist(uniqueWishlist)
        saveWishlistToStorage(uniqueWishlist)

        // Enviar wishlist combinada al servidor
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(uniqueWishlist)
        })
      }
    } catch (error) {
      console.error('Error syncing wishlist:', error)
    }
  }, [user, loadWishlistFromStorage, saveWishlistToStorage])

  // Cargar wishlist inicial
  useEffect(() => {
    const localWishlist = loadWishlistFromStorage()
    setWishlist(localWishlist)
    setLoading(false)
  }, [loadWishlistFromStorage])

  // Sincronizar cuando el usuario se autentica
  useEffect(() => {
    if (user) {
      syncWishlist()
    }
  }, [user, syncWishlist])

  // Agregar a wishlist
  const addToWishlist = useCallback(async (product: Omit<WishlistItem, 'addedAt'>) => {
    const newItem: WishlistItem = {
      ...product,
      addedAt: new Date()
    }

    setWishlist(prev => {
      const updated = [...prev, newItem]
      saveWishlistToStorage(updated)
      return updated
    })

    // Sincronizar con servidor si el usuario está autenticado
    if (user) {
      try {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify([newItem])
        })
      } catch (error) {
        console.error('Error syncing wishlist to server:', error)
      }
    }

    toast({
      title: "Agregado a favoritos",
      description: `${product.name} se ha agregado a tu lista de deseos.`,
    })
  }, [user, saveWishlistToStorage, toast])

  // Remover de wishlist
  const removeFromWishlist = useCallback(async (productId: string) => {
    const product = wishlist.find(item => item.id === productId)
    
    setWishlist(prev => {
      const updated = prev.filter(item => item.id !== productId)
      saveWishlistToStorage(updated)
      return updated
    })

    // Sincronizar con servidor si el usuario está autenticado
    if (user) {
      try {
        await fetch(`/api/wishlist/${productId}`, {
          method: 'DELETE',
          credentials: 'include'
        })
      } catch (error) {
        console.error('Error removing from server wishlist:', error)
      }
    }

    if (product) {
      toast({
        title: "Removido de favoritos",
        description: `${product.name} se ha removido de tu lista de deseos.`,
      })
    }
  }, [wishlist, user, saveWishlistToStorage, toast])

  // Verificar si está en wishlist
  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some(item => item.id === productId)
  }, [wishlist])

  // Limpiar wishlist
  const clearWishlist = useCallback(async () => {
    setWishlist([])
    saveWishlistToStorage([])

    if (user) {
      try {
        await fetch('/api/wishlist', {
          method: 'DELETE',
          credentials: 'include'
        })
      } catch (error) {
        console.error('Error clearing server wishlist:', error)
      }
    }

    toast({
      title: "Lista de deseos limpiada",
      description: "Se han removido todos los productos de tu lista de deseos.",
    })
  }, [user, saveWishlistToStorage, toast])

  const value: WishlistContextType = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount: wishlist.length,
    loading,
    syncWishlist
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
} 