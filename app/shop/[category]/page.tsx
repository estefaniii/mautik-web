import { notFound } from "next/navigation"
import ProductCard from "@/components/product-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { Product } from "@/types/product"

interface CategoryPageProps {
  params: {
    category: string
  }
}

interface ApiProduct {
  id: string
  name: string
  price: number
  originalPrice?: number
  description: string
  images: string[]
  category: string
  stock: number
  averageRating?: number
  totalReviews?: number
  featured?: boolean
  isNew?: boolean
  discount?: number
}

async function fetchCategoryProducts(categoryName: string): Promise<Product[]> {
  try {
    // Usar URL relativa para desarrollo y producción
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      : 'http://localhost:3001' // Puerto del servidor de desarrollo
    
    const res = await fetch(`${baseUrl}/api/products?category=${encodeURIComponent(categoryName)}`, { 
      cache: 'no-store' 
    })
    
    if (!res.ok) {
      console.error('Error fetching category products:', res.status)
      return []
    }
    
    const apiProducts: ApiProduct[] = await res.json()
    
    // Mapear productos de la API al formato esperado por ProductCard
    return apiProducts.map((apiProduct: ApiProduct): Product => ({
      id: apiProduct.id,
      name: apiProduct.name,
      price: apiProduct.price,
      originalPrice: apiProduct.originalPrice || apiProduct.price,
      description: apiProduct.description,
      images: Array.isArray(apiProduct.images) && apiProduct.images.length > 0 
        ? apiProduct.images 
        : ['/placeholder.svg'],
      category: apiProduct.category || '',
      stock: apiProduct.stock,
      rating: apiProduct.averageRating || 4.5,
      reviewCount: apiProduct.totalReviews || 0,
      featured: apiProduct.featured || false,
      isNew: apiProduct.isNew || false,
      discount: apiProduct.discount || 0,
      attributes: [],
      details: [],
      sku: '',
    }))
  } catch (error) {
    console.error('Error in fetchCategoryProducts:', error)
    return []
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Decode the category from URL
  const categoryName = decodeURIComponent(params.category)

  // Fetch products for this category
  const categoryProducts = await fetchCategoryProducts(categoryName)

  // If no products found, show mensaje amigable
  return (
    <div className="bg-gradient-to-b from-purple-50 to-white min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/shop">Tienda</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-purple-800 font-medium">{categoryName}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-3xl font-bold text-purple-900">{categoryName}</h1>
          <Link href="/shop">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-purple-800 text-purple-800 hover:bg-purple-100"
            >
              <ArrowLeft size={16} /> Volver a la Tienda
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        {categoryProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg mb-4">No hay productos en esta categoría por ahora.</p>
            <p className="text-sm text-gray-400">Pronto tendremos nuevos productos disponibles.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categoryProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        )}
      </div>
    </div>
  )
}
