import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Nuestra Historia",
  description:
    "Conoce a Mautik: un taller artesanal en La Chorrera, Panamá, donde cada peluche, llavero y pieza de bisutería se teje y se arma a mano.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Nuestra Historia · Mautik",
    description:
      "Conoce a Mautik: un taller artesanal en La Chorrera, Panamá, donde cada peluche, llavero y pieza de bisutería se teje y se arma a mano.",
    url: "/about",
  },
}

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Gem, Sparkles, ArrowRight, Instagram } from "lucide-react"
import { MARCA } from "@/lib/contacto"

/*
  Reescritura de la página.

  Lo que había antes era el andamio de la plantilla:
   · La foto grande del "taller" era `cori-burns-dupe` alojada en el blob de
     Vercel — una imagen ajena que venía de ejemplo. Presentarla como el taller
     de Mautik no corresponde. Ahora todas las fotos son de Estéfani.
   · El texto decía que Mautik "selecciona productos curados de todo el mundo".
     Es falso: acá se teje y se arma todo a mano en La Chorrera. Eso además le
     quita justamente el valor que tiene.
   · "Nuestro proceso creativo" hablaba de bocetos, prototipos y un "riguroso
     control de calidad": relleno corporativo que no describe a nadie.
*/

const VALORES = [
  {
    icono: Heart,
    titulo: "Hecho a mano, de verdad",
    texto:
      "No hay máquinas ni proveedores. Cada peluche se teje punto por punto y cada pulsera se arma cuenta por cuenta, acá en La Chorrera.",
  },
  {
    icono: Gem,
    titulo: "Ninguna pieza sale igual",
    texto:
      "Al tejer a mano siempre hay pequeñas diferencias entre una pieza y otra. No es un defecto: es la prueba de que nadie más tiene la tuya.",
  },
  {
    icono: Sparkles,
    titulo: "Se puede pedir a tu gusto",
    texto:
      "Colores, iniciales, tamaños. Si tienes una idea, se puede tejer: escríbenos y lo vemos juntas antes de empezar.",
  },
]

const MOSAICO = [
  { src: "/productos/mtk-cr-029.webp", alt: "Capibara de crochet con accesorios, hecho a mano" },
  { src: "/productos/mtk-ot-005.webp", alt: "Cartera crema tejida a crochet con estrellas de mar" },
  { src: "/productos/mtk-pu-004.webp", alt: "Pulsera de perlas con alambre bañado en oro" },
  { src: "/productos/mtk-cr-003.webp", alt: "Capibara grande de crochet" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Encabezado con mosaico de piezas reales ───────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-sm font-medium text-purple-900 dark:bg-white/10 dark:text-purple-100">
                {MARCA.ciudad}, {MARCA.pais}
              </span>
              <h1 className="font-display mt-5 text-4xl font-bold text-purple-900 dark:text-purple-100 md:text-5xl lg:text-6xl">
                Un taller, dos manos
                <br />y mucho hilo
              </h1>
              <p className="mt-5 max-w-xl text-lg text-gray-700 dark:text-purple-100/80">
                Mautik es el taller de Estéfani. Todo lo que ves en la tienda salió
                de acá: tejido, armado y revisado a mano, una pieza a la vez.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" className="rounded-full bg-purple-800 px-8 hover:bg-purple-900" asChild>
                  <Link href="/shop">
                    Ver la tienda <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-purple-800 px-8 text-purple-800 hover:bg-purple-100 dark:border-purple-300 dark:text-purple-200 dark:hover:bg-white/10"
                  asChild
                >
                  <a href={MARCA.instagramUrl} target="_blank" rel="noopener noreferrer">
                    <Instagram className="mr-2 h-4 w-4" /> {MARCA.instagram}
                  </a>
                </Button>
              </div>
            </div>

            {/* Mosaico: dos columnas desfasadas, todo fotos propias */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {MOSAICO.map((foto, i) => (
                <div
                  key={foto.src}
                  className={`relative overflow-hidden rounded-3xl bg-purple-50 dark:bg-white/5 ${
                    i % 2 === 0 ? "aspect-[3/4]" : "aspect-[3/4] sm:translate-y-6"
                  }`}
                >
                  <Image
                    src={foto.src}
                    alt={foto.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 45vw, 22vw"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── La historia ───────────────────────────────────────────────── */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl rounded-3xl bg-purple-50 p-6 dark:bg-white/5 sm:p-10">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                <Image
                  src="/lookbook/canasta-crochet.webp"
                  alt="Canasta con peluches de crochet hechos a mano en el taller de Mautik"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 90vw, 45vw"
                />
              </div>
              <div>
                <h2 className="font-display mb-5 text-3xl font-bold text-purple-900 dark:text-purple-100">
                  Empezó con una pulsera
                </h2>
                <p className="mb-4 text-gray-700 dark:text-purple-100/80">
                  En 2021 Estéfani empezó tejiendo pulseras de hilo y armando piezas
                  con alambre bañado en oro. Lo que era un pasatiempo se fue llenando
                  de pedidos: primero de amigas, después de gente que las veía puestas
                  y preguntaba dónde las conseguía.
                </p>
                <p className="mb-4 text-gray-700 dark:text-purple-100/80">
                  Del alambre pasó al crochet, y del crochet a los peluches: capibaras,
                  ositos, personajes, llaveros. Hoy Mautik tiene piezas desde cincuenta
                  centavos hasta carteras y peluches grandes que llevan días de trabajo.
                </p>
                <p className="text-gray-700 dark:text-purple-100/80">
                  Lo que no cambió es cómo se hacen: sentada, con el hilo en la mano,
                  una por una.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cómo trabajamos ───────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-display mb-3 text-3xl font-bold text-purple-900 dark:text-purple-100">
              Cómo trabajamos
            </h2>
            <p className="text-gray-700 dark:text-purple-100/80">
              Tres cosas que no negociamos, y que se notan cuando tienes la pieza en la mano.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {VALORES.map(({ icono: Icono, titulo, texto }) => (
              <div
                key={titulo}
                className="rounded-3xl border border-purple-100 bg-card p-6 transition-shadow hover:shadow-md dark:border-white/10"
              >
                <span className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-purple-100 dark:bg-white/10">
                  <Icono className="h-6 w-6 text-purple-800 dark:text-purple-300" />
                </span>
                <h3 className="mb-2 text-xl font-semibold text-purple-900 dark:text-purple-100">{titulo}</h3>
                <p className="text-gray-700 dark:text-purple-100/80">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quién está detrás ─────────────────────────────────────────── */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-4xl items-center gap-8 rounded-3xl bg-purple-50 p-6 dark:bg-white/5 sm:p-10 md:grid-cols-[auto,1fr]">
            <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-full sm:h-56 sm:w-56">
              <Image
                src="/estefani.webp"
                alt="Estéfani Torres, fundadora de Mautik"
                fill
                className="object-cover"
                sizes="224px"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="font-display mb-1 text-3xl font-bold text-purple-900 dark:text-purple-100">
                Estéfani Torres
              </h2>
              <p className="mb-4 font-medium text-purple-700 dark:text-purple-300">
                Fundadora · teje todo lo que ves acá
              </p>
              <p className="text-gray-700 dark:text-purple-100/80">
                Estudia mercadeo en la Universidad de Panamá y teje desde 2021. Cada
                pedido pasa por sus manos, desde elegir el hilo hasta cerrar el último
                punto. Si le escribes por Instagram, te contesta ella.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cierre ────────────────────────────────────────────────────── */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-3xl bg-purple-900 px-6 py-14 text-center dark:bg-[hsl(265_35%_16%)] sm:px-12">
            <h2 className="font-display mb-4 text-3xl font-bold text-white">
              ¿Buscás algo en particular?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">
              Si quieres una pieza en tus colores, con tu inicial o de un personaje
              que no está en la tienda, escríbenos y lo tejemos.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" className="rounded-full bg-white px-8 text-purple-900 hover:bg-purple-100" asChild>
                <Link href="/shop">Explorar la tienda</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-transparent px-8 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/contact">Hacer un pedido</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
