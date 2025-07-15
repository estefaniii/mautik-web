// TypeScript interface for Notification model
export interface Notification {
	id: string;
	userId: string;
	type: string; // 'order', 'product', 'user', 'system'
	title: string;
	message: string;
	data?: any; // Additional data like orderId, productId, etc.
	isRead: boolean;
	createdAt: Date;
	updatedAt: Date;
	user?: any; // TODO: Replace 'any' with 'User' if you have a User type
}
