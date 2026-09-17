"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

/**
 * Fondo del hero: las fotos propias de Estéfani sobre el arbusto florido,
 * cambiando con un fundido cada 5 segundos.
 *
 * Detalles que importan:
 *  · Solo la primera lleva `priority`: es el LCP de la portada. Si todas
 *    llevaran prioridad, competirían entre ellas y la primera tardaría más.
 *  · Las otras tres se precargan igual (están en el DOM desde el principio con
 *    opacidad 0), así el cambio no muestra un hueco en la primera vuelta.
 *  · Si el sistema pide menos animación (`prefers-reduced-motion`), se queda
 *    quieta en la primera. Hay gente a la que el movimiento automático le
 *    marea, y un fondo que cambia solo es exactamente eso.
 *  · Cuando la pestaña no está a la vista se detiene: si no, al volver se
 *    encuentra un salto de varias imágenes de golpe.
 */

export interface FotoHero {
  src: string
  alt: string
}

const INTERVALO = 5000

export default function HeroCarrusel({ fotos }: { fotos: FotoHero[] }) {
  const [actual, setActual] = useState(0)

  useEffect(() => {
    if (fotos.length < 2) return

    const menosMovimiento =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (menosMovimiento) return

    let id: ReturnType<typeof setInterval> | null = null

    const arrancar = () => {
      if (id) return
      id = setInterval(() => setActual((i) => (i + 1) % fotos.length), INTERVALO)
    }
    const parar = () => {
      if (id) clearInterval(id)
      id = null
    }

    const alCambiarVisibilidad = () =>
      document.hidden ? parar() : arrancar()

    arrancar()
    document.addEventListener("visibilitychange", alCambiarVisibilidad)
    return () => {
      parar()
      document.removeEventListener("visibilitychange", alCambiarVisibilidad)
    }
  }, [fotos.length])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {fotos.map((foto, i) => (
        <Image
          key={foto.src}
          src={foto.src}
          alt={i === 0 ? foto.alt : ""}
          // Las que no son la primera son decoración: nombrarlas todas le
          // repetiría lo mismo cuatro veces a un lector de pantalla.
          aria-hidden={i !== 0}
          fill
          sizes="100vw"
          /*
            El encuadre cambia con la pantalla. En vertical la pieza queda
            arriba (`object-top`), que es donde hay foto libre: si se centra,
            el texto —que en móvil se apoya abajo— le cae justo encima.
          */
          className={`object-cover object-top sm:object-center [transition:opacity_1000ms_ease-in-out,transform_7000ms_ease-out] ${
            i === actual ? "opacity-100 motion-safe:scale-105" : "opacity-0 scale-100"
          }`}
          priority={i === 0}
          fetchPriority={i === 0 ? "high" : "auto"}
        />
      ))}
      {/*
        El velo.

        Antes era uno solo, lateral, pensado para escritorio. En móvil el texto
        no está a la izquierda sino abajo, así que ese degradado no tapaba nada
        donde hacía falta y, sumado al bloque de texto, dejaba la foto invisible.

        Ahora son dos: de abajo hacia arriba en móvil (el texto se apoya en el
        borde y la mitad de arriba de la foto respira) y de lado desde sm.
      */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/15 sm:bg-gradient-to-r sm:from-black/80 sm:via-black/40 sm:to-black/5" />
      {/* Sombra bajo la barra de navegación, para que se lea sobre la foto. */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent sm:hidden" />
    </div>
  )
}
