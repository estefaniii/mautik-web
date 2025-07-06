const request = require('supertest');
const app = require('../app'); // Ajusta la ruta según tu setup

describe('API Productos', () => {
	it('GET /api/products debe devolver 200 y un array', async () => {
		const res = await request(app).get('/api/products');
		expect(res.statusCode).toBe(200);
		expect(Array.isArray(res.body.products)).toBe(true);
	});
});
