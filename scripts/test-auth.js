// Script para probar la autenticación
async function testAuth() {
	try {
		console.log('🔍 Probando autenticación...');

		// Paso 1: Intentar login
		console.log('📝 Paso 1: Intentando login...');
		const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: 'admin@mautik.com',
				password: 'admin123',
			}),
			credentials: 'include',
		});

		console.log('📡 Login response status:', loginResponse.status);

		if (!loginResponse.ok) {
			const errorData = await loginResponse.json();
			console.error('❌ Login failed:', errorData);
			return;
		}

		const loginData = await loginResponse.json();
		console.log('✅ Login successful:', loginData.message);
		console.log('👤 User:', loginData.user.name);
		console.log('🔑 Token received:', !!loginData.token);

		// Paso 2: Verificar autenticación
		console.log('\n📝 Paso 2: Verificando autenticación...');
		const meResponse = await fetch('http://localhost:3000/api/auth/me', {
			credentials: 'include',
		});

		console.log('📡 Me response status:', meResponse.status);

		const meData = await meResponse.json();
		console.log('📦 Me response data:', meData);

		if (!meResponse.ok) {
			console.error('❌ Auth check failed:', meData);
			return;
		}

		console.log('✅ Auth check successful:', meData.isAuthenticated);
		if (meData.user) {
			console.log('👤 User authenticated:', meData.user.name);
		} else {
			console.log('❌ No user data in response');
		}

		// Paso 3: Probar upload (simulado)
		console.log('\n📝 Paso 3: Probando endpoint de upload...');
		const uploadResponse = await fetch('http://localhost:3000/api/upload', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				test: 'data',
			}),
		});

		console.log('📡 Upload response status:', uploadResponse.status);

		if (!uploadResponse.ok) {
			const errorData = await uploadResponse.json();
			console.error('❌ Upload test failed:', errorData);
		} else {
			console.log('✅ Upload endpoint accessible');
		}
	} catch (error) {
		console.error('❌ Test error:', error);
	}
}

testAuth();
