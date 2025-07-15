import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analytics';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
	try {
		// Verify admin access
		const user = await verifyAuth(request);
		if (!user || !user.isAdmin) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const days = parseInt(searchParams.get('days') || '30');

		const analytics = await AnalyticsService.getDashboardAnalytics();

		if (!analytics) {
			return NextResponse.json(
				{ error: 'Error fetching analytics' },
				{ status: 500 },
			);
		}

		return NextResponse.json(analytics);
	} catch (error) {
		console.error('Analytics API error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { type, data } = body;

		switch (type) {
			case 'product_view':
				await AnalyticsService.trackProductView(data.productId);
				break;

			case 'product_sale':
				await AnalyticsService.trackProductSale(
					data.productId,
					data.quantity,
					data.price,
				);
				break;

			case 'user_activity':
				await AnalyticsService.trackUserActivity(data.userId);
				break;

			case 'order':
				await AnalyticsService.trackOrder(
					data.orderId,
					data.userId,
					data.totalAmount,
					data.itemsCount,
				);
				break;

			default:
				return NextResponse.json(
					{ error: 'Invalid analytics type' },
					{ status: 400 },
				);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Analytics tracking error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
