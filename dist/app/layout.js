"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
const google_1 = require("next/font/google");
require("./globals.css");
const accessibility_1 = require("@/components/ui/accessibility");
const toaster_1 = require("@/components/ui/toaster");
const navbar_1 = __importDefault(require("@/components/navbar"));
const footer_1 = __importDefault(require("@/components/footer"));
const client_providers_1 = __importDefault(require("./client-providers"));
const inter = (0, google_1.Inter)({ subsets: ["latin"] });
exports.metadata = {
    title: "Mautik - Artesanías Únicas",
    description: "Descubre nuestra colección de artesanías únicas hechas a mano. Joyería, crochet, llaveros y más.",
    keywords: "artesanías, joyería, crochet, llaveros, pulseras, collares, anillos, aretes",
    authors: [{ name: "Mautik" }],
    creator: "Mautik",
    publisher: "Mautik",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
    openGraph: {
        title: "Mautik - Artesanías Únicas",
        description: "Descubre nuestra colección de artesanías únicas hechas a mano.",
        url: "/",
        siteName: "Mautik",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Mautik - Artesanías Únicas",
            },
        ],
        locale: "es_ES",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Mautik - Artesanías Únicas",
        description: "Descubre nuestra colección de artesanías únicas hechas a mano.",
        images: ["/og-image.jpg"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    verification: {
        google: "your-google-verification-code",
    },
};
function RootLayout({ children, }) {
    return ((0, jsx_runtime_1.jsxs)("html", { lang: "es", suppressHydrationWarning: true, children: [(0, jsx_runtime_1.jsxs)("head", { children: [(0, jsx_runtime_1.jsx)("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }), (0, jsx_runtime_1.jsx)("meta", { name: "theme-color", content: "#7c3aed" }), (0, jsx_runtime_1.jsx)("link", { rel: "icon", href: "/favicon.ico" }), (0, jsx_runtime_1.jsx)("link", { rel: "apple-touch-icon", href: "/apple-touch-icon.png" }), (0, jsx_runtime_1.jsx)("link", { rel: "manifest", href: "/manifest.json" }), (0, jsx_runtime_1.jsx)("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }), (0, jsx_runtime_1.jsx)("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" }), (0, jsx_runtime_1.jsx)("link", { rel: "dns-prefetch", href: "//hebbkx1anhila5yf.public.blob.vercel-storage.com" }), (0, jsx_runtime_1.jsx)("script", { type: "application/ld+json", dangerouslySetInnerHTML: {
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "Organization",
                                "name": "Mautik",
                                "url": "https://mautik.com",
                                "logo": "https://mautik.com/logo.png",
                                "description": "Artesanías únicas hechas a mano",
                                "address": {
                                    "@type": "PostalAddress",
                                    "addressCountry": "PA"
                                },
                                "contactPoint": {
                                    "@type": "ContactPoint",
                                    "contactType": "customer service"
                                },
                                "sameAs": [
                                    "https://facebook.com/mautik",
                                    "https://instagram.com/mautik"
                                ]
                            })
                        } })] }), (0, jsx_runtime_1.jsx)("body", { className: inter.className, children: (0, jsx_runtime_1.jsxs)(client_providers_1.default, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen flex flex-col", children: [(0, jsx_runtime_1.jsx)(accessibility_1.SkipLinks, {}), (0, jsx_runtime_1.jsx)("header", { id: "main-navigation", role: "banner", children: (0, jsx_runtime_1.jsx)(navbar_1.default, {}) }), (0, jsx_runtime_1.jsx)("main", { id: "main-content", role: "main", className: "flex-1", style: { paddingTop: '72px' }, children: children }), (0, jsx_runtime_1.jsx)("footer", { id: "footer", role: "contentinfo", children: (0, jsx_runtime_1.jsx)(footer_1.default, {}) })] }), (0, jsx_runtime_1.jsx)(toaster_1.Toaster, {})] }) })] }));
}
