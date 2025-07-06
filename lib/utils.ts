import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getOrders(userId?: string) {
	const key = userId ? `mautik_orders_${userId}` : 'mautik_orders_guest';
	const data = localStorage.getItem(key);
	if (!data) return [];
	try {
		return JSON.parse(data);
	} catch {
		return [];
	}
}

export function saveOrder(order: any, userId?: string) {
	const key = userId ? `mautik_orders_${userId}` : 'mautik_orders_guest';
	const orders = getOrders(userId);
	orders.unshift(order);
	localStorage.setItem(key, JSON.stringify(orders));
}
