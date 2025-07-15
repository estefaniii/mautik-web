const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Imágenes de ejemplo por categoría
const categoryImages = {
	pulseras: [
		'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop',
		'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
	],
	collares: [
		'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
		'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop',
	],
	llaveros: [
		'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
		'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop',
	],
	aretes: [
		'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop',
		'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
	],
	anillos: [
		'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
		'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop',
	],
	crochet: [
		'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop',
		'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
	],
};

async function updateProductImages() {
	try {
		console.log('🖼️ Actualizando imágenes de productos...\n');

		const products = await prisma.product.findMany({
			select: {
				id: true,
				name: true,
				images: true,
				category: true,
			},
		});

		let updatedCount = 0;

		for (const product of products) {
			// Solo actualizar productos que tienen /placeholder.jpg
			if (
				product.images.length === 1 &&
				product.images[0] === '/placeholder.jpg'
			) {
				const categoryImagesList =
					categoryImages[product.category] || categoryImages.pulseras;
				const randomImage =
					categoryImagesList[
						Math.floor(Math.random() * categoryImagesList.length)
					];

				await prisma.product.update({
					where: { id: product.id },
					data: { images: [randomImage] },
				});

				console.log(`✅ ${product.name} - Imagen actualizada`);
				updatedCount++;
			} else {
				console.log(`⏭️ ${product.name} - Ya tiene imágenes reales`);
			}
		}

		console.log(`\n🎉 Actualización completada!`);
		console.log(`📊 Productos actualizados: ${updatedCount}`);
	} catch (error) {
		console.error('❌ Error:', error);
	} finally {
		await prisma.$disconnect();
	}
}

updateProductImages();
