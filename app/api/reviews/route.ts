import { NextRequest, NextResponse } from 'next/server';

// Mock data para reseñas
const mockReviews = [
  {
    _id: '1',
    user: {
      _id: 'user-1',
      name: 'María González',
      email: 'maria@example.com',
      avatar: '/placeholder-user.jpg'
    },
    product: {
      _id: '1',
      name: 'Collar Artesanal',
      images: ['/placeholder.svg']
    },
    rating: 5,
    comment: 'Excelente calidad, muy bonito el diseño. Lo recomiendo totalmente.',
    createdAt: new Date('2024-01-15')
  },
  {
    _id: '2',
    user: {
      _id: 'user-2',
      name: 'Carlos Rodríguez',
      email: 'carlos@example.com',
      avatar: '/placeholder-user.jpg'
    },
    product: {
      _id: '2',
      name: 'Pulsera de Cuentas',
      images: ['/placeholder.svg']
    },
    rating: 4,
    comment: 'Muy bonita pulsera, perfecta para regalo.',
    createdAt: new Date('2024-01-12')
  },
  {
    _id: '3',
    user: {
      _id: 'user-3',
      name: 'Ana Martínez',
      email: 'ana@example.com',
      avatar: '/placeholder-user.jpg'
    },
    product: {
      _id: '3',
      name: 'Sombrero Panameño',
      images: ['/placeholder.svg']
    },
    rating: 5,
    comment: 'Auténtico sombrero panameño, muy bien hecho.',
    createdAt: new Date('2024-01-10')
  }
];

export async function GET(request: NextRequest) {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    return NextResponse.json(mockReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
