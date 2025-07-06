import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

console.log('🌱 Iniciando seed de reseñas...');

// Simular datos de reseñas locales
const sampleReviews = [
	{
		_id: 'review-1',
		product: '68698b8d60fdf7f436e7c8d2',
		user: {
			_id: 'user-1',
			name: 'Ana María L.',
			avatar: '/placeholder-user.jpg',
		},
		rating: 5,
		title: 'Hermoso anillo, excelente calidad',
		comment:
			'Este anillo es hermoso, exactamente como se ve en las fotos. La piedra tiene un color intenso y el acabado de la plata es perfecto. Lo uso a diario y siempre recibo cumplidos.',
		helpful: 12,
		verified: true,
		createdAt: new Date('2025-03-15'),
		updatedAt: new Date('2025-03-15'),
	},
	{
		_id: 'review-2',
		product: '68698b8d60fdf7f436e7c8d2',
		user: {
			_id: 'user-2',
			name: 'Roberto G.',
			avatar: '/placeholder-user.jpg',
		},
		rating: 4,
		title: 'Gran regalo para mi esposa',
		comment:
			'Compré este anillo como regalo para mi esposa y le encantó. La calidad es excelente, aunque el tamaño era un poco grande. El servicio al cliente fue muy útil para el cambio.',
		helpful: 5,
		verified: true,
		createdAt: new Date('2025-02-02'),
		updatedAt: new Date('2025-02-02'),
	},
	{
		_id: 'review-3',
		product: '686988607436783',
		user: {
			_id: 'user-3',
			name: 'Sofía R.',
			avatar: '/placeholder-user.jpg',
		},
		rating: 5,
		title: 'Pulsera preciosa y cómoda',
		comment:
			'Esta pulsera es preciosa y muy cómoda de usar. El cuero es de buena calidad y los detalles en plata son muy elegantes. Definitivamente compraré más productos de esta marca.',
		helpful: 8,
		verified: true,
		createdAt: new Date('2025-03-10'),
		updatedAt: new Date('2025-03-10'),
	},
	{
		_id: 'review-4',
		product: '686988607436783',
		user: {
			_id: 'user-4',
			name: 'Miguel Á.',
			avatar: '/placeholder-user.jpg',
		},
		rating: 5,
		title: 'Perfecto para mi compromiso',
		comment:
			'Compré este anillo para mi compromiso y superó todas mis expectativas. El diamante es brillante y el oro tiene un acabado impecable. Mi prometida quedó encantada.',
		helpful: 15,
		verified: true,
		createdAt: new Date('2025-03-05'),
		updatedAt: new Date('2025-03-05'),
	},
	{
		_id: 'review-5',
		product: '686988607436783',
		user: {
			_id: 'user-5',
			name: 'Laura T.',
			avatar: '/placeholder-user.jpg',
		},
		rating: 4,
		title: 'Hermoso pero esperaba más grande',
		comment:
			'El anillo es hermoso, aunque esperaba que el diamante fuera un poco más grande. De todas formas, la calidad es excelente y el servicio de entrega fue rápido.',
		helpful: 3,
		verified: true,
		createdAt: new Date('2025-02-20'),
		updatedAt: new Date('2025-02-20'),
	},
];

console.log('✅ Datos de reseñas preparados:');
console.log(`   - Total de reseñas: ${sampleReviews.length}`);
console.log(
	`   - Productos con reseñas: ${
		new Set(sampleReviews.map((r) => r.product)).size
	}`,
);

// Calcular estadísticas
const stats = {
	totalReviews: sampleReviews.length,
	averageRating:
		sampleReviews.reduce((sum, review) => sum + review.rating, 0) /
		sampleReviews.length,
	distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
};

sampleReviews.forEach((review) => {
	stats.distribution[review.rating as keyof typeof stats.distribution]++;
});

console.log('📊 Estadísticas de reseñas:');
console.log(`   - Rating promedio: ${stats.averageRating.toFixed(2)}`);
console.log(`   - Distribución:`, stats.distribution);

console.log('\n🎉 Seed de reseñas completado!');
console.log(
	'💡 Las reseñas estarán disponibles en la API local cuando MongoDB Atlas no esté disponible.',
);
console.log('🔗 Para probar: http://localhost:3000/product/[product-id]');
