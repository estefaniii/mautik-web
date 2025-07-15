"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Star, User, Calendar, ThumbsUp, MessageCircle, LogIn, UserPlus, Edit, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"

interface Review {
  id: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  rating: number
  title: string
  comment: string
  helpful: number
  verified: boolean
  createdAt: string
  updatedAt: string
}

interface ReviewStats {
  averageRating: number
  totalReviews: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

interface ProductReviewsProps {
  productId: string
  productName: string
}

export default function ProductReviews({ 
  productId, 
  productName
}: ProductReviewsProps) {
  const { toast } = useToast()
  const { user, isLoading } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState<string | null>(null)
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: "",
    comment: ""
  })
  const [hoveredRating, setHoveredRating] = useState(0)

  // Cargar reseñas
  const loadReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reviews?productId=${productId}`)
      const data = await response.json()
      
      if (response.ok) {
        setReviews(data.reviews)
        setStats(data.stats)
      } else {
        toast({
          title: "Error",
          description: data.error || "Error cargando reseñas",
          variant: "destructive"
        })
      }
    } catch (error) {
      const errorToUse = error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));
      toast({
        title: "Error",
        description: "Error de conexión al cargar reseñas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [productId])

  const handleWriteReview = () => {
    if (!user) {
      toast({
        title: "Inicia sesión requerido",
        description: "Debes iniciar sesión para escribir una reseña.",
        variant: "destructive"
      })
      return
    }
    setShowReviewForm(true)
    setEditingReview(null)
    setNewReview({ rating: 0, title: "", comment: "" })
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review.id)
    setNewReview({
      rating: review.rating,
      title: review.title,
      comment: review.comment
    })
    setShowReviewForm(true)
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar tu reseña?")) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Reseña eliminada",
          description: "Tu reseña ha sido eliminada exitosamente."
        })
        loadReviews() // Recargar reseñas
      } else {
        toast({
          title: "Error",
          description: data.error || "Error eliminando reseña",
          variant: "destructive"
        })
      }
    } catch (error) {
      const errorToUse = error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));
      toast({
        title: "Error",
        description: "Error de conexión al eliminar reseña",
        variant: "destructive"
      })
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para escribir una reseña.",
        variant: "destructive"
      })
      return
    }

    if (newReview.rating === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona una calificación.",
        variant: "destructive"
      })
      return
    }

    if (!newReview.title.trim() || !newReview.comment.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos.",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem('token')
      
      const url = editingReview 
        ? `/api/reviews/${editingReview}`
        : '/api/reviews'
      
      const method = editingReview ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          rating: newReview.rating,
          title: newReview.title.trim(),
          comment: newReview.comment.trim()
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: editingReview ? "Reseña actualizada" : "Reseña enviada",
          description: editingReview 
            ? "Tu reseña ha sido actualizada exitosamente."
            : "Gracias por tu opinión. Tu reseña ha sido publicada."
        })
        
        setNewReview({ rating: 0, title: "", comment: "" })
        setShowReviewForm(false)
        setEditingReview(null)
        loadReviews() // Recargar reseñas
      } else {
        toast({
          title: "Error",
          description: data.error || "Error enviando reseña",
          variant: "destructive"
        })
      }
    } catch (error) {
      const errorToUse = error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));
      toast({
        title: "Error",
        description: "Error de conexión al enviar reseña",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRatingClick = (rating: number) => {
    setNewReview(prev => ({ ...prev, rating }))
  }

  const handleRatingHover = (rating: number) => {
    setHoveredRating(rating)
  }

  const handleRatingLeave = () => {
    setHoveredRating(0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">Cargando reseñas...</span>
        </div>
      </div>
    )
  }

  const userReview = reviews.find(review => review.user.id === user?.id)

  return (
    <div className="space-y-8">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Reseñas de Clientes</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={`${
                    i < Math.floor(stats.averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{stats.averageRating.toFixed(1)}</span>
            </div>
            <span className="text-gray-600 dark:text-gray-400">({stats.totalReviews} reseñas)</span>
          </div>
        </div>
        {!userReview && (
          <Button 
            onClick={handleWriteReview}
            className="bg-purple-800 hover:bg-purple-900 dark:bg-purple-600 dark:hover:bg-purple-700"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Escribir Reseña
          </Button>
        )}
      </div>

      {/* Rating Distribution */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Distribución de Calificaciones</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.distribution[rating as keyof typeof stats.distribution]
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
            
            return (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center w-16">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{rating}</span>
                  <Star className="h-4 w-4 text-yellow-400 fill-current ml-1" />
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* User's Review */}
      {userReview && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Tu Reseña</h4>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditReview(userReview)}
                className="border-purple-800 text-purple-800 hover:bg-purple-50 dark:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-900/20"
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteReview(userReview.id)}
                className="border-red-600 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userReview.user.avatar} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h5 className="font-medium text-gray-900 dark:text-gray-100">{userReview.user.name}</h5>
                {userReview.verified && (
                  <Badge variant="secondary" className="text-xs">
                    Compra Verificada
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={`${
                        i < userReview.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  {formatDate(userReview.createdAt)}
                </span>
              </div>
              <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{userReview.title}</h6>
              <p className="text-gray-700 dark:text-gray-300">{userReview.comment}</p>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Required Message */}
      {!user && !isLoading && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-purple-100 dark:bg-purple-800 rounded-full p-3">
              <LogIn className="h-8 w-8 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Inicia sesión para escribir reseñas
              </h4>
              <p className="text-purple-700 dark:text-purple-300 mb-4">
                Únete a nuestra comunidad y comparte tu experiencia con otros clientes.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="bg-purple-800 hover:bg-purple-900 dark:bg-purple-600 dark:hover:bg-purple-700">
                <Link href="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-purple-800 text-purple-800 hover:bg-purple-50 dark:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-900/20">
                <Link href="/login?register=true">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Registrarse
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Form - Only show if user is authenticated */}
      {showReviewForm && user && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {editingReview ? 'Editar Reseña' : 'Escribir una Reseña'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Como {user.name}</p>
            </div>
          </div>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Calificación *
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingClick(rating)}
                    onMouseEnter={() => handleRatingHover(rating)}
                    onMouseLeave={handleRatingLeave}
                    className="focus:outline-none"
                  >
                    <Star
                      size={24}
                      className={`${
                        rating <= (hoveredRating || newReview.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      } hover:scale-110 transition-all duration-200`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título de la Reseña *
              </label>
              <Input
                id="review-title"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Resume tu experiencia en pocas palabras"
                maxLength={100}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            {/* Review Comment */}
            <div>
              <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comentario *
              </label>
              <Textarea
                id="review-comment"
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Comparte tu experiencia con este producto..."
                rows={4}
                maxLength={500}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {newReview.comment.length}/500 caracteres
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3">
              <Button 
                type="submit" 
                className="bg-purple-800 hover:bg-purple-900 dark:bg-purple-600 dark:hover:bg-purple-700"
                disabled={submitting}
              >
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingReview ? 'Actualizar Reseña' : 'Publicar Reseña'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setShowReviewForm(false)
                  setEditingReview(null)
                  setNewReview({ rating: 0, title: "", comment: "" })
                }}
                disabled={submitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No hay reseñas aún</h4>
            <p className="text-gray-600 dark:text-gray-400">
              {user ? "Sé el primero en compartir tu experiencia con este producto." : "Inicia sesión para ser el primero en compartir tu experiencia."}
            </p>
          </div>
        ) : (
          reviews
            .filter(review => !user || review.user.id !== user.id) // No mostrar la reseña del usuario actual en la lista
            .map((review) => (
            <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
              <div className="flex items-start space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.user.avatar} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100">{review.user.name}</h5>
                    {review.verified && (
                      <Badge variant="secondary" className="text-xs">
                        Compra Verificada
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={`${
                            i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  
                  <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{review.title}</h6>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{review.comment}</p>
                  
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Útil ({review.helpful})
                    </button>
                    <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                      Responder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
