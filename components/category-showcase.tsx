"use client"

import Link from "next/link"
import LazyImage from '@/components/ui/lazy-image'
import { ArrowRight } from "lucide-react"
import { CATEGORIAS } from "@/lib/categorias"


/*
  Categorías de la portada, con fotos REALES del catálogo.

  Antes cada una traía una foto de stock de Unsplash: joyería y peluches de
  otra gente. En una marca hecha a mano eso es lo peor que se puede poner en
  la portada, porque la clienta llega a la tienda y no encuentra nada de lo
  que vio. Ahora cada categoría muestra una pieza suya, elegida porque se ve
  clara (varias fotos de bisutería están sobre satén y la pieza casi no se
  distingue).

  Los enlaces van a /shop/<categoría>, que son páginas de verdad con su propio
  título y descripción, en vez de al filtro por query.
*/
const categories = CATEGORIAS.map((c) => ({
  slug: c.slug,
  name: c.nombre,
  image: c.imagen,
  link: c.href,
  description: c.descripcion,
}))

/*
  Bento en vez de carrusel.

  Antes eran siete tarjetas del mismo tamaño en un carrusel horizontal con
  flechas: en el celular había que empujar de a una y en escritorio la mitad
  de las categorías quedaba fuera de pantalla. El bento de las referencias
  (tarjetas de tamaños distintos en una misma reja) muestra las siete de una
  sola vez, le da jerarquía a las dos líneas principales y no necesita
  flechas ni JavaScript.
*/
/*
  El bento cambia de forma según el ancho.

  En el celular (2 columnas) las tarjetas anchas ocupaban la pantalla entera y
  se comían el alto: había que hacer mucho scroll para ver siete categorías.
  Ahora en móvil solo Crochet es grande y el resto va de a dos; recién a
  partir de sm aparece el bento completo de 4 columnas.
*/
// Por slug y no por nombre: el nombre visible puede cambiar ("Otros" pasó a
// ser "Otros tejidos") y el mosaico se quedaba sin su celda ancha sin avisar.
const AREAS: Record<string, string> = {
  crochet: "col-span-2 row-span-2",
  pulseras: "col-span-1 row-span-1 sm:col-span-2",
  llaveros: "col-span-1 row-span-1",
  collares: "col-span-1 row-span-1",
  anillos: "col-span-1 row-span-1",
  aretes: "col-span-1 row-span-1",
  otros: "col-span-2 row-span-1",
}

export function CategoryShowcase() {
  return (
    <section className="bg-background py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-display mb-3 text-center text-2xl font-bold text-purple-900 sm:text-3xl dark:text-purple-100">
          Descubre Nuestras Categorías
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-center text-sm text-gray-600 sm:mb-10 sm:text-base dark:text-purple-100/70">
          Todo tejido y armado a mano en La Chorrera, pieza por pieza.
        </p>

        <div className="mx-auto grid max-w-5xl auto-rows-[120px] grid-cols-2 gap-2.5 sm:auto-rows-[150px] sm:grid-cols-4 sm:gap-4 lg:auto-rows-[170px]">
          {categories.map((category) => (
            <Link
              key={category.link}
              href={category.link}
              aria-label={`Ver productos de la categoría ${category.name}`}
              className={`group relative overflow-hidden rounded-3xl shadow-[0_2px_12px_rgba(24,10,48,0.08)] ring-1 ring-purple-100/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(24,10,48,0.18)] dark:ring-purple-300/15 ${AREAS[category.slug] ?? "col-span-1 row-span-1"}`}
            >
              <LazyImage
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
                priority={false}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <h3 className="text-base font-bold text-white drop-shadow-sm sm:text-lg">
                  {category.name}
                </h3>
                {/* La descripción solo en las tarjetas grandes: en las chicas no entra sin apretujarse */}
                {(AREAS[category.slug] ?? "").includes("col-span-2") && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-white/85">
                    {category.description}
                  </p>
                )}
                <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-white/90 transition-transform group-hover:translate-x-0.5">
                  Ver productos <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
