"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GlobalError;
const jsx_runtime_1 = require("react/jsx-runtime");
function GlobalError({ error, reset }) {
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 40, textAlign: 'center' }, children: [(0, jsx_runtime_1.jsx)("h2", { children: "\u00A1Ha ocurrido un error inesperado!" }), (0, jsx_runtime_1.jsx)("p", { children: error.message }), (0, jsx_runtime_1.jsx)("button", { onClick: () => reset(), style: { marginTop: 20, padding: 10 }, children: "Intentar de nuevo" })] }));
}
