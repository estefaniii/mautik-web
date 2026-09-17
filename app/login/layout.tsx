import type { Metadata } from "next"

/**
 * Página que no debe aparecer en Google. Lleva su propio `metadata` para
 * declarar el noindex y para no heredar el canonical de la portada, que le
 * diría a Google que esta URL ES la home.
 */
export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
