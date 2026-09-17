"use client"

import { Suspense, useEffect, useState } from "react"
import HeroCarrusel from "@/components/hero-carrusel"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ProductCard from "@/components/product-card"
import FeaturedCollection from "@/components/featured-collection"
import { CategoryShowcase } from "@/components/category-showcase"
import { ArrowRight, Sparkles, Star, Truck } from "lucide-react"
import type { Product } from "@/types/product"

// Tipo para productos de la API
interface ApiProduct {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  images: string[]
  stock: number
  featured?: boolean
  isNew?: boolean
  specifications?: Record<string, any>
  discount?: number // Nuevo campo para el descuento
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Función para mapear productos de la API al formato esperado
  const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
    return {
      id: apiProduct.id, // Usar directamente el ID de la API
      name: apiProduct.name,
      price: apiProduct.price,
      originalPrice: apiProduct.originalPrice,
      description: apiProduct.description,
      images: apiProduct.images || ['/placeholder.jpg'],
      category: apiProduct.category,
      stock: apiProduct.stock,
      featured: apiProduct.featured || false,
      isNew: apiProduct.isNew || false,
      discount: apiProduct.discount || 0, // Usar el descuento manual configurado
      attributes: apiProduct.specifications ? Object.entries(apiProduct.specifications).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: String(value)
      })) : [],
      details: apiProduct.specifications ? Object.entries(apiProduct.specifications).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: String(value)
      })) : []
    }
  }

  // Cargar productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        // Primero intentar productos destacados; si no hay, traer los más recientes
        let response = await fetch('/api/products?limit=12&featured=true')
        if (response.ok) {
          const data = await response.json()
          let apiProducts: ApiProduct[] = data.products || data
          if (apiProducts.length === 0) {
            const fallback = await fetch('/api/products?limit=12')
            if (fallback.ok) {
              const fbData = await fallback.json()
              apiProducts = fbData.products || fbData
            }
          }
          // Mapear productos
          const mappedProducts = apiProducts.map(mapApiProductToProduct)
          setFeaturedProducts(mappedProducts.slice(0, 12))
        } else {
          console.error('Error fetching products')
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <>
      {/*
        Acá había un <MetaTags> con title, description y keywords. Usaba
        `next/head`, que es API del Pages Router: en el App Router no hace
        absolutamente nada. Los metadatos de la portada salen de
        `app/layout.tsx`, que es donde sí funcionan.
      */}
      <div className="min-h-screen">
        {/* Hero Section */}
        {/*
          Hero. Tres cambios de diseño respecto a la versión anterior:
          1. La foto es un PRODUCTO REAL de Mautik (Hollow Knight tejido a mano,
             foto propia). Antes era `fondonubes.jpg`, un fondo de celular
             vertical de 1211x2160 estirado a un hero horizontal: se veía gris
             y no comunicaba que esto es una tienda de artesanía.
          2. Altura 78vh en vez de 100vh. Un hero de pantalla completa esconde
             el producto y obliga a hacer scroll para ver que hay tienda.
          3. El degradado va de izquierda a derecha, no de arriba abajo, así el
             texto queda legible sin tener que apagar la foto entera.
        */}
        {/*
          Sin `overflow-hidden` en la sección: el panel flotante sobresale por
          abajo a propósito y con el recorte puesto acá quedaba cortado por la
          mitad. El recorte va en el contenedor de la imagen, que es lo único
          que hace falta clipear.
        */}
        {/*
          Alturas.

          En el teléfono medía 86svh y el bloque de texto iba pegado abajo:
          quedaban 205px de foto vacía arriba contra 112 abajo, y se veía
          descuadrado, como si el texto flotara. A 78svh los dos huecos se
          parecen y la pieza de la foto sigue viéndose entera.
        */}
        <section className="relative flex min-h-[78svh] items-end pb-24 sm:h-[74svh] sm:max-h-[720px] sm:min-h-[560px] sm:items-center sm:pb-0 lg:h-[78svh] lg:max-h-[820px]">
          <HeroCarrusel
            fotos={[
              { src: "/hero-1.webp", alt: "Peluche de Hollow Knight tejido a mano por Mautik en La Chorrera, Panamá" },
              { src: "/hero-2.webp", alt: "Osito de crochet hecho a mano por Mautik" },
              { src: "/hero-3.webp", alt: "Peluche de vaquita tejido a crochet por Mautik" },
              { src: "/hero-4.webp", alt: "Cartera tejida a crochet por Mautik" },
            ]}
          />

          {/*
            El texto va dentro del `container`, igual que el resto de la página.
            Antes usaba `px-6 sm:px-10 lg:pl-16`, que no coincide con ninguna
            otra sección: en una pantalla ancha el título quedaba pegado al
            borde izquierdo mientras todo lo de abajo estaba centrado, y se
            notaba que no estaban alineados.
          */}
          <div className="container relative z-10 mx-auto px-4">
            <div className="max-w-xl text-white [&_h1]:[text-shadow:0_1px_14px_rgba(24,10,48,0.55)] [&>p]:[text-shadow:0_1px_12px_rgba(24,10,48,0.6)] lg:max-w-2xl">
              {/*
                La pastilla era `bg-white/15` con borde blanco y desenfoque.
                Sobre una foto clara —la mano, el satén— ese blanco al 15% se
                mezcla con lo que hay debajo y sale un gris sucio con el borde
                marcado: se veía como una caja negra pegada encima. Sólida, en
                el morado de la marca, se lee igual sobre cualquiera de las
                cuatro fotos y no depende de lo que tenga detrás.
              */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-purple-950/30 [text-shadow:none] sm:text-sm">
                <Sparkles size={14} className="shrink-0" />
                Hecho a mano en Panamá
              </span>

              {/*
                Un solo h1. Antes eran un h1 ("Mautik") y un h2 con el lema,
                que competían por el mismo lugar en la jerarquía. El lema ahora
                va dentro del h1: para un buscador la portada dice qué vende,
                no solo cómo se llama.
              */}
              <h1 className="mt-5 text-5xl font-bold leading-[1.03] tracking-tight sm:text-6xl lg:text-7xl">
                Mautik
                <span className="mt-2.5 block text-xl font-semibold leading-snug text-purple-50 sm:text-2xl lg:text-3xl">
                  Artesanías tejidas a mano, una por una
                </span>
              </h1>

              <p className="mt-4 max-w-md text-base leading-relaxed text-white/90 sm:mt-5 sm:text-lg">
                Peluches, llaveros y bisutería hechos pieza por pieza en La
                Chorrera. No hay dos iguales.
              </p>

              {/*
                Los dos botones tenían anchos distintos y en el teléfono caían
                uno debajo del otro en escalera. Acá van del mismo ancho hasta
                `sm`, y desde ahí lado a lado.

                El segundo era `bg-white/10` con desenfoque: el mismo problema
                que la pastilla, un recuadro gris turbio sobre la foto. Ahora
                es blanco sólido con el texto morado, que además le da el
                contraste que un botón necesita.
              */}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-full rounded-full border border-purple-400/40 bg-purple-700 text-base font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_28px_rgba(24,10,48,0.35)] transition hover:bg-purple-800 sm:w-auto sm:px-8"
                >
                  <Link href="/shop">
                    Explorar Colección <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {/*
                  Vidrio esmerilado, ahora bien hecho.

                  El intento anterior era `bg-white/10` con un desenfoque
                  flojo: sobre una foto clara eso no se lee como vidrio, se lee
                  como un recuadro gris sucio con el borde marcado. Lo que hace
                  que parezca vidrio de verdad son tres cosas juntas:
                   · más blanco de fondo (20%) y desenfoque fuerte,
                   · saturar lo que se ve detrás, como el cristal real,
                   · y un brillo de un píxel en el borde de arriba
                     (`inset 0 1px 0`), que es el reflejo de la luz.
                */}
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-full rounded-full border border-white/55 bg-white/25 text-base font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_8px_28px_rgba(24,10,48,0.28)] backdrop-blur-xl backdrop-saturate-150 transition hover:bg-white/35 sm:w-auto sm:px-8 dark:border-white/55 dark:bg-white/25 dark:text-white dark:hover:bg-white/35"
                >
                  <Link href="/about">Nuestra Historia</Link>
                </Button>
              </div>

              {/*
                Acá había tres etiquetas ("Hecho con Amor", "Calidad Artesanal",
                "Único y Especial"). En móvil se partían en dos líneas y no
                decían nada que la clienta no supiera ya al ver la foto. En su
                lugar va lo único que de verdad quiere saber antes de comprar:
                si le llega y cómo.
              */}
              <p className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-white/85">
                <Truck size={15} className="shrink-0" />
                <span>Envíos a todo Panamá</span>
                <span aria-hidden className="hidden text-white/45 sm:inline">·</span>
                <span>Entrega personal en La Chorrera</span>
              </p>
            </div>
          </div>

          {/*
            Panel flotante al pie del hero.

            Es el elemento que se repite en todas las referencias que pasó
            Estéfani (la barra blanca montada sobre la foto del hero). Acá en
            vez de un buscador lleva las categorías, que es lo que una clienta
            de Mautik necesita a mano: entra por "pulseras" o por "crochet".

            En pantalla chica la fila no cabe entera y se desplaza de lado. Eso
            antes no se veía: la última categoría quedaba cortada contra el
            borde sin ninguna señal de que hubiera más. Ahora hay un
            desvanecido a la derecha que lo anuncia, y "Ver todo" dejó de estar
            escondido en móvil.
          */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 translate-y-1/2 px-4">
            <div className="pointer-events-auto relative mx-auto max-w-4xl rounded-3xl border border-white/60 bg-white/85 p-2.5 shadow-[0_18px_50px_rgba(24,10,48,0.22)] backdrop-blur-xl sm:p-4 dark:border-white/10 dark:bg-card/85">
              <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <span className="hidden shrink-0 pl-2 pr-1 text-xs font-semibold uppercase tracking-wide text-purple-900/70 lg:block dark:text-purple-100/70">
                  Busca por
                </span>
                {[
                  { slug: "crochet", nombre: "Crochet" },
                  { slug: "pulseras", nombre: "Pulseras" },
                  { slug: "collares", nombre: "Collares" },
                  { slug: "anillos", nombre: "Anillos" },
                  { slug: "aretes", nombre: "Aretes" },
                  { slug: "llaveros", nombre: "Llaveros" },
                ].map((c) => (
                  <Link
                    key={c.slug}
                    href={`/shop/${c.slug}`}
                    className="shrink-0 rounded-full border border-purple-100 bg-white px-4 py-2 text-sm font-medium text-purple-900 transition hover:border-purple-300 hover:bg-purple-50 dark:border-white/10 dark:bg-white/5 dark:text-purple-50 dark:hover:bg-white/10"
                  >
                    {c.nombre}
                  </Link>
                ))}
                <Link
                  href="/shop"
                  className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-purple-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-950 dark:bg-white dark:text-purple-950 dark:hover:bg-purple-50"
                >
                  Ver todo <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {/* Señal de que la fila sigue hacia la derecha. */}
              <div className="pointer-events-none absolute inset-y-2 right-2.5 w-9 rounded-r-3xl bg-gradient-to-l from-white/95 to-transparent lg:hidden dark:from-card" />
            </div>
          </div>
        </section>

        {/* Featured Products */}
        {/* pt extra para dejarle aire al panel flotante del hero */}
        <section className="pb-20 pt-28 bg-background sm:pt-32">
          <div className="container mx-auto px-4">
            {/*
              El texto decía "Nuestras creaciones más populares, seleccionadas
              especialmente para ti. Cada pieza refleja la pasión y dedicación
              de la artesanía panameña." Es relleno de plantilla: no dice nada
              concreto y además habla de "seleccionar", que es lo contrario de
              lo que hace Mautik. Acá se teje.
            */}
            <div className="mb-12 text-center sm:mb-14">
              <Badge className="mb-4 border-none bg-purple-100 text-purple-800 dark:bg-white/10 dark:text-purple-200">
                <Star size={14} className="mr-1" />
                Lo que más se pide
              </Badge>
              <h2 className="font-display mb-4 text-3xl font-bold text-purple-900 dark:text-purple-100 md:text-4xl lg:text-5xl">
                Piezas Destacadas
              </h2>
              <p className="mx-auto max-w-xl text-lg leading-relaxed text-gray-600 dark:text-purple-100/80">
                Lo que más sale del taller. Todo está hecho y listo para enviar, salvo
                que quieras el tuyo en otros colores.
              </p>
            </div>

            {loading ? (
              <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-96 bg-gray-200 dark:bg-white/10 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                {featuredProducts.map((product) => (
                  <Suspense key={product.id} fallback={<div className="h-96 bg-gray-200 dark:bg-white/10 animate-pulse rounded-xl" />}>
                    <ProductCard product={product} />
                  </Suspense>
                ))}
              </div>
            )}

            <div className="text-center">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-purple-300 px-8 text-purple-900 transition hover:bg-purple-100 dark:border-white/20 dark:text-purple-100 dark:hover:bg-white/10"
              >
                <Link href="/shop">
                  Ver toda la tienda <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Collection */}
        <FeaturedCollection />

        {/* Category Showcase */}
        <CategoryShowcase />
      </div>
    </>
  )
}
