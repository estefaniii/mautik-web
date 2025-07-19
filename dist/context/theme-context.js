"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeProvider = ThemeProvider;
exports.useTheme = useTheme;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ThemeContext = (0, react_1.createContext)(undefined);
function ThemeProvider({ children }) {
    const [isDarkMode, setIsDarkMode] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        // Cargar el modo oscuro desde localStorage al inicializar
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode !== null) {
            const darkMode = savedDarkMode === 'true';
            setIsDarkMode(darkMode);
            applyTheme(darkMode);
        }
    }, []);
    const applyTheme = (dark) => {
        if (dark) {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
    };
    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);
        applyTheme(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode.toString());
    };
    const setDarkMode = (dark) => {
        setIsDarkMode(dark);
        applyTheme(dark);
        localStorage.setItem('darkMode', dark.toString());
    };
    return ((0, jsx_runtime_1.jsx)(ThemeContext.Provider, { value: { isDarkMode, toggleDarkMode, setDarkMode }, children: children }));
}
function useTheme() {
    const context = (0, react_1.useContext)(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
