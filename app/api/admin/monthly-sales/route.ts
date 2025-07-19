import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);
	if (!session || !session.user || !session.user.isAdmin) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
	// Ejemplo de ventas mensuales
	return NextResponse.json([
		{ month: 'Enero', sales: 0 },
		{ month: 'Febrero', sales: 0 },
		{ month: 'Marzo', sales: 0 },
	]);
}
