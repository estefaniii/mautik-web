import Link from "next/link"
import Image from "next/image"
import { Instagram, Mail, MapPin, MessageCircle, Truck, CreditCard, Heart } from "lucide-react"
import { EMAIL_PUBLICO, MARCA, WHATSAPP, enlaceWhatsapp } from "@/lib/contacto"

/*
  Pie de página.

  El fondo lo pinta el <footer> mismo, no un <div> absoluto encima: así
  cualquier herramienta que mida contraste lee el texto claro sobre el morado
  que se ve de verdad, y no sobre el blanco de la página.

  Cambios de esta pasada:
   · Se importaban `Input`, `Button` y seis iconos de lucide que no se usaban
     en ninguna parte del archivo (los iconos estaban escritos a mano como SVG
     dentro del JSX). Eran peso muerto en el paquete.
   · El lema decía que Mautik "selecciona" productos: es el texto de la
     plantilla. Acá no se selecciona nada, se teje.
   · El correo y la ciudad estaban escritos a mano; ahora salen de
     `lib/contacto`, que es de donde los toman los correos y el formulario.
   · Se agregó la franja de confianza (envíos, pago, hecho a mano), que es lo
     que una clienta busca abajo del todo antes de decidirse.
*/

const ENLACES = [
  { titulo: "Tienda", enlaces: [
    { texto: "Todo el catálogo", href: "/shop" },
    { texto: "Crochet", href: "/shop/crochet" },
    { texto: "Pulseras", href: "/shop/pulseras" },
    { texto: "Llaveros", href: "/shop/llaveros" },
    { texto: "Collares", href: "/shop/collares" },
    { texto: "Anillos", href: "/shop/anillos" },
    { texto: "Aretes", href: "/shop/aretes" },
    { texto: "Otros tejidos", href: "/shop/otros" },
  ] },
  { titulo: "Mautik", enlaces: [
    { texto: "Nuestra historia", href: "/about" },
    { texto: "Lookbook", href: "/lookbook" },
    { texto: "Contacto", href: "/contact" },
    { texto: "Pedidos personalizados", href: "/contact" },
  ] },
]

const CONFIANZA = [
  { icono: Truck, texto: "Envíos a todo Panamá" },
  { icono: CreditCard, texto: "Pago seguro con PayPal" },
  { icono: Heart, texto: "Tejido a mano en La Chorrera" },
]

export default function Footer() {
  return (
    <footer id="footer" role="contentinfo" className="relative overflow-hidden bg-purple-950 dark:bg-[hsl(265_30%_9%)]">
      {/* Textura de puntos, solo en modo oscuro */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-700 dark:opacity-100"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Franja de confianza ───────────────────────────────────────── */}
      {/*
        Los tres iban con `justify-start`, o sea pegados al borde izquierdo de
        su columna. Como los textos miden distinto ("Envíos a todo Panamá" y
        "Tejido a mano en La Chorrera" no se parecen en largo), cada uno
        arrancaba en un sitio y el conjunto se veía torcido, con un hueco
        enorme en el medio.

        Ahora cada uno va centrado en su tercio y las separaciones son
        iguales. El `max-w-5xl` evita que en una pantalla muy ancha se
        despeguen tanto que dejen de leerse como un grupo.
      */}
      <div className="relative z-10 border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3 sm:gap-6 sm:divide-x sm:divide-white/10">
            {CONFIANZA.map(({ icono: Icono, texto }) => (
              <div
                key={texto}
                className="flex items-center justify-center gap-2.5 text-center text-sm text-purple-100/90"
              >
                <Icono className="h-5 w-5 shrink-0 text-purple-300" />
                <span>{texto}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4 py-12 sm:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Marca */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              {/* Mismo lockup que el encabezado: la marca (la M tejida) + la palabra. */}
              <Image
                src="/logo-marca.png"
                alt="Mautik"
                width={44}
                height={44}
                className="h-11 w-11 rounded-xl"
              />
              <span className="text-xl font-bold text-purple-100">{MARCA.nombre}</span>
            </div>
            <p className="mb-5 max-w-sm text-sm leading-relaxed text-purple-100/70">
              Peluches, llaveros y bisutería tejidos y armados a mano, pieza por
              pieza, en {MARCA.ciudad}. No hay dos iguales.
            </p>
            <div className="flex gap-2">
              <a
                href={MARCA.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-purple-100/70 transition-colors hover:bg-white/10 hover:text-purple-200"
                aria-label="Mautik en Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href={MARCA.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-purple-100/70 transition-colors hover:bg-white/10 hover:text-purple-200"
                aria-label="Mautik en Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/channel/UCgcupJB4BMMXZH8DAPLNNJg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-purple-100/70 transition-colors hover:bg-white/10 hover:text-purple-200"
                aria-label="Mautik en YouTube"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/*
            Las páginas /shop/<categoría> estaban en el sitemap pero ningún
            enlace del sitio llevaba a ellas. Desde acá quedan enlazadas en
            todas las páginas.
          */}
          {ENLACES.map((col) => (
            <div key={col.titulo}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-purple-200">
                {col.titulo}
              </h3>
              <ul className="space-y-2.5">
                {col.enlaces.map((e) => (
                  <li key={e.texto}>
                    <Link
                      href={e.href}
                      className="text-sm text-purple-100/75 transition-colors hover:text-white"
                    >
                      {e.texto}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contacto */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-purple-200">
              Contacto
            </h3>
            <ul className="space-y-3 text-sm text-purple-100/75">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-purple-300" />
                {MARCA.ciudad}, {MARCA.provincia}, {MARCA.pais}
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-purple-300" />
                <a href={`mailto:${EMAIL_PUBLICO}`} className="break-all transition-colors hover:text-white">
                  {EMAIL_PUBLICO}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-purple-300" />
                <a
                  href={MARCA.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  {MARCA.instagram}
                </a>
              </li>
              {/*
                El WhatsApp ya estaba en `lib/contacto` y solo se usaba en la
                página de contacto. Es por donde entran de verdad los pedidos
                personalizados, así que ahora está en todas las páginas.
              */}
              <li className="flex items-start gap-2.5">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-purple-300" />
                <a
                  href={enlaceWhatsapp()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  +{WHATSAPP}
                </a>
              </li>
            </ul>
            <Link
              href="/contact"
              className="mt-5 inline-flex items-center rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Escríbenos
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-7 sm:flex-row">
          <p className="text-sm text-purple-100/70">
            © {new Date().getFullYear()} {MARCA.nombre}. Hecho a mano en {MARCA.pais}.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy-policy"
              className="text-sm text-purple-100/70 transition-colors hover:text-white hover:underline"
            >
              Política de privacidad
            </Link>
            <Link
              href="/terms-of-service"
              className="text-sm text-purple-100/70 transition-colors hover:text-white hover:underline"
            >
              Términos de servicio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
