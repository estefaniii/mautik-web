"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
// @ts-ignore
const db_1 = require("@/lib/db");
class AnalyticsService {
    // Track product view
    static async trackProductView(productId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            await db_1.prisma.productAnalytics.upsert({
                where: {
                    productId_date: {
                        productId,
                        date: today,
                    },
                },
                update: {
                    views: {
                        increment: 1,
                    },
                },
                create: {
                    productId,
                    date: today,
                    views: 1,
                },
            });
        }
        catch (error) {
            const errorToUse = error instanceof Error
                ? error
                : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            console.error('Analytics error:', errorToUse);
        }
    }
    // Track product sale
    static async trackProductSale(productId, quantity, price) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            await db_1.prisma.productAnalytics.upsert({
                where: {
                    productId_date: {
                        productId,
                        date: today,
                    },
                },
                update: {
                    sales: {
                        increment: quantity,
                    },
                    revenue: {
                        increment: quantity * price,
                    },
                },
                create: {
                    productId,
                    date: today,
                    sales: quantity,
                    revenue: quantity * price,
                },
            });
        }
        catch (error) {
            const errorToUse = error instanceof Error
                ? error
                : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            console.error('Analytics error:', errorToUse);
        }
    }
    // Track user activity
    static async trackUserActivity(userId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            await db_1.prisma.userAnalytics.upsert({
                where: {
                    userId_date: {
                        userId,
                        date: today,
                    },
                },
                update: {
                    visits: {
                        increment: 1,
                    },
                },
                create: {
                    userId,
                    date: today,
                    visits: 1,
                },
            });
        }
        catch (error) {
            const errorToUse = error instanceof Error
                ? error
                : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            console.error('Analytics error:', errorToUse);
        }
    }
    // Track order
    static async trackOrder(orderId, userId, totalAmount, itemsCount) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            // Track order analytics
            await db_1.prisma.orderAnalytics.create({
                data: {
                    orderId,
                    totalAmount,
                    itemsCount,
                    date: today,
                },
            });
            // Update user analytics
            await db_1.prisma.userAnalytics.upsert({
                where: {
                    userId_date: {
                        userId,
                        date: today,
                    },
                },
                update: {
                    orders: {
                        increment: 1,
                    },
                    revenue: {
                        increment: totalAmount,
                    },
                },
                create: {
                    userId,
                    date: today,
                    orders: 1,
                    revenue: totalAmount,
                },
            });
            // Update site analytics
            await db_1.prisma.siteAnalytics.upsert({
                where: {
                    date: today,
                },
                update: {
                    orders: {
                        increment: 1,
                    },
                    revenue: {
                        increment: totalAmount,
                    },
                },
                create: {
                    date: today,
                    orders: 1,
                    revenue: totalAmount,
                },
            });
        }
        catch (error) {
            const errorToUse = error instanceof Error
                ? error
                : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            console.error('Analytics error:', errorToUse);
        }
    }
    // Get dashboard analytics
    static async getDashboardAnalytics() {
        try {
            const today = new Date();
            const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            // Get total sales for last 30 days
            const salesData = await db_1.prisma.orderAnalytics.findMany({
                where: {
                    date: {
                        gte: thirtyDaysAgo,
                    },
                },
                select: {
                    totalAmount: true,
                    date: true,
                },
            });
            // Get top selling products
            const topProducts = await db_1.prisma.productAnalytics.groupBy({
                by: ['productId'],
                where: {
                    date: {
                        gte: thirtyDaysAgo,
                    },
                },
                _sum: {
                    sales: true,
                    revenue: true,
                },
                orderBy: {
                    _sum: {
                        sales: 'desc',
                    },
                },
                take: 10,
            });
            // Get product details for top products
            const topProductIds = topProducts.map((p) => p.productId);
            const products = await db_1.prisma.product.findMany({
                where: {
                    id: {
                        in: topProductIds,
                    },
                },
                select: {
                    id: true,
                    name: true,
                    category: true,
                    images: true,
                },
            });
            // Calculate metrics
            const totalRevenue = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
            const totalOrders = salesData.length;
            const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
            // Calculate growth (compare with previous 30 days)
            const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
            const previousSalesData = await db_1.prisma.orderAnalytics.findMany({
                where: {
                    date: {
                        gte: sixtyDaysAgo,
                        lt: thirtyDaysAgo,
                    },
                },
                select: {
                    totalAmount: true,
                },
            });
            const previousRevenue = previousSalesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
            const revenueGrowth = previousRevenue > 0
                ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
                : 0;
            // Get monthly sales data for chart
            const monthlySales = await db_1.prisma.orderAnalytics.groupBy({
                by: ['date'],
                where: {
                    date: {
                        gte: thirtyDaysAgo,
                    },
                },
                _sum: {
                    totalAmount: true,
                },
                orderBy: {
                    date: 'asc',
                },
            });
            return {
                totalRevenue,
                totalOrders,
                averageOrderValue,
                revenueGrowth,
                topProducts: topProducts.map((product, index) => (Object.assign(Object.assign({}, product), { product: products.find((p) => p.id === product.productId), rank: index + 1 }))),
                monthlySales: monthlySales.map((sale) => ({
                    date: sale.date,
                    revenue: sale._sum.totalAmount,
                })),
            };
        }
        catch (error) {
            const errorToUse = error instanceof Error
                ? error
                : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            console.error('Analytics error:', errorToUse);
            return null;
        }
    }
    // Get product performance
    static async getProductPerformance(productId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const analytics = await db_1.prisma.productAnalytics.findMany({
                where: {
                    productId,
                    date: {
                        gte: startDate,
                    },
                },
                orderBy: {
                    date: 'asc',
                },
            });
            const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
            const totalSales = analytics.reduce((sum, a) => sum + a.sales, 0);
            const totalRevenue = analytics.reduce((sum, a) => sum + a.revenue, 0);
            return {
                totalViews,
                totalSales,
                totalRevenue,
                conversionRate: totalViews > 0 ? (totalSales / totalViews) * 100 : 0,
                dailyData: analytics,
            };
        }
        catch (error) {
            const errorToUse = error instanceof Error
                ? error
                : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            console.error('Analytics error:', errorToUse);
            return null;
        }
    }
}
exports.AnalyticsService = AnalyticsService;
