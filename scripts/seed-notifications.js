const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedNotifications() {
	try {
		console.log('🌱 Seeding realistic notifications...\n');

		// Get admin user
		const adminUser = await prisma.user.findFirst({
			where: { email: 'admin@mautik.com' },
		});

		if (!adminUser) {
			console.log(
				'❌ Admin user not found. Please run the create-admin script first.',
			);
			return;
		}

		// Sample notifications for an e-commerce system
		const notifications = [
			{
				title: 'Welcome to Mautik!',
				message:
					'Thank you for joining our platform. Start exploring our amazing products!',
				type: 'SUCCESS',
			},
			{
				title: 'New Product Added',
				message:
					'We just added "Handmade Crochet Blanket" to our collection. Check it out!',
				type: 'INFO',
			},
			{
				title: 'Order #12345 Shipped',
				message:
					'Your order has been shipped and is on its way to you. Track your package here.',
				type: 'SUCCESS',
			},
			{
				title: 'Special Discount Available',
				message:
					'Get 20% off on all electronics this weekend! Use code: ELECTRONICS20',
				type: 'INFO',
			},
			{
				title: 'Payment Failed',
				message:
					'Your recent payment attempt failed. Please update your payment method.',
				type: 'ERROR',
			},
			{
				title: 'Low Stock Alert',
				message:
					'Only 3 units left of "Vintage Camera". Order soon to avoid disappointment!',
				type: 'WARNING',
			},
			{
				title: 'Review Request',
				message:
					"How was your recent purchase? We'd love to hear your feedback!",
				type: 'INFO',
			},
			{
				title: 'Account Security',
				message:
					'Your account password was changed successfully from a new device.',
				type: 'SUCCESS',
			},
			{
				title: 'Return Processed',
				message:
					'Your return for order #12340 has been processed. Refund will appear in 3-5 business days.',
				type: 'SUCCESS',
			},
			{
				title: 'Maintenance Notice',
				message:
					"We'll be performing scheduled maintenance tonight from 2-4 AM. Some features may be temporarily unavailable.",
				type: 'WARNING',
			},
		];

		console.log(`📝 Creating ${notifications.length} notifications...`);

		for (let i = 0; i < notifications.length; i++) {
			const notification = notifications[i];

			// Create notification with different timestamps (some recent, some older)
			const createdAt = new Date();
			createdAt.setHours(createdAt.getHours() - (notifications.length - i) * 2); // Spread over time

			await prisma.notification.create({
				data: {
					userId: adminUser.id,
					title: notification.title,
					message: notification.message,
					type: notification.type,
					isRead: i < 3, // First 3 are read, rest are unread
					createdAt: createdAt,
				},
			});

			console.log(`   ✅ Created: ${notification.title}`);
		}

		// Get final count
		const totalNotifications = await prisma.notification.count();
		const unreadCount = await prisma.notification.count({
			where: { isRead: false },
		});

		console.log(`\n🎉 Successfully seeded notifications!`);
		console.log(`📊 Total notifications: ${totalNotifications}`);
		console.log(`📬 Unread notifications: ${unreadCount}`);
		console.log(`\n🔔 Check the notification bell in your app to see them!`);
	} catch (error) {
		console.error('❌ Error seeding notifications:', error);
	} finally {
		await prisma.$disconnect();
	}
}

seedNotifications();
