"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NotFound;
const jsx_runtime_1 = require("react/jsx-runtime");
function NotFound() {
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 40, textAlign: 'center' }, children: [(0, jsx_runtime_1.jsx)("h2", { children: "P\u00E1gina no encontrada" }), (0, jsx_runtime_1.jsx)("p", { children: "La p\u00E1gina que buscas no existe." }), (0, jsx_runtime_1.jsx)("a", { href: "/", style: { color: '#7c3aed', textDecoration: 'underline' }, children: "Volver al inicio" })] }));
}
