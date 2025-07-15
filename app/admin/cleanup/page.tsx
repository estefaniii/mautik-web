"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Trash2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import AdminGuard from "@/components/admin-guard"

export default function CleanupPage() {
  const [productIds, setProductIds] = useState("")
  const [isCleaning, setIsCleaning] = useState(false)
  const [results, setResults] = useState<any>(null)
  const { toast } = useToast()

  const cleanProductReferences = async () => {
    if (!productIds.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa al menos un ID de producto.",
        variant: "destructive"
      })
      return
    }

    setIsCleaning(true)
    setResults(null)

    try {
      const ids = productIds.split(',').map(id => id.trim()).filter(id => id)
      
      // Función para limpiar localStorage
      const cleanLocalStorage = () => {
        const keysToClean = [
          'mautik_favorites_temp',
          'mautik_cart_temp'
        ]
        
        // Agregar claves específicas de usuario si existe
        const user = JSON.parse(localStorage.getItem('mautik_user') || '{}')
        if (user.id) {
          keysToClean.push(`mautik_favorites_${user.id}`)
          keysToClean.push(`mautik_cart_${user.id}`)
        }
        
        const results: any = {
          totalCleaned: 0,
          details: {}
        }
        
        keysToClean.forEach(key => {
          const data = localStorage.getItem(key)
          if (data) {
            try {
              const parsed = JSON.parse(data)
              
              if (Array.isArray(parsed)) {
                const originalLength = parsed.length
                const filtered = parsed.filter(item => !ids.includes(item.id))
                const cleanedCount = originalLength - filtered.length
                
                if (cleanedCount > 0) {
                  localStorage.setItem(key, JSON.stringify(filtered))
                  results.totalCleaned += cleanedCount
                  results.details[key] = {
                    original: originalLength,
                    cleaned: filtered.length,
                    removed: cleanedCount
                  }
                } else {
                  results.details[key] = {
                    original: originalLength,
                    cleaned: originalLength,
                    removed: 0
                  }
                }
              }
            } catch (error) {
              results.details[key] = { error: error instanceof Error ? error.message : String(error) }
            }
          } else {
            results.details[key] = { error: "No existe" }
          }
        })
        
        return results
      }

      const cleanupResults = cleanLocalStorage()
      setResults(cleanupResults)

      if (cleanupResults.totalCleaned > 0) {
        toast({
          title: "Limpieza completada",
          description: `Se eliminaron ${cleanupResults.totalCleaned} referencias a productos eliminados.`,
        })
      } else {
        toast({
          title: "Sin cambios",
          description: "No se encontraron referencias a los productos especificados.",
        })
      }

    } catch (error) {
      console.error("Error durante la limpieza:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error durante la limpieza.",
        variant: "destructive"
      })
    } finally {
      setIsCleaning(false)
    }
  }

  const clearAllLocalStorage = () => {
    if (confirm("¿Estás seguro de que quieres limpiar TODO el localStorage? Esta acción no se puede deshacer.")) {
      localStorage.clear()
      toast({
        title: "localStorage limpiado",
        description: "Se ha limpiado completamente el localStorage del navegador.",
      })
      setResults(null)
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-purple-900 mb-2">Limpieza de localStorage</h1>
              <p className="text-gray-600">
                Herramienta para limpiar referencias a productos eliminados del localStorage del navegador.
              </p>
            </div>

            <div className="grid gap-6">
              {/* Formulario de limpieza */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trash2 className="h-5 w-5 mr-2" />
                    Limpiar referencias específicas
                  </CardTitle>
                  <CardDescription>
                    Ingresa los IDs de productos eliminados separados por comas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="productIds">IDs de productos eliminados</Label>
                    <Textarea
                      id="productIds"
                      placeholder="Ej: 679, 871, 123, 456"
                      value={productIds}
                      onChange={(e) => setProductIds(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      onClick={cleanProductReferences}
                      disabled={isCleaning || !productIds.trim()}
                      className="bg-purple-800 hover:bg-purple-900"
                    >
                      {isCleaning ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Limpiando...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Limpiar referencias
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={clearAllLocalStorage}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Limpiar todo localStorage
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Resultados */}
              {results && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Resultados de la limpieza
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="font-semibold text-green-800">
                          Total de referencias eliminadas: {results.totalCleaned}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Detalles por clave:</h4>
                        <div className="space-y-2">
                          {Object.entries(results.details).map(([key, detail]: [string, any]) => (
                            <div key={key} className="bg-gray-50 p-3 rounded">
                              <p className="font-medium">{key}</p>
                              {detail.error ? (
                                <p className="text-red-600 text-sm">{detail.error}</p>
                              ) : (
                                <p className="text-sm text-gray-600">
                                  Original: {detail.original} | Limpiado: {detail.cleaned} | Eliminados: {detail.removed}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Información */}
              <Card>
                <CardHeader>
                  <CardTitle>Información</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Esta herramienta limpia referencias a productos eliminados del localStorage del navegador.</p>
                    <p>• Los IDs deben estar separados por comas (ej: 679, 871, 123).</p>
                    <p>• Se limpian tanto favoritos como carrito de compras.</p>
                    <p>• La limpieza afecta tanto a usuarios autenticados como anónimos.</p>
                    <p>• <strong>¡Cuidado!</strong> La opción "Limpiar todo localStorage" elimina TODOS los datos locales.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
} 