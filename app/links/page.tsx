import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Montserrat } from "next/font/google"
import { Instagram, Facebook, Youtube, MessageCircle, ShoppingBag, Mail, MapPin, Clock, Heart, ArrowUpRight } from "lucide-react"
import { EMAIL_PUBLICO, enlaceWhatsapp } from "@/lib/contacto"

/*
  Página del enlace de la bio (antes era un linktree aparte en
  mautik.vercel.app; ahora vive dentro de la tienda).

  Tipografía de los títulos: Montserrat (elegida por la marca en vez de
  Heading Now, que es comercial).
*/
const titular = Montserrat({ weight: ["400", "500"], subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "Mautik · Enlaces",
  description: "Crochet y bisutería hecha a mano en Panamá. Tienda, Instagram, WhatsApp y más.",
  alternates: { canonical: "/links" },
  openGraph: {
    title: "Mautik · Enlaces",
    description: "Crochet y bisutería hecha a mano en Panamá.",
    url: "/links",
  },
}

const redes = [
  { titulo: "Instagram", detalle: "@mautik_official", url: "https://www.instagram.com/mautik_official/", Icono: Instagram },
  { titulo: "WhatsApp", detalle: "Pedidos y consultas", url: enlaceWhatsapp("¡Hola Mautik! Vengo de Instagram y quería preguntar por "), Icono: MessageCircle },
  { titulo: "Facebook", detalle: "Comunidad", url: "https://www.facebook.com/Mautikofficial", Icono: Facebook },
  { titulo: "YouTube", detalle: "Tutoriales", url: "https://www.youtube.com/channel/UCgcupJB4BMMXZH8DAPLNNJg", Icono: Youtube },
]

const fotos = [
  { src: "/productos/mtk-cr-001.webp", alt: "Peluche de vaquita tejido a crochet" },
  { src: "/productos/mtk-cr-029.webp", alt: "Capibara tejida a crochet con accesorios" },
  { src: "/productos/mtk-ll-001.webp", alt: "Llavero de gatito tejido a crochet" },
  { src: "/productos/mtk-cr-013.webp", alt: "Husky tejido a crochet" },
]

export default function LinksPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1A0B3D] text-[#F3E8FF]">
      {/* Fondo: degradado morado con dos halos de luz */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#4C1D95_0%,#2E1065_45%,#1A0B3D_100%)]" />
        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="absolute bottom-0 -right-24 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#E9D5FF_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-12 sm:py-16">
        {/* Encabezado */}
        <header className="flex flex-col items-center text-center">
          <div className="relative">
            <div aria-hidden className="absolute inset-0 rounded-[28px] bg-fuchsia-400/40 blur-xl" />
            <Image
              src="/icon-512.png"
              alt="Logo de Mautik"
              width={104}
              height={104}
              priority
              className="relative rounded-[28px] ring-1 ring-white/20 shadow-2xl"
            />
          </div>

          <h1 className={`${titular.className} mt-5 text-4xl font-medium lowercase leading-none tracking-tight text-[#F0ABFC] sm:text-5xl`}>
            Mautik
          </h1>
          <p className="mt-3 text-sm font-medium uppercase tracking-[0.25em] text-violet-200/90">
            Crochet · Bisutería
          </p>
          <p className="mt-2 text-[15px] text-violet-100/75">Hecho a mano con amor desde Panamá</p>
        </header>

        {/* Enlace principal */}
        <Link
          href="/shop"
          className="group mt-9 flex items-center justify-between rounded-2xl bg-[#E9D5FF] px-5 py-4 text-[#2E1065] shadow-[0_10px_30px_-10px_rgba(233,213,255,0.6)] transition duration-300 hover:-translate-y-0.5 hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-300/60"
        >
          <span className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#2E1065] text-[#E9D5FF]">
              <ShoppingBag className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-left">
              <span className={`${titular.className} block text-base font-medium`}>Ver la tienda</span>
              <span className="block text-xs font-medium text-[#4C1D95]/80">Paga con Yappy o PayPal</span>
            </span>
          </span>
          <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </Link>

        {/* Redes */}
        <nav aria-label="Redes de Mautik" className="mt-3 grid gap-3">
          {redes.map(({ titulo, detalle, url, Icono }) => (
            <a
              key={titulo}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-2xl border border-white/15 bg-white/[0.07] px-5 py-3.5 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-violet-200/50 hover:bg-white/[0.12] focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-300/50"
            >
              <span className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-300/15 text-violet-100">
                  <Icono className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-left">
                  <span className="block font-semibold text-[#F3E8FF]">{titulo}</span>
                  <span className="block text-xs text-violet-200/70">{detalle}</span>
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-violet-200/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet-100" aria-hidden />
            </a>
          ))}
        </nav>

        {/* Muestra de productos */}
        <section aria-labelledby="hecho-a-mano" className="mt-10">
          <h2 id="hecho-a-mano" className={`${titular.className} text-center text-lg font-medium text-[#E9D5FF]`}>
            Nuestros diseños
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {fotos.map((f) => (
              <Link
                key={f.src}
                href="/shop"
                className="group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-white/15"
              >
                <Image
                  src={f.src}
                  alt={f.alt}
                  fill
                  sizes="(max-width: 448px) 50vw, 220px"
                  className="object-cover transition duration-500 group-hover:scale-110"
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Datos */}
        <section aria-label="Contacto" className="mt-8 grid grid-cols-3 gap-2 text-center text-[11px] text-violet-100/80 sm:text-xs">
          <a href={`mailto:${EMAIL_PUBLICO}`} className="flex flex-col items-center gap-1.5 rounded-xl bg-white/[0.05] px-2 py-3 hover:bg-white/[0.1]">
            <Mail className="h-4 w-4 text-fuchsia-200" aria-hidden />
            <span className="leading-tight">Escríbenos<br />por correo</span>
          </a>
          <div className="flex flex-col items-center gap-1.5 rounded-xl bg-white/[0.05] px-2 py-3">
            <MapPin className="h-4 w-4 text-fuchsia-200" aria-hidden />
            <span>La Chorrera, Panamá</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 rounded-xl bg-white/[0.05] px-2 py-3">
            <Clock className="h-4 w-4 text-fuchsia-200" aria-hidden />
            <span className="leading-tight">Lun a sáb<br />9 a. m. – 6 p. m.</span>
          </div>
        </section>

        <a
          href="https://paypal.me/estefanniii"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-fuchsia-300/30 px-5 py-3 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-300/10"
        >
          <Heart className="h-4 w-4" aria-hidden /> Apoya mi arte
        </a>

        <footer className="mt-auto pt-10 text-center text-xs text-violet-200/60">
          © {new Date().getFullYear()} Mautik · hecho a mano con amor
        </footer>
      </div>
    </div>
  )
}
