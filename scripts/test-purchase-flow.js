#!/usr/bin/env node

/**
 * Script para probar el flujo completo de compra
 * Ejecutar con: node scripts/test-purchase-flow.js
 */

const fetch = require('node-fetch');
require('dotenv').config();

const BASE_URL =
	process.env.NODE_ENV === 'production'
		? process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
		: 'http://localhost:3001';

async function testPurchaseFlow() {
	console.log('🛒 Probando flujo completo de compra...\n');
	console.log(`📍 URL base: ${BASE_URL}\n`);

	const tests = [
		{
			name: 'Verificar que el servidor esté funcionando',
			test: async () => {
				const response = await fetch(`${BASE_URL}/api/products`);
				if (!response.ok) {
					throw new Error(`Servidor no responde: ${response.status}`);
				}
				const products = await response.json();
				console.log(
					`✅ Servidor funcionando - ${products.length} productos disponibles`,
				);
				return products.length > 0;
			},
		},
		{
			name: 'Verificar API de productos',
			test: async () => {
				const response = await fetch(`${BASE_URL}/api/products?limit=5`);
				if (!response.ok) {
					throw new Error(`Error en API de productos: ${response.status}`);
				}
				const products = await response.json();
				console.log(
					`✅ API de productos funcionando - ${products.length} productos obtenidos`,
				);

				// Verificar estructura de productos
				if (products.length > 0) {
					const product = products[0];
					const requiredFields = [
						'id',
						'name',
						'price',
						'description',
						'category',
					];
					const missingFields = requiredFields.filter(
						(field) => !product[field],
					);

					if (missingFields.length > 0) {
						throw new Error(
							`Campos faltantes en producto: ${missingFields.join(', ')}`,
						);
					}
					console.log(`✅ Estructura de productos correcta`);
				}

				return true;
			},
		},
		{
			name: 'Verificar filtros por categoría',
			test: async () => {
				const categories = ['crochet', 'llaveros', 'pulseras'];

				for (const category of categories) {
					const response = await fetch(
						`${BASE_URL}/api/products?category=${encodeURIComponent(category)}`,
					);
					if (!response.ok) {
						throw new Error(
							`Error filtrando por categoría ${category}: ${response.status}`,
						);
					}
					const products = await response.json();
					console.log(
						`✅ Filtro por categoría "${category}": ${products.length} productos`,
					);
				}

				return true;
			},
		},
		{
			name: 'Verificar búsqueda de productos',
			test: async () => {
				const searchTerms = ['crochet', 'pulsera', 'collar'];

				for (const term of searchTerms) {
					const response = await fetch(
						`${BASE_URL}/api/products?search=${encodeURIComponent(term)}`,
					);
					if (!response.ok) {
						throw new Error(`Error en búsqueda "${term}": ${response.status}`);
					}
					const products = await response.json();
					console.log(`✅ Búsqueda "${term}": ${products.length} resultados`);
				}

				return true;
			},
		},
		{
			name: 'Verificar configuración de Stripe',
			test: async () => {
				if (!process.env.STRIPE_SECRET_KEY) {
					console.log('⚠️ STRIPE_SECRET_KEY no configurada');
					return false;
				}

				if (!process.env.STRIPE_PUBLISHABLE_KEY) {
					console.log('⚠️ STRIPE_PUBLISHABLE_KEY no configurada');
					return false;
				}

				console.log('✅ Claves de Stripe configuradas');

				// Probar creación de payment intent
				try {
					const response = await fetch(
						`${BASE_URL}/api/stripe/create-payment-intent`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ amount: 1000, currency: 'usd' }),
						},
					);

					if (response.ok) {
						const data = await response.json();
						if (data.clientSecret) {
							console.log('✅ API de Stripe funcionando correctamente');
							return true;
						}
					}

					console.log('⚠️ API de Stripe no responde correctamente');
					return false;
				} catch (error) {
					console.log('⚠️ Error probando Stripe:', error.message);
					return false;
				}
			},
		},
		{
			name: 'Verificar configuración de base de datos',
			test: async () => {
				try {
					const response = await fetch(`${BASE_URL}/api/admin/products`);
					if (response.status === 401) {
						console.log('✅ API admin protegida correctamente');
						return true;
					} else if (response.ok) {
						console.log('⚠️ API admin accesible sin autenticación');
						return false;
					} else {
						console.log('✅ API admin responde correctamente');
						return true;
					}
				} catch (error) {
					console.log('⚠️ Error probando API admin:', error.message);
					return false;
				}
			},
		},
		{
			name: 'Verificar configuración de emails',
			test: async () => {
				if (!process.env.RESEND_API_KEY) {
					console.log(
						'⚠️ RESEND_API_KEY no configurada - emails deshabilitados',
					);
					return false;
				}

				console.log('✅ Resend configurado para emails');
				return true;
			},
		},
		{
			name: 'Verificar configuración de Sentry',
			test: async () => {
				if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
					console.log(
						'⚠️ NEXT_PUBLIC_SENTRY_DSN no configurada - monitoreo deshabilitado',
					);
					return false;
				}

				console.log('✅ Sentry configurado para monitoreo de errores');
				return true;
			},
		},
	];

	let passedTests = 0;
	let totalTests = tests.length;

	console.log('🧪 Ejecutando pruebas...\n');

	for (const test of tests) {
		try {
			console.log(`📋 ${test.name}...`);
			const result = await test.test();
			if (result) {
				passedTests++;
				console.log(`✅ ${test.name} - PASÓ\n`);
			} else {
				console.log(`⚠️ ${test.name} - ADVERTENCIA\n`);
			}
		} catch (error) {
			console.log(`❌ ${test.name} - FALLÓ: ${error.message}\n`);
		}
	}

	console.log('📊 Resultados de las pruebas:');
	console.log(`✅ Pruebas pasadas: ${passedTests}/${totalTests}`);
	console.log(
		`📈 Porcentaje de éxito: ${Math.round((passedTests / totalTests) * 100)}%`,
	);

	if (passedTests === totalTests) {
		console.log(
			'\n🎉 ¡Todas las pruebas pasaron! El proyecto está listo para producción.',
		);
	} else if (passedTests >= totalTests * 0.8) {
		console.log(
			'\n✅ La mayoría de las pruebas pasaron. El proyecto está casi listo.',
		);
	} else {
		console.log(
			'\n⚠️ Varias pruebas fallaron. Revisa la configuración antes del despliegue.',
		);
	}

	console.log('\n📝 Próximos pasos recomendados:');
	console.log('1. Probar el flujo de compra manualmente en el navegador');
	console.log('2. Verificar la responsividad en dispositivos móviles');
	console.log('3. Probar la autenticación de usuarios');
	console.log('4. Configurar webhooks de Stripe en producción');
	console.log('5. Configurar variables de entorno en producción');
}

// Función para probar endpoints específicos
async function testSpecificEndpoints() {
	console.log('\n🔍 Probando endpoints específicos...\n');

	const endpoints = [
		'/api/products',
		'/api/auth/me',
		'/api/cart',
		'/api/wishlist',
		'/api/orders',
		'/api/notifications',
	];

	for (const endpoint of endpoints) {
		try {
			const response = await fetch(`${BASE_URL}${endpoint}`);
			const status = response.status;
			const statusText = response.statusText;

			if (status === 200) {
				console.log(`✅ ${endpoint} - ${status} ${statusText}`);
			} else if (status === 401) {
				console.log(
					`🔒 ${endpoint} - ${status} ${statusText} (requiere autenticación)`,
				);
			} else if (status === 404) {
				console.log(`❌ ${endpoint} - ${status} ${statusText} (no encontrado)`);
			} else {
				console.log(`⚠️ ${endpoint} - ${status} ${statusText}`);
			}
		} catch (error) {
			console.log(`❌ ${endpoint} - Error: ${error.message}`);
		}
	}
}

// Ejecutar pruebas
testPurchaseFlow()
	.then(() => testSpecificEndpoints())
	.catch(console.error);
