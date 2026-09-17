"use client"

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Imagen con esqueleto de carga.
 *
 * Antes este componente montaba su propio IntersectionObserver para decidir
 * cuándo cargar la imagen. Tenía dos fallas que dejaban la grilla de productos
 * en blanco:
 *
 *   1. Si el observer no disparaba, el `<Image>` no se montaba nunca y la card
 *      quedaba con el esqueleto pulsando para siempre.
 *   2. La opacidad dependía de `onLoad`. Cuando la imagen venía de la caché
 *      terminaba de cargar ANTES de que React enganchara el handler, el evento
 *      `load` no disparaba y la imagen quedaba en `opacity: 0` — cargada pero
 *      invisible.
 *
 * Ahora el lazy loading lo hace `next/image` de forma nativa (`loading="lazy"`),
 * que es más confiable y no depende de JavaScript. El esqueleto solo cubre la
 * imagen mientras no esté lista.
 */

interface LazyImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
  [key: string]: any
}

export default function LazyImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  priority = false,
  sizes,
  onLoad,
  onError,
  fallbackSrc = '/placeholder.jpg',
  ...rest
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [reintento, setReintento] = useState(0)
  const [sinOptimizar, setSinOptimizar] = useState(false)
  const imgElRef = useRef<HTMLImageElement | null>(null)

  /*
    Un reintento antes de rendirse.

    Cada despliegue reemplaza los archivos de /public y cambia el hash `dpl_`
    de las URLs de /_next/image. Si alguien está mirando la tienda en ese
    momento, las peticiones que iban en vuelo fallan y la tarjeta se caía al
    placeholder morado de Mautik. No era un problema de las fotos —todas
    responden 200— sino del cambio de versión debajo de los pies del que está
    navegando. Con un reintento se
    resuelve solo.

    OJO con CÓMO se reintenta. La primera versión de esto le pegaba `?r=1` al
    src. Con `next/image` y una ruta local eso es un tiro en el pie: el
    optimizador rechaza cualquier `url` que traiga query y responde 400
    SIEMPRE. O sea que el reintento no podía funcionar nunca, y encima
    convertía un fallo pasajero en un placeholder permanente. Verificado en
    producción: `/_next/image?url=%2Fproductos%2Fmtk-ot-005.webp%3Fr%3D1` → 400,
    mientras la misma foto sin el `?r=1` daba 200.

    Ahora el src se deja intacto y lo que se cambia es la `key` del <Image>:
    React desmonta y vuelve a montar el <img>, el navegador pide la imagen de
    nuevo, y la URL que le llega al optimizador sigue siendo válida.
  */
  const srcActual = hasError ? fallbackSrc : src

  /** Marca como cargada una imagen que ya venía completa de la caché. */
  const revisarSiYaEstaCargada = (el: HTMLImageElement | null) => {
    if (el?.complete && el.naturalWidth > 0) setIsLoaded(true)
  }

  const registrarImg = (el: HTMLImageElement | null) => {
    imgElRef.current = el
    revisarSiYaEstaCargada(el)
  }

  // La fuente puede cambiar sobre un nodo que React reutiliza (por ejemplo al
  // caer al fallback), y en ese caso el ref no se vuelve a ejecutar.
  useEffect(() => {
    setIsLoaded(false)
    // El navegador puede resolverla de caché en el mismo tick.
    const t = setTimeout(() => revisarSiYaEstaCargada(imgElRef.current), 0)
    return () => clearTimeout(t)
  }, [srcActual, reintento, sinOptimizar])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  /*
    Escalera de recuperación, en este orden:

      1. Reintentar (remontando el <img>).
      2. Pedir la MISMA foto pero sin pasar por el optimizador de Next.
      3. Recién ahí, el fallback o avisarle a quien nos usa.

    El paso 2 es el que faltaba y el que de verdad hacía falta. `next/image`
    le agrega a la URL el parámetro `dpl_...`, que identifica el despliegue.
    Cuando se publica una versión nueva mientras alguien está mirando la
    tienda, el navegador sigue teniendo el bundle viejo y sigue pidiendo
    `/_next/image?...&dpl=<viejo>`, que ya no existe. El reintento pedía
    exactamente la misma URL vieja, fallaba igual, y la tarjeta se quedaba con
    el cartel de "sin foto" hasta recargar la página entera.

    El archivo en `/productos/xxx.webp` sí responde siempre, porque es un
    archivo estático sin parámetros. Pesa más que la versión optimizada, pero
    entre eso y no mostrar la foto, se muestra la foto.
  */
  const handleError = () => {
    if (reintento === 0 && !hasError && !sinOptimizar) {
      setReintento(1)
      return
    }
    if (!sinOptimizar && !hasError && src.startsWith('/')) {
      setSinOptimizar(true)
      return
    }
    if (!hasError && fallbackSrc) {
      setHasError(true)
      return
    }
    onError?.()
  }

  const estiloSkeleton = fill
    ? ({ position: 'absolute', inset: 0 } as React.CSSProperties)
    : ({ width: width || 100, height: height || 100, display: 'block' } as React.CSSProperties)

  if (!srcActual) {
    return <Skeleton style={estiloSkeleton} />
  }

  return (
    <div
      className={`relative${fill ? ' w-full h-full' : ''}`}
      role="img"
      aria-label={alt}
    >
      {!isLoaded && <Skeleton style={estiloSkeleton} />}
      <Image
        key={`${srcActual}#${reintento}#${sinOptimizar}`}
        ref={registrarImg}
        src={srcActual}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        unoptimized={sinOptimizar || undefined}
        // Sin priority, next/image usa loading="lazy" nativo del navegador.
        // Sin `sizes`, con `fill` Next sirve una resolución al azar; este
        // default cubre la grilla y lo sobreescribe quien pase su propio sizes.
        sizes={sizes || (fill ? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw' : undefined)}
        {...rest}
        {...(fill ? { fill } : { width, height })}
      />
    </div>
  )
}
