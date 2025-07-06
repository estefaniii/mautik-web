import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

const categories = [
  {
    name: "Joyería",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jewelry-category-QUKILQx3QBULPGZeznexdmJXqPwdP7.jpg",
    link: "/shop?category=Anillos,Collares,Pulseras,Aretes",
    description: "Descubre nuestra colección de joyería artesanal",
  },
  {
    name: "Crochet",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/crochet-category.jpg",
    link: "/shop?category=Crochet",
    description: "Artesanías únicas hechas a mano con crochet",
  },
  {
    name: "Peluches",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/plush-toys-Zzh5Kp8E4vRXZXdXc07DNcYxbVzWc0.jpg",
    link: "/shop?category=Peluches",
    description: "Adorables peluches para todas las edades",
  },
  {
    name: "Llaveros",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/keychain-1avERJBjLm9Nt2ETHxdpnW3hLTiVL5.jpg",
    link: "/shop?category=Llaveros",
    description: "Llaveros únicos para tu día a día",
  },
]

export function CategoryShowcase() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-purple-900 dark:text-purple-200 text-center mb-12">
          Explora Nuestras Categorías
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={category.link}
              className="group block relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-80 w-full">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                <p className="mb-4 text-white/90">{category.description}</p>
                <div className="flex items-center text-white group-hover:text-purple-200 transition-colors">
                  <span>Ver Productos</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
