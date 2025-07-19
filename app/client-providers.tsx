"use client"

import { AuthProvider } from "@/context/auth-context"
import { CartProvider } from "@/context/cart-context"
import { FavoritesProvider } from "@/context/favorites-context"
import { NotificationProvider } from "@/context/notification-context"
import { WishlistProvider } from "@/context/wishlist-context"
import { ThemeProvider } from "@/context/theme-context"
import { SessionProvider } from "next-auth/react"

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <NotificationProvider>
                <WishlistProvider>
                  {children}
                </WishlistProvider>
              </NotificationProvider>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  )
} 