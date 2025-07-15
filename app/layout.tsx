import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/context/theme-context"
import { AuthProvider } from "@/context/auth-context"
import { CartProvider } from "@/context/cart-context"
import { FavoritesProvider } from "@/context/favorites-context"
import { NotificationProvider } from "@/context/notification-context"
import { WishlistProvider } from "@/context/wishlist-context"
import { SkipLinks } from "@/components/ui/accessibility"
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mautik - Artesanías Únicas",
  description: "Descubre nuestra colección de artesanías únicas hechas a mano. Joyería, crochet, llaveros y más.",
  keywords: "artesanías, joyería, crochet, llaveros, pulseras, collares, anillos, aretes",
  authors: [{ name: "Mautik" }],
  creator: "Mautik",
  publisher: "Mautik",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Mautik - Artesanías Únicas",
    description: "Descubre nuestra colección de artesanías únicas hechas a mano.",
    url: "/",
    siteName: "Mautik",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mautik - Artesanías Únicas",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mautik - Artesanías Únicas",
    description: "Descubre nuestra colección de artesanías únicas hechas a mano.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#7c3aed" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect para mejorar rendimiento */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch para recursos externos */}
        <link rel="dns-prefetch" href="//hebbkx1anhila5yf.public.blob.vercel-storage.com" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Mautik",
              "url": "https://mautik.com",
              "logo": "https://mautik.com/logo.png",
              "description": "Artesanías únicas hechas a mano",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "PA"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <NotificationProvider>
                  <WishlistProvider>
                    <div className="min-h-screen flex flex-col">
                      <SkipLinks />
                      
                      <header id="main-navigation" role="banner">
                        <Navbar />
                      </header>
                      
                      <main id="main-content" role="main" className="flex-1" style={{ paddingTop: '72px' }}>
                        {children}
                      </main>
                      
                      <footer id="footer" role="contentinfo">
                        <Footer />
                      </footer>
                    </div>
                    
                    <Toaster />
                  </WishlistProvider>
                </NotificationProvider>
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
