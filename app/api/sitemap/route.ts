import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sitioUrl } from '@/lib/site-url';

/**
 * Sin esto Next intentaba prerenderizar la ruta durante el build, lo que
 * obliga a conectarse a la base en tiempo de compilación: un hipo de conexión
 * tumbaba el deploy entero (pasó el 2026-09-09). Un sitemap se genera al
 * pedirlo, no al compilar.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
	// El dominio real, no uno fijo: antes decía https://mautik.com, que no
	// sirve esta app, así que el sitemap listaba URLs inexistentes.
	const BASE_URL = sitioUrl();
	const products = await prisma.product.findMany({ select: { id: true } });
	const urls = [
		BASE_URL,
		...products.map((p: { id: string }) => `${BASE_URL}/product/${p.id}`),
	];
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `<url><loc>${url}</loc></url>`).join('')}
</urlset>`;
	return new NextResponse(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
		},
	});
}
