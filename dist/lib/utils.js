"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.getOrders = getOrders;
exports.saveOrder = saveOrder;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
function getOrders(userId) {
    const key = userId ? `mautik_orders_${userId}` : 'mautik_orders_guest';
    const data = localStorage.getItem(key);
    if (!data)
        return [];
    try {
        return JSON.parse(data);
    }
    catch (_a) {
        return [];
    }
}
function saveOrder(order, userId) {
    const key = userId ? `mautik_orders_${userId}` : 'mautik_orders_guest';
    const orders = getOrders(userId);
    orders.unshift(order);
    localStorage.setItem(key, JSON.stringify(orders));
}
