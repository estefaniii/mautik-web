import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

// Función para verificar el token JWT desde las cookies
const verifyTokenFromCookies = (request: NextRequest) => {
	try {
		const authToken = request.cookies.get('auth-token')?.value;

		if (!authToken) {
			return null;
		}

		const decoded = jwt.verify(authToken, JWT_SECRET) as any;
		return decoded;
	} catch (error) {
		console.error('Token verification error:', error);
		return null;
	}
};

// Uso de 'params' actualizado para Next.js 13+ API routes
// DELETE - Remover producto específico de wishlist
export async function DELETE(
	request: NextRequest,
	context: { params: { id: string } },
) {
	try {
		const user = verifyTokenFromCookies(request);

		if (!user) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}

		const productId = context.params.id;

		// Verificar que el producto existe
		const product = await prisma.product.findUnique({
			where: { id: productId },
		});

		if (!product) {
			return NextResponse.json(
				{ error: 'Producto no encontrado' },
				{ status: 404 },
			);
		}

		// Eliminar de wishlist
		await prisma.wishlistItem.deleteMany({
			where: {
				userId: user.id,
				productId: productId,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error removing from wishlist:', error);
		return NextResponse.json(
			{ error: 'Error al remover de lista de deseos' },
			{ status: 500 },
		);
	}
}
