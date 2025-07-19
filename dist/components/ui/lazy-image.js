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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LazyImage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const image_1 = __importDefault(require("next/image"));
const skeleton_1 = require("@/components/ui/skeleton");
function LazyImage(_a) {
    var { src, alt, fill = false, width, height, className = '', priority = false, sizes, onLoad, onError, fallbackSrc = '/placeholder.svg' } = _a, rest = __rest(_a, ["src", "alt", "fill", "width", "height", "className", "priority", "sizes", "onLoad", "onError", "fallbackSrc"]);
    const [isLoaded, setIsLoaded] = (0, react_1.useState)(false);
    const [isInView, setIsInView] = (0, react_1.useState)(priority);
    const [hasError, setHasError] = (0, react_1.useState)(false);
    const [currentSrc, setCurrentSrc] = (0, react_1.useState)(priority ? src : '');
    const imgRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (priority) {
            setIsInView(true);
            setCurrentSrc(src);
            return;
        }
        const observer = new window.IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                setCurrentSrc(src);
                observer.disconnect();
            }
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        if (imgRef.current) {
            observer.observe(imgRef.current);
        }
        return () => {
            if (observer && observer.disconnect)
                observer.disconnect();
        };
    }, [src, priority]);
    const handleLoad = () => {
        setIsLoaded(true);
        onLoad === null || onLoad === void 0 ? void 0 : onLoad();
    };
    const handleError = () => {
        setHasError(true);
        if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
        }
        else {
            onError === null || onError === void 0 ? void 0 : onError();
        }
    };
    const imageProps = Object.assign(Object.assign({ src: hasError ? fallbackSrc : currentSrc, alt, className: `${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`, onLoad: handleLoad, onError: handleError, sizes }, rest), (fill ? { fill } : { width, height }));
    // Estilos inline para el skeleton si no es fill
    const skeletonStyle = fill
        ? { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }
        : { width: width || 100, height: height || 100, display: 'block' };
    return ((0, jsx_runtime_1.jsxs)("div", { ref: imgRef, className: `relative${fill ? ' w-full h-full' : ''}`, role: "img", "aria-label": alt, children: [!isLoaded && isInView && ((0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { style: skeletonStyle })), isInView && ((0, jsx_runtime_1.jsx)(image_1.default, Object.assign({}, imageProps, { priority: priority }))), !isInView && !priority && ((0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { style: skeletonStyle }))] }));
}
