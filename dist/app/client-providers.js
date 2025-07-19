"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ClientProviders;
const jsx_runtime_1 = require("react/jsx-runtime");
const auth_context_1 = require("@/context/auth-context");
const cart_context_1 = require("@/context/cart-context");
const favorites_context_1 = require("@/context/favorites-context");
const notification_context_1 = require("@/context/notification-context");
const wishlist_context_1 = require("@/context/wishlist-context");
const theme_context_1 = require("@/context/theme-context");
const react_1 = require("next-auth/react");
function ClientProviders({ children }) {
    return ((0, jsx_runtime_1.jsx)(react_1.SessionProvider, { children: (0, jsx_runtime_1.jsx)(theme_context_1.ThemeProvider, { children: (0, jsx_runtime_1.jsx)(auth_context_1.AuthProvider, { children: (0, jsx_runtime_1.jsx)(cart_context_1.CartProvider, { children: (0, jsx_runtime_1.jsx)(favorites_context_1.FavoritesProvider, { children: (0, jsx_runtime_1.jsx)(notification_context_1.NotificationProvider, { children: (0, jsx_runtime_1.jsx)(wishlist_context_1.WishlistProvider, { children: children }) }) }) }) }) }) }));
}
