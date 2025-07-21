"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, ThumbsUp, MessageCircle, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  createdAt: string
  helpful: number
  isVerified: boolean
}

interface ProductReviewsProps {
  productId: string
  productName: string
  onReviewAdded?: () => void
}

export default function ProductReviews({ productId, productName, onReviewAdded }: ProductReviewsProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent')

  // Cargar reviews
  useEffect(() => {
    const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`)
        if (response.ok) {
      const data = await response.json()
          setReviews(data)
          
          // Verificar si el usuario ya tiene una review
          if (user) {
            const userReview = data.find((r: Review) => r.userId === user.id)
            setUserReview(userReview || null)
          }
      }
    } catch (error) {
        console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

    fetchReviews()
  }, [productId, user])

  // Ordenar reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating
      case 'helpful':
        return b.helpful - a.helpful
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  }
  })

  // Calcular estadísticas
  const totalReviews = reviews.length
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
    : 0
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: totalReviews > 0 ? (reviews.filter(r => r.rating === stars).length / totalReviews) * 100 : 0
  }))

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para dejar una reseña.",
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: "Comentario requerido",
        description: "Por favor escribe un comentario sobre el producto.",
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim()
        })
      })

      if (response.ok) {
        const newReview = await response.json()
        setReviews(prev => [newReview, ...prev])
        setUserReview(newReview)
        setShowReviewForm(false)
        setComment("")
        setRating(5)
        
        toast({
          title: "¡Gracias!",
          description: "Tu reseña ha sido publicada exitosamente.",
        })
        
        onReviewAdded?.()
      } else {
        throw new Error('Error al publicar la reseña')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo publicar tu reseña. Intenta de nuevo.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setReviews(prev => prev.map(r => 
          r.id === reviewId 
            ? { ...r, helpful: r.helpful + 1 }
            : r
        ))
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return "Hoy"
    if (diffInDays === 1) return "Ayer"
    if (diffInDays < 7) return `Hace ${diffInDays} días`
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`
    if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`
    return `Hace ${Math.floor(diffInDays / 365)} años`
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Reseñas ({totalReviews})
          </h3>
          {totalReviews > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={16}
                  className={`${
                      star <= Math.round(averageRating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {averageRating.toFixed(1)} de 5
              </span>
            </div>
          )}
        </div>
        
        {!userReview && user && (
          <Button 
            onClick={() => setShowReviewForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <MessageCircle size={16} className="mr-2" />
            Escribir reseña
          </Button>
        )}
      </div>

      {/* Distribución de ratings */}
      {totalReviews > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
            Distribución de calificaciones
          </h4>
        <div className="space-y-2">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{stars}</span>
                  <Star size={12} className="text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulario de reseña */}
      {showReviewForm && (
        <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-6 bg-purple-50/50 dark:bg-purple-900/20">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Escribe tu reseña para {productName}
              </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Calificación
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={24}
                      className={`${
                        star <= rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 dark:text-gray-600"
                      } hover:text-yellow-400 transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comentario
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comparte tu experiencia con este producto..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleSubmitReview}
                disabled={submitting || !comment.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {submitting ? "Publicando..." : "Publicar reseña"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowReviewForm(false)
                  setComment("")
                  setRating(5)
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filtros de ordenamiento */}
      {totalReviews > 1 && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Ordenar por:</span>
          <div className="flex gap-2">
            {[
              { key: 'recent', label: 'Más recientes' },
              { key: 'rating', label: 'Mejor calificadas' },
              { key: 'helpful', label: 'Más útiles' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key as any)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  sortBy === key
                    ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista de reseñas */}
      <div className="space-y-6">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No hay reseñas aún</p>
            <p className="text-sm">Sé el primero en compartir tu experiencia con este producto.</p>
          </div>
        ) : (
          sortedReviews.map((review) => (
            <div key={review.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    {review.userAvatar ? (
                      <AvatarImage src={review.userAvatar} alt={review.userName} />
                    ) : (
                  <AvatarFallback>
                        <User size={16} />
                  </AvatarFallback>
                    )}
                </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {review.userName}
                      </span>
                      {review.isVerified && (
                      <Badge variant="secondary" className="text-xs">
                          Verificado
                      </Badge>
                    )}
                  </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={12}
                          className={`${
                              star <= review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                      <span>•</span>
                      <span>{formatDate(review.createdAt)}</span>
                  </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleHelpful(review.id)}
                  className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <ThumbsUp size={14} />
                  <span>{review.helpful}</span>
                </button>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
