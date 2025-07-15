import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
	const products = [
		{
			name: 'Producto de prueba 1',
			description: 'Este es un producto de prueba sin ID manual.',
			price: 49.99,
			stock: 15,
			images: ['/placeholder.svg'],
			category: 'Test',
			sku: 'TEST-001',
		},
		{
			name: 'Producto de prueba 2',
			description: 'Este es otro producto de prueba sin ID manual.',
			price: 79.99,
			stock: 8,
			images: ['/placeholder.svg'],
			category: 'Test',
			sku: 'TEST-002',
		},
	];
	for (const data of products) {
		try {
			// NO especificar ID - dejar que Prisma genere UUID automáticamente
			await prisma.product.create({
				data: data,
			});
			console.log(`Producto de prueba creado: ${data.name}`);
		} catch (e) {
			console.error(`Error con el producto ${data.name}:`, e);
		}
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
