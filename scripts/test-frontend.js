// Script para probar el frontend y verificar el mapeo de datos
import puppeteer from 'puppeteer';

async function testFrontend() {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();

	try {
		console.log('🔍 Probando frontend...');

		// Interceptar requests para ver qué está pasando
		page.on('request', (request) => {
			console.log(`📡 Request: ${request.method()} ${request.url()}`);
		});

		page.on('response', (response) => {
			console.log(`📥 Response: ${response.status()} ${response.url()}`);
		});

		// Interceptar errores de consola
		page.on('console', (msg) => {
			console.log(`💬 Console: ${msg.type()} ${msg.text()}`);
		});

		// Interceptar errores de página
		page.on('pageerror', (error) => {
			console.log(`❌ Page Error: ${error.message}`);
		});

		// Navegar a la página principal
		console.log('\n🏠 Probando página principal...');
		await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

		// Esperar a que carguen los productos
		await page.waitForTimeout(3000);

		// Obtener los enlaces de productos
		const productLinks = await page.evaluate(() => {
			const links = Array.from(
				document.querySelectorAll('a[href*="/product/"]'),
			);
			return links.map((link) => ({
				href: link.href,
				text: link.textContent?.trim(),
			}));
		});

		console.log(
			`\n🔗 Enlaces de productos encontrados: ${productLinks.length}`,
		);
		productLinks.slice(0, 3).forEach((link, index) => {
			console.log(`  ${index + 1}. ${link.href} - ${link.text}`);
		});

		// Probar un enlace de producto
		if (productLinks.length > 0) {
			const firstLink = productLinks[0].href;
			console.log(`\n🔍 Probando enlace: ${firstLink}`);

			await page.goto(firstLink, { waitUntil: 'networkidle0' });
			await page.waitForTimeout(2000);

			// Verificar si la página cargó correctamente
			const title = await page.title();
			console.log(`📄 Título de la página: ${title}`);

			// Verificar si hay errores
			const errors = await page.evaluate(() => {
				return window.performance
					.getEntriesByType('resource')
					.filter((entry) => entry.name.includes('/api/'))
					.map((entry) => ({
						url: entry.name,
						status: entry.transferSize === 0 ? 'failed' : 'success',
					}));
			});

			console.log('\n📊 Estado de las APIs:');
			errors.forEach((error) => {
				console.log(
					`  ${error.status === 'success' ? '✅' : '❌'} ${error.url}`,
				);
			});
		}
	} catch (error) {
		console.error('❌ Error:', error.message);
	} finally {
		await browser.close();
	}
}

testFrontend();
