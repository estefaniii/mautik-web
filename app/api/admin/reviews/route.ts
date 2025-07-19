import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);
	if (!session || !session.user || !(session.user as any).isAdmin) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
	const reviews = await prisma.review.findMany({
		include: { user: true, product: true },
	});
	return NextResponse.json(reviews);
}
