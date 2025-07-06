const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 Probando conexión a MongoDB...');
console.log('URI:', MONGODB_URI ? 'Configurada' : 'NO CONFIGURADA');

if (!MONGODB_URI) {
	console.log('❌ Error: MONGODB_URI no está configurada en .env');
	console.log('📝 Para configurar MongoDB Atlas:');
	console.log('1. Ve a https://cloud.mongodb.com');
	console.log('2. Crea un cluster gratuito');
	console.log('3. Obtén la URI de conexión');
	console.log('4. Agrega MONGODB_URI=tu_uri_aqui en .env');
	process.exit(1);
}

async function testConnection() {
	try {
		console.log('🔄 Conectando a MongoDB Atlas...');

		await mongoose.connect(MONGODB_URI, {
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
		});

		console.log('✅ Conexión exitosa a MongoDB Atlas!');
		console.log('📊 Base de datos:', mongoose.connection.name);
		console.log('🌐 Host:', mongoose.connection.host);
		console.log('🔌 Puerto:', mongoose.connection.port);

		// Probar operaciones básicas
		console.log('\n🧪 Probando operaciones básicas...');

		// Listar colecciones
		const collections = await mongoose.connection.db
			.listCollections()
			.toArray();
		console.log(
			'📚 Colecciones disponibles:',
			collections.map((c) => c.name),
		);

		// Contar usuarios
		const User = mongoose.model('User', new mongoose.Schema({}));
		const userCount = await User.countDocuments();
		console.log('👥 Usuarios en la base de datos:', userCount);

		// Contar productos
		const Product = mongoose.model('Product', new mongoose.Schema({}));
		const productCount = await Product.countDocuments();
		console.log('📦 Productos en la base de datos:', productCount);

		console.log('\n🎉 ¡Todo funciona correctamente!');
		console.log('💡 Tu perfil y datos se guardarán de forma permanente.');
	} catch (error) {
		console.log('❌ Error conectando a MongoDB Atlas:');
		console.log('Error:', error.message);

		if (error.name === 'MongoNetworkError') {
			console.log('\n🔧 Posibles soluciones:');
			console.log('1. Verifica tu conexión a internet');
			console.log('2. Asegúrate de que la URI sea correcta');
			console.log('3. Verifica que el cluster esté activo');
			console.log('4. Revisa que la IP esté en la whitelist');
		}

		if (error.message.includes('ENOTFOUND')) {
			console.log('\n🌐 Problema de DNS detectado');
			console.log('💡 Intenta cambiar tu DNS a 8.8.8.8 o 1.1.1.1');
		}
	} finally {
		await mongoose.disconnect();
		console.log('\n🔌 Conexión cerrada');
	}
}

testConnection();
