// Script para verificar la consistencia entre la API de productos y la base de datos
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyProductConsistency() {
	try {
		console.log('🔍 Verificando consistencia entre API y base de datos...');

		// Obtener productos directamente de la base de datos
		const dbProducts = await prisma.product.findMany({
			select: { id: true, name: true, sku: true },
		});

		console.log(`📊 Productos en base de datos: ${dbProducts.length}`);
		dbProducts.forEach((product, index) => {
			console.log(
				`  ${index + 1}. ID: ${product.id}, Nombre: ${product.name}, SKU: ${
					product.sku
				}`,
			);
		});

		// Obtener productos desde la API
		console.log('\n🌐 Probando API de productos...');
		const apiResponse = await fetch('http://localhost:3000/api/products');
		const apiData = await apiResponse.json();

		if (apiData.products) {
			console.log(`📡 Productos en API: ${apiData.products.length}`);

			// Verificar cada producto de la API
			for (const apiProduct of apiData.products) {
				console.log(
					`\n🔍 Verificando producto: ${apiProduct.name} (ID: ${apiProduct.id})`,
				);

				// Verificar si existe en la base de datos
				const dbProduct = await prisma.product.findUnique({
					where: { id: apiProduct.id },
					select: { id: true, name: true, sku: true },
				});

				if (dbProduct) {
					console.log(
						`  ✅ Encontrado en BD: ${dbProduct.name} (SKU: ${dbProduct.sku})`,
					);

					// Probar la API de producto específico
					const specificResponse = await fetch(
						`http://localhost:3000/api/products/${apiProduct.id}`,
					);
					if (specificResponse.ok) {
						console.log(`  ✅ API específica funciona`);
					} else {
						console.log(
							`  ❌ API específica falla: ${specificResponse.status}`,
						);
					}
				} else {
					console.log(`  ❌ NO encontrado en BD`);
				}
			}
		} else {
			console.log('❌ No se pudieron obtener productos de la API');
		}
	} catch (error) {
		console.error('❌ Error:', error.message);
	} finally {
		await prisma.$disconnect();
	}
}

verifyProductConsistency();
