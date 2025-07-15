"use client"

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

// Hook para navegación por teclado
export function useKeyboardNavigation() {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [isNavigating, setIsNavigating] = useState(false)

  const handleKeyDown = (event: KeyboardEvent, items: any[], onSelect: (item: any) => void) => {
    if (!items.length) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setIsNavigating(true)
        setFocusedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setIsNavigating(true)
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : items.length - 1
        )
        break
      case 'Enter':
        event.preventDefault()
        if (focusedIndex >= 0 && items[focusedIndex]) {
          onSelect(items[focusedIndex])
        }
        break
      case 'Escape':
        event.preventDefault()
        setFocusedIndex(-1)
        setIsNavigating(false)
        break
    }
  }

  return {
    focusedIndex,
    isNavigating,
    handleKeyDown,
    setFocusedIndex,
    setIsNavigating
  }
}

// Hook para skip links
export function useSkipLinks() {
  const [skipLinksVisible, setSkipLinksVisible] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setSkipLinksVisible(true)
      }
    }

    const handleClick = () => {
      setSkipLinksVisible(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return skipLinksVisible
}

// Componente Skip Links
export function SkipLinks() {
  const visible = useSkipLinks()

  if (!visible) return null

  return (
    <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50">
      <nav aria-label="Enlaces de navegación rápida">
        <ul className="space-y-2">
          <li>
            <a
              href="#main-content"
              className="block px-4 py-2 bg-purple-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Saltar al contenido principal
            </a>
          </li>
          <li>
            <a
              href="#main-navigation"
              className="block px-4 py-2 bg-purple-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Saltar a la navegación
            </a>
          </li>
          <li>
            <a
              href="#footer"
              className="block px-4 py-2 bg-purple-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Saltar al pie de página
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}

// Componente para anunciar cambios a lectores de pantalla
export function LiveRegion({ 
  message, 
  role = 'status',
  'aria-live': ariaLive = 'polite'
}: {
  message: string
  role?: 'status' | 'alert' | 'log'
  'aria-live'?: 'polite' | 'assertive' | 'off'
}) {
  return (
    <div
      role={role}
      aria-live={ariaLive}
      className="sr-only"
      aria-atomic="true"
    >
      {message}
    </div>
  )
}

// Hook para LiveRegion
export function useLiveRegion() {
  const [message, setMessage] = useState('')

  const announce = (msg: string, priority: 'polite' | 'assertive' = 'polite') => {
    setMessage(msg)
    // Limpiar mensaje después de un tiempo
    setTimeout(() => setMessage(''), 1000)
  }

  return { message, announce }
}

// Componente para manejar focus trap
export function FocusTrap({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([])

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      setFocusableElements(Array.from(elements) as HTMLElement[])
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !focusableElements.length) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [focusableElements])

  return (
    <div ref={containerRef}>
      {children}
    </div>
  )
}

// Hook para manejar clicks fuera de un elemento
export function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler()
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

// Componente para manejar focus visible
export function FocusVisible({ children }: { children: React.ReactNode }) {
  return (
    <div className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2">
      {children}
    </div>
  )
}

// Hook para manejar navegación por teclado en listas
export function useListNavigation<T>(
  items: T[],
  onSelect: (item: T, index: number) => void
) {
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!items.length) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : items.length - 1
        )
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (selectedIndex >= 0 && items[selectedIndex]) {
          onSelect(items[selectedIndex], selectedIndex)
        }
        break
      case 'Home':
        event.preventDefault()
        setSelectedIndex(0)
        break
      case 'End':
        event.preventDefault()
        setSelectedIndex(items.length - 1)
        break
    }
  }

  return {
    selectedIndex,
    setSelectedIndex,
    handleKeyDown
  }
}

// Componente para manejar anuncios de carga
export function LoadingAnnouncer({ 
  isLoading, 
  message = 'Cargando...',
  completeMessage = 'Carga completada'
}: {
  isLoading: boolean
  message?: string
  completeMessage?: string
}) {
  const { announce } = useLiveRegion()

  useEffect(() => {
    if (isLoading) {
      announce(message)
    } else {
      announce(completeMessage)
    }
  }, [isLoading, message, completeMessage, announce])

  return null
}

// Hook para manejar navegación por teclado en modales
export function useModalKeyboard(closeModal: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closeModal])
}

// Componente para manejar anuncios de errores
export function ErrorAnnouncer({ error }: { error: string | null }) {
  const { announce } = useLiveRegion()

  useEffect(() => {
    if (error) {
      announce(error, 'assertive')
    }
  }, [error, announce])

  return null
}

// Hook para manejar navegación por teclado en formularios
export function useFormNavigation() {
  const router = useRouter()

  const handleFormKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      router.back()
    }
  }

  return { handleFormKeyDown }
} 