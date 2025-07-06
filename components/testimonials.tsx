"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    id: 1,
    name: "María González",
    role: "Cliente Frecuente",
    image: "/images/testimonial-1.jpg",
    content:
      "Los productos de Mautik son simplemente hermosos. La calidad es excepcional y cada pieza tiene un toque único. Mi anillo de plata con zafiro siempre recibe cumplidos.",
  },
  {
    id: 2,
    name: "Carlos Ramírez",
    role: "Comprador Reciente",
    image: "/images/testimonial-2.jpg",
    content:
      "Compré un peluche unicornio para mi hija y está encantada. Los detalles son preciosos y la calidad del material es excelente. Definitivamente volveré a comprar.",
  },
  {
    id: 3,
    name: "Laura Mendoza",
    role: "Coleccionista",
    image: "/images/testimonial-3.jpg",
    content:
      "Como coleccionista de joyería artesanal, puedo decir que Mautik ofrece piezas verdaderamente únicas. El servicio al cliente también es excepcional.",
  },
]

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  const nextTestimonial = useCallback(() => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }, [])

  const prevTestimonial = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }, [])

  const goToTestimonial = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-purple-900 mb-4">Lo Que Dicen Nuestros Clientes</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nos enorgullece la satisfacción de nuestros clientes. Estas son algunas de sus experiencias con nuestros
            productos.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="bg-purple-50 rounded-lg p-8 md:p-12 shadow-md">
            <Quote className="h-12 w-12 text-purple-300 mb-6" />

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden">
                <Image
                  src={testimonials[activeIndex].image || "/placeholder.svg"}
                  alt={testimonials[activeIndex].name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <p className="text-gray-700 text-lg italic mb-6">"{testimonials[activeIndex].content}"</p>
                <h4 className="font-semibold text-purple-900 text-lg">{testimonials[activeIndex].name}</h4>
                <p className="text-gray-600">{testimonials[activeIndex].role}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8 gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full border-purple-300 text-purple-800 hover:bg-purple-100 hover:text-purple-900"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`h-3 w-3 rounded-full ${index === activeIndex ? "bg-purple-800" : "bg-purple-200"}`}
                aria-label={`Ver testimonio ${index + 1}`}
              />
            ))}

            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full border-purple-300 text-purple-800 hover:bg-purple-100 hover:text-purple-900"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
