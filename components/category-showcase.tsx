import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { useRef, useState, useEffect } from "react"

const categories = [
  {
    name: "Crochet",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/crochet-category.jpg",
    link: "/shop?category=crochet",
    description: "Artesanías únicas hechas a mano con crochet",
  },
  {
    name: "Llaveros",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/keychain-1avERJBjLm9Nt2ETHxdpnW3hLTiVL5.jpg",
    link: "/shop?category=llaveros",
    description: "Llaveros únicos para tu día a día",
  },
  {
    name: "Pulseras",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jewelry-category-QUKILQx3QBULPGZeznexdmJXqPwdP7.jpg",
    link: "/shop?category=pulseras",
    description: "Pulseras elegantes y artesanales",
  },
  {
    name: "Collares",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jewelry-category-QUKILQx3QBULPGZeznexdmJXqPwdP7.jpg",
    link: "/shop?category=collares",
    description: "Collares únicos para complementar tu estilo",
  },
  {
    name: "Anillos",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jewelry-category-QUKILQx3QBULPGZeznexdmJXqPwdP7.jpg",
    link: "/shop?category=anillos",
    description: "Anillos artesanales con diseños únicos",
  },
  {
    name: "Aretes",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jewelry-category-QUKILQx3QBULPGZeznexdmJXqPwdP7.jpg",
    link: "/shop?category=aretes",
    description: "Aretes elegantes para cualquier ocasión",
  },
  {
    name: "Otros",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/plush-toys-Zzh5Kp8E4vRXZXdXc07DNcYxbVzWc0.jpg",
    link: "/shop?category=otros",
    description: "Productos únicos y especiales",
  },
]

export function CategoryShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Checa si hay overflow para mostrar flechas
  const checkForScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    checkForScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", checkForScroll)
    window.addEventListener("resize", checkForScroll)
    return () => {
      el.removeEventListener("scroll", checkForScroll)
      window.removeEventListener("resize", checkForScroll)
    }
  }, [])

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const scrollAmount = el.clientWidth * 0.8
    el.scrollBy({ left: dir === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" })
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-2 sm:px-4">
        <h2 className="font-display text-3xl font-bold text-purple-900 dark:text-purple-200 text-center mb-12">
          Explora Nuestras Categorías
        </h2>
        <div className="relative">
          {/* Gradiente izquierdo */}
          {canScrollLeft && (
            <div className="pointer-events-none absolute left-0 top-0 h-full w-10 z-10 bg-gradient-to-r from-white/90 dark:from-gray-900/90 to-transparent" />
          )}
          {/* Gradiente derecho */}
          {canScrollRight && (
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 z-10 bg-gradient-to-l from-white/90 dark:from-gray-900/90 to-transparent" />
          )}
          {/* Flecha izquierda */}
          {canScrollLeft && (
            <button
              aria-label="Ver categorías anteriores"
              onClick={() => scroll("left")}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-black/90 rounded-full p-2.5 hover:bg-purple-100 dark:hover:bg-purple-800/40 transition-colors focus:outline-none"
            >
              <ArrowLeft className="h-6 w-6 text-purple-800 dark:text-purple-200" />
            </button>
          )}
          {/* Carrusel horizontal */}
          <div
            ref={scrollRef}
            className="flex gap-5 md:gap-7 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-1 py-2"
            style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
            tabIndex={0}
            aria-label="Carrusel de categorías"
          >
            {categories.map((category, index) => (
              <Link
                key={index}
                href={category.link}
                className="group block relative min-w-[75vw] max-w-[90vw] sm:min-w-[45vw] sm:max-w-[50vw] md:min-w-[28vw] md:max-w-[32vw] lg:min-w-[220px] lg:max-w-[260px] w-full snap-start overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 focus:outline-none"
                style={{ flex: "0 0 auto" }}
                tabIndex={0}
                aria-label={`Ver productos de la categoría ${category.name}`}
              >
                <div className="relative h-44 sm:h-56 md:h-60 w-full">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                  <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 drop-shadow-lg">{category.name}</h3>
                  <p className="mb-2 md:mb-4 text-white/90 text-sm md:text-base line-clamp-2 drop-shadow-md">{category.description}</p>
                  <div className="flex items-center text-white group-hover:text-purple-200 transition-colors text-sm md:text-base">
                    <span>Ver Productos</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {/* Flecha derecha */}
          {canScrollRight && (
            <button
              aria-label="Ver más categorías"
              onClick={() => scroll("right")}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-black/90 rounded-full p-2.5 hover:bg-purple-100 dark:hover:bg-purple-800/40 transition-colors focus:outline-none"
            >
              <ArrowRight className="h-6 w-6 text-purple-800 dark:text-purple-200" />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

// Utilidad para ocultar la barra de scroll en todos los navegadores
// Agrega esto a tu CSS global o tailwind.config.js:
// .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
// .scrollbar-hide::-webkit-scrollbar { display: none; }
