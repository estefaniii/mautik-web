import Head from 'next/head'

/**
 * ⚠️ ESTE COMPONENTE NO HACE NADA. No lo uses para SEO nuevo.
 *
 * Usa `next/head`, que es API del Pages Router. En el App Router (que es lo
 * que usa este proyecto) `next/head` se ignora por completo: ni el <title>,
 * ni las meta, ni el JSON-LD de acá llegan al HTML.
 *
 * Verificado en producción el 2026-09-09: la ficha de producto devolvía un
 * solo bloque JSON-LD (el global del layout) y el <title> genérico del sitio,
 * no el nombre del producto.
 *
 * Reemplazo correcto:
 *   - metadata por página -> `generateMetadata` en un layout/página SERVIDOR
 *     (ver app/product/[id]/layout.tsx)
 *   - datos estructurados -> helpers de lib/seo/structured-data.ts
 *
 * Se deja en el repo solo para no romper las páginas que todavía lo importan.
 * Cuando cada una tenga su `generateMetadata`, este archivo se borra.
 */
interface MetaTagsProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  product?: {
    name: string
    price: string
    currency: string
    availability: 'in stock' | 'out of stock'
    category: string
  }
}

export default function MetaTags({
  title = 'Mautik - Hecho a Mano & Selección Especial',
  description = 'Descubre piezas únicas hechas a mano y productos seleccionados cuidadosamente. Joyería, crochet, decoración y más.',
  keywords = 'artesanía, diseño, joyería, crochet, accesorios, curaduría, panamá, tienda online, hecho a mano, productos seleccionados',
  image = '/maar.png',
  url = 'https://mautik-web.vercel.app',
  type = 'website',
  product
}: MetaTagsProps) {
  const fullTitle = title === 'Mautik - Artesanía Panameña' ? title : `${title} | Mautik`
  const fullUrl = url.startsWith('http') ? url : `https://mautik-web.vercel.app${url}`

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Mautik" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image.startsWith('http') ? image : `https://mautik-web.vercel.app${image}`} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Mautik" />
      <meta property="og:locale" content="es_PA" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image.startsWith('http') ? image : `https://mautik-web.vercel.app${image}`} />
      
      {/* Product Schema Markup */}
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": product.name,
              "description": description,
              "image": image.startsWith('http') ? image : `https://mautik-web.vercel.app${image}`,
              "offers": {
                "@type": "Offer",
                "price": product.price,
                "priceCurrency": product.currency,
                "availability": `https://schema.org/${product.availability.replace(' ', '')}`,
                "url": fullUrl
              },
              "category": product.category,
              "brand": {
                "@type": "Brand",
                "name": "Mautik"
              }
            })
          }}
        />
      )}
      
      {/* Organization Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Mautik",
            "url": "https://mautik-web.vercel.app",
            "logo": "https://mautik-web.vercel.app/maar.png",
            "description": "Artesanía panameña hecha a mano con pasión y dedicación",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "La Chorrera",
              "addressRegion": "Panama Oeste",
              "addressCountry": "PA"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "email": "mautik.official@gmail.com"
            },
            "sameAs": [
              "https://www.facebook.com/Mautikofficial",
              "https://www.instagram.com/mautik_official/",
              "https://www.youtube.com/channel/UCgcupJB4BMMXZH8DAPLNNJg"
            ]
          })
        }}
      />
    </Head>
  )
} 