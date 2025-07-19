"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProductReviews;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const textarea_1 = require("@/components/ui/textarea");
const input_1 = require("@/components/ui/input");
const lucide_react_1 = require("lucide-react");
const use_toast_1 = require("@/hooks/use-toast");
const avatar_1 = require("@/components/ui/avatar");
const badge_1 = require("@/components/ui/badge");
const auth_context_1 = require("@/context/auth-context");
const link_1 = __importDefault(require("next/link"));
function ProductReviews({ productId, productName }) {
    const { toast } = (0, use_toast_1.useToast)();
    const { user, isLoading } = (0, auth_context_1.useAuth)();
    const [reviews, setReviews] = (0, react_1.useState)([]);
    const [stats, setStats] = (0, react_1.useState)({
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [submitting, setSubmitting] = (0, react_1.useState)(false);
    const [showReviewForm, setShowReviewForm] = (0, react_1.useState)(false);
    const [editingReview, setEditingReview] = (0, react_1.useState)(null);
    const [newReview, setNewReview] = (0, react_1.useState)({
        rating: 0,
        title: "",
        comment: ""
    });
    const [hoveredRating, setHoveredRating] = (0, react_1.useState)(0);
    // Cargar reseñas
    const loadReviews = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/reviews?productId=${productId}`);
            const data = await response.json();
            if (response.ok) {
                setReviews(data.reviews);
                setStats(data.stats);
            }
            else {
                toast({
                    title: "Error",
                    description: data.error || "Error cargando reseñas",
                    variant: "destructive"
                });
            }
        }
        catch (error) {
            const errorToUse = error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            toast({
                title: "Error",
                description: "Error de conexión al cargar reseñas",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        loadReviews();
    }, [productId]);
    const handleWriteReview = () => {
        if (!user) {
            toast({
                title: "Inicia sesión requerido",
                description: "Debes iniciar sesión para escribir una reseña.",
                variant: "destructive"
            });
            return;
        }
        setShowReviewForm(true);
        setEditingReview(null);
        setNewReview({ rating: 0, title: "", comment: "" });
    };
    const handleEditReview = (review) => {
        setEditingReview(review.id);
        setNewReview({
            rating: review.rating,
            title: review.title,
            comment: review.comment
        });
        setShowReviewForm(true);
    };
    const handleDeleteReview = async (reviewId) => {
        if (!confirm("¿Estás seguro de que quieres eliminar tu reseña?")) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok) {
                toast({
                    title: "Reseña eliminada",
                    description: "Tu reseña ha sido eliminada exitosamente."
                });
                loadReviews(); // Recargar reseñas
            }
            else {
                toast({
                    title: "Error",
                    description: data.error || "Error eliminando reseña",
                    variant: "destructive"
                });
            }
        }
        catch (error) {
            const errorToUse = error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            toast({
                title: "Error",
                description: "Error de conexión al eliminar reseña",
                variant: "destructive"
            });
        }
    };
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            toast({
                title: "Error",
                description: "Debes iniciar sesión para escribir una reseña.",
                variant: "destructive"
            });
            return;
        }
        if (newReview.rating === 0) {
            toast({
                title: "Error",
                description: "Por favor selecciona una calificación.",
                variant: "destructive"
            });
            return;
        }
        if (!newReview.title.trim() || !newReview.comment.trim()) {
            toast({
                title: "Error",
                description: "Por favor completa todos los campos.",
                variant: "destructive"
            });
            return;
        }
        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');
            const url = editingReview
                ? `/api/reviews/${editingReview}`
                : '/api/reviews';
            const method = editingReview ? 'PUT' : 'POST';
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
            });
            const data = await response.json();
            if (response.ok) {
                toast({
                    title: editingReview ? "Reseña actualizada" : "Reseña enviada",
                    description: editingReview
                        ? "Tu reseña ha sido actualizada exitosamente."
                        : "Gracias por tu opinión. Tu reseña ha sido publicada."
                });
                setNewReview({ rating: 0, title: "", comment: "" });
                setShowReviewForm(false);
                setEditingReview(null);
                loadReviews(); // Recargar reseñas
            }
            else {
                toast({
                    title: "Error",
                    description: data.error || "Error enviando reseña",
                    variant: "destructive"
                });
            }
        }
        catch (error) {
            const errorToUse = error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            toast({
                title: "Error",
                description: "Error de conexión al enviar reseña",
                variant: "destructive"
            });
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleRatingClick = (rating) => {
        setNewReview(prev => (Object.assign(Object.assign({}, prev), { rating })));
    };
    const handleRatingHover = (rating) => {
        setHoveredRating(rating);
    };
    const handleRatingLeave = () => {
        setHoveredRating(0);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "space-y-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-purple-600" }), (0, jsx_runtime_1.jsx)("span", { className: "ml-2 text-gray-600", children: "Cargando rese\u00F1as..." })] }) }));
    }
    const userReview = reviews.find(review => review.user.id === (user === null || user === void 0 ? void 0 : user.id));
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2", children: "Rese\u00F1as de Clientes" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [[...Array(5)].map((_, i) => ((0, jsx_runtime_1.jsx)(lucide_react_1.Star, { size: 20, className: `${i < Math.floor(stats.averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"}` }, i))), (0, jsx_runtime_1.jsx)("span", { className: "ml-2 text-lg font-semibold text-gray-900 dark:text-gray-100", children: stats.averageRating.toFixed(1) })] }), (0, jsx_runtime_1.jsxs)("span", { className: "text-gray-600 dark:text-gray-400", children: ["(", stats.totalReviews, " rese\u00F1as)"] })] })] }), !userReview && ((0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleWriteReview, className: "bg-purple-800 hover:bg-purple-900 dark:bg-purple-600 dark:hover:bg-purple-700", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MessageCircle, { className: "h-4 w-4 mr-2" }), "Escribir Rese\u00F1a"] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-gray-50 dark:bg-gray-800 rounded-lg p-6", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Distribuci\u00F3n de Calificaciones" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: [5, 4, 3, 2, 1].map((rating) => {
                            const count = stats.distribution[rating];
                            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                            return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center w-16", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: rating }), (0, jsx_runtime_1.jsx)(lucide_react_1.Star, { className: "h-4 w-4 text-yellow-400 fill-current ml-1" })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-yellow-400 h-2 rounded-full transition-all duration-300", style: { width: `${percentage}%` } }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-600 dark:text-gray-400 w-12 text-right", children: count })] }, rating));
                        }) })] }), userReview && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-lg font-semibold text-purple-900 dark:text-purple-100", children: "Tu Rese\u00F1a" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", onClick: () => handleEditReview(userReview), className: "border-purple-800 text-purple-800 hover:bg-purple-50 dark:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-900/20", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "h-4 w-4 mr-1" }), "Editar"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", onClick: () => handleDeleteReview(userReview.id), className: "border-red-600 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4 mr-1" }), "Eliminar"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start space-x-4", children: [(0, jsx_runtime_1.jsxs)(avatar_1.Avatar, { className: "h-10 w-10", children: [(0, jsx_runtime_1.jsx)(avatar_1.AvatarImage, { src: userReview.user.avatar }), (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "h-5 w-5" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2 mb-2", children: [(0, jsx_runtime_1.jsx)("h5", { className: "font-medium text-gray-900 dark:text-gray-100", children: userReview.user.name }), userReview.verified && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "secondary", className: "text-xs", children: "Compra Verificada" }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4 mb-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center", children: [...Array(5)].map((_, i) => ((0, jsx_runtime_1.jsx)(lucide_react_1.Star, { size: 14, className: `${i < userReview.rating ? "text-yellow-400 fill-current" : "text-gray-300"}` }, i))) }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-3 w-3 inline mr-1" }), formatDate(userReview.createdAt)] })] }), (0, jsx_runtime_1.jsx)("h6", { className: "font-medium text-gray-900 dark:text-gray-100 mb-2", children: userReview.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-700 dark:text-gray-300", children: userReview.comment })] })] })] })), !user && !isLoading && ((0, jsx_runtime_1.jsx)("div", { className: "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6 text-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-purple-100 dark:bg-purple-800 rounded-full p-3", children: (0, jsx_runtime_1.jsx)(lucide_react_1.LogIn, { className: "h-8 w-8 text-purple-600 dark:text-purple-300" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2", children: "Inicia sesi\u00F3n para escribir rese\u00F1as" }), (0, jsx_runtime_1.jsx)("p", { className: "text-purple-700 dark:text-purple-300 mb-4", children: "\u00DAnete a nuestra comunidad y comparte tu experiencia con otros clientes." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row gap-3", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { asChild: true, className: "bg-purple-800 hover:bg-purple-900 dark:bg-purple-600 dark:hover:bg-purple-700", children: (0, jsx_runtime_1.jsxs)(link_1.default, { href: "/login", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.LogIn, { className: "h-4 w-4 mr-2" }), "Iniciar Sesi\u00F3n"] }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { asChild: true, variant: "outline", className: "border-purple-800 text-purple-800 hover:bg-purple-50 dark:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-900/20", children: (0, jsx_runtime_1.jsxs)(link_1.default, { href: "/login?register=true", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.UserPlus, { className: "h-4 w-4 mr-2" }), "Registrarse"] }) })] })] }) })), showReviewForm && user && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3 mb-4", children: [(0, jsx_runtime_1.jsxs)(avatar_1.Avatar, { className: "h-8 w-8", children: [(0, jsx_runtime_1.jsx)(avatar_1.AvatarImage, { src: user.avatar }), (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "h-4 w-4" }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-semibold text-gray-900 dark:text-gray-100", children: editingReview ? 'Editar Reseña' : 'Escribir una Reseña' }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Como ", user.name] })] })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmitReview, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Calificaci\u00F3n *" }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center space-x-1", children: [1, 2, 3, 4, 5].map((rating) => ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleRatingClick(rating), onMouseEnter: () => handleRatingHover(rating), onMouseLeave: handleRatingLeave, className: "focus:outline-none", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Star, { size: 24, className: `${rating <= (hoveredRating || newReview.rating)
                                                    ? "text-yellow-400 fill-current"
                                                    : "text-gray-300"} hover:scale-110 transition-all duration-200` }) }, rating))) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "review-title", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "T\u00EDtulo de la Rese\u00F1a *" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "review-title", value: newReview.title, onChange: (e) => setNewReview(prev => (Object.assign(Object.assign({}, prev), { title: e.target.value }))), placeholder: "Resume tu experiencia en pocas palabras", maxLength: 100, className: "dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "review-comment", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Comentario *" }), (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { id: "review-comment", value: newReview.comment, onChange: (e) => setNewReview(prev => (Object.assign(Object.assign({}, prev), { comment: e.target.value }))), placeholder: "Comparte tu experiencia con este producto...", rows: 4, maxLength: 500, className: "dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: [newReview.comment.length, "/500 caracteres"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-3", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { type: "submit", className: "bg-purple-800 hover:bg-purple-900 dark:bg-purple-600 dark:hover:bg-purple-700", disabled: submitting, children: [submitting && (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), editingReview ? 'Actualizar Reseña' : 'Publicar Reseña'] }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", variant: "outline", onClick: () => {
                                            setShowReviewForm(false);
                                            setEditingReview(null);
                                            setNewReview({ rating: 0, title: "", comment: "" });
                                        }, disabled: submitting, children: "Cancelar" })] })] })] })), (0, jsx_runtime_1.jsx)("div", { className: "space-y-6", children: reviews.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-8", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MessageCircle, { className: "h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" }), (0, jsx_runtime_1.jsx)("h4", { className: "text-lg font-medium text-gray-900 dark:text-gray-100 mb-2", children: "No hay rese\u00F1as a\u00FAn" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: user ? "Sé el primero en compartir tu experiencia con este producto." : "Inicia sesión para ser el primero en compartir tu experiencia." })] })) : (reviews
                    .filter(review => !user || review.user.id !== user.id) // No mostrar la reseña del usuario actual en la lista
                    .map((review) => ((0, jsx_runtime_1.jsx)("div", { className: "border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start space-x-4", children: [(0, jsx_runtime_1.jsxs)(avatar_1.Avatar, { className: "h-10 w-10", children: [(0, jsx_runtime_1.jsx)(avatar_1.AvatarImage, { src: review.user.avatar }), (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "h-5 w-5" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2 mb-2", children: [(0, jsx_runtime_1.jsx)("h5", { className: "font-medium text-gray-900 dark:text-gray-100", children: review.user.name }), review.verified && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "secondary", className: "text-xs", children: "Compra Verificada" }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4 mb-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center", children: [...Array(5)].map((_, i) => ((0, jsx_runtime_1.jsx)(lucide_react_1.Star, { size: 14, className: `${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}` }, i))) }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-3 w-3 inline mr-1" }), formatDate(review.createdAt)] })] }), (0, jsx_runtime_1.jsx)("h6", { className: "font-medium text-gray-900 dark:text-gray-100 mb-2", children: review.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-700 dark:text-gray-300 mb-3", children: review.comment }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsxs)("button", { className: "flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ThumbsUp, { className: "h-4 w-4 mr-1" }), "\u00DAtil (", review.helpful, ")"] }), (0, jsx_runtime_1.jsx)("button", { className: "text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300", children: "Responder" })] })] })] }) }, review.id)))) })] }));
}
