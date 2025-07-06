"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Mail } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const { toast } = useToast()

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (!email) {
        toast({
          title: "Error",
          description: "Por favor, ingresa tu correo electrónico.",
          variant: "destructive",
        })
        return
      }

      // Here you would typically send the email to your API
      toast({
        title: "¡Gracias por suscribirte!",
        description: "Recibirás nuestras novedades y ofertas especiales.",
      })

      setEmail("")
    },
    [email, toast],
  )

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }, [])

  return (
    <section className="bg-purple-100 dark:bg-gray-800 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Mail className="h-12 w-12 text-purple-800 dark:text-purple-300 mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold text-purple-900 dark:text-purple-200 mb-4">Suscríbete a Nuestro Boletín</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-8">
            Mantente al día con nuestras últimas colecciones, ofertas exclusivas y consejos de estilo.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={handleEmailChange}
              className="flex-grow"
            />
            <Button type="submit" className="bg-purple-800 hover:bg-purple-900">
              Suscribirse
            </Button>
          </form>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            No compartimos tu información. Puedes darte de baja en cualquier momento.
          </p>
        </div>
      </div>
    </section>
  )
}
