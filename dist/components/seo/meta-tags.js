"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MetaTags;
const jsx_runtime_1 = require("react/jsx-runtime");
const head_1 = __importDefault(require("next/head"));
function MetaTags({ title = 'Mautik - Artesanía Panameña', description = 'Descubre la belleza de la artesanía panameña. Productos únicos hechos a mano con pasión y dedicación.', keywords = 'artesanía, panamá, crochet, joyería, accesorios, handmade, artesanía panameña', image = '/maar.png', url = 'https://mautik.com', type = 'website', product }) {
    const fullTitle = title === 'Mautik - Artesanía Panameña' ? title : `${title} | Mautik`;
    const fullUrl = url.startsWith('http') ? url : `https://mautik.com${url}`;
    return ((0, jsx_runtime_1.jsxs)(head_1.default, { children: [(0, jsx_runtime_1.jsx)("title", { children: fullTitle }), (0, jsx_runtime_1.jsx)("meta", { name: "description", content: description }), (0, jsx_runtime_1.jsx)("meta", { name: "keywords", content: keywords }), (0, jsx_runtime_1.jsx)("meta", { name: "author", content: "Mautik" }), (0, jsx_runtime_1.jsx)("meta", { name: "robots", content: "index, follow" }), (0, jsx_runtime_1.jsx)("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }), (0, jsx_runtime_1.jsx)("link", { rel: "canonical", href: fullUrl }), (0, jsx_runtime_1.jsx)("meta", { property: "og:title", content: fullTitle }), (0, jsx_runtime_1.jsx)("meta", { property: "og:description", content: description }), (0, jsx_runtime_1.jsx)("meta", { property: "og:image", content: image.startsWith('http') ? image : `https://mautik.com${image}` }), (0, jsx_runtime_1.jsx)("meta", { property: "og:url", content: fullUrl }), (0, jsx_runtime_1.jsx)("meta", { property: "og:type", content: type }), (0, jsx_runtime_1.jsx)("meta", { property: "og:site_name", content: "Mautik" }), (0, jsx_runtime_1.jsx)("meta", { property: "og:locale", content: "es_PA" }), (0, jsx_runtime_1.jsx)("meta", { name: "twitter:card", content: "summary_large_image" }), (0, jsx_runtime_1.jsx)("meta", { name: "twitter:title", content: fullTitle }), (0, jsx_runtime_1.jsx)("meta", { name: "twitter:description", content: description }), (0, jsx_runtime_1.jsx)("meta", { name: "twitter:image", content: image.startsWith('http') ? image : `https://mautik.com${image}` }), product && ((0, jsx_runtime_1.jsx)("script", { type: "application/ld+json", dangerouslySetInnerHTML: {
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
                } })), (0, jsx_runtime_1.jsx)("script", { type: "application/ld+json", dangerouslySetInnerHTML: {
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
                } })] }));
}
