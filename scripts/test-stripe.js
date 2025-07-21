#!/usr/bin/env node

/**
 * Script para probar la configuración de Stripe
 * Ejecutar con: node scripts/test-stripe.js
 */

const Stripe = require('stripe');
require('dotenv').config();

async function testStripeConfig() {
	console.log('🔍 Probando configuración de Stripe...\n');

	// Verificar variables de entorno
	const requiredEnvVars = [
		'STRIPE_SECRET_KEY',
		'STRIPE_PUBLISHABLE_KEY',
		'STRIPE_WEBHOOK_SECRET',
	];

	console.log('📋 Variables de entorno requeridas:');
	for (const envVar of requiredEnvVars) {
		const value = process.env[envVar];
		if (value) {
			console.log(
				`✅ ${envVar}: ${value.substring(0, 10)}...${value.substring(value.length - 4)}`,
			);
		} else {
			console.log(`❌ ${envVar}: NO CONFIGURADA`);
		}
	}

	console.log('\n🔑 Probando conexión con Stripe...');

	try {
		const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
			apiVersion: '2025-06-30.basil',
		});

		// Probar conexión obteniendo la cuenta
		const account = await stripe.accounts.retrieve();
		console.log(`✅ Conexión exitosa con Stripe`);
		console.log(`   Cuenta: ${account.business_type || 'N/A'}`);
		console.log(`   País: ${account.country}`);
		console.log(`   Email: ${account.email}`);

		// Verificar configuración de webhooks
		console.log('\n🔗 Verificando webhooks...');
		const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });

		if (webhooks.data.length === 0) {
			console.log('⚠️  No se encontraron webhooks configurados');
			console.log('   Para configurar un webhook:');
			console.log('   1. Ve a https://dashboard.stripe.com/webhooks');
			console.log('   2. Crea un nuevo endpoint');
			console.log('   3. URL: https://tu-dominio.com/api/stripe/webhook');
			console.log('   4. Eventos: checkout.session.completed');
		} else {
			console.log(`✅ Se encontraron ${webhooks.data.length} webhook(s):`);
			webhooks.data.forEach((webhook, index) => {
				console.log(`   ${index + 1}. ${webhook.url}`);
				console.log(`      Eventos: ${webhook.enabled_events.join(', ')}`);
				console.log(`      Estado: ${webhook.status}`);
			});
		}

		// Verificar configuración de productos
		console.log('\n🛍️  Verificando productos de Stripe...');
		const products = await stripe.products.list({ limit: 5 });
		console.log(
			`✅ Se encontraron ${products.data.length} producto(s) en Stripe`,
		);

		// Verificar configuración de precios
		const prices = await stripe.prices.list({ limit: 5 });
		console.log(`✅ Se encontraron ${prices.data.length} precio(s) en Stripe`);

		console.log('\n🎉 Configuración de Stripe verificada exitosamente!');
		console.log('\n📝 Próximos pasos:');
		console.log('   1. Configura los webhooks en el dashboard de Stripe');
		console.log('   2. Prueba una compra en modo test');
		console.log('   3. Verifica que los webhooks se reciban correctamente');
	} catch (error) {
		console.error('❌ Error probando Stripe:', error.message);

		if (error.type === 'StripeAuthenticationError') {
			console.log('\n💡 Solución: Verifica que STRIPE_SECRET_KEY sea correcta');
		} else if (error.type === 'StripeInvalidRequestError') {
			console.log(
				'\n💡 Solución: Verifica que la API key tenga los permisos correctos',
			);
		}
	}
}

// Función para probar webhook localmente
async function testWebhookLocally() {
	console.log('\n🧪 Para probar webhooks localmente:');
	console.log('   1. Instala Stripe CLI: https://stripe.com/docs/stripe-cli');
	console.log(
		'   2. Ejecuta: stripe listen --forward-to localhost:3001/api/stripe/webhook',
	);
	console.log('   3. Usa el webhook secret que te proporcione el CLI');
	console.log(
		'   4. En otra terminal: stripe trigger checkout.session.completed',
	);
}

// Ejecutar pruebas
testStripeConfig()
	.then(() => {
		testWebhookLocally();
	})
	.catch(console.error);
