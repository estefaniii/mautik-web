import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

// Loading spinner
export function LoadingSpinner({ size = "default", className = "" }: { 
  size?: "sm" | "default" | "lg", 
  className?: string 
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  )
}

// Loading overlay
export function LoadingOverlay({ 
  message = "Cargando...",
  className = ""
}: { 
  message?: string,
  className?: string 
}) {
  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  )
}

// Product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <div className="relative">
        <Skeleton className="h-64 w-full" />
        <div className="absolute top-3 left-3 space-y-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="absolute top-3 right-3">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}

// Product grid skeleton
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number, columns?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          {[...Array(columns)].map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Form skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex space-x-2 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

// Page skeleton
export function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  )
}

// Inline loading
export function InlineLoading({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
      <LoadingSpinner size="sm" />
      <span className="text-sm">{message}</span>
    </div>
  )
}

// Button loading
export function ButtonLoading({ children, loading, ...props }: {
  children: React.ReactNode
  loading?: boolean
  [key: string]: any
}) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`flex items-center space-x-2 ${props.className || ''}`}
    >
      {loading && <LoadingSpinner size="sm" />}
      <span>{children}</span>
    </button>
  )
} 