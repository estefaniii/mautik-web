import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
	const products = await prisma.product.findMany({ select: { id: true } });
	console.log(products.map((p) => p.id));
}

main().finally(() => prisma.$disconnect());
