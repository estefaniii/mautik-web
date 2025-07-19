"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const analytics_1 = require("@/lib/analytics");
const auth_1 = require("@/lib/auth");
async function GET(request) {
    try {
        // Verify admin access
        const user = await (0, auth_1.verifyAuth)(request);
        if (!user || !user.isAdmin) {
            return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');
        const analytics = await analytics_1.AnalyticsService.getDashboardAnalytics();
        if (!analytics) {
            return server_1.NextResponse.json({ error: 'Error fetching analytics' }, { status: 500 });
        }
        return server_1.NextResponse.json(analytics);
    }
    catch (error) {
        console.error('Analytics API error:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { type, data } = body;
        switch (type) {
            case 'product_view':
                await analytics_1.AnalyticsService.trackProductView(data.productId);
                break;
            case 'product_sale':
                await analytics_1.AnalyticsService.trackProductSale(data.productId, data.quantity, data.price);
                break;
            case 'user_activity':
                await analytics_1.AnalyticsService.trackUserActivity(data.userId);
                break;
            case 'order':
                await analytics_1.AnalyticsService.trackOrder(data.orderId, data.userId, data.totalAmount, data.itemsCount);
                break;
            default:
                return server_1.NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 });
        }
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Analytics tracking error:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
