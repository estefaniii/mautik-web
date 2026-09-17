"use client"

import { useState, useRef, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Camera, Upload, Image as ImageIcon, FileImage } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"

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
  const { updateProfile } = useAuth();

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
      formData.append('proposito', 'avatar')

      // Subir a Cloudinary
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        // Guardar avatar en backend y actualizar contexto
        const result = await updateProfile({ avatar: data.url })
        if (result.success) {
          onImageChange(data.url)
          toast({
            title: "✅ Imagen actualizada",
            description: "Tu foto de perfil ha sido actualizada exitosamente.",
          })
          setShowDialog(false)
        } else {
          toast({
            title: "❌ Error al guardar avatar",
            description: result.error || "No se pudo guardar el avatar en el perfil.",
            variant: "destructive"
          })
        }
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
        <Avatar
          className={`${sizeClasses[size]} border-4 border-purple-100 transition-all duration-300 dark:border-white/15 ${
            isDragOver ? 'scale-105 border-purple-400' : 'hover:border-purple-300'
          }`}
        >
          {/*
            El `?t=${Date.now()}` cambiaba en CADA render: el navegador no
            podía guardar la foto en caché y la volvía a descargar una y otra
            vez. Y con los avatares de Google, que ya llevan sus propios
            parámetros en la dirección, colgarle otro puede devolver un error.
          */}
          <AvatarImage src={currentImage || "/placeholder-user.jpg"} alt={userName} />
          <AvatarFallback className="bg-purple-500 text-2xl text-white">
            {getUserInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {/* Al arrastrar una imagen encima */}
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-purple-500/25">
            <Upload className="h-8 w-8 text-white drop-shadow" />
          </div>
        )}

        {/*
          UN solo botón de cámara.

          Había dos: este y otro que aparecía al pasar el ratón, en el centro
          del avatar. Se veían los dos a la vez y encima el de abajo iba en
          `-bottom-2 -right-2`, sobresaliendo del círculo y chocando con lo que
          tuviera al lado. Ahora va apoyado DENTRO del borde.
        */}
        {isEditing && (
          <button
            type="button"
            aria-label="Cambiar foto de perfil"
            onClick={(e) => {
              e.stopPropagation()
              setShowDialog(true)
            }}
            className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border-2 border-card bg-purple-700 text-white shadow-md transition-colors hover:bg-purple-800"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Al pasar el ratón, solo un velo: el icono ya está abajo. */}
        {isEditing && !isDragOver && (
          <div className="pointer-events-none absolute inset-0 rounded-full bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
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

          {/*
            UN solo botón.

            Había tres —"Seleccionar archivo", "Galería" y "Cámara"— y los tres
            llamaban exactamente a la misma línea: `fileInputRef.current.click()`.
            O sea, el mismo selector de archivos con tres nombres distintos. En
            el teléfono ese selector ya ofrece por su cuenta cámara o galería,
            así que las dos opciones de abajo no agregaban nada y sí confundían.
          */}
          <div
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
              isDragOver
                ? 'border-purple-400 bg-purple-50 dark:bg-white/10'
                : 'border-gray-300 hover:border-purple-300 dark:border-white/15 dark:hover:border-purple-300/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragOver ? (
              <div className="space-y-2">
                <Upload className="mx-auto h-8 w-8 text-purple-600 dark:text-purple-300" />
                <p className="font-medium text-purple-700 dark:text-purple-200">
                  Suelta la imagen aquí
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <ImageIcon className="mx-auto h-11 w-11 text-gray-400 dark:text-purple-100/40" />
                <div>
                  <p className="mb-3 text-sm text-gray-600 dark:text-purple-100/70">
                    Arrastra una foto aquí o
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full rounded-full bg-purple-700 hover:bg-purple-800"
                  >
                    <FileImage className="mr-2 h-4 w-4" />
                    Elegir una foto
                  </Button>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-500 dark:text-purple-100/55">
            JPG, PNG o GIF · hasta 5 MB
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setShowDialog(false)}
              disabled={isUploading}
            >
              Cancelar
            </Button>
          </DialogFooter>

          {/* Indicador de carga */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-card/85">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-purple-100/70">Subiendo imagen...</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 