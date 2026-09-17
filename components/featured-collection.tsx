import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

/*
  Colección destacada, reescrita entera.

  Lo que había tenía dos problemas gordos:

  1. El fondo era `/maar.png`: una playa tropical al atardecer, con palmeras y
     una cabaña, generada por IA. No es una foto de Estéfani, no tiene nada
     que ver con Mautik y ocupaba la sección completa a `brightness-0.7`, con
     las fichas de producto encima de una puesta de sol.

  2. Debajo repetía una rejilla de ocho productos ordenando "destacados
     primero"... exactamente el mismo criterio que "Piezas Destacadas", la
     sección de arriba. Como 29 de los 30 productos de crochet están marcados
     como destacados, los ocho que salían eran LOS MISMOS ocho, con la misma
     foto y el mismo precio, a media pantalla de distancia. La sección medía
     1.755 px para no enseñar nada nuevo.

  Ahora es lo que su nombre promete: los personajes, con piezas reales suyas
  que no aparecen en la rejilla de arriba, y un solo enlace a la categoría.
  Ya no necesita traerse el catálogo entero al navegador, así que dejó de ser
  un componente de cliente.
*/

const PERSONAJES = [
  {
    id: "01a9ffe8-f63f-4aaf-b0e8-278fb661dbb7",
    src: "/productos/mtk-cr-009.webp",
    nombre: "Hollow Knight",
    alt: "Peluche de Hollow Knight tejido a crochet a mano por Mautik",
  },
  {
    id: "222c4224-9c44-4b56-8cca-16bec96b3ad2",
    src: "/productos/mtk-cr-008.webp",
    nombre: "Spiderman",
    alt: "Peluche de Spiderman tejido a crochet a mano por Mautik",
  },
  {
    id: "bf78b7f7-5887-428e-83e8-03e53b662aa1",
    src: "/productos/mtk-cr-012.webp",
    nombre: "Luffy",
    alt: "Peluche de Luffy de One Piece tejido a crochet por Mautik",
  },
  {
    id: "185cca87-8525-434a-b93e-6f0b0b031a59",
    src: "/productos/mtk-cr-017.webp",
    nombre: "Kuromi",
    alt: "Peluche de Kuromi tejido a crochet a mano por Mautik",
  },
]

export default function FeaturedCollection() {
  return (
    <section className="bg-purple-50 py-16 dark:bg-white/5 sm:py-20">
      <div className="container mx-auto px-4">
        {/*
          A 768px esto caía a una sola columna: el texto arriba y las cuatro
          fotos debajo a todo el ancho, 1.464 px de sección para cuatro piezas.
          Desde `md` van lado a lado.
        */}
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          {/* Texto */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-purple-900 dark:bg-white/10 dark:text-purple-100">
              <Sparkles className="h-3.5 w-3.5" />
              Colección de personajes
            </span>
            <h2 className="font-display mt-4 text-3xl font-bold text-purple-900 dark:text-purple-100 sm:text-4xl">
              Los personajes que te
              <br className="hidden sm:block" /> gustan, tejidos a mano
            </h2>
            <p className="mt-4 max-w-md text-gray-700 dark:text-purple-100/80">
              Hollow Knight, Spiderman, Luffy, Kuromi y muchos más. Cada uno se teje
              por encargo, punto por punto, y sale distinto del anterior. Si el tuyo
              no está en la tienda, se puede pedir.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-purple-800 px-7 hover:bg-purple-900 dark:bg-purple-700 dark:hover:bg-purple-800"
              >
                <Link href="/shop/crochet">
                  Ver los peluches <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-purple-300 px-7 text-purple-900 hover:bg-purple-100 dark:border-white/20 dark:text-purple-100 dark:hover:bg-white/10"
              >
                <Link href="/contact">Pedir uno a tu gusto</Link>
              </Button>
            </div>
          </div>

          {/* Mosaico de piezas reales, dos columnas desfasadas */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {PERSONAJES.map((p, i) => (
              <Link
                key={p.src}
                href={`/product/${p.id}`}
                className={`group relative aspect-[3/4] overflow-hidden rounded-3xl bg-purple-100 dark:bg-white/10 ${
                  i % 2 === 1 ? "sm:translate-y-8" : ""
                }`}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 22vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10 text-sm font-semibold text-white">
                  {p.nombre}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
