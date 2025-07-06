const request = require('supertest');
const app = require('../app'); // Ajusta la ruta según tu setup

describe('API Pedidos', () => {
	it('GET /api/orders debe devolver 200 y un array', async () => {
		const res = await request(app).get('/api/orders');
		expect(res.statusCode).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
	});
});
