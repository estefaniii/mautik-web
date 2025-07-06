# Configuración de Cloudinary para Subida de Imágenes

## 🔧 Pasos para configurar Cloudinary:

### 1. Crear cuenta en Cloudinary

- Ve a [https://cloudinary.com](https://cloudinary.com)
- Regístrate para una cuenta gratuita
- Confirma tu email

### 2. Obtener credenciales

- Ve a tu [Dashboard de Cloudinary](https://cloudinary.com/console)
- En la sección "Account Details" encontrarás:
  - **Cloud Name**
  - **API Key**
  - **API Secret**

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://admin:admin123@cluster0.mongodb.net/mautik-ecommerce?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui

# Stripe Configuration (opcional)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
```

### 4. Reiniciar el servidor

Después de configurar las variables de entorno:

```bash
npm run dev
```

## 🎯 Funcionalidades incluidas:

- ✅ **Drag & Drop** de imágenes
- ✅ **Selección de archivos** desde explorador
- ✅ **Acceso a galería** (simulado)
- ✅ **Captura de cámara** (simulado)
- ✅ **Validación de tipos** (solo imágenes)
- ✅ **Validación de tamaño** (máximo 5MB)
- ✅ **Optimización automática** de imágenes
- ✅ **Transformaciones** (recorte, redimensionado)
- ✅ **Manejo de errores** detallado

## 📁 Estructura de carpetas en Cloudinary:

- `mautik-ecommerce/profiles/` - Fotos de perfil
- `mautik-ecommerce/products/` - Imágenes de productos

## 🔒 Seguridad:

- Las credenciales se almacenan en variables de entorno
- Validación de tipos de archivo
- Límite de tamaño de archivo
- Transformaciones automáticas para optimización

## 🚀 Uso:

1. Ve a tu perfil: `/profile`
2. Click en el avatar
3. Arrastra una imagen o selecciona desde archivos
4. La imagen se subirá automáticamente a Cloudinary
5. Se actualizará tu foto de perfil
