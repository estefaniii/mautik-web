"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (dark: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    /**
     * El script bloqueante del <head> ya aplicó la clase `dark` antes del
     * primer pintado (para que no haya destello blanco). Acá solo sincronizamos
     * el estado de React con lo que ya está en el DOM, en vez de volver a
     * decidir el tema y provocar un segundo repintado.
     */
    const yaEstaOscuro = document.documentElement.classList.contains('dark')
    setIsDarkMode(yaEstaOscuro)

    // Si el usuario nunca eligió, seguimos la preferencia del sistema en vivo.
    if (localStorage.getItem('darkMode') === null) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const alCambiar = (e: MediaQueryListEvent) => {
        if (localStorage.getItem('darkMode') !== null) return
        setIsDarkMode(e.matches)
        applyTheme(e.matches)
      }
      mq.addEventListener('change', alCambiar)
      return () => mq.removeEventListener('change', alCambiar)
    }
  }, [])

  const applyTheme = (dark: boolean) => {
    const raiz = document.documentElement

    /*
      Se apagan las transiciones mientras se cambia el tema (ver la regla
      `.cambiando-tema` en globals.css) para que toda la página se repinte de
      una sola vez. Sin esto, unos elementos tardaban 0,15s en cambiar de
      color y otros 0,3s, y en ese medio segundo el encabezado se veía roto.
    */
    raiz.classList.add('cambiando-tema')

    if (dark) {
      raiz.classList.add('dark')
    } else {
      raiz.classList.remove('dark')
    }

    // Leer una propiedad calculada obliga al navegador a aplicar los colores
    // nuevos AHORA, con las transiciones apagadas. Recién después se vuelven
    // a encender, ya con todo pintado.
    window.getComputedStyle(raiz).backgroundColor

    /*
      Se vuelven a encender en cuanto el navegador pinta. El `setTimeout` es el
      respaldo: en una pestaña que está en segundo plano `requestAnimationFrame`
      no se ejecuta, y sin él las transiciones se quedarían apagadas para
      siempre en esa pestaña.
    */
    const encender = () => raiz.classList.remove('cambiando-tema')
    window.requestAnimationFrame(() => window.requestAnimationFrame(encender))
    window.setTimeout(encender, 120)
  }

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    applyTheme(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
  }

  const setDarkMode = (dark: boolean) => {
    setIsDarkMode(dark)
    applyTheme(dark)
    localStorage.setItem('darkMode', dark.toString())
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 