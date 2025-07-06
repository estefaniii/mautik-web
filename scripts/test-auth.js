const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testAuth() {
	console.log('🧪 Probando sistema de autenticación...\n');

	try {
		// 1. Probar login con credenciales correctas
		console.log('1. Probando login con credenciales correctas...');
		const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: 'admin@mautik.com',
				password: 'admin123',
			}),
		});

		const loginData = await loginResponse.json();
		console.log('Status:', loginResponse.status);
		console.log('Response:', JSON.stringify(loginData, null, 2));

		if (loginResponse.ok) {
			console.log('✅ Login exitoso\n');

			// 2. Probar verificar autenticación
			console.log('2. Probando verificación de autenticación...');
			const cookies = loginResponse.headers.get('set-cookie');
			const authResponse = await fetch(`${BASE_URL}/auth/me`, {
				headers: {
					Cookie: cookies || '',
				},
			});

			const authData = await authResponse.json();
			console.log('Status:', authResponse.status);
			console.log('Response:', JSON.stringify(authData, null, 2));

			if (authResponse.ok && authData.isAuthenticated) {
				console.log('✅ Verificación de autenticación exitosa\n');
			} else {
				console.log('❌ Verificación de autenticación falló\n');
			}
		} else {
			console.log('❌ Login falló\n');
		}

		// 3. Probar login con credenciales incorrectas
		console.log('3. Probando login con credenciales incorrectas...');
		const wrongLoginResponse = await fetch(`${BASE_URL}/auth/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: 'wrong@email.com',
				password: 'wrongpassword',
			}),
		});

		const wrongLoginData = await wrongLoginResponse.json();
		console.log('Status:', wrongLoginResponse.status);
		console.log('Response:', JSON.stringify(wrongLoginData, null, 2));

		if (!wrongLoginResponse.ok) {
			console.log(
				'✅ Login con credenciales incorrectas rechazado correctamente\n',
			);
		} else {
			console.log('❌ Login con credenciales incorrectas no fue rechazado\n');
		}

		// 4. Probar registro de nuevo usuario
		console.log('4. Probando registro de nuevo usuario...');
		const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: 'Usuario Test',
				email: 'test@example.com',
				password: 'test123456',
			}),
		});

		const registerData = await registerResponse.json();
		console.log('Status:', registerResponse.status);
		console.log('Response:', JSON.stringify(registerData, null, 2));

		if (registerResponse.ok) {
			console.log('✅ Registro exitoso\n');
		} else {
			console.log('❌ Registro falló\n');
		}

		// 5. Probar logout
		console.log('5. Probando logout...');
		const logoutResponse = await fetch(`${BASE_URL}/auth/logout`, {
			method: 'POST',
		});

		const logoutData = await logoutResponse.json();
		console.log('Status:', logoutResponse.status);
		console.log('Response:', JSON.stringify(logoutData, null, 2));

		if (logoutResponse.ok) {
			console.log('✅ Logout exitoso\n');
		} else {
			console.log('❌ Logout falló\n');
		}
	} catch (error) {
		console.error('❌ Error durante las pruebas:', error.message);
	}

	console.log('🏁 Pruebas completadas');
}

testAuth();
