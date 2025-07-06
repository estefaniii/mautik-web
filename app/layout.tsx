import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/auth-context"
import { CartProvider } from "@/context/cart-context"
import { FavoritesProvider } from "@/context/favorites-context"
import { ThemeProvider } from "@/context/theme-context"
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mautik - Joyería Artesanal Premium",
  description:
    "Descubre nuestra colección exclusiva de joyería artesanal. Anillos, collares, aretes y más, hechos con los mejores materiales.",
  keywords: "joyería, artesanal, anillos, collares, aretes, plata, oro, premium",
  generator: 'v0.dev',
  openGraph: {
    title: 'Mautik - Joyería Artesanal Premium',
    description: 'Descubre nuestra colección exclusiva de joyería artesanal. Anillos, collares, aretes y más, hechos con los mejores materiales.',
    url: 'https://mautik.com',
    siteName: 'Mautik',
    images: [
      {
        url: '/maar.png',
        width: 800,
        height: 600,
        alt: 'Mautik Joyería',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mautik',
    title: 'Mautik - Joyería Artesanal Premium',
    description: 'Descubre nuestra colección exclusiva de joyería artesanal.',
    images: ['/maar.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <Toaster />
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
