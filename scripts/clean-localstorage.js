// Script para limpiar localStorage de referencias a productos eliminados
// Ejecutar en la consola del navegador

console.log(
	'🧹 Limpiando localStorage de referencias a productos eliminados...',
);

// Función para limpiar referencias a productos específicos
function cleanProductReferences(productIds) {
	const keysToClean = ['mautik_favorites_temp', 'mautik_cart_temp'];

	// Agregar claves específicas de usuario si existe
	const user = JSON.parse(localStorage.getItem('mautik_user') || '{}');
	if (user.id) {
		keysToClean.push(`mautik_favorites_${user.id}`);
		keysToClean.push(`mautik_cart_${user.id}`);
	}

	let cleanedCount = 0;

	keysToClean.forEach((key) => {
		const data = localStorage.getItem(key);
		if (data) {
			try {
				const parsed = JSON.parse(data);
				let cleaned = false;

				if (Array.isArray(parsed)) {
					const originalLength = parsed.length;
					const filtered = parsed.filter(
						(item) => !productIds.includes(item.id),
					);
					if (filtered.length !== originalLength) {
						localStorage.setItem(key, JSON.stringify(filtered));
						cleaned = true;
						cleanedCount += originalLength - filtered.length;
						console.log(
							`✅ Limpiado ${key}: eliminados ${
								originalLength - filtered.length
							} items`,
						);
					}
				}

				if (!cleaned) {
					console.log(`ℹ️  ${key}: sin cambios`);
				}
			} catch (error) {
				console.error(`❌ Error procesando ${key}:`, error);
			}
		} else {
			console.log(`ℹ️  ${key}: no existe`);
		}
	});

	return cleanedCount;
}

// Productos conocidos que fueron eliminados
const deletedProductIds = ['679', '871', '123', '456']; // Agregar más IDs según sea necesario

console.log('📋 Productos a limpiar:', deletedProductIds);

const totalCleaned = cleanProductReferences(deletedProductIds);

console.log(
	`🎉 Limpieza completada! Se eliminaron ${totalCleaned} referencias a productos eliminados.`,
);
console.log('💡 Recarga la página para ver los cambios.');
