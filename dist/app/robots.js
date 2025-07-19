"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = robots;
function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/api/',
                '/_next/',
                '/private/',
                '/checkout/',
                '/profile/',
                '/orders/',
                '/favorites/',
                '/cart/',
            ],
        },
        sitemap: 'https://mautik.com/sitemap.xml',
    };
}
