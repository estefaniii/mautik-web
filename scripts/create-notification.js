const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createNotification(userId, title, message, type = 'INFO') {
	try {
		const notification = await prisma.notification.create({
			data: {
				userId,
				title,
				message,
				type,
				isRead: false,
			},
		});

		console.log(`✅ Notification created: ${title}`);
		return notification;
	} catch (error) {
		console.error('❌ Error creating notification:', error);
		throw error;
	}
}

// Example usage functions
async function notifyOrderShipped(userId, orderId, trackingNumber) {
	return createNotification(
		userId,
		`Order #${orderId} Shipped`,
		`Your order has been shipped! Tracking number: ${trackingNumber}`,
		'SUCCESS',
	);
}

async function notifyPaymentFailed(userId, orderId) {
	return createNotification(
		userId,
		'Payment Failed',
		`Payment for order #${orderId} failed. Please update your payment method.`,
		'ERROR',
	);
}

async function notifyLowStock(userId, productName, remainingStock) {
	return createNotification(
		userId,
		'Low Stock Alert',
		`Only ${remainingStock} units left of "${productName}". Order soon!`,
		'WARNING',
	);
}

async function notifyNewProduct(userId, productName) {
	return createNotification(
		userId,
		'New Product Available',
		`Check out our new product: "${productName}"!`,
		'INFO',
	);
}

async function notifyDiscount(userId, discountCode, percentage) {
	return createNotification(
		userId,
		'Special Discount!',
		`Get ${percentage}% off with code: ${discountCode}`,
		'INFO',
	);
}

async function notifyReviewRequest(userId, productName) {
	return createNotification(
		userId,
		'Review Request',
		`How was your experience with "${productName}"? We'd love your feedback!`,
		'INFO',
	);
}

// Export functions for use in other scripts
module.exports = {
	createNotification,
	notifyOrderShipped,
	notifyPaymentFailed,
	notifyLowStock,
	notifyNewProduct,
	notifyDiscount,
	notifyReviewRequest,
};

// Example usage if run directly
if (require.main === module) {
	async function example() {
		try {
			// Get admin user
			const adminUser = await prisma.user.findFirst({
				where: { email: 'admin@mautik.com' },
			});

			if (!adminUser) {
				console.log('❌ Admin user not found');
				return;
			}

			console.log('📝 Creating example notifications...\n');

			// Create some example notifications
			await notifyOrderShipped(adminUser.id, '12345', 'TRK123456789');
			await notifyLowStock(adminUser.id, 'Handmade Crochet Blanket', 2);
			await notifyNewProduct(adminUser.id, 'Vintage Camera');
			await notifyDiscount(adminUser.id, 'SUMMER20', 20);

			console.log('\n🎉 Example notifications created successfully!');
		} catch (error) {
			console.error('❌ Error:', error);
		} finally {
			await prisma.$disconnect();
		}
	}

	example();
}
