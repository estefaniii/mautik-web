// Script para probar que los enlaces de productos se generan correctamente

async function testProductLinks() {
	try {
		console.log('🔍 Probando carga de productos desde la API...');

		// Probar la API de productos
		const response = await fetch('http://localhost:3000/api/products');
		const data = await response.json();

		console.log('📡 Respuesta de la API:', {
			status: response.status,
			hasProducts: !!data.products,
			productCount: data.products ? data.products.length : 0,
		});

		if (data.products && data.products.length > 0) {
			console.log('✅ Productos encontrados:');
			data.products.slice(0, 5).forEach((product, index) => {
				console.log(
					`  ${index + 1}. ID: ${product.id}, Nombre: ${product.name}`,
				);
				console.log(`     Enlace: http://localhost:3000/product/${product.id}`);
			});

			// Probar un producto específico
			const firstProduct = data.products[0];
			console.log(`\n🔍 Probando producto específico: ${firstProduct.id}`);

			const productResponse = await fetch(
				`http://localhost:3000/api/products/${firstProduct.id}`,
			);
			const productData = await productResponse.json();

			console.log('📦 Respuesta del producto específico:', {
				status: productResponse.status,
				hasProduct: !!productData.product,
				productId: productData.product ? productData.product.id : 'N/A',
			});
		} else {
			console.log('❌ No se encontraron productos');
		}
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

testProductLinks();
