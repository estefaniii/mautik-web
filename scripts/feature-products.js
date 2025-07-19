// Script para destacar los primeros 5 productos en la base de datos
// Ejecuta: node scripts/feature-products.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
	const products = await prisma.product.findMany({
		take: 5,
		orderBy: { createdAt: 'asc' },
	});
	if (products.length === 0) {
		console.log('No hay productos en la base de datos.');
		return;
	}
	const updates = await Promise.all(
		products.map((product) =>
			prisma.product.update({
				where: { id: product.id },
				data: { featured: true },
			}),
		),
	);
	console.log(
		`Productos destacados actualizados: ${updates.map((p) => p.name).join(', ')}`,
	);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
