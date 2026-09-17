/**
 * Datos estructurados (JSON-LD) de Mautik.
 *
 * Cubre las tres cosas que se piden distinto:
 *  - SEO clásico  -> Organization / Store / Product / BreadcrumbList
 *  - GEO (local)  -> LocalBusiness con dirección, coordenadas y areaServed
 *  - AEO          -> FAQPage con respuestas cortas y directas, que es lo que
 *                    citan los asistentes y los resúmenes de IA
 */

import { sitioUrl } from "@/lib/site-url";

export const SITIO = {
  nombre: "Mautik",
  url: sitioUrl(),
  // logo-512.png en vez del logo.PNG original: ese pesaba 4.8 MB (3464x3464
  // px) y es justo el archivo que Google descarga desde este JSON-LD. Este
  // es el mismo logo a 512 px y 155 KB. El original sigue en public/ por si
  // hace falta para impresión.
  logo: "/logo-512.png",
  descripcion:
    "Artesanía hecha a mano en La Chorrera, Panamá: peluches de crochet, llaveros, pulseras, collares, anillos y aretes.",
  instagram: "https://www.instagram.com/mautik_official",
  facebook: "https://www.facebook.com/Mautikofficial",
  ciudad: "La Chorrera",
  provincia: "Panamá Oeste",
  pais: "PA",
  // Centro de La Chorrera. Ajustar si quieres apuntar a una dirección exacta.
  lat: 8.8803,
  lng: -79.7833,
  moneda: "USD",
  idioma: "es-PA",
} as const;

const abs = (ruta: string) => (ruta.startsWith("http") ? ruta : `${SITIO.url}${ruta}`);

/**
 * Negocio local. Es el bloque que hace el trabajo de GEO: sin `address` con
 * localidad y sin `geo`, Google no puede ubicar el negocio en búsquedas del
 * tipo "crochet cerca de mí" o "artesanía en La Chorrera".
 */
export function negocioLocal() {
  return {
    "@context": "https://schema.org",
    "@type": ["Store", "LocalBusiness"],
    "@id": `${SITIO.url}/#tienda`,
    name: SITIO.nombre,
    url: SITIO.url,
    logo: abs(SITIO.logo),
    image: abs(SITIO.logo),
    description: SITIO.descripcion,
    priceRange: "$",
    currenciesAccepted: SITIO.moneda,
    paymentAccepted: "Yappy, PayPal",
    address: {
      "@type": "PostalAddress",
      addressLocality: SITIO.ciudad,
      addressRegion: SITIO.provincia,
      addressCountry: SITIO.pais,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITIO.lat,
      longitude: SITIO.lng,
    },
    areaServed: [
      { "@type": "AdministrativeArea", name: "Panamá Oeste" },
      { "@type": "Country", name: "Panamá" },
    ],
    sameAs: [SITIO.instagram, SITIO.facebook],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "atención al cliente",
      availableLanguage: ["es"],
      areaServed: "PA",
      url: `${SITIO.url}/contact`,
    },
  };
}

/** Sitio + buscador interno, para que Google muestre la caja de búsqueda. */
export function sitioWeb() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITIO.url}/#sitio`,
    name: SITIO.nombre,
    url: SITIO.url,
    inLanguage: SITIO.idioma,
    publisher: { "@id": `${SITIO.url}/#tienda` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITIO.url}/shop?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface ProductoSeo {
  id: string;
  name: string;
  description: string;
  price: number;
  images?: string[];
  category?: string;
  sku?: string;
  stock?: number;
}

/**
 * Producto con oferta. `availability` y `price` tienen que reflejar la realidad:
 * si Google detecta que el precio del schema no coincide con el de la página,
 * deja de mostrar el resultado enriquecido.
 */
export function producto(p: ProductoSeo) {
  const enStock = (p.stock ?? 0) > 0;
  const datos: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITIO.url}/product/${p.id}#producto`,
    name: p.name,
    description: p.description,
    sku: p.sku,
    image: (p.images?.length ? p.images : [SITIO.logo]).map(abs),
    category: p.category,
    brand: { "@type": "Brand", name: SITIO.nombre },
    // Artesanía: cada pieza la hace Mautik a mano
    manufacturer: { "@id": `${SITIO.url}/#tienda` },
    offers: {
      "@type": "Offer",
      url: `${SITIO.url}/product/${p.id}`,
      priceCurrency: SITIO.moneda,
      price: p.price.toFixed(2),
      availability: enStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITIO.url}/#tienda` },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "PA",
        },
      },
    },
  };


  return datos;
}

export function migasDePan(items: Array<{ nombre: string; ruta: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.nombre,
      item: abs(it.ruta),
    })),
  };
}

/**
 * Preguntas frecuentes — esto es el motor del AEO.
 * Las respuestas van primero al grano y en una sola oración cuando se puede,
 * porque es el formato que los asistentes copian textual.
 */
export const PREGUNTAS_FRECUENTES = [
  {
    pregunta: "¿Dónde está Mautik?",
    respuesta:
      "Mautik es un taller artesanal ubicado en La Chorrera, provincia de Panamá Oeste, Panamá. Vendemos en línea y hacemos entregas en todo el país.",
  },
  {
    pregunta: "¿Qué métodos de pago aceptan?",
    respuesta:
      // Yappy sigue esperando la cuenta comercial del banco: hasta que
      // funcione, decirle a Google que se acepta es prometer algo que hoy no
      // se puede cobrar.
      "Pagamos con PayPal, que acepta tarjetas de crédito y débito aunque no tengas cuenta de PayPal. Yappy entra en cuanto el banco apruebe la cuenta comercial.",
  },
  {
    pregunta: "¿Hacen envíos a todo Panamá?",
    respuesta:
      "Sí. Enviamos a todo Panamá por Uno Express, y en La Chorrera ofrecemos entrega personal por 1.50 dólares.",
  },
  {
    pregunta: "¿Los peluches de crochet son hechos a mano?",
    respuesta:
      "Sí, cada peluche se teje a mano pieza por pieza. Por eso no hay dos exactamente iguales y los tiempos de entrega dependen del tamaño.",
  },
  {
    pregunta: "¿Puedo pedir un peluche personalizado?",
    respuesta:
      "Sí. Tejemos personajes, colores y tamaños a pedido. Escríbenos por Instagram (@mautik_official) o desde la página de contacto con la referencia que quieras.",
  },
  {
    pregunta: "¿Cuánto cuesta un peluche de crochet en Mautik?",
    respuesta:
      "Los precios van desde 4.50 dólares por las piezas pequeñas, como la ranita, hasta 30 dólares por la capibara grande con accesorios.",
  },
  {
    pregunta: "¿Cuánto tardan en entregar un pedido?",
    respuesta:
      "Las piezas en stock salen en 1 a 3 días hábiles. Los pedidos personalizados tardan entre 1 y 2 semanas según el tamaño.",
  },
] as const;

export function preguntasFrecuentes() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PREGUNTAS_FRECUENTES.map((f) => ({
      "@type": "Question",
      name: f.pregunta,
      acceptedAnswer: { "@type": "Answer", text: f.respuesta },
    })),
  };
}

/** Junta varios bloques en un solo script con @graph. */
export function grafo(...bloques: Array<Record<string, unknown>>) {
  return {
    "@context": "https://schema.org",
    "@graph": bloques.map(({ "@context": _ctx, ...resto }) => resto),
  };
}
