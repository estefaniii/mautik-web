import Head from 'next/head'

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
  title = 'Mautik - Artesanía Panameña',
  description = 'Descubre la belleza de la artesanía panameña. Productos únicos hechos a mano con pasión y dedicación.',
  keywords = 'artesanía, panamá, crochet, joyería, accesorios, handmade, artesanía panameña',
  image = '/maar.png',
  url = 'https://mautik.com',
  type = 'website',
  product
}: MetaTagsProps) {
  const fullTitle = title === 'Mautik - Artesanía Panameña' ? title : `${title} | Mautik`
  const fullUrl = url.startsWith('http') ? url : `https://mautik.com${url}`

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
      <meta property="og:image" content={image.startsWith('http') ? image : `https://mautik.com${image}`} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Mautik" />
      <meta property="og:locale" content="es_PA" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image.startsWith('http') ? image : `https://mautik.com${image}`} />
      
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
              "image": image.startsWith('http') ? image : `https://mautik.com${image}`,
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
            "url": "https://mautik.com",
            "logo": "https://mautik.com/maar.png",
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