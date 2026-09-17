"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import LazyImage from '@/components/ui/lazy-image'
import { ShoppingCart, Star, Image as ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/types/product"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast()
  const { addToCart } = useCart()
  const [imageError, setImageError] = useState(false)

  const productId = product.id

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addToCart({
      ...product,
      quantity: 1,
      stock: product.stock,
      attributes: product.attributes || [],
    })

    toast({
      title: "Producto añadido",
      description: `${product.name} se ha añadido a tu carrito.`,
    })
  }


  const handleImageError = () => {
    setImageError(true)
  }

  const getProductImage = () => {
    if (imageError || !product.images || product.images.length === 0) {
      return "/placeholder.jpg"
    }

    const primera = product.images[0]
    if (!primera || typeof primera !== "string" || primera.trim() === "") {
      return "/placeholder.jpg"
    }

    const ruta = primera.trim()

    /*
      Acá había un bug que dejaba la tienda entera sin fotos.

      La validación era `new URL(ruta)` dentro de un try/catch: si tiraba
      error, se devolvía el placeholder. Pero las fotos de los productos se
      guardan como rutas relativas ("/productos/mtk-an-004.webp"), y
      `new URL()` sin base tira error con cualquier ruta relativa. O sea: la
      validación descartaba justamente las rutas buenas y TODAS las tarjetas
      mostraban el placeholder de Mautik. Verificado en la base: los 58
      productos guardan la ruta relativa.

      Una ruta que arranca con "/" es válida y es el caso normal. Para las
      absolutas (si algún día se sube a un CDN) se sigue validando de verdad,
      y solo se aceptan http/https.
    */
    if (ruta.startsWith("/")) return ruta

    try {
      const u = new URL(ruta)
      return u.protocol === "http:" || u.protocol === "https:"
        ? ruta
        : "/placeholder.jpg"
    } catch {
      return "/placeholder.jpg"
    }
  }

  /**
   * La segunda foto del producto, si tiene.
   *
   * Muchas publicaciones tienen más de una imagen y hasta ahora la segunda
   * solo se veía entrando a la ficha. Acá se precarga debajo de la primera y
   * aparece al pasar el mouse (y en el celular, donde no hay hover, se sigue
   * viendo la primera y las demás quedan en la ficha).
   */
  const segundaFoto = () => {
    if (imageError || !product.images || product.images.length < 2) return null
    const s = product.images[1]
    if (typeof s !== "string" || !s.trim()) return null
    const ruta = s.trim()
    if (ruta.startsWith("/")) return ruta
    try {
      const u = new URL(ruta)
      return u.protocol === "http:" || u.protocol === "https:" ? ruta : null
    } catch {
      return null
    }
  }

  const renderImagePlaceholder = () => (
    <div className="w-full h-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
      <div className="text-center">
        <ImageIcon size={48} className="text-purple-400 dark:text-purple-500 mx-auto mb-2" />
        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
          {product.name}
        </p>
      </div>
    </div>
  )

  const precioFinal = product.price * (1 - (product.discount ?? 0) / 100)
  const agotado = product.stock === 0
  const categoria = (product.category || "").trim()
  const etiqueta = categoria ? categoria.charAt(0).toUpperCase() + categoria.slice(1).toLowerCase() : null

  /*
    Tarjeta al estilo de las referencias que pasó Estéfani (apps de viaje):
    la foto ocupa toda la tarjeta y el nombre, el precio y las etiquetas van
    ENCIMA de la foto, sobre un degradado oscuro. Abajo, una franja con el
    botón de añadir.

    Dos cosas que además arregla, no son solo estética:

    1. El botón "Añadir" estaba con `opacity-0 group-hover:opacity-100`. En el
       celular no hay hover, así que NUNCA aparecía: para agregar algo al
       carrito había que entrar a la ficha. Ahora está siempre visible.
    2. La descripción se leía en gris claro sobre blanco a 12px. Ahora va en
       blanco sobre el degradado, que contrasta mucho mejor.
  */
  /*
    La superficie usa el token `bg-card` del tema, no `dark:bg-card`.

    gray-900 es un gris AZULADO (tono 221) y todo el modo oscuro de Mautik
    cuelga del morado (tono 265): las tarjetas se veían de otra familia que el
    fondo, que es justo lo que hacía ver el modo oscuro sucio. `bg-card` es la
    misma superficie que usa el resto de la app.

    El canto también va en morado: con `ring-white/10` la tarjeta no tenía
    borde visible y se fundía con el fondo.
  */
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-card shadow-[0_2px_12px_rgba(24,10,48,0.08)] ring-1 ring-purple-100/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(24,10,48,0.16)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.5)] dark:ring-purple-300/15 dark:hover:ring-purple-300/30">
      {/*
        El hueco de la foto lleva su propio fondo.

        Estéfani mandó capturas con una franja azul oscura entre la foto y el
        texto. Pasa cuando la foto todavía no pintó (o falla): abajo quedaba el
        degradado negro sobre un hueco transparente y se leía como una banda
        maciza de otro color. Con `bg-card` el hueco es del mismo color que la
        tarjeta y, si algo falta, no se nota como error.
      */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-card">
        <Link href={`/product/${productId}`} className="absolute inset-0 block" aria-label={product.name}>
          {imageError ? (
            renderImagePlaceholder()
          ) : (
            <LazyImage
              src={getProductImage()}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              onError={handleImageError}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={false}
              /*
                Sin fallbackSrc a propósito: si la foto falla, la tarjeta
                muestra su propio aviso con el nombre del producto
                (renderImagePlaceholder), no la tarjeta morada de "MAUTIK
                hecho a mano", que parecía un producto sin foto.
              */
              fallbackSrc=""
            />
          )}

          {/*
            La opacidad se controla desde este div, no desde la imagen:
            LazyImage le agrega su propio `opacity-100` al cargar y pisaba el
            `opacity-0` puesto en la imagen.

            El cambio a la segunda foto espera 2 segundos: `group-hover` pone
            `delay-[2000ms]` al entrar el cursor, y la clase base tiene
            `delay-0` para que al salir vuelva de inmediato. Sin el retardo, la
            foto cambiaba con solo pasar el mouse de largo camino al botón, y
            daba la sensación de que la tarjeta parpadeaba.
          */}
          {segundaFoto() && (
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity delay-0 duration-500 group-hover:opacity-100 group-hover:delay-[2000ms]">
              <LazyImage
                src={segundaFoto() as string}
                alt={`${product.name}, segunda vista`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={false}
                /*
                Sin fallbackSrc a propósito: si la foto falla, la tarjeta
                muestra su propio aviso con el nombre del producto
                (renderImagePlaceholder), no la tarjeta morada de "MAUTIK
                hecho a mano", que parecía un producto sin foto.
              */
              fallbackSrc=""
              />
            </div>
          )}

        </Link>

        {/*
          El carrito va acá, en la esquina, donde antes estaba el corazón: un
          solo gesto y sin una barra grande comiéndose la tarjeta. Queda fuera
          del <Link> para que tocarlo agregue al carrito y no abra la ficha.
        */}
        <button
          onClick={handleAddToCart}
          disabled={agotado}
          title={agotado ? "Agotado" : "Añadir al carrito"}
          aria-label={agotado ? `${product.name}: agotado` : `Añadir ${product.name} al carrito`}
          className="absolute right-2 top-2 z-20 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-purple-900 shadow-md backdrop-blur transition hover:scale-105 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 sm:right-3 sm:top-3 sm:h-10 sm:w-10 dark:bg-purple-950/85 dark:text-purple-50 dark:hover:bg-purple-950"
        >
          <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>

        {/* Insignias */}
        {/*
          Insignias.

          En el teléfono ocupaban casi la mitad del ancho de la tarjeta: con
          dos columnas la tarjeta mide unos 175px y "Nuevo" con su estrella se
          comía 65 de esos. Ahora la letra, el relleno y la estrella bajan de
          tamaño en pantalla chica y vuelven al normal desde `sm`.
        */}
        <div className="pointer-events-none absolute left-2 top-2 z-20 flex flex-col items-start gap-1 sm:left-3 sm:top-3 sm:gap-1.5">
          {(product.discount ?? 0) > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm sm:px-2.5 sm:py-1 sm:text-[11px]">
              -{product.discount}%
            </span>
          )}
          {product.isNew && (
            <span className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-purple-900 shadow-sm sm:px-2.5 sm:py-1 sm:text-[11px]">
              <Star className="h-2.5 w-2.5 fill-current sm:h-3 sm:w-3" /> Nuevo
            </span>
          )}
          {agotado && (
            <span className="rounded-full bg-gray-900/85 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm sm:px-2.5 sm:py-1 sm:text-[11px]">
              Agotado
            </span>
          )}
        </div>


      </div>

      {/*
        Nombre, precio, descripción, etiquetas y botón: TODO sobre la
        superficie de la tarjeta, ya no encima de la foto.

        Las referencias ponen el texto sobre la imagen porque son paisajes
        oscuros. Las fotos de Mautik son de satén blanco, y para que el texto
        blanco se leyera hacía falta un degradado negro que, en modo oscuro, se
        veía como una franja azul maciza tapando media foto (Estéfani lo pasó
        en dos capturas; muestreé la imagen y el problema no era la foto, era
        mi degradado). Sin el degradado la foto se ve completa y limpia, y el
        texto se lee perfecto donde tiene contraste de verdad.

        Lo que sí se queda de la referencia: el precio en pastilla al lado del
        nombre.
      */}
      {/*
        En el teléfono el nombre y el precio iban en la MISMA línea, y con dos
        columnas de 175px la pastilla del precio se comía la mitad: los nombres
        salían cortados a la tercera palabra ("Cartera crema…", "Anillos con
        diseño…"). Desde `sm` hay sitio de sobra y vuelven a ir lado a lado.
      */}
      <div className="mt-auto flex flex-col gap-2 p-3">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-gray-900 dark:text-purple-50 sm:text-base">
            {product.name}
          </h3>
          <div className="flex shrink-0 items-baseline gap-2 sm:block sm:text-right">
            <span className="inline-block rounded-full bg-purple-900 px-2.5 py-1 text-sm font-bold text-white dark:bg-purple-400/25 dark:text-white">
              ${precioFinal.toFixed(2)}
            </span>
            {(product.discount ?? 0) > 0 && (
              <p className="text-[11px] text-gray-400 line-through dark:text-purple-100/50 sm:mt-0.5">
                ${product.price.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <p className="line-clamp-2 text-[11px] leading-snug text-gray-600 dark:text-purple-100/85 sm:text-xs">
          {product.description}
        </p>

        {/*
          Sin la etiqueta "Hecho a mano".

          Estaba en TODAS las tarjetas, y como todo lo que vende Mautik es
          hecho a mano, no distinguía nada: era una palabra repetida 68 veces
          que además se llevaba una línea entera en el teléfono. Que la tienda
          es artesanal ya lo dicen el hero, la portada y el pie.
        */}
        {etiqueta && (
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-900 dark:bg-purple-400/20 dark:text-purple-50">
              {etiqueta}
            </span>
          </div>
        )}

      </div>
    </article>
  )
}
