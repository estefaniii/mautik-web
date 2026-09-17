import type { Metadata } from "next"

// Metadata propia de la página. Antes todas heredaban el título genérico del
// layout raíz, así que en Google salían todas iguales.
export const metadata: Metadata = {
  title: "Lookbook",
  description: "Mira nuestras colecciones de crochet y bisutería hechas a mano en Panamá, pieza por pieza.",
  alternates: { canonical: "/lookbook" },
  openGraph: { title: "Lookbook · Mautik", description: "Mira nuestras colecciones de crochet y bisutería hechas a mano en Panamá, pieza por pieza.", url: "/lookbook" },
}

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

/*
  Las tres líneas del catálogo, con fotos reales.

  Lo que había antes venía del andamio de la plantilla: dos "colecciones"
  inventadas ("Océano Panameño 2025", "Artesanía Tradicional") con ocho fotos
  alojadas en el blob de Vercel que YA NO EXISTEN — verificado, las ocho
  devuelven 404. O sea: una página enlazada desde el menú y el footer que a la
  clienta le mostraba solo placeholders y textos de una colección que no está
  en la tienda. Los botones "Explorar Colección" tampoco iban a ningún lado:
  apuntaban a /shop?collection=1 y la tienda solo entiende `oceano-panameno`.

  Estas tres son las líneas reales, las mismas en que está organizado el
  catálogo y los dos portafolios de Canva. Si quieres ponerles nombres de
  colección propios, se cambian acá y nada más.
*/
const lookbookCollections = [
  {
    id: "crochet",
    name: "Crochet",
    description:
      "Peluches y figuras tejidas punto por punto: animalitos, personajes y muñecos. Cada pieza se arma completa a mano, así que no hay dos iguales.",
    // La portada es la foto de la canasta: sale del catálogo de Canva de
    // Tejidos y, de las 68 imágenes de los dos Canva, era la única que no
    // estaba en ninguna parte de la app. Muestra varias piezas juntas, así
    // que no sirve de foto de producto, pero de portada de colección es la
    // mejor que hay.
    coverImage: "/lookbook/canasta-crochet.webp",
    images: [
      "/productos/mtk-cr-006.webp",
      "/productos/mtk-cr-013.webp",
      "/productos/mtk-cr-021.webp",
    ],
  },
  {
    id: "pulseras",
    name: "Bisutería",
    description:
      "Pulseras, collares, anillos y aretes armados cuenta por cuenta: hilo, perlas y alambre bañado en oro. Se pueden pedir con iniciales o en tu combinación de colores.",
    coverImage: "/productos/mtk-ar-003.webp",
    images: [
      "/productos/mtk-pu-006.webp",
      "/productos/mtk-co-003.webp",
      "/productos/mtk-an-003.webp",
    ],
  },
  {
    id: "otros",
    name: "Tejidos para usar",
    description:
      "Lo que sale del crochet pero se lleva puesto: vinchas, tops y bolsos tejidos a mano, en los colores que elijas.",
    coverImage: "/productos/mtk-ot-002.webp",
    images: [
      "/productos/mtk-ot-001.webp",
      "/productos/mtk-ot-003.webp",
      "/productos/mtk-ot-004.webp",
    ],
  },
]

export default function LookbookPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h1 className="font-display mb-4 text-4xl font-bold text-purple-900 dark:text-purple-100 md:text-5xl">
            Lookbook Mautik
          </h1>
          <p className="text-lg text-gray-700 dark:text-purple-100/80">
            Explora nuestras colecciones y descubre la historia detrás de cada pieza artesanal.
          </p>
        </div>

        {/* Collections */}
        {lookbookCollections.map((collection, orden) => (
          <div key={collection.id} className="mb-20">
            <div className="relative mb-6 h-[52vh] min-h-[340px] overflow-hidden rounded-3xl">
              <Image
                src={collection.coverImage}
                alt={`Colección ${collection.name} de Mautik`}
                fill
                className="object-cover"
                // La primera portada está arriba del pliegue: si carga en
                // diferido, es justo la imagen que mide el LCP.
                priority={orden === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/35 to-transparent p-6 sm:p-8">
                <h2 className="font-display mb-3 text-3xl font-bold text-white md:text-4xl">
                  {collection.name}
                </h2>
                <p className="mb-6 max-w-2xl text-white/90">{collection.description}</p>
                <div>
                  {/*
                    Antes esto iba a /shop?collection=<id>, que la tienda no
                    entiende: el botón no filtraba nada. Ahora va a la página
                    de la categoría, que sí existe y muestra las piezas.
                  */}
                  <Button className="rounded-full bg-white px-6 text-purple-900 hover:bg-purple-100 dark:bg-white/15 dark:text-white dark:hover:bg-white/25" asChild>
                    <Link href={`/shop/${collection.id}`}>
                      Explorar Colección <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {collection.images.map((image, index) => (
                <div key={image} className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-sm">
                  <Image
                    src={image}
                    alt={`${collection.name} de Mautik, pieza ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* CTA Section */}
        <div className="mt-12 rounded-3xl bg-purple-100 px-6 py-12 text-center dark:bg-white/5">
          <h3 className="font-display mb-3 text-2xl font-bold text-purple-900 dark:text-purple-100">
            ¿Te inspira nuestra colección?
          </h3>
          <p className="mx-auto mb-6 max-w-2xl text-gray-700 dark:text-purple-100/80">
            Visita nuestra tienda para descubrir todas las piezas artesanales que tenemos disponibles para ti.
          </p>
          <Button
              size="lg"
              className="rounded-full bg-purple-800 px-8 hover:bg-purple-900 dark:bg-purple-700 dark:hover:bg-purple-800"
             asChild>
            <Link href="/shop">
              Visitar Tienda
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
