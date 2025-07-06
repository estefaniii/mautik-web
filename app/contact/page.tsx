"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Mensaje enviado",
      description: "Gracias por contactarnos. Te responderemos pronto.",
    })

    setFormData({ name: "", email: "", subject: "", message: "" })
    setIsSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-purple-900 dark:text-purple-200 mb-4">Contáctanos</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            ¿Tienes alguna pregunta o quieres hacer un pedido personalizado? Estamos aquí para ayudarte.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-200 mb-6">Envíanos un mensaje</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre completo
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Correo electrónico
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Asunto
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mensaje
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full min-h-[120px]"
                  placeholder="Cuéntanos más detalles..."
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-800 hover:bg-purple-900"
              >
                {isSubmitting ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar mensaje
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-200 mb-6">Información de contacto</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="mr-3 h-6 w-6 text-purple-800 dark:text-purple-300 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Ubicación</h3>
                    <p className="text-gray-600 dark:text-gray-400">La Chorrera, Panama Oeste, Panamá</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-3 h-6 w-6 text-purple-800 dark:text-purple-300" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Teléfono</h3>
                    <p className="text-gray-600 dark:text-gray-400">+507 6778 2931</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-3 h-6 w-6 text-purple-800 dark:text-purple-300" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Email</h3>
                    <p className="text-gray-600 dark:text-gray-400">mautik.official@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-200 mb-6">Horarios de atención</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Lunes - Viernes</span>
                  <span className="font-semibold dark:text-gray-100">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sábados</span>
                  <span className="font-semibold dark:text-gray-100">9:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Domingos</span>
                  <span className="font-semibold dark:text-gray-100">Cerrado</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-100 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-3">¿Necesitas ayuda rápida?</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Para consultas urgentes o pedidos especiales, puedes contactarnos directamente por WhatsApp.
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Phone className="mr-2 h-4 w-4" />
                Contactar por WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
