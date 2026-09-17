"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

/**
 * Fila de filtros rápidos por categoría, al estilo de las tiendas grandes
 * (Pandora, Zara): las categorías más usadas quedan a un clic, sin abrir el
 * panel de filtros. En móvil scrollea horizontal.
 *
 * Las cuentas salen de los productos reales, no de una lista fija, así que si
 * una categoría se queda sin stock deja de ocupar espacio.
 */

/** Orden y etiquetas: coincide con las categorías canónicas (minúscula). */
const CATEGORIAS: Array<{ slug: string; etiqueta: string }> = [
  { slug: "crochet", etiqueta: "Crochet" },
  { slug: "llaveros", etiqueta: "Llaveros" },
  { slug: "pulseras", etiqueta: "Pulseras" },
  { slug: "collares", etiqueta: "Collares" },
  { slug: "anillos", etiqueta: "Anillos" },
  { slug: "aretes", etiqueta: "Aretes" },
  { slug: "otros", etiqueta: "Otros" },
]

interface Props {
  /** slug activo, o null para "Todo" */
  activa?: string | null
  className?: string
}

export default function CategoryChips({ activa = null, className = "" }: Props) {
  const parametros = useSearchParams()
  const [cuentas, setCuentas] = useState<Record<string, number>>({})
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    let cancelado = false

    fetch("/api/products?limit=500")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: Array<{ category?: string }>) => {
        if (cancelado || !Array.isArray(data)) return
        const acc: Record<string, number> = {}
        for (const p of data) {
          // La base tiene categorías con mayúscula mezclada ("Pulseras" y
          // "pulseras"), así que normalizamos para no contar doble.
          const slug = (p.category || "").toLowerCase().trim()
          if (!slug) continue
          acc[slug] = (acc[slug] || 0) + 1
        }
        setCuentas(acc)
        setTotal(data.length)
      })
      .catch(() => {
        // Sin cuentas los chips siguen sirviendo para navegar.
        if (!cancelado) setTotal(null)
      })

    return () => {
      cancelado = true
    }
  }, [])

  const visibles = CATEGORIAS.filter((c) => (cuentas[c.slug] ?? 0) > 0 || total === null)

  const base =
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors"
  const inactivo =
    "border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50 dark:border-white/10 dark:bg-card dark:text-purple-50 dark:hover:bg-white/10"
  const activo =
    "border-purple-600 bg-purple-600 text-white hover:bg-purple-700"

  /*
    Los chips conservan el resto de los parametros de la URL.

    Antes cada chip era un enlace fijo a /shop?category=X, que reemplazaba
    toda la query: si la clienta habia elegido "Precio: menor a mayor" y
    despues tocaba una categoria, el orden se perdia y volvia a "Destacados".
  */
  const conservando = (cambios: Record<string, string | null>) => {
    const params = new URLSearchParams(parametros?.toString() ?? "")
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor === null) params.delete(clave)
      else params.set(clave, valor)
    }
    const query = params.toString()
    return query ? `/shop?${query}` : "/shop"
  }

  return (
    <nav
      aria-label="Filtrar por categoría"
      className={`-mx-4 mb-6 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {/*
        En el celular la fila scrollea de lado (por eso el margen negativo, para
        que llegue al borde). De sm en adelante los chips se acomodan en varias
        líneas: antes seguían en una sola y los últimos quedaban cortados fuera
        del contenedor.
      */}
      <ul className="flex items-center gap-2 sm:flex-wrap sm:gap-2.5">
        <li>
          <Link
            href={conservando({ category: null })}
            aria-current={!activa ? "page" : undefined}
            className={`${base} ${!activa ? activo : inactivo}`}
          >
            Todo
            {total !== null && (
              <span className={!activa ? "text-purple-50" : "text-gray-500 dark:text-purple-100/85"}>{total}</span>
            )}
          </Link>
        </li>
        {visibles.map((c) => {
          const esActiva = activa === c.slug
          const n = cuentas[c.slug]
          return (
            <li key={c.slug}>
              <Link
                href={conservando({ category: c.slug })}
                aria-current={esActiva ? "page" : undefined}
                className={`${base} ${esActiva ? activo : inactivo}`}
              >
                {c.etiqueta}
                {typeof n === "number" && (
                  <span className={esActiva ? "text-purple-50" : "text-gray-500 dark:text-purple-100/85"}>{n}</span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
