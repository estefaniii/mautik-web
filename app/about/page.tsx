import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Diamond, Heart, Gem, Award, Users, Clock } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-purple-900/10 dark:bg-purple-400/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-purple-900 dark:text-purple-200">
              Nuestra Historia
            </h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8">
              Descubre la pasión y dedicación detrás de cada pieza artesanal de Mautik
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cori-burns-dupe-BwA7D9ffMMqY1FgvwL2nTs4Df7wj3b.jpeg"
                  alt="Artesanos trabajando"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="font-display text-3xl font-bold text-purple-900 dark:text-purple-200 mb-6">
                Nacidos de la Pasión por lo Artesanal
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Mautik nació en 2021 de la mano de Estéfani Torres, una apasionada artesana que comenzó creando pulseras
                de hilos, alambre, peluches de crochet y accesorios únicos.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Lo que comenzó como un pequeño proyecto en La Chorrera, Panamá, rápidamente se convirtió en un referente
                de la joyería artesanal y accesorios hechos a mano, gracias a la dedicación por la calidad y el detalle
                en cada pieza.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Hoy, Mautik ofrece una variedad de productos artesanales que reflejan la creatividad y el amor por el
                arte manual, manteniendo la esencia panameña en cada creación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-purple-900 dark:text-purple-200 mb-4">Nuestros Valores</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Estos principios guían cada aspecto de nuestro trabajo y nos ayudan a crear productos excepcionales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-purple-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 dark:bg-purple-900/50 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Heart className="text-purple-800 dark:text-purple-300 h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-200 mb-2">Pasión</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Amamos lo que hacemos y ponemos nuestro corazón en cada pieza que creamos, desde el diseño inicial hasta
                el producto final.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 dark:bg-purple-900/50 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Gem className="text-purple-800 dark:text-purple-300 h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-200 mb-2">Calidad</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Utilizamos los mejores materiales y técnicas artesanales para garantizar que cada producto sea duradero
                y hermoso.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 dark:bg-purple-900/50 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Award className="text-purple-800 dark:text-purple-300 h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-200 mb-2">Autenticidad</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Cada pieza es única y refleja nuestra identidad cultural y artística, manteniendo vivas las tradiciones
                artesanales panameñas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-purple-900 dark:text-purple-200 mb-4">Nuestro Proceso Creativo</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Descubre cómo transformamos ideas en piezas únicas a través de un proceso artesanal cuidadoso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Diamond className="text-purple-800 dark:text-purple-300 h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-2">Diseño</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Todo comienza con una idea que se transforma en bocetos detallados y prototipos.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-purple-800 dark:text-purple-300 h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-2">Selección</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Elegimos cuidadosamente los mejores materiales de Panamá para cada pieza, priorizando calidad y
                sostenibilidad.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-purple-800 dark:text-purple-300 h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-2">Creación</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Trabajamos meticulosamente en cada detalle, dedicando el tiempo necesario para la perfección.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-purple-800 dark:text-purple-300 h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-2">Calidad</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Cada pieza pasa por un riguroso control de calidad antes de llegar a tus manos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-purple-900 dark:text-purple-200 mb-4">Nuestra Creadora</h2>
            <p className="text-gray-700 dark:text-gray-300">Conoce a la persona apasionada que hace posible Mautik.</p>
          </div>

          <div className="max-w-md mx-auto text-center">
            <div className="relative h-64 w-64 rounded-full overflow-hidden mx-auto mb-4">
              <Image src="/placeholder-user.jpg" alt="Estéfani Torres - Fundadora" fill className="object-cover" />
            </div>
            <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-200 mb-1">Estéfani Torres</h3>
            <p className="text-purple-600 dark:text-purple-300 mb-3">Fundadora y Diseñadora Principal</p>
            <p className="text-gray-700 dark:text-gray-300">
              Estéfani comenzó su viaje artesanal en 2021 creando pulseras de hilos y alambre, expandiéndose luego a
              peluches de crochet y diversos accesorios. Su pasión por el arte manual y el detalle se refleja en cada
              pieza única de Mautik.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-purple-100 dark:bg-gray-700">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold text-purple-900 dark:text-purple-200 mb-6">Descubre Nuestras Creaciones</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              Cada pieza cuenta una historia. Encuentra la tuya en nuestra colección de productos artesanales.
            </p>
            <Link href="/shop">
              <Button size="lg" className="bg-purple-800 hover:bg-purple-900 text-lg px-8">
                Explorar Tienda
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
