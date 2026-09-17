/**
 * Las categorías de la tienda, en un solo lugar.
 *
 * Estaban escritas TRES veces y de tres formas distintas:
 *  · `components/navbar.tsx` — con enlaces a `/shop?category=<slug>` (el
 *    filtro, no la página).
 *  · `components/footer.tsx` — con enlaces a `/shop/<slug>` y "Otros tejidos"
 *    en vez de "Otros".
 *  · `components/category-showcase.tsx` — con foto y descripción.
 *
 * O sea que el mismo enlace llevaba a sitios distintos según desde dónde se
 * tocara, y agregar una categoría obligaba a acordarse de tres archivos.
 *
 * Las páginas `/shop/<slug>` existen de verdad, con su título y su
 * descripción, así que son las que valen para enlazar.
 */

export interface Categoria {
	slug: string;
	nombre: string;
	href: string;
	imagen: string;
	descripcion: string;
}

export const CATEGORIAS: Categoria[] = [
	{
		slug: 'crochet',
		nombre: 'Crochet',
		href: '/shop/crochet',
		imagen: '/productos/mtk-cr-013.webp',
		descripcion: 'Peluches y figuras tejidas una por una',
	},
	{
		slug: 'llaveros',
		nombre: 'Llaveros',
		href: '/shop/llaveros',
		imagen: '/productos/mtk-ll-002.webp',
		descripcion: 'Del tamaño justo para la mochila o las llaves',
	},
	{
		slug: 'pulseras',
		nombre: 'Pulseras',
		href: '/shop/pulseras',
		imagen: '/productos/mtk-pu-006.webp',
		descripcion: 'De hilo y de perlas, con cierre ajustable',
	},
	{
		slug: 'collares',
		nombre: 'Collares',
		href: '/shop/collares',
		imagen: '/productos/mtk-co-003.webp',
		descripcion: 'Collares y chockers, con la inicial que quieras',
	},
	{
		slug: 'anillos',
		nombre: 'Anillos',
		href: '/shop/anillos',
		imagen: '/productos/mtk-an-003.webp',
		descripcion: 'De perlas, sencillos o con cuenta de diseño',
	},
	{
		slug: 'aretes',
		nombre: 'Aretes',
		href: '/shop/aretes',
		imagen: '/productos/mtk-ar-003.webp',
		descripcion: 'Incluidos los tipo piercing para segundos huecos',
	},
	{
		slug: 'otros',
		nombre: 'Otros tejidos',
		href: '/shop/otros',
		imagen: '/productos/mtk-ot-002.webp',
		descripcion: 'Vinchas, tops, bolsos y más, todo tejido',
	},
];
