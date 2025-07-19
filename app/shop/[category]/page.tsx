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

async function fetchCategoryProducts(categoryName: string): Promise<Product[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/products?category=${encodeURIComponent(categoryName)}`, { cache: 'no-store' })
  if (!res.ok) return []
  return await res.json()
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
            No hay productos en esta categoría por ahora.
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
