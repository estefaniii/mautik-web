const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkImages() {
	try {
		console.log('🔍 Verificando imágenes de productos...\n');

		const products = await prisma.product.findMany({
			select: {
				id: true,
				name: true,
				images: true,
				category: true,
			},
		});

		console.log(`📊 Total de productos: ${products.length}\n`);

		products.forEach((product, index) => {
			console.log(`${index + 1}. ${product.name}`);
			console.log(`   Categoría: ${product.category}`);
			console.log(
				`   Imágenes: ${
					product.images.length > 0 ? product.images.join(', ') : 'Sin imágenes'
				}`,
			);
			console.log(`   ID: ${product.id}\n`);
		});

		// Contar productos con y sin imágenes
		const withImages = products.filter((p) => p.images.length > 0);
		const withoutImages = products.filter((p) => p.images.length === 0);

		console.log(`📈 Estadísticas:`);
		console.log(`   - Productos con imágenes: ${withImages.length}`);
		console.log(`   - Productos sin imágenes: ${withoutImages.length}`);
	} catch (error) {
		console.error('❌ Error:', error);
	} finally {
		await prisma.$disconnect();
	}
}

checkImages();
