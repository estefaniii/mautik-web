import type { Metadata } from "next"

/**
 * `app/orders/page.tsx` es un componente cliente y por eso no puede exportar
 * `metadata`. Este layout servidor sí, y así la página deja de heredar el
 * título genérico del sitio.
 */
export const metadata: Metadata = {
  title: "Tus pedidos",
  description: "El estado y el historial de tus pedidos en Mautik.",
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
