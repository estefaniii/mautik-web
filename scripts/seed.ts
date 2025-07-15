import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const sampleProducts = [
	{
		name: 'Smartphone Premium X1',
		description:
			'El último smartphone con tecnología avanzada, cámara de 108MP, pantalla OLED de 6.7 pulgadas y procesador de última generación.',
		price: 899.99,
		originalPrice: 1099.99,
		category: 'electronics',
		subcategory: 'smartphones',
		images: [
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
		],
		stock: 50,
		sku: 'PHONE-X1-001',
		brand: 'TechBrand',
		tags: ['smartphone', 'premium', '5G', 'cámara'],
		specifications: {
			screen: '6.7 OLED',
			camera: '108MP',
			battery: '4500mAh',
			storage: '256GB',
		},
		reviews: [],
		isActive: true,
		isFeatured: true,
	},
	{
		name: 'Laptop Gaming Pro',
		description:
			'Laptop para gaming con RTX 4070, Intel i7, 32GB RAM y SSD de 1TB. Perfecta para juegos y trabajo profesional.',
		price: 1599.99,
		originalPrice: 1899.99,
		category: 'electronics',
		subcategory: 'laptops',
		images: [
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
		],
		stock: 25,
		sku: 'LAPTOP-GAMING-001',
		brand: 'GameTech',
		tags: ['laptop', 'gaming', 'RTX', 'i7'],
		specifications: {
			processor: 'Intel i7-13700H',
			graphics: 'RTX 4070',
			ram: '32GB DDR5',
			storage: '1TB SSD',
		},
		reviews: [],
		isActive: true,
		isFeatured: true,
	},
	{
		name: 'Camiseta Casual Premium',
		description:
			'Camiseta de algodón 100% orgánico, corte moderno y colores vibrantes. Perfecta para el día a día.',
		price: 29.99,
		originalPrice: 39.99,
		category: 'clothing',
		subcategory: 'shirts',
		images: [
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
		],
		stock: 100,
		sku: 'SHIRT-CASUAL-001',
		brand: 'FashionCo',
		tags: ['camiseta', 'algodón', 'casual', 'orgánico'],
		specifications: {
			material: '100% Algodón Orgánico',
			fit: 'Regular',
			care: 'Lavado a máquina',
		},
		reviews: [],
		isActive: true,
		isFeatured: false,
	},
	{
		name: 'Auriculares Inalámbricos Pro',
		description:
			'Auriculares con cancelación de ruido activa, 30 horas de batería y sonido Hi-Fi premium.',
		price: 199.99,
		originalPrice: 249.99,
		category: 'electronics',
		subcategory: 'audio',
		images: [
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
		],
		stock: 75,
		sku: 'HEADPHONES-PRO-001',
		brand: 'AudioTech',
		tags: ['auriculares', 'inalámbricos', 'cancelación ruido', 'Hi-Fi'],
		specifications: {
			battery: '30 horas',
			connectivity: 'Bluetooth 5.3',
			features: 'Cancelación de ruido activa',
			weight: '250g',
		},
		reviews: [],
		isActive: true,
		isFeatured: true,
	},
	{
		name: 'Reloj Inteligente Sport',
		description:
			'Reloj inteligente con GPS, monitor de salud, resistente al agua y más de 100 modos deportivos.',
		price: 299.99,
		category: 'electronics',
		subcategory: 'wearables',
		images: [
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
		],
		stock: 60,
		sku: 'WATCH-SPORT-001',
		brand: 'SportTech',
		tags: ['reloj', 'inteligente', 'GPS', 'deporte', 'salud'],
		specifications: {
			display: '1.4 AMOLED',
			battery: '14 días',
			waterproof: '5ATM',
			sensors: 'GPS, Corazón, SpO2',
		},
		reviews: [],
		isActive: true,
		isFeatured: true,
	},
];

async function seedDatabase() {
	try {
		await prisma.$connect();
		console.log('Conectado a MongoDB');

		// Limpiar datos existentes
		await prisma.product.deleteMany({});
		await prisma.user.deleteMany({});
		console.log('Datos existentes eliminados');

		// Crear productos
		await prisma.product.createMany({ data: sampleProducts });
		console.log('Productos de ejemplo creados');

		// Crear usuario administrador
		const adminPassword = 'admin123'; // Plain text for demo
		await prisma.user.create({
			data: {
				name: 'Administrador',
				email: 'admin@mautik.com',
				password: adminPassword,
				isAdmin: true,
			},
		});

		// Crear usuario normal
		const userPassword = 'user123'; // Plain text for demo
		await prisma.user.create({
			data: {
				name: 'Usuario Demo',
				email: 'user@mautik.com',
				password: userPassword,
				isAdmin: false,
			},
		});

		console.log('Usuarios de ejemplo creados');
		console.log('✅ Base de datos poblada exitosamente');
		console.log('');
		console.log('Credenciales de acceso:');
		console.log('Admin: admin@mautik.com / admin123');
		console.log('Usuario: user@mautik.com / user123');

		process.exit(0);
	} catch (error) {
		console.error('Error poblando la base de datos:', error);
		process.exit(1);
	}
}

seedDatabase();
