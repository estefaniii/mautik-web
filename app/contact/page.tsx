"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MapPin, Send, Instagram, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EMAIL_PUBLICO, MARCA, WHATSAPP, enlaceWhatsapp } from "@/lib/contacto"
import { PREGUNTAS_FRECUENTES, preguntasFrecuentes } from "@/lib/seo/structured-data"

/*
  El formulario ANTES no mandaba nada: hacía `await new Promise(setTimeout, 1000)`
  y sacaba un toast que decía "Mensaje enviado". O sea que cada persona que
  escribía se iba convencida de que Mautik había recibido su mensaje, y no
  llegaba a ningún lado.

  Ahora va por FormSubmit (formsubmit.co), que no necesita servidor propio:
  se le pega al endpoint AJAX con el correo de la marca y el mensaje llega al
  Gmail de Mautik. La primera vez que alguien envía, FormSubmit manda un correo
  de activación a mautik.official@gmail.com con un enlace que hay que tocar UNA
  vez; hasta entonces los mensajes quedan retenidos.
*/
const ENDPOINT = `https://formsubmit.co/ajax/${EMAIL_PUBLICO}`

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Trampa para bots: es un campo escondido, una persona nunca lo llena.
    const trampa = (e.currentTarget.elements.namedItem("_honey") as HTMLInputElement)?.value
    if (trampa) return

    setEnviando(true)
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          Nombre: formData.name,
          Correo: formData.email,
          Asunto: formData.subject,
          Mensaje: formData.message,
          // FormSubmit usa estos campos con guion bajo como configuración
          _subject: `Mautik · ${formData.subject || "Mensaje desde la web"}`,
          _replyto: formData.email,
          _template: "table",
          _captcha: "false",
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok || json?.success === "false") {
        throw new Error(json?.message || `El servicio devolvió ${res.status}`)
      }

      setEnviado(true)
      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch (error: any) {
      toast({
        title: "No se pudo enviar",
        description:
          `${error?.message || "Hubo un problema."} Escríbenos directo a ${EMAIL_PUBLICO} y te respondemos igual.`,
        variant: "destructive",
      })
    } finally {
      setEnviando(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-purple-900 dark:text-purple-200 mb-4">
            Contáctanos
          </h1>
          <p className="text-lg text-gray-700 dark:text-purple-100/80">
            ¿Tienes una pregunta o quieres un pedido personalizado? Escríbenos y te respondemos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Formulario */}
          <div className="rounded-3xl border border-purple-100 bg-card p-6 shadow-sm dark:border-white/10 sm:p-8">
            <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-200 mb-6">Envíanos un mensaje</h2>

            {enviado ? (
              <div className="flex flex-col items-center rounded-2xl bg-purple-50 px-6 py-12 text-center dark:bg-white/5">
                <CheckCircle2 className="mb-4 h-12 w-12 text-purple-700 dark:text-purple-300" />
                <h3 className="mb-2 text-xl font-semibold text-purple-900 dark:text-purple-100">
                  ¡Mensaje enviado!
                </h3>
                <p className="mb-6 text-sm text-gray-700 dark:text-purple-100/80">
                  Te respondemos al correo que dejaste, normalmente dentro del mismo día.
                </p>
                <Button variant="outline" className="rounded-full" onClick={() => setEnviado(false)}>
                  Escribir otro mensaje
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* honeypot: invisible para las personas, irresistible para los bots */}
                <input
                  type="text"
                  name="_honey"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute h-0 w-0 opacity-0"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-purple-100/80 mb-2">
                      Nombre completo
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-xl"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-purple-100/80 mb-2">
                      Correo electrónico
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-purple-100/80 mb-2">
                    Asunto
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full rounded-xl"
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-purple-100/80 mb-2">
                    Mensaje
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full min-h-[140px] rounded-2xl"
                    placeholder="Cuéntanos más detalles..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={enviando}
                  className="w-full rounded-full bg-purple-800 py-6 text-base hover:bg-purple-900"
                >
                  {enviando ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar mensaje
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Datos de contacto */}
          <div className="space-y-6">
            {/*
              WhatsApp, solo en esta página y como botón normal — nada de
              burbuja flotante siguiéndote por todo el sitio. Para un pedido
              personalizado es por lejos el canal más directo.
            */}
            <a
              href={enlaceWhatsapp()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-3xl bg-[#25D366] p-5 text-white shadow-sm transition-transform hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] sm:p-6"
            >
              <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-white/20">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.898 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-semibold">Escríbenos por WhatsApp</span>
                <span className="block text-sm text-white/90">
                  Es lo más rápido para pedidos personalizados · +{WHATSAPP}
                </span>
              </span>
            </a>

            <div className="rounded-3xl border border-purple-100 bg-card p-6 shadow-sm dark:border-white/10 sm:p-8">
              <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-200 mb-6">Información de contacto</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-purple-100 dark:bg-white/10">
                    <MapPin className="h-5 w-5 text-purple-800 dark:text-purple-300" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-purple-50">Ubicación</h3>
                    <p className="text-gray-600 dark:text-purple-100/70">
                      {MARCA.ciudad}, {MARCA.provincia}, {MARCA.pais}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-purple-100 dark:bg-white/10">
                    <Mail className="h-5 w-5 text-purple-800 dark:text-purple-300" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-purple-50">Email</h3>
                    <a
                      href={`mailto:${EMAIL_PUBLICO}`}
                      className="break-all text-gray-600 underline-offset-2 hover:underline dark:text-purple-100/70"
                    >
                      {EMAIL_PUBLICO}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-purple-100 dark:bg-white/10">
                    <Instagram className="h-5 w-5 text-purple-800 dark:text-purple-300" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-purple-50">Instagram</h3>
                    <a
                      href={MARCA.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 underline-offset-2 hover:underline dark:text-purple-100/70"
                    >
                      {MARCA.instagram}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-purple-100 bg-card p-6 shadow-sm dark:border-white/10 sm:p-8">
              <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-200 mb-6">Horarios de atención</h2>
              <div className="space-y-3">
                {[
                  ["Lunes - Viernes", "9:00 AM - 6:00 PM"],
                  ["Sábados", "9:00 AM - 4:00 PM"],
                  ["Domingos", "Cerrado"],
                ].map(([dia, hora]) => (
                  <div key={dia} className="flex items-center justify-between gap-4 border-b border-purple-100 pb-3 last:border-0 last:pb-0 dark:border-white/10">
                    <span className="text-gray-600 dark:text-purple-100/70">{dia}</span>
                    <span className="font-semibold text-gray-900 dark:text-purple-50">{hora}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/*
            Preguntas frecuentes.

            Estas seis preguntas ya existían, pero SOLO como dato para Google:
            se imprimían en el código de todas las páginas y no se veían en
            ninguna. Además de ser justo lo que Google pide no hacer, era una
            pena, porque responden lo que más se pregunta antes de comprar.
            Acá se ven, y el dato estructurado se declara junto a ellas.
          */}
          <section className="mx-auto mt-14 max-w-3xl">
            <h2 className="font-display mb-2 text-center text-3xl font-bold text-purple-900 dark:text-purple-100">
              Preguntas frecuentes
            </h2>
            <p className="mb-8 text-center text-gray-600 dark:text-purple-100/70">
              Lo que más nos preguntan antes de hacer un pedido.
            </p>

            <div className="divide-y divide-purple-100 overflow-hidden rounded-3xl border border-purple-100 bg-card dark:divide-white/10 dark:border-white/10">
              {PREGUNTAS_FRECUENTES.map((f) => (
                <details key={f.pregunta} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-medium text-purple-900 transition-colors hover:bg-purple-50 dark:text-purple-50 dark:hover:bg-white/5 sm:px-6">
                    {f.pregunta}
                    <span
                      aria-hidden
                      className="shrink-0 text-xl font-light text-purple-400 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="px-5 pb-5 text-gray-700 dark:text-purple-100/80 sm:px-6">
                    {f.respuesta}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(preguntasFrecuentes()) }}
          />
        </div>
      </div>
    </div>
  )
}
