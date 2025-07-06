import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const lookbookCollections = [
  {
    id: 1,
    name: "Océano Panameño 2025",
    description:
      "Inspirada en las hermosas costas y mares de Panamá, esta colección captura la esencia de las aguas cristalinas y la diversidad marina del país.",
    coverImage:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lookbook-cover-kHe9fZGTKYhW8qoAxM5ysYJV5gQ3zZ.jpg",
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lookbook-1-F3EPWY72QiV91HYaMEFWEBfQxC1a1Z.jpg",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lookbook-2-uImKS1LIpupAJhVGJ1aUJ47nCNpMvD.jpg",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lookbook-3-EsUoRhNIvKdMrp8ygzZYXvB7EhkQUB.jpg",
    ],
  },
  {
    id: 2,
    name: "Artesanía Tradicional",
    description:
      "Un homenaje a las técnicas artesanales tradicionales de Panamá, combinando métodos ancestrales con un toque moderno y elegante.",
    coverImage:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/traditional-craft-pxmf4xHNdMnEXGQ2l5Xr6o8ZPZdHwT.jpg",
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/craft-1-SYMdSvoBHOoTYJvwRfbP9JrVORktmm.jpg",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/craft-2-AY9y8vjfSXhiGW49mQFOw9D6XhI42X.jpg",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/craft-3-IB8ssMK1J4xSgVfBQQWVNXeOgMV5VW.jpg",
    ],
  },
]

export default function LookbookPage() {
  return (
    <div className="bg-gradient-to-b from-purple-50 to-white min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-purple-900 mb-4">Lookbook Mautik</h1>
          <p className="text-lg text-gray-700">
            Explora nuestras colecciones y descubre la historia detrás de cada pieza artesanal.
          </p>
        </div>

        {/* Collections */}
        {lookbookCollections.map((collection) => (
          <div key={collection.id} className="mb-20">
            <div className="relative h-[50vh] rounded-xl overflow-hidden mb-8">
              <Image
                src={collection.coverImage || "/placeholder.svg"}
                alt={collection.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 to-transparent flex flex-col justify-end p-8">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">{collection.name}</h2>
                <p className="text-white/90 max-w-2xl mb-6">{collection.description}</p>
                <Link href={`/shop?collection=${collection.id}`}>
                  <Button className="bg-white text-purple-900 hover:bg-purple-100 dark:bg-gray-700 dark:text-purple-200 dark:hover:bg-gray-600">
                    Explorar Colección <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {collection.images.map((image, index) => (
                <div key={index} className="relative h-80 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${collection.name} - Imagen ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* CTA Section */}
        <div className="bg-purple-100 rounded-xl p-8 text-center mt-12">
          <h3 className="font-display text-2xl font-bold text-purple-900 mb-3">¿Te inspira nuestra colección?</h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Visita nuestra tienda para descubrir todas las piezas artesanales que tenemos disponibles para ti.
          </p>
          <Link href="/shop">
            <Button size="lg" className="bg-purple-800 hover:bg-purple-900 dark:bg-gray-700 dark:text-purple-200 dark:hover:bg-gray-600">
              Visitar Tienda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
