"use client"

import { useState, useRef, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Upload, X, Image as ImageIcon, FileImage, Smartphone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProfileAvatarProps {
  currentImage?: string
  userName: string
  onImageChange: (imageUrl: string) => void
  size?: "sm" | "md" | "lg"
  isEditing?: boolean
}

export default function ProfileAvatar({ 
  currentImage, 
  userName, 
  onImageChange, 
  size = "lg",
  isEditing = false
}: ProfileAvatarProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-20 w-20", 
    lg: "h-24 w-24"
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [])

  const handleFileUpload = async (file: File) => {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "❌ Error",
        description: "Solo se permiten archivos de imagen.",
        variant: "destructive"
      })
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "❌ Error",
        description: "La imagen debe ser menor a 5MB.",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)

    try {
      // Crear FormData para enviar al servidor
      const formData = new FormData()
      formData.append('file', file)

      // Subir a Cloudinary
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        onImageChange(data.url)
        toast({
          title: "✅ Imagen actualizada",
          description: "Tu foto de perfil ha sido actualizada exitosamente.",
        })
        setShowDialog(false)
      } else {
        // Manejar errores específicos de Cloudinary
        if (data.error === 'Configuración de Cloudinary incompleta') {
          toast({
            title: "❌ Error de configuración",
            description: "Las credenciales de Cloudinary no están configuradas. Contacta al administrador.",
            variant: "destructive"
          })
        } else {
          throw new Error(data.error || 'Error al subir imagen')
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "No se pudo subir la imagen. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleGallerySelect = () => {
    // En un entorno real, esto abriría la galería del dispositivo
    // Por ahora, simulamos seleccionando un archivo
    fileInputRef.current?.click()
  }

  const handleCameraCapture = () => {
    // En un entorno real, esto abriría la cámara
    // Por ahora, simulamos seleccionando un archivo
    fileInputRef.current?.click()
  }

  return (
    <div className="relative">
      {/* Avatar principal con drag & drop */}
      <div
        className={`relative ${sizeClasses[size]} ${isEditing ? 'cursor-pointer group' : ''}`}
        onDragOver={isEditing ? handleDragOver : undefined}
        onDragLeave={isEditing ? handleDragLeave : undefined}
        onDrop={isEditing ? handleDrop : undefined}
        onClick={isEditing ? () => setShowDialog(true) : undefined}
      >
        <Avatar className={`${sizeClasses[size]} border-4 border-purple-100 transition-all duration-300 ${
          isDragOver ? 'border-purple-400 scale-105' : 'hover:border-purple-300'
        }`}>
          <AvatarImage src={currentImage ? `${currentImage}?t=${Date.now()}` : "/placeholder-user.jpg"} alt={userName} />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-white">
            {getUserInitials(userName)}
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay de drag & drop */}
        {isDragOver && (
          <div className="absolute inset-0 bg-purple-500/20 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-purple-600" />
          </div>
        )}

        {/* Botón de cámara */}
        {isEditing && (
          <Button 
            size="sm" 
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-purple-600 hover:bg-purple-700 shadow-lg"
            onClick={(e) => {
              e.stopPropagation()
              setShowDialog(true)
            }}
          >
            <Camera className="h-4 w-4" />
          </Button>
        )}

        {/* Indicador de hover */}
        {isEditing && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-full transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Camera className="h-6 w-6 text-white" />
          </div>
        )}
      </div>

      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Dialog para opciones de imagen */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Cambiar foto de perfil
            </DialogTitle>
            <DialogDescription>
              Selecciona una nueva imagen para tu perfil. Puedes arrastrar una imagen aquí o elegir una opción.
            </DialogDescription>
          </DialogHeader>

          {/* Área de drag & drop en el dialog */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              isDragOver 
                ? 'border-purple-400 bg-purple-50' 
                : 'border-gray-300 hover:border-purple-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragOver ? (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-purple-600" />
                <p className="text-purple-600 font-medium">Suelta la imagen aquí</p>
              </div>
            ) : (
              <div className="space-y-4">
                <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Arrastra una imagen aquí o
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    <FileImage className="h-4 w-4 mr-2" />
                    Seleccionar archivo
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Opciones adicionales */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleGallerySelect}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Smartphone className="h-4 w-4" />
              Galería
            </Button>
            <Button
              variant="outline"
              onClick={handleCameraCapture}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Cámara
            </Button>
          </div>

          {/* Información de formato */}
          <div className="text-xs text-gray-500 text-center">
            Formatos soportados: JPG, PNG, GIF • Máximo 5MB
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isUploading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </DialogFooter>

          {/* Indicador de carga */}
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Subiendo imagen...</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 