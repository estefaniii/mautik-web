"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ImageUpload;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const label_1 = require("@/components/ui/label");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
function ImageUpload({ onImageUpload, className }) {
    const [isUploading, setIsUploading] = (0, react_1.useState)(false);
    const [dragActive, setDragActive] = (0, react_1.useState)(false);
    const fileInputRef = (0, react_1.useRef)(null);
    const { toast } = (0, use_toast_1.useToast)();
    const uploadImage = async (file) => {
        if (!file)
            return;
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Error",
                description: "Por favor selecciona un archivo de imagen válido.",
                variant: "destructive"
            });
            return;
        }
        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "Error",
                description: "La imagen debe ser menor a 5MB.",
                variant: "destructive"
            });
            return;
        }
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('/api/upload', {
                method: 'POST',
                credentials: 'include', // Incluir cookies automáticamente
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Error al subir la imagen');
            }
            const data = await response.json();
            if (data.url) {
                onImageUpload(data.url);
                toast({
                    title: "Imagen subida",
                    description: "La imagen se ha subido correctamente a Cloudinary.",
                });
            }
            else {
                throw new Error('No se recibió la URL de la imagen');
            }
        }
        catch (error) {
            const errorToUse = error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            console.error('Error uploading image:', errorToUse);
            toast({
                title: "Error",
                description: errorToUse.message || "No se pudo subir la imagen. Verifica tu conexión a internet.",
                variant: "destructive"
            });
        }
        finally {
            setIsUploading(false);
        }
    };
    const handleFileSelect = (e) => {
        var _a;
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            uploadImage(file);
        }
    };
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        }
        else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };
    const handleDrop = (e) => {
        var _a;
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = (_a = e.dataTransfer.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            uploadImage(file);
        }
    };
    const handleClick = () => {
        var _a;
        (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click();
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: className, children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Subir imagen" }), (0, jsx_runtime_1.jsxs)("div", { className: `
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `, onDragEnter: handleDrag, onDragLeave: handleDrag, onDragOver: handleDrag, onDrop: handleDrop, onClick: handleClick, children: [(0, jsx_runtime_1.jsx)("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleFileSelect, className: "hidden", disabled: isUploading }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-col items-center gap-2", children: isUploading ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600", children: "Subiendo imagen..." })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { className: "h-8 w-8 text-gray-400" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-700", children: "Arrastra una imagen aqu\u00ED o haz clic para seleccionar" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 mt-1", children: "PNG, JPG, GIF hasta 5MB" })] })] })) })] })] }));
}
