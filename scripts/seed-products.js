const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const products = [
	{
		name: 'Pulsera de Crochet Elegante',
		description:
			'Hermosa pulsera tejida a mano con hilos de colores vibrantes. Perfecta para cualquier ocasión.',
		price: 25.99,
		originalPrice: 35.99,
		stock: 15,
		images: ['/placeholder.jpg'],
		category: 'pulseras',
		sku: 'PUL-001',
		featured: true,
		isNew: true,
		discount: 28,
	},
	{
		name: 'Collar Bohemio Artesanal',
		description:
			'Collar único con diseño bohemio, perfecto para complementar tu estilo casual.',
		price: 45.5,
		originalPrice: 55.5,
		stock: 8,
		images: ['/placeholder.jpg'],
		category: 'collares',
		sku: 'COL-001',
		featured: true,
		isNew: false,
		discount: 18,
	},
	{
		name: 'Llavero Personalizado',
		description:
			'Llavero hecho a mano con tu nombre o diseño personalizado. Ideal como regalo.',
		price: 12.99,
		originalPrice: 15.99,
		stock: 25,
		images: ['/placeholder.jpg'],
		category: 'llaveros',
		sku: 'LLA-001',
		featured: false,
		isNew: true,
		discount: 19,
	},
	{
		name: 'Aretes de Flores',
		description:
			'Aretes delicados con diseño de flores, perfectos para el día a día.',
		price: 18.75,
		originalPrice: 22.75,
		stock: 12,
		images: ['/placeholder.jpg'],
		category: 'aretes',
		sku: 'ARE-001',
		featured: false,
		isNew: false,
		discount: 18,
	},
	{
		name: 'Anillo Minimalista',
		description:
			'Anillo elegante con diseño minimalista, ideal para cualquier ocasión.',
		price: 32.0,
		originalPrice: 40.0,
		stock: 10,
		images: ['/placeholder.jpg'],
		category: 'anillos',
		sku: 'ANI-001',
		featured: true,
		isNew: false,
		discount: 20,
	},
	{
		name: 'Bolsa de Crochet',
		description:
			'Bolsa tejida a mano, perfecta para llevar tus pertenencias con estilo.',
		price: 55.99,
		originalPrice: 65.99,
		stock: 6,
		images: ['/placeholder.jpg'],
		category: 'crochet',
		sku: 'BOL-001',
		featured: true,
		isNew: true,
		discount: 15,
	},
	{
		name: 'Pulsera de Amistad',
		description:
			'Pulsera colorida tejida a mano, símbolo de amistad y buena vibra.',
		price: 8.99,
		originalPrice: 12.99,
		stock: 30,
		images: ['/placeholder.jpg'],
		category: 'pulseras',
		sku: 'PUL-002',
		featured: false,
		isNew: false,
		discount: 31,
	},
	{
		name: 'Collar de Perlas',
		description:
			'Collar elegante con perlas naturales, perfecto para ocasiones especiales.',
		price: 75.5,
		originalPrice: 85.5,
		stock: 5,
		images: ['/placeholder.jpg'],
		category: 'collares',
		sku: 'COL-002',
		featured: true,
		isNew: false,
		discount: 12,
	},
	{
		name: 'Llavero de Corazón',
		description:
			'Llavero adorable con forma de corazón, ideal como regalo romántico.',
		price: 9.99,
		originalPrice: 14.99,
		stock: 20,
		images: ['/placeholder.jpg'],
		category: 'llaveros',
		sku: 'LLA-002',
		featured: false,
		isNew: true,
		discount: 33,
	},
	{
		name: 'Aretes de Mariposa',
		description:
			'Aretes delicados con diseño de mariposa, perfectos para la primavera.',
		price: 22.5,
		originalPrice: 28.5,
		stock: 15,
		images: ['/placeholder.jpg'],
		category: 'aretes',
		sku: 'ARE-002',
		featured: false,
		isNew: false,
		discount: 21,
	},
	{
		name: 'Anillo de Plata',
		description:
			'Anillo elegante de plata, perfecto para complementar cualquier outfit.',
		price: 45.0,
		originalPrice: 55.0,
		stock: 8,
		images: ['/placeholder.jpg'],
		category: 'anillos',
		sku: 'ANI-002',
		featured: true,
		isNew: false,
		discount: 18,
	},
	{
		name: 'Mantel de Crochet',
		description:
			'Mantel tejido a mano con diseño tradicional, perfecto para tu mesa.',
		price: 89.99,
		originalPrice: 99.99,
		stock: 4,
		images: ['/placeholder.jpg'],
		category: 'crochet',
		sku: 'MAN-001',
		featured: false,
		isNew: true,
		discount: 10,
	},
];

async function seedProducts() {
	try {
		console.log('🌱 Iniciando seed de productos...');

		// Limpiar productos existentes
		await prisma.product.deleteMany({});
		console.log('🗑️ Productos existentes eliminados');

		// Crear nuevos productos
		for (const product of products) {
			await prisma.product.create({
				data: product,
			});
			console.log(`✅ Producto creado: ${product.name}`);
		}

		console.log('🎉 Seed de productos completado exitosamente!');
		console.log(`📊 Total de productos creados: ${products.length}`);
	} catch (error) {
		console.error('❌ Error durante el seed:', error);
	} finally {
		await prisma.$disconnect();
	}
}

seedProducts();
