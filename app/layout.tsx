import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SkipLinks } from "@/components/ui/accessibility"
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import MarcoSitio from "@/components/marco-sitio"
import ClientProviders from "./client-providers"
import { grafo, negocioLocal, sitioWeb } from "@/lib/seo/structured-data"
import { sitioUrl } from "@/lib/site-url"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mautik - Hecho a Mano & Selección Especial",
  description: "Descubre piezas únicas hechas a mano y productos seleccionados cuidadosamente. Joyería, crochet, decoración y más.",
  keywords: "artesanía, diseño, joyería, crochet, accesorios, curaduría, panamá, tienda online, hecho a mano, productos seleccionados",
  authors: [{ name: "Mautik" }],
  creator: "Mautik",
  publisher: "Mautik",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // La URL pública se resuelve en lib/site-url.ts, que descarta los valores
  // de localhost heredados del .env cuando no estamos en desarrollo.
  metadataBase: new URL(sitioUrl()),
  // Canonical de la portada. Cada otra ruta declara el suyo (o va noindex),
  // así que ninguna hereda este por error.
  alternates: { canonical: "/" },
  openGraph: {
    title: "Mautik - Hecho a Mano & Selección Especial",
    description: "Descubre piezas únicas hechas a mano y productos seleccionados cuidadosamente. Joyería, crochet, decoración y más.",
    url: "/",
    siteName: "Mautik",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mautik - Hecho a Mano & Selección Especial",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mautik - Hecho a Mano & Selección Especial",
    description: "Descubre piezas únicas hechas a mano y productos seleccionados cuidadosamente. Joyería, crochet, decoración y más.",
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
  // Cuando tengas el código de Search Console, pegalo acá y descomentá.
  // Mientras esté vacío es mejor no emitir la meta que emitirla con un valor falso.
  // verification: { google: "..." },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/*
          Tema antes del primer pintado.

          El ThemeContext aplica la clase `dark` en un useEffect, que corre
          DESPUÉS de hidratar: el sitio pintaba en claro y recién después
          cambiaba a oscuro, así que se veía un destello blanco en cada carga.
          Este script es bloqueante y minúsculo a propósito: corre antes de que
          el navegador pinte, así que no hay salto.

          Además respeta la preferencia del sistema en la primera visita, que
          antes se ignoraba (si no había nada en localStorage, se quedaba claro).
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var g=localStorage.getItem('darkMode');var d=g===null?window.matchMedia('(prefers-color-scheme: dark)').matches:g==='true';if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2E1065" />
        {/*
          Iconos del sitio.

          Antes solo se declaraba el SVG, y `/favicon.ico` ni siquiera existía:
          daba 404. Eso importa porque el navegador lo pide por su cuenta
          aunque no esté declarado, y varios sitios —Safari, los lectores de
          RSS, las vistas previas al compartir un enlace— van directo a
          `/favicon.ico` y se quedaban sin icono.

          El .ico lleva seis tamaños adentro (16 a 256) y el navegador elige.

          ⚠️ Se quitó la línea del SVG a propósito. `icon.svg` era un REDIBUJO
          de la M hecho a mano con trazos, no el logo real, y los navegadores
          modernos prefieren el SVG sobre todo lo demás: el icono de la pestaña
          era esa aproximación y no la marca. Ahora todos los tamaños salen del
          mismo archivo, `icon-512.png`, que sí es el logo.
        */}
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png?v=3" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=3" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=3" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3" />
        <link rel="manifest" href="/manifest.json?v=3" />
        
        {/* Preconnect para mejorar rendimiento */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch para recursos externos */}
        <link rel="dns-prefetch" href="//hebbkx1anhila5yf.public.blob.vercel-storage.com" />
        
        {/* Datos estructurados: SEO + GEO (negocio local) + AEO (FAQ) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              /*
                Las preguntas frecuentes YA NO van acá.

                Este script se imprime en TODAS las páginas, así que la
                portada, la tienda y cada ficha de producto le declaraban a
                Google un bloque de preguntas frecuentes... que en ninguna de
                esas páginas se ve. Google pide que ese dato corresponda a
                preguntas visibles en la misma página; si no, lo ignora, y en
                el peor caso lo cuenta como marcado engañoso.

                Ahora las preguntas se ven en /contact, y el bloque se declara
                ahí, junto a ellas.
              */
              grafo(negocioLocal(), sitioWeb())
            ),
          }}
        />
      </head>
      <body className={inter.className}>
        <ClientProviders>
          <div className="min-h-screen flex flex-col">
            <SkipLinks />

            {/*
              Acá `<Navbar />` iba envuelto en un `<header role="banner">` y
              `<Footer />` en un `<footer role="contentinfo">`... pero los dos
              componentes YA traen su propio <header> y su propio <footer>.
              O sea que la página tenía dos encabezados y dos pies anidados,
              uno dentro del otro, con el mismo papel declarado. Para un lector
              de pantalla eso es "encabezado, encabezado" en cada página. Los
              identificadores de los enlaces de salto se mudaron a los
              elementos de verdad.
            */}
            <MarcoSitio navbar={<Navbar />} footer={<Footer />}>
              {children}
            </MarcoSitio>
          </div>

          <Toaster />
        </ClientProviders>
      </body>
    </html>
  )
}
