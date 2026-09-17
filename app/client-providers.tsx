"use client"

import { AuthProvider } from "@/context/auth-context"
import { CartProvider } from "@/context/cart-context"
import { NotificationProvider } from "@/context/notification-context"
import { ThemeProvider } from "@/context/theme-context"
import { SessionProvider } from "next-auth/react"

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  )
} 