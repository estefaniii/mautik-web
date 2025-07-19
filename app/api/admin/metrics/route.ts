import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || !session.user || !(session.user as any).isAdmin) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Consultar métricas reales
		const [
			totalUsers,
			totalProducts,
			totalOrders,
			totalSalesAgg,
			pendingOrders,
		] = await Promise.all([
			prisma.user.count(),
			prisma.product.count(),
			prisma.order.count(),
			prisma.order.aggregate({
				_sum: { totalAmount: true },
				where: { status: 'delivered' },
			}),
			prisma.order.count({
				where: { status: { in: ['pending', 'processing'] } },
			}),
		]);

		// Calcular crecimiento de ventas (mes actual vs anterior)
		const now = new Date();
		const currentMonth = now.getMonth();
		const currentYear = now.getFullYear();
		const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
		const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

		const [salesThisMonthAgg, salesLastMonthAgg] = await Promise.all([
			prisma.order.aggregate({
				_sum: { totalAmount: true },
				where: {
					status: 'delivered',
					createdAt: {
						gte: new Date(currentYear, currentMonth, 1),
						lt: new Date(currentYear, currentMonth + 1, 1),
					},
				},
			}),
			prisma.order.aggregate({
				_sum: { totalAmount: true },
				where: {
					status: 'delivered',
					createdAt: {
						gte: new Date(lastMonthYear, lastMonth, 1),
						lt: new Date(lastMonthYear, lastMonth + 1, 1),
					},
				},
			}),
		]);

		const salesThisMonth = salesThisMonthAgg._sum?.totalAmount || 0;
		const salesLastMonth = salesLastMonthAgg._sum?.totalAmount || 0;
		let salesGrowth = 0;
		if (salesLastMonth > 0) {
			salesGrowth = ((salesThisMonth - salesLastMonth) / salesLastMonth) * 100;
		} else if (salesThisMonth > 0) {
			salesGrowth = 100;
		}

		return NextResponse.json({
			totalUsers,
			totalProducts,
			totalOrders,
			totalSales: totalSalesAgg._sum?.totalAmount || 0,
			pendingOrders,
			salesGrowth,
		});
	} catch (error: any) {
		console.error('Error in /api/admin/metrics:', error);
		return NextResponse.json(
			{ error: error?.message || 'Internal Server Error' },
			{ status: 500 },
		);
	}
}
