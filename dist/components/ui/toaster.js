"use strict";
"use client";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Toaster = Toaster;
const jsx_runtime_1 = require("react/jsx-runtime");
const use_toast_1 = require("@/hooks/use-toast");
const toast_1 = require("@/components/ui/toast");
function Toaster() {
    const { toasts } = (0, use_toast_1.useToast)();
    return ((0, jsx_runtime_1.jsxs)(toast_1.ToastProvider, { children: [toasts.map(function (_a) {
                var { id, title, description, action } = _a, props = __rest(_a, ["id", "title", "description", "action"]);
                return ((0, jsx_runtime_1.jsxs)(toast_1.Toast, Object.assign({}, props, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid gap-1", children: [title && (0, jsx_runtime_1.jsx)(toast_1.ToastTitle, { children: title }), description && ((0, jsx_runtime_1.jsx)(toast_1.ToastDescription, { children: description }))] }), action, (0, jsx_runtime_1.jsx)(toast_1.ToastClose, {})] }), id));
            }), (0, jsx_runtime_1.jsx)(toast_1.ToastViewport, {})] }));
}
