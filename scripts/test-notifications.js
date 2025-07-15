const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testNotifications() {
	try {
		console.log('🧪 Testing Notification System...\n');

		// 1. Check if notifications table exists and has data
		const notifications = await prisma.notification.findMany({
			take: 5,
			orderBy: { createdAt: 'desc' },
		});

		console.log(`📊 Found ${notifications.length} notifications in database`);

		if (notifications.length > 0) {
			console.log('📋 Recent notifications:');
			notifications.forEach((notification, index) => {
				console.log(
					`  ${index + 1}. ${notification.title} - ${notification.message} (${
						notification.type
					})`,
				);
			});
		}

		// 2. Test creating a new notification
		console.log('\n➕ Creating test notification...');

		const testNotification = await prisma.notification.create({
			data: {
				userId: '0338f809-6af8-4735-b629-e02c4e5bd642', // admin user
				title: 'Test Notification',
				message: 'This is a test notification to verify the system is working',
				type: 'INFO',
				isRead: false,
			},
		});

		console.log('✅ Test notification created successfully');
		console.log(`   ID: ${testNotification.id}`);
		console.log(`   Title: ${testNotification.title}`);
		console.log(`   Type: ${testNotification.type}`);

		// 3. Test fetching notifications for user
		console.log('\n📥 Fetching notifications for admin user...');

		const userNotifications = await prisma.notification.findMany({
			where: {
				userId: '0338f809-6af8-4735-b629-e02c4e5bd642',
			},
			orderBy: { createdAt: 'desc' },
		});

		console.log(
			`📊 Found ${userNotifications.length} notifications for admin user`,
		);

		// 4. Test marking notification as read
		if (userNotifications.length > 0) {
			console.log('\n✅ Marking first notification as read...');

			const updatedNotification = await prisma.notification.update({
				where: { id: userNotifications[0].id },
				data: { isRead: true },
			});

			console.log(
				`✅ Notification marked as read: ${updatedNotification.title}`,
			);
		}

		// 5. Test notification counts
		console.log('\n📊 Notification statistics:');

		const totalNotifications = await prisma.notification.count();
		const unreadNotifications = await prisma.notification.count({
			where: { isRead: false },
		});
		const readNotifications = await prisma.notification.count({
			where: { isRead: true },
		});

		console.log(`   Total: ${totalNotifications}`);
		console.log(`   Unread: ${unreadNotifications}`);
		console.log(`   Read: ${readNotifications}`);

		// 6. Test different notification types
		console.log('\n🎨 Testing different notification types...');

		const notificationTypes = ['INFO', 'SUCCESS', 'WARNING', 'ERROR'];

		for (const type of notificationTypes) {
			await prisma.notification.create({
				data: {
					userId: '0338f809-6af8-4735-b629-e02c4e5bd642',
					title: `${type} Notification`,
					message: `This is a ${type.toLowerCase()} notification`,
					type: type,
					isRead: false,
				},
			});
			console.log(`   ✅ Created ${type} notification`);
		}

		console.log('\n🎉 Notification system test completed successfully!');
		console.log('\n📝 Next steps:');
		console.log('   1. Check the notification bell in the UI');
		console.log('   2. Verify notifications appear in the dropdown');
		console.log('   3. Test marking notifications as read');
		console.log('   4. Test notification deletion');
	} catch (error) {
		console.error('❌ Error testing notifications:', error);
	} finally {
		await prisma.$disconnect();
	}
}

testNotifications();
