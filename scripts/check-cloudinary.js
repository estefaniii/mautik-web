require('dotenv').config({ path: '.env.local' });

console.log('🔍 Verificando configuración de Cloudinary...\n');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('📋 Estado de las credenciales:');
console.log(`Cloud Name: ${cloudName ? '✅ Configurado' : '❌ Faltante'}`);
console.log(`API Key: ${apiKey ? '✅ Configurado' : '❌ Faltante'}`);
console.log(`API Secret: ${apiSecret ? '✅ Configurado' : '❌ Faltante'}`);

if (!cloudName || !apiKey || !apiSecret) {
	console.log('\n❌ Configuración incompleta');
	console.log('\n📝 Para configurar Cloudinary:');
	console.log('1. Ve a https://cloudinary.com y crea una cuenta');
	console.log('2. Obtén tus credenciales del Dashboard');
	console.log('3. Crea un archivo .env.local con:');
	console.log('   CLOUDINARY_CLOUD_NAME=tu_cloud_name');
	console.log('   CLOUDINARY_API_KEY=tu_api_key');
	console.log('   CLOUDINARY_API_SECRET=tu_api_secret');
	console.log('\n4. Reinicia el servidor: npm run dev');
} else {
	console.log('\n✅ Configuración completa');
	console.log('🎉 Cloudinary está listo para usar');
	console.log('\n💡 Puedes probar subiendo una imagen en tu perfil');
}

console.log('\n📚 Más información en: CLOUDINARY_SETUP.md');
