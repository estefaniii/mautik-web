"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProfileAvatar;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const avatar_1 = require("@/components/ui/avatar");
const button_1 = require("@/components/ui/button");
const dialog_1 = require("@/components/ui/dialog");
const lucide_react_1 = require("lucide-react");
const use_toast_1 = require("@/hooks/use-toast");
const auth_context_1 = require("@/context/auth-context");
function ProfileAvatar({ currentImage, userName, onImageChange, size = "lg", isEditing = false }) {
    const [isDragOver, setIsDragOver] = (0, react_1.useState)(false);
    const [isUploading, setIsUploading] = (0, react_1.useState)(false);
    const [showDialog, setShowDialog] = (0, react_1.useState)(false);
    const fileInputRef = (0, react_1.useRef)(null);
    const { toast } = (0, use_toast_1.useToast)();
    const { updateProfile } = (0, auth_context_1.useAuth)();
    const sizeClasses = {
        sm: "h-16 w-16",
        md: "h-20 w-20",
        lg: "h-24 w-24"
    };
    const getUserInitials = (name) => {
        return name
            .split(" ")
            .map(word => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };
    const handleDragOver = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);
    const handleDragLeave = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);
    const handleDrop = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    }, []);
    const handleFileUpload = async (file) => {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            toast({
                title: "❌ Error",
                description: "Solo se permiten archivos de imagen.",
                variant: "destructive"
            });
            return;
        }
        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "❌ Error",
                description: "La imagen debe ser menor a 5MB.",
                variant: "destructive"
            });
            return;
        }
        setIsUploading(true);
        try {
            // Crear FormData para enviar al servidor
            const formData = new FormData();
            formData.append('file', file);
            // Subir a Cloudinary
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                // Guardar avatar en backend y actualizar contexto
                const result = await updateProfile({ avatar: data.url });
                if (result.success) {
                    onImageChange(data.url);
                    toast({
                        title: "✅ Imagen actualizada",
                        description: "Tu foto de perfil ha sido actualizada exitosamente.",
                    });
                    setShowDialog(false);
                }
                else {
                    toast({
                        title: "❌ Error al guardar avatar",
                        description: result.error || "No se pudo guardar el avatar en el perfil.",
                        variant: "destructive"
                    });
                }
            }
            else {
                // Manejar errores específicos de Cloudinary
                if (data.error === 'Configuración de Cloudinary incompleta') {
                    toast({
                        title: "❌ Error de configuración",
                        description: "Las credenciales de Cloudinary no están configuradas. Contacta al administrador.",
                        variant: "destructive"
                    });
                }
                else {
                    throw new Error(data.error || 'Error al subir imagen');
                }
            }
        }
        catch (error) {
            console.error('Error uploading image:', error);
            toast({
                title: "❌ Error",
                description: error instanceof Error ? error.message : "No se pudo subir la imagen. Inténtalo de nuevo.",
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
            handleFileUpload(file);
        }
    };
    const handleGallerySelect = () => {
        var _a;
        // En un entorno real, esto abriría la galería del dispositivo
        // Por ahora, simulamos seleccionando un archivo
        (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click();
    };
    const handleCameraCapture = () => {
        var _a;
        // En un entorno real, esto abriría la cámara
        // Por ahora, simulamos seleccionando un archivo
        (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click();
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsxs)("div", { className: `relative ${sizeClasses[size]} ${isEditing ? 'cursor-pointer group' : ''}`, onDragOver: isEditing ? handleDragOver : undefined, onDragLeave: isEditing ? handleDragLeave : undefined, onDrop: isEditing ? handleDrop : undefined, onClick: isEditing ? () => setShowDialog(true) : undefined, children: [(0, jsx_runtime_1.jsxs)(avatar_1.Avatar, { className: `${sizeClasses[size]} border-4 border-purple-100 transition-all duration-300 ${isDragOver ? 'border-purple-400 scale-105' : 'hover:border-purple-300'}`, children: [(0, jsx_runtime_1.jsx)(avatar_1.AvatarImage, { src: currentImage ? `${currentImage}?t=${Date.now()}` : "/placeholder-user.jpg", alt: userName }), (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { className: "text-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-white", children: getUserInitials(userName) })] }), isDragOver && ((0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 bg-purple-500/20 rounded-full flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { className: "h-8 w-8 text-purple-600" }) })), isEditing && ((0, jsx_runtime_1.jsx)(button_1.Button, { size: "sm", className: "absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-purple-600 hover:bg-purple-700 shadow-lg", onClick: (e) => {
                            e.stopPropagation();
                            setShowDialog(true);
                        }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Camera, { className: "h-4 w-4" }) })), isEditing && ((0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-full transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Camera, { className: "h-6 w-6 text-white" }) }))] }), (0, jsx_runtime_1.jsx)("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleFileSelect, className: "hidden" }), (0, jsx_runtime_1.jsx)(dialog_1.Dialog, { open: showDialog, onOpenChange: setShowDialog, children: (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { className: "sm:max-w-md", children: [(0, jsx_runtime_1.jsxs)(dialog_1.DialogHeader, { children: [(0, jsx_runtime_1.jsxs)(dialog_1.DialogTitle, { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Camera, { className: "h-5 w-5" }), "Cambiar foto de perfil"] }), (0, jsx_runtime_1.jsx)(dialog_1.DialogDescription, { children: "Selecciona una nueva imagen para tu perfil. Puedes arrastrar una imagen aqu\u00ED o elegir una opci\u00F3n." })] }), (0, jsx_runtime_1.jsx)("div", { className: `border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${isDragOver
                                ? 'border-purple-400 bg-purple-50'
                                : 'border-gray-300 hover:border-purple-300'}`, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, children: isDragOver ? ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { className: "h-8 w-8 mx-auto text-purple-600" }), (0, jsx_runtime_1.jsx)("p", { className: "text-purple-600 font-medium", children: "Suelta la imagen aqu\u00ED" })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Image, { className: "h-12 w-12 mx-auto text-gray-400" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 mb-2", children: "Arrastra una imagen aqu\u00ED o" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: () => { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, disabled: isUploading, className: "w-full", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileImage, { className: "h-4 w-4 mr-2" }), "Seleccionar archivo"] })] })] })) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: handleGallerySelect, disabled: isUploading, className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Smartphone, { className: "h-4 w-4" }), "Galer\u00EDa"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: handleCameraCapture, disabled: isUploading, className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Camera, { className: "h-4 w-4" }), "C\u00E1mara"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 text-center", children: "Formatos soportados: JPG, PNG, GIF \u2022 M\u00E1ximo 5MB" }), (0, jsx_runtime_1.jsx)(dialog_1.DialogFooter, { children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: () => setShowDialog(false), disabled: isUploading, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4 mr-2" }), "Cancelar"] }) }), isUploading && ((0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600", children: "Subiendo imagen..." })] }) }))] }) })] }));
}
