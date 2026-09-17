import type { Metadata } from "next"

/**
 * `app/contact/page.tsx` es un componente cliente y por eso no puede exportar
 * `metadata`. Este layout servidor sí, y así la página deja de heredar el
 * título genérico del sitio.
 */
export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos para pedidos personalizados, mayoreo o cualquier duda. Mautik, La Chorrera, Panamá.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contacto · Mautik", description: "Escríbenos para pedidos personalizados, mayoreo o cualquier duda. Mautik, La Chorrera, Panamá.", url: "/contact" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
