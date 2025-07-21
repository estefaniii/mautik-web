"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from 'lucide-react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showReportDialog?: boolean
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId?: string
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    this.props.onError?.(error, errorInfo)

    // En producción, enviar error a Sentry
    if (process.env.NODE_ENV === 'production') {
      try {
        const errorId = Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack || '',
            },
          },
          tags: {
            location: 'error_boundary',
            component: errorInfo.componentStack?.split('\n')[1]?.trim() || 'unknown',
          },
        })
        
        this.setState({ errorId })
        
        // Mostrar diálogo de reporte si está habilitado
        if (this.props.showReportDialog) {
          Sentry.showReportDialog({ eventId: errorId })
        }
      } catch (sentryError) {
        console.error('Error sending to Sentry:', sentryError)
      }
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleReportError = () => {
    if (this.state.errorId && process.env.NODE_ENV === 'production') {
      Sentry.showReportDialog({ eventId: this.state.errorId })
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-lg w-full mx-auto text-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full p-4">
                  <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                ¡Ups! Algo salió mal
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado y estamos trabajando para solucionarlo.
              </p>

              {this.state.errorId && process.env.NODE_ENV === 'production' && (
                <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    ID del error: <code className="font-mono">{this.state.errorId}</code>
                  </p>
                </div>
              )}

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                    <Bug size={16} />
                    Detalles del error (solo desarrollo)
                  </summary>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-xs font-mono text-red-600 dark:text-red-400 overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Intentar de nuevo
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  Recargar página
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Link href="/" className="flex-1">
                  <Button variant="ghost" className="w-full">
                    <Home className="h-4 w-4 mr-2" />
                    Ir al inicio
                  </Button>
                </Link>
                
                {this.state.errorId && process.env.NODE_ENV === 'production' && (
                  <Button
                    onClick={this.handleReportError}
                    variant="ghost"
                    className="flex-1"
                  >
                    <Bug className="h-4 w-4 mr-2" />
                    Reportar error
                  </Button>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  ¿Necesitas ayuda?
                </p>
                <Link href="/contact">
                  <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-400">
                    <Mail className="h-4 w-4 mr-2" />
                    Contactar soporte
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook para usar error boundary en componentes funcionales
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error)
    setError(error)
    
    // En producción, enviar a Sentry
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        tags: {
          location: 'use_error_handler',
        },
      })
    }
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, clearError }
}

// Componente para mostrar errores en componentes funcionales
export function ErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error
  resetErrorBoundary: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-3 mb-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Algo salió mal
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {error.message || 'Ha ocurrido un error inesperado.'}
      </p>
      <Button onClick={resetErrorBoundary}>
        Intentar de nuevo
      </Button>
    </div>
  )
}

// HOC para envolver componentes con error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  showReportDialog?: boolean
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback} showReportDialog={showReportDialog}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Hook para capturar errores de async/await
export function useAsyncError() {
  const [, setError] = React.useState()
  return React.useCallback((e: Error) => {
    setError(() => {
      throw e
    })
  }, [])
} 