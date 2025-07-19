"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKeyboardNavigation = useKeyboardNavigation;
exports.useSkipLinks = useSkipLinks;
exports.SkipLinks = SkipLinks;
exports.LiveRegion = LiveRegion;
exports.useLiveRegion = useLiveRegion;
exports.FocusTrap = FocusTrap;
exports.useClickOutside = useClickOutside;
exports.FocusVisible = FocusVisible;
exports.useListNavigation = useListNavigation;
exports.LoadingAnnouncer = LoadingAnnouncer;
exports.useModalKeyboard = useModalKeyboard;
exports.ErrorAnnouncer = ErrorAnnouncer;
exports.useFormNavigation = useFormNavigation;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
// Hook para navegación por teclado
function useKeyboardNavigation() {
    const [focusedIndex, setFocusedIndex] = (0, react_1.useState)(-1);
    const [isNavigating, setIsNavigating] = (0, react_1.useState)(false);
    const handleKeyDown = (event, items, onSelect) => {
        if (!items.length)
            return;
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setIsNavigating(true);
                setFocusedIndex(prev => prev < items.length - 1 ? prev + 1 : 0);
                break;
            case 'ArrowUp':
                event.preventDefault();
                setIsNavigating(true);
                setFocusedIndex(prev => prev > 0 ? prev - 1 : items.length - 1);
                break;
            case 'Enter':
                event.preventDefault();
                if (focusedIndex >= 0 && items[focusedIndex]) {
                    onSelect(items[focusedIndex]);
                }
                break;
            case 'Escape':
                event.preventDefault();
                setFocusedIndex(-1);
                setIsNavigating(false);
                break;
        }
    };
    return {
        focusedIndex,
        isNavigating,
        handleKeyDown,
        setFocusedIndex,
        setIsNavigating
    };
}
// Hook para skip links
function useSkipLinks() {
    const [skipLinksVisible, setSkipLinksVisible] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Tab') {
                setSkipLinksVisible(true);
            }
        };
        const handleClick = () => {
            setSkipLinksVisible(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('click', handleClick);
        };
    }, []);
    return skipLinksVisible;
}
// Componente Skip Links
function SkipLinks() {
    const visible = useSkipLinks();
    if (!visible)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50", children: (0, jsx_runtime_1.jsx)("nav", { "aria-label": "Enlaces de navegaci\u00F3n r\u00E1pida", children: (0, jsx_runtime_1.jsxs)("ul", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)("a", { href: "#main-content", className: "block px-4 py-2 bg-purple-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500", children: "Saltar al contenido principal" }) }), (0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)("a", { href: "#main-navigation", className: "block px-4 py-2 bg-purple-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500", children: "Saltar a la navegaci\u00F3n" }) }), (0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)("a", { href: "#footer", className: "block px-4 py-2 bg-purple-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500", children: "Saltar al pie de p\u00E1gina" }) })] }) }) }));
}
// Componente para anunciar cambios a lectores de pantalla
function LiveRegion({ message, role = 'status', 'aria-live': ariaLive = 'polite' }) {
    return ((0, jsx_runtime_1.jsx)("div", { role: role, "aria-live": ariaLive, className: "sr-only", "aria-atomic": "true", children: message }));
}
// Hook para LiveRegion
function useLiveRegion() {
    const [message, setMessage] = (0, react_1.useState)('');
    const announce = (msg, priority = 'polite') => {
        setMessage(msg);
        // Limpiar mensaje después de un tiempo
        setTimeout(() => setMessage(''), 1000);
    };
    return { message, announce };
}
// Componente para manejar focus trap
function FocusTrap({ children }) {
    const containerRef = (0, react_1.useRef)(null);
    const [focusableElements, setFocusableElements] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        if (containerRef.current) {
            const elements = containerRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            setFocusableElements(Array.from(elements));
        }
    }, []);
    (0, react_1.useEffect)(() => {
        const handleKeyDown = (event) => {
            if (event.key !== 'Tab' || !focusableElements.length)
                return;
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            }
            else {
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [focusableElements]);
    return ((0, jsx_runtime_1.jsx)("div", { ref: containerRef, children: children }));
}
// Hook para manejar clicks fuera de un elemento
function useClickOutside(ref, handler) {
    (0, react_1.useEffect)(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler();
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
}
// Componente para manejar focus visible
function FocusVisible({ children }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2", children: children }));
}
// Hook para manejar navegación por teclado en listas
function useListNavigation(items, onSelect) {
    const [selectedIndex, setSelectedIndex] = (0, react_1.useState)(-1);
    const handleKeyDown = (event) => {
        if (!items.length)
            return;
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setSelectedIndex(prev => prev < items.length - 1 ? prev + 1 : 0);
                break;
            case 'ArrowUp':
                event.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : items.length - 1);
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    onSelect(items[selectedIndex], selectedIndex);
                }
                break;
            case 'Home':
                event.preventDefault();
                setSelectedIndex(0);
                break;
            case 'End':
                event.preventDefault();
                setSelectedIndex(items.length - 1);
                break;
        }
    };
    return {
        selectedIndex,
        setSelectedIndex,
        handleKeyDown
    };
}
// Componente para manejar anuncios de carga
function LoadingAnnouncer({ isLoading, message = 'Cargando...', completeMessage = 'Carga completada' }) {
    const { announce } = useLiveRegion();
    (0, react_1.useEffect)(() => {
        if (isLoading) {
            announce(message);
        }
        else {
            announce(completeMessage);
        }
    }, [isLoading, message, completeMessage, announce]);
    return null;
}
// Hook para manejar navegación por teclado en modales
function useModalKeyboard(closeModal) {
    (0, react_1.useEffect)(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [closeModal]);
}
// Componente para manejar anuncios de errores
function ErrorAnnouncer({ error }) {
    const { announce } = useLiveRegion();
    (0, react_1.useEffect)(() => {
        if (error) {
            announce(error, 'assertive');
        }
    }, [error, announce]);
    return null;
}
// Hook para manejar navegación por teclado en formularios
function useFormNavigation() {
    const router = (0, navigation_1.useRouter)();
    const handleFormKeyDown = (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            router.back();
        }
    };
    return { handleFormKeyDown };
}
