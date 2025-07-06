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
    // Cargar el modo oscuro desde localStorage al inicializar
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode !== null) {
      const darkMode = savedDarkMode === 'true'
      setIsDarkMode(darkMode)
      applyTheme(darkMode)
    }
  }, [])

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
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