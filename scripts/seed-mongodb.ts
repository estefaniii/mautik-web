import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import connectDB from '../lib/db';
import Product from '../models/Product';
import User from '../models/User';
import bcrypt from 'bcryptjs';

const sampleProducts = [
	{
		name: 'Anillo de Plata con Zafiro',
		description: 'Anillo artesanal de plata 925 con un zafiro azul natural.',
		longDescription:
			'Este hermoso anillo artesanal está elaborado con plata 925 de la más alta calidad y presenta un deslumbrante zafiro azul natural como piedra central. Cada pieza es única y está cuidadosamente trabajada a mano por nuestros maestros joyeros.',
		price: 120.0,
		originalPrice: 150.0,
		category: 'Anillos',
		subcategory: 'anillos',
		images: [
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
		],
		stock: 15,
		sku: 'ANILLO-ZAFIRO-001',
		brand: 'Mautik',
		tags: ['anillo', 'plata', 'zafiro', 'artesanal'],
		specifications: {
			material: 'Plata 925',
			piedra: 'Zafiro natural',
			talla: 'Ajustable',
			peso: '8.5g',
		},
		reviews: [],
		averageRating: 4.8,
		totalReviews: 24,
		isActive: true,
		isFeatured: true,
	},
	{
		name: 'Collar de Perlas Doradas',
		description: 'Collar elegante con perlas doradas y detalles en oro.',
		longDescription:
			'Este elegante collar está compuesto por perlas cultivadas con un hermoso tono dorado y detalles en oro de 18k. Las perlas han sido cuidadosamente seleccionadas por su lustre y uniformidad.',
		price: 95.0,
		originalPrice: 120.0,
		category: 'Collares',
		subcategory: 'collares',
		images: [
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
		],
		stock: 10,
		sku: 'COLLAR-PERLAS-001',
		brand: 'Mautik',
		tags: ['collar', 'perlas', 'oro', 'elegante'],
		specifications: {
			material: 'Oro 18k y perlas cultivadas',
			longitud: '45cm',
			tipo_perla: 'Cultivada dorada',
			cierre: 'Seguridad con cadena',
		},
		reviews: [],
		averageRating: 4.5,
		totalReviews: 18,
		isActive: true,
		isFeatured: true,
	},
	{
		name: 'Aretes de Diamante',
		description: 'Aretes clásicos con diamantes naturales en oro blanco.',
		longDescription:
			'Estos elegantes aretes presentan diamantes naturales de corte brillante montados en oro blanco de 14k. Perfectos para cualquier ocasión especial.',
		price: 280.0,
		category: 'Aretes',
		subcategory: 'aretes',
		images: [
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
		],
		stock: 8,
		sku: 'ARETES-DIAMANTE-001',
		brand: 'Mautik',
		tags: ['aretes', 'diamante', 'oro blanco', 'clásico'],
		specifications: {
			material: 'Oro blanco 14k',
			piedra: 'Diamante natural',
			quilates: '0.5ct total',
			corte: 'Brillante',
		},
		reviews: [],
		averageRating: 4.9,
		totalReviews: 32,
		isActive: true,
		isFeatured: true,
	},
	{
		name: 'Luffy de Crochet Amigurumi',
		description: 'Adorable Luffy de crochet hecha a mano con hilo suave.',
		longDescription:
			'Esta hermosa muñeca de Luffy está elaborada completamente a mano con hilo de algodón suave y seguro para niños. Cada pieza es única y creada con amor.',
		price: 25.0,
		category: 'Crochet',
		subcategory: 'juguetes',
		images: [
			'https://res.cloudinary.com/db6rrzdmy/image/upload/v1751748968/mautik-ecommerce/sfbyhuq2xaxbr8ynvmro.jpg',
		],
		stock: 8,
		sku: 'CROCHET-LUFFY-001',
		brand: 'Mautik',
		tags: ['crochet', 'amigurumi', 'luffy', 'juguete'],
		specifications: {
			material: 'Hilo de algodón 100%',
			altura: '25cm',
			tecnica: 'Amigurumi',
			lavado: 'A mano',
		},
		reviews: [],
		averageRating: 4.9,
		totalReviews: 12,
		isActive: true,
		isFeatured: true,
	},
	{
		name: 'Llavero Personalizado de Crochet',
		description: 'Llavero único hecho a mano con técnica de crochet.',
		longDescription:
			'Este hermoso llavero está elaborado completamente a mano con hilo de algodón y puede ser personalizado con diferentes colores y diseños.',
		price: 12.0,
		category: 'Llaveros',
		subcategory: 'accesorios',
		images: [
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
		],
		stock: 25,
		sku: 'LLAVERO-CROCHET-001',
		brand: 'Mautik',
		tags: ['llavero', 'crochet', 'personalizado', 'accesorio'],
		specifications: {
			material: 'Hilo de algodón',
			altura: '8cm',
			tecnica: 'Crochet',
			personalizable: 'Sí',
		},
		reviews: [],
		averageRating: 4.7,
		totalReviews: 8,
		isActive: true,
		isFeatured: false,
	},
	{
		name: 'Peluche Conejito de Crochet',
		description: 'Suave peluche de conejito hecho con técnica de crochet.',
		longDescription:
			'Este adorable conejito de peluche está elaborado completamente a mano con hilo suave y relleno de fibra de poliéster. Perfecto para niños y adultos.',
		price: 28.0,
		category: 'Peluches',
		subcategory: 'juguetes',
		images: [
			'/placeholder.svg?height=400&width=400',
			'/placeholder.svg?height=400&width=400',
		],
		stock: 15,
		sku: 'PELUCHE-CONEJO-001',
		brand: 'Mautik',
		tags: ['peluche', 'crochet', 'conejito', 'suave'],
		specifications: {
			material: 'Hilo suave y fibra',
			altura: '20cm',
			color: 'Gris claro',
			ojos: 'Bordados seguros',
		},
		reviews: [],
		averageRating: 4.8,
		totalReviews: 20,
		isActive: true,
		isFeatured: true,
	},
];

async function seedDatabase() {
	try {
		await connectDB();
		console.log('✅ Conectado a MongoDB Atlas');

		// Limpiar datos existentes
		await Product.deleteMany({});
		await User.deleteMany({});
		console.log('🗑️ Datos existentes eliminados');

		// Crear productos
		await Product.insertMany(sampleProducts);
		console.log(`📦 ${sampleProducts.length} productos creados`);

		// Crear usuario administrador
		const adminUser = new User({
			name: 'Administrador Mautik',
			email: 'admin@mautik.com',
			password: 'admin123',
			isAdmin: true,
		});
		await adminUser.save();

		// Crear usuario normal
		const normalUser = new User({
			name: 'Usuario Demo',
			email: 'user@mautik.com',
			password: 'user123',
			isAdmin: false,
		});
		await normalUser.save();

		console.log('👥 Usuarios de ejemplo creados');
		console.log('');
		console.log('🎉 Base de datos poblada exitosamente!');
		console.log('');
		console.log('🔑 Credenciales de acceso:');
		console.log('👨‍💼 Admin: admin@mautik.com / admin123');
		console.log('👤 Usuario: user@mautik.com / user123');
		console.log('');
		console.log('🌐 Panel de administración: http://localhost:3000/admin');
		console.log(
			'⚠️  IMPORTANTE: Cambia las contraseñas después del primer login',
		);

		process.exit(0);
	} catch (error) {
		console.error('❌ Error poblando la base de datos:', error);
		process.exit(1);
	}
}

seedDatabase();
