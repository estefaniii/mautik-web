export interface Product {
	id: number;
	_id?: string; // Para productos de la API
	name: string;
	price: number;
	originalPrice?: number;
	description: string;
	longDescription: string;
	images: string[];
	category: string;
	stock: number;
	rating: number;
	reviewCount: number;
	featured: boolean;
	isNew: boolean;
	discount?: number;
	attributes: { name: string; value: string }[];
	details: { name: string; value: string }[];
	sku: string; // <-- Agregado para compatibilidad
}

export const products: Product[] = [
	{
		id: 1,
		sku: 'ANILLO-ZAFIRO-001',
		name: 'Anillo de Plata con Zafiro',
		price: 120.0,
		originalPrice: 150.0,
		description: 'Anillo artesanal de plata 925 con un zafiro azul natural.',
		longDescription:
			'Este hermoso anillo artesanal está elaborado con plata 925 de la más alta calidad y presenta un deslumbrante zafiro azul natural como piedra central. Cada pieza es única y está cuidadosamente trabajada a mano por nuestros maestros joyeros. El diseño clásico pero elegante lo convierte en la elección perfecta para ocasiones especiales o uso diario.',
		images: [
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
		],
		category: 'Anillos',
		stock: 15,
		rating: 4.8,
		reviewCount: 24,
		featured: true,
		isNew: false,
		discount: 20,
		attributes: [
			{ name: 'Material', value: 'Plata 925' },
			{ name: 'Piedra', value: 'Zafiro natural' },
			{ name: 'Talla', value: 'Ajustable' },
			{ name: 'Peso', value: '8.5g' },
		],
		details: [
			{ name: 'Material', value: 'Plata 925 certificada' },
			{ name: 'Piedra principal', value: 'Zafiro natural azul' },
			{ name: 'Acabado', value: 'Pulido brillante' },
			{ name: 'Garantía', value: '2 años' },
			{ name: 'Cuidados', value: 'Limpiar con paño suave' },
		],
	},
	{
		id: 2,
		sku: 'COLLAR-PERLAS-001',
		name: 'Collar de Perlas Doradas',
		price: 95.0,
		originalPrice: 120.0,
		description: 'Collar elegante con perlas doradas y detalles en oro.',
		longDescription:
			'Este elegante collar está compuesto por perlas cultivadas con un hermoso tono dorado y detalles en oro de 18k. Las perlas han sido cuidadosamente seleccionadas por su lustre y uniformidad. El cierre de seguridad garantiza que tu collar permanezca seguro mientras lo usas.',
		images: [
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
		],
		category: 'Collares',
		stock: 10,
		rating: 4.5,
		reviewCount: 18,
		featured: true,
		isNew: false,
		discount: 21,
		attributes: [
			{ name: 'Material', value: 'Oro 18k y perlas cultivadas' },
			{ name: 'Longitud', value: '45cm' },
			{ name: 'Tipo de perla', value: 'Cultivada dorada' },
			{ name: 'Cierre', value: 'Seguridad con cadena' },
		],
		details: [
			{ name: 'Material', value: 'Oro 18k y perlas cultivadas' },
			{ name: 'Longitud', value: '45cm (ajustable)' },
			{ name: 'Diámetro perlas', value: '8-9mm' },
			{ name: 'Origen perlas', value: 'Cultivadas en agua dulce' },
			{ name: 'Garantía', value: '1 año' },
		],
	},
	{
		id: 3,
		sku: 'ARETES-DIAMANTE-001',
		name: 'Aretes de Diamante',
		price: 280.0,
		description: 'Aretes clásicos con diamantes naturales en oro blanco.',
		longDescription:
			'Estos elegantes aretes presentan diamantes naturales de corte brillante montados en oro blanco de 14k. Perfectos para cualquier ocasión especial, estos aretes añaden un toque de sofisticación a cualquier atuendo.',
		images: [
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
		],
		category: 'Aretes',
		stock: 8,
		rating: 4.9,
		reviewCount: 32,
		featured: true,
		isNew: true,
		attributes: [
			{ name: 'Material', value: 'Oro blanco 14k' },
			{ name: 'Piedra', value: 'Diamante natural' },
			{ name: 'Quilates', value: '0.5ct total' },
			{ name: 'Corte', value: 'Brillante' },
		],
		details: [
			{ name: 'Material', value: 'Oro blanco 14k' },
			{ name: 'Diamantes', value: '0.5ct total, corte brillante' },
			{ name: 'Claridad', value: 'VS1' },
			{ name: 'Color', value: 'G-H' },
			{ name: 'Certificación', value: 'GIA' },
		],
	},
	{
		id: 4,
		sku: 'PULSERA-PLATA-001',
		name: 'Pulsera de Plata Trenzada',
		price: 65.0,
		description: 'Pulsera artesanal de plata con diseño trenzado único.',
		longDescription:
			'Esta hermosa pulsera artesanal presenta un diseño trenzado único elaborado completamente en plata 925. El patrón intrincado refleja la habilidad de nuestros artesanos y crea una pieza verdaderamente especial.',
		images: ['/placeholder.svg?height=400&width=400'],
		category: 'Pulseras',
		stock: 20,
		rating: 4.6,
		reviewCount: 15,
		featured: false,
		isNew: true,
		attributes: [
			{ name: 'Material', value: 'Plata 925' },
			{ name: 'Longitud', value: '18cm' },
			{ name: 'Ancho', value: '12mm' },
			{ name: 'Peso', value: '25g' },
		],
		details: [
			{ name: 'Material', value: 'Plata 925 pura' },
			{ name: 'Técnica', value: 'Trenzado artesanal' },
			{ name: 'Cierre', value: 'Broche de seguridad' },
			{ name: 'Acabado', value: 'Pulido mate' },
			{ name: 'Mantenimiento', value: 'Fácil limpieza' },
		],
	},
	{
		id: 5,
		sku: 'ANILLO-SOLITARIO-001',
		name: 'Anillo de Compromiso Solitario',
		price: 450.0,
		description: 'Anillo de compromiso clásico con diamante solitario.',
		longDescription:
			'El anillo de compromiso perfecto con un diamante solitario de corte brillante montado en oro blanco de 18k. Este diseño clásico y atemporal simboliza el amor eterno y es la elección perfecta para ese momento especial.',
		images: [
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
		],
		category: 'Anillos',
		stock: 5,
		rating: 5.0,
		reviewCount: 28,
		featured: true,
		isNew: false,
		attributes: [
			{ name: 'Material', value: 'Oro blanco 18k' },
			{ name: 'Diamante', value: '1ct, corte brillante' },
			{ name: 'Claridad', value: 'VVS1' },
			{ name: 'Color', value: 'D' },
		],
		details: [
			{ name: 'Material', value: 'Oro blanco 18k' },
			{ name: 'Diamante central', value: '1ct, corte brillante' },
			{ name: 'Claridad', value: 'VVS1' },
			{ name: 'Color', value: 'D (incoloro)' },
			{ name: 'Certificación', value: 'GIA' },
			{ name: 'Garantía', value: 'Lifetime' },
		],
	},
	{
		id: 6,
		sku: 'COLLAR-ORO-001',
		name: 'Collar de Cadena de Oro',
		price: 180.0,
		description: 'Collar de cadena clásica en oro amarillo de 14k.',
		longDescription:
			'Esta elegante cadena de oro amarillo de 14k es perfecta para uso diario o para ocasiones especiales. Su diseño clásico y versátil la convierte en una pieza esencial en cualquier colección de joyería.',
		images: ['/placeholder.svg?height=400&width=400'],
		category: 'Collares',
		stock: 12,
		rating: 4.7,
		reviewCount: 22,
		featured: false,
		isNew: false,
		attributes: [
			{ name: 'Material', value: 'Oro amarillo 14k' },
			{ name: 'Longitud', value: '50cm' },
			{ name: 'Peso', value: '15g' },
			{ name: 'Eslabón', value: 'Tipo cable' },
		],
		details: [
			{ name: 'Material', value: 'Oro amarillo 14k sólido' },
			{ name: 'Longitud', value: '50cm' },
			{ name: 'Ancho', value: '2mm' },
			{ name: 'Peso', value: '15g' },
			{ name: 'Cierre', value: 'Mosquetón con anilla' },
		],
	},
	{
		id: 7,
		sku: 'CROCHET-MUNECA-001',
		name: 'Muñeca de Crochet Amigurumi',
		price: 35.0,
		description: 'Adorable muñeca de crochet hecha a mano con hilo suave.',
		longDescription:
			'Esta hermosa muñeca de crochet está elaborada completamente a mano con hilo de algodón suave y seguro para niños. Cada pieza es única y creada con amor por nuestras artesanas expertas en la técnica amigurumi.',
		images: [
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
		],
		category: 'Crochet',
		stock: 8,
		rating: 4.9,
		reviewCount: 12,
		featured: true,
		isNew: true,
		attributes: [
			{ name: 'Material', value: 'Hilo de algodón 100%' },
			{ name: 'Altura', value: '25cm' },
			{ name: 'Técnica', value: 'Amigurumi' },
			{ name: 'Lavado', value: 'A mano' },
		],
		details: [
			{ name: 'Material', value: 'Hilo de algodón 100% hipoalergénico' },
			{ name: 'Técnica', value: 'Crochet amigurumi' },
			{ name: 'Altura', value: '25cm' },
			{ name: 'Relleno', value: 'Fibra de poliéster segura' },
			{ name: 'Cuidados', value: 'Lavar a mano con agua fría' },
		],
	},
	{
		id: 8,
		sku: 'LLAVERO-FLOR-001',
		name: 'Llavero de Crochet Flor',
		price: 12.0,
		description: 'Llavero decorativo con flor de crochet en colores vibrantes.',
		longDescription:
			'Este hermoso llavero presenta una flor de crochet elaborada a mano con hilos de colores vibrantes. Perfecto para personalizar tus llaves y añadir un toque de color a tu día.',
		images: ['/placeholder.svg?height=400&width=400'],
		category: 'Llaveros',
		stock: 25,
		rating: 4.7,
		reviewCount: 8,
		featured: false,
		isNew: true,
		attributes: [
			{ name: 'Material', value: 'Hilo de algodón y metal' },
			{ name: 'Diámetro', value: '8cm' },
			{ name: 'Colores', value: 'Varios disponibles' },
			{ name: 'Anillo', value: 'Metal resistente' },
		],
		details: [
			{ name: 'Material', value: 'Hilo de algodón 100%' },
			{ name: 'Anillo', value: 'Metal galvanizado' },
			{ name: 'Diámetro', value: '8cm' },
			{ name: 'Colores', value: 'Rosa, azul, amarillo, verde' },
			{ name: 'Cuidados', value: 'Limpiar con paño húmedo' },
		],
	},
	{
		id: 9,
		sku: 'PELUCHE-CONEJO-001',
		name: 'Peluche Conejito de Crochet',
		price: 28.0,
		description: 'Suave peluche de conejito hecho con técnica de crochet.',
		longDescription:
			'Este adorable conejito de peluche está elaborado completamente a mano con hilo suave y relleno de fibra de poliéster. Perfecto para niños y adultos que aprecian las manualidades artesanales.',
		images: [
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
		],
		category: 'Peluches',
		stock: 15,
		rating: 4.8,
		reviewCount: 20,
		featured: true,
		isNew: false,
		attributes: [
			{ name: 'Material', value: 'Hilo suave y fibra' },
			{ name: 'Altura', value: '20cm' },
			{ name: 'Color', value: 'Gris claro' },
			{ name: 'Ojos', value: 'Bordados seguros' },
		],
		details: [
			{ name: 'Material', value: 'Hilo de algodón suave' },
			{ name: 'Relleno', value: 'Fibra de poliéster segura' },
			{ name: 'Altura', value: '20cm' },
			{ name: 'Ojos', value: 'Bordados a mano' },
			{ name: 'Cuidados', value: 'Lavar a mano con agua fría' },
		],
	},
	{
		id: 10,
		sku: 'LLAVERO-CORAZON-001',
		name: 'Llavero de Crochet Corazón',
		price: 10.0,
		description: 'Llavero con corazón de crochet, perfecto como regalo.',
		longDescription:
			'Este llavero presenta un hermoso corazón de crochet elaborado a mano. Ideal como regalo para seres queridos o para añadir un toque romántico a tus llaves.',
		images: ['/placeholder.svg?height=400&width=400'],
		category: 'Llaveros',
		stock: 30,
		rating: 4.6,
		reviewCount: 15,
		featured: false,
		isNew: false,
		attributes: [
			{ name: 'Material', value: 'Hilo de algodón' },
			{ name: 'Tamaño', value: '6cm x 5cm' },
			{ name: 'Color', value: 'Rosa o rojo' },
			{ name: 'Anillo', value: 'Metal plateado' },
		],
		details: [
			{ name: 'Material', value: 'Hilo de algodón 100%' },
			{ name: 'Tamaño', value: '6cm x 5cm' },
			{ name: 'Anillo', value: 'Metal plateado resistente' },
			{ name: 'Colores', value: 'Rosa, rojo' },
			{ name: 'Cuidados', value: 'Limpiar con paño húmedo' },
		],
	},
	{
		id: 11,
		sku: 'PELUCHE-OSO-001',
		name: 'Peluche Oso de Crochet',
		price: 32.0,
		description: 'Oso de peluche elaborado con técnica de crochet artesanal.',
		longDescription:
			'Este tierno oso de peluche está elaborado completamente a mano con hilo suave y relleno de fibra de poliéster. Cada oso es único y creado con amor por nuestras artesanas expertas.',
		images: [
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
		],
		category: 'Peluches',
		stock: 12,
		rating: 4.9,
		reviewCount: 18,
		featured: true,
		isNew: true,
		attributes: [
			{ name: 'Material', value: 'Hilo suave y fibra' },
			{ name: 'Altura', value: '22cm' },
			{ name: 'Color', value: 'Marrón claro' },
			{ name: 'Nariz', value: 'Bordada a mano' },
		],
		details: [
			{ name: 'Material', value: 'Hilo de algodón suave' },
			{ name: 'Relleno', value: 'Fibra de poliéster segura' },
			{ name: 'Altura', value: '22cm' },
			{ name: 'Detalles', value: 'Nariz y ojos bordados' },
			{ name: 'Cuidados', value: 'Lavar a mano con agua fría' },
		],
	},
	{
		id: 12,
		sku: 'LLAVERO-ESTRELLA-001',
		name: 'Llavero de Crochet Estrella',
		price: 8.0,
		description: 'Llavero con estrella de crochet en colores brillantes.',
		longDescription:
			'Este llavero presenta una hermosa estrella de crochet elaborada a mano con hilos de colores brillantes. Perfecto para añadir un toque mágico a tus llaves.',
		images: ['/placeholder.svg?height=400&width=400'],
		category: 'Llaveros',
		stock: 40,
		rating: 4.5,
		reviewCount: 10,
		featured: false,
		isNew: false,
		attributes: [
			{ name: 'Material', value: 'Hilo de algodón' },
			{ name: 'Tamaño', value: '7cm' },
			{ name: 'Colores', value: 'Amarillo, dorado, plateado' },
			{ name: 'Anillo', value: 'Metal dorado' },
		],
		details: [
			{ name: 'Material', value: 'Hilo de algodón 100%' },
			{ name: 'Tamaño', value: '7cm de diámetro' },
			{ name: 'Anillo', value: 'Metal dorado resistente' },
			{ name: 'Colores', value: 'Amarillo, dorado, plateado' },
			{ name: 'Cuidados', value: 'Limpiar con paño húmedo' },
		],
	},
];

export const categories = [
	{
		name: 'Anillos',
		slug: 'anillos',
		count: products.filter((p) => p.category === 'Anillos').length,
	},
	{
		name: 'Collares',
		slug: 'collares',
		count: products.filter((p) => p.category === 'Collares').length,
	},
	{
		name: 'Aretes',
		slug: 'aretes',
		count: products.filter((p) => p.category === 'Aretes').length,
	},
	{
		name: 'Pulseras',
		slug: 'pulseras',
		count: products.filter((p) => p.category === 'Pulseras').length,
	},
	{
		name: 'Crochet',
		slug: 'crochet',
		count: products.filter((p) => p.category === 'Crochet').length,
	},
	{
		name: 'Llaveros',
		slug: 'llaveros',
		count: products.filter((p) => p.category === 'Llaveros').length,
	},
	{
		name: 'Peluches',
		slug: 'peluches',
		count: products.filter((p) => p.category === 'Peluches').length,
	},
];
