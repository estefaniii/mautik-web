import type { Metadata } from "next"

/**
 * `app/shop/page.tsx` es un componente cliente y por eso no puede exportar
 * `metadata`. Este layout servidor sí, y así la página deja de heredar el
 * título genérico del sitio.
 */
export const metadata: Metadata = {
  title: "Tienda",
  description: "Todo el catálogo de Mautik: peluches de crochet, llaveros, pulseras, collares, anillos y aretes hechos a mano en Panamá.",
  alternates: { canonical: "/shop" },
  openGraph: { title: "Tienda · Mautik", description: "Todo el catálogo de Mautik: peluches de crochet, llaveros, pulseras, collares, anillos y aretes hechos a mano en Panamá.", url: "/shop" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
