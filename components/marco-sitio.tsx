"use client"

import { usePathname } from "next/navigation"

/*
  Rutas que se ven sin la barra ni el pie de la tienda.

  /links es la página del enlace de la bio de Instagram (lo que antes era el
  linktree aparte en mautik.vercel.app). Es una tarjeta de pantalla completa:
  con la barra fija encima y el pie de la tienda debajo dejaba de parecer un
  linktree.
*/
const SIN_MARCO = ["/links"]

export default function MarcoSitio({
  navbar,
  footer,
  children,
}: {
  navbar: React.ReactNode
  footer: React.ReactNode
  children: React.ReactNode
}) {
  const pathname = usePathname() || ""
  const sinMarco = SIN_MARCO.some((r) => pathname === r || pathname.startsWith(`${r}/`))

  if (sinMarco) {
    return (
      <main id="main-content" role="main" className="flex-1">
        {children}
      </main>
    )
  }

  return (
    <>
      {navbar}
      {/*
        El relleno de arriba (la barra es fija) estaba escrito a mano en
        72px. La barra ahora mide siempre 64: antes cambiaba de alto al
        hacer scroll, y ese cambio era lo que hacía que "se expandiera"
        al abrir las notificaciones.
      */}
      <main id="main-content" role="main" className="flex-1 pt-16">
        {children}
      </main>
      {footer}
    </>
  )
}
