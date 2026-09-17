import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: 'res.cloudinary.com' },
			{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
			{ protocol: 'https', hostname: 'lh3.googleusercontent.com' },
			{ protocol: 'https', hostname: 'images.unsplash.com' },
		],
		// Solo WebP, a propósito. AVIF pesa ~20% menos pero codificar es
		// carísimo en CPU: con 22 imágenes en la portada el optimizador se
		// atoraba y varias quedaban sin cargar. WebP ya ahorra ~30% contra
		// JPEG, codifica rápido y lo soporta cualquier navegador actual.
		formats: ['image/webp'],
		// Las fotos de producto se sirven en la grilla (~300px), en la ficha
		// (~800px) y en el hero (a sangre). Recortar la lista de anchos evita
		// generar variantes que nadie pide.
		deviceSizes: [640, 768, 1024, 1280, 1536, 1920],
		imageSizes: [64, 128, 256, 384],
		// Un mes de caché en el optimizador: las fotos de artesanía no cambian.
		minimumCacheTTL: 2678400,
	},

	// Comprime el HTML/JS que sirve el servidor.
	compress: true,
	// No filtrar la versión de Next en las cabeceras.
	poweredByHeader: false,

	experimental: {
		// Solo importa los iconos que realmente se usan en vez del paquete
		// completo: lucide-react y react-icons son enormes.
		optimizePackageImports: ['lucide-react', 'react-icons', 'date-fns', 'recharts'],
	},
	/*
	  Cabeceras de seguridad.

	  El sitio solo mandaba HSTS. Faltaban las cuatro básicas, y en una tienda
	  que cobra con PayPal la primera importa de verdad: sin `X-Frame-Options`
	  cualquiera puede meter el checkout de Mautik dentro de un iframe en otra
	  página y poner botones falsos encima (clickjacking).
	*/
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					// Nadie puede meter el sitio dentro de un iframe.
					{ key: 'X-Frame-Options', value: 'DENY' },
					// El navegador respeta el tipo de archivo que declara el servidor
					// y no "adivina" (un .txt no se ejecuta como script).
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					// Al salir del sitio se manda el dominio, no la URL completa:
					// las páginas de pedido no filtran su dirección a terceros.
					{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
					// La tienda no usa cámara, micrófono ni ubicación: se apagan.
					{
						key: 'Permissions-Policy',
						value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
					},
				],
			},
		];
	},
	// Remover configuraciones experimentales que pueden causar problemas
	// experimental: {
	//   webpackBuildWorker: true,
	//   parallelServerBuildTraces: true,
	//   parallelServerCompiles: true,
	// },
};

export default withSentryConfig(nextConfig, {
	org: 'mautik',
	project: 'javascript-nextjs',
	silent: !process.env.CI,
	widenClientFileUpload: true,
	tunnelRoute: '/monitoring',
	disableLogger: true,
	automaticVercelMonitors: true,
	autoInstrumentServerFunctions: false,
	autoInstrumentAppDirectory: false,
	autoInstrumentMiddleware: false,
});
