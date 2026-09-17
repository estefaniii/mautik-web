import type { Metadata } from "next"

/**
 * `app/cart/page.tsx` es un componente cliente y por eso no puede exportar
 * `metadata`. Este layout servidor sí, y así la página deja de heredar el
 * título genérico del sitio.
 */
export const metadata: Metadata = {
  title: "Tu carrito",
  description: "Revisa los productos de tu carrito antes de finalizar la compra.",
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
