# SEO y Analytics - Mautik E-commerce

## 🚀 Funcionalidades Implementadas

### 📊 **Analytics Avanzado**

#### **Modelos de Base de Datos**

- `ProductAnalytics`: Seguimiento de vistas, ventas y ingresos por producto
- `UserAnalytics`: Actividad de usuarios, visitas y compras
- `OrderAnalytics`: Métricas detalladas de pedidos
- `SiteAnalytics`: Métricas generales del sitio

#### **Dashboard de Analytics**

- **URL**: `/admin/analytics`
- **Métricas principales**:
  - Ingresos totales con crecimiento
  - Número de órdenes
  - Ticket promedio
  - Productos más vendidos
- **Gráficos**:
  - Ventas mensuales (línea)
  - Top 10 productos por ventas
- **Filtros**: 7, 30, 90 días

#### **API de Analytics**

- **Endpoint**: `/api/analytics`
- **Métodos**:
  - `GET`: Obtener métricas del dashboard
  - `POST`: Registrar eventos de analytics

### 🔍 **SEO Optimizado**

#### **Meta Tags Dinámicos**

- **Componente**: `components/seo/meta-tags.tsx`
- **Funcionalidades**:
  - Meta tags básicos (title, description, keywords)
  - Open Graph tags para redes sociales
  - Twitter Card tags
  - Canonical URLs
  - Schema markup para productos y organización

#### **Sitemap Automático**

- **URL**: `/sitemap.xml`
- **Incluye**:
  - Páginas estáticas
  - Páginas de categorías
  - Páginas de productos (con fechas de actualización)
- **Prioridades y frecuencias configuradas**

#### **Robots.txt**

- **URL**: `/robots.txt`
- **Configuración**:
  - Permite indexación de páginas públicas
  - Bloquea áreas privadas (admin, api, etc.)
  - Referencia al sitemap

#### **Schema Markup**

- **Product Schema**: Para páginas de productos
- **Organization Schema**: Información de la empresa
- **Breadcrumb Schema**: Navegación estructurada

## 🛠️ **Cómo Usar**

### **Analytics**

#### **1. Acceder al Dashboard**

```bash
# Navegar a
http://localhost:3001/admin/analytics
```

#### **2. Registrar Eventos**

```javascript
// Ejemplo de tracking de vista de producto
await fetch('/api/analytics', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({
		type: 'product_view',
		data: { productId: 'product-id' },
	}),
});

// Ejemplo de tracking de venta
await fetch('/api/analytics', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({
		type: 'product_sale',
		data: {
			productId: 'product-id',
			quantity: 2,
			price: 29.99,
		},
	}),
});
```

### **SEO**

#### **1. Usar Meta Tags en Páginas**

```jsx
import MetaTags from '@/components/seo/meta-tags';

export default function MyPage() {
	return (
		<>
			<MetaTags
				title="Mi Página"
				description="Descripción de la página"
				keywords="palabras, clave, seo"
				image="/mi-imagen.jpg"
				url="/mi-pagina"
			/>
			{/* Contenido de la página */}
		</>
	);
}
```

#### **2. Meta Tags para Productos**

```jsx
<MetaTags
	title={product.name}
	description={product.description}
	keywords={`${product.name}, ${product.category}, artesanía panameña`}
	image={product.images[0]}
	url={`/product/${product.id}`}
	type="product"
	product={{
		name: product.name,
		price: product.price.toString(),
		currency: 'USD',
		availability: product.stock > 0 ? 'in stock' : 'out of stock',
		category: product.category,
	}}
/>
```

## 📈 **Métricas Disponibles**

### **Dashboard Principal**

- **Ventas totales**: Ingresos acumulados
- **Crecimiento**: Comparación con período anterior
- **Órdenes**: Número total de pedidos
- **Ticket promedio**: Valor promedio por orden
- **Productos top**: Los más vendidos

### **Gráficos**

- **Ventas por día**: Línea temporal de ingresos
- **Productos más vendidos**: Ranking con métricas

### **Filtros Temporales**

- **7 días**: Semana actual
- **30 días**: Mes actual
- **90 días**: Trimestre actual

## 🔧 **Configuración**

### **Variables de Entorno**

```env
# Base URL para SEO
NEXT_PUBLIC_SITE_URL=https://mautik.com

# Analytics (opcional)
ANALYTICS_ENABLED=true
```

### **Personalización**

- **Colores**: Modificar en `app/admin/analytics/page.tsx`
- **Métricas**: Agregar en `lib/analytics.ts`
- **Meta tags**: Personalizar en `components/seo/meta-tags.tsx`

## 🧪 **Testing**

### **Ejecutar Tests**

```bash
node scripts/test-seo-analytics.js
```

### **Verificar Sitemap**

```bash
curl http://localhost:3001/sitemap.xml
```

### **Verificar Robots.txt**

```bash
curl http://localhost:3001/robots.txt
```

## 📊 **Próximas Mejoras**

### **Analytics**

- [ ] Exportar reportes a PDF/Excel
- [ ] Alertas automáticas
- [ ] Segmentación de usuarios
- [ ] Funnel de conversión

### **SEO**

- [ ] Blog con artículos SEO
- [ ] Optimización de imágenes
- [ ] PWA (Progressive Web App)
- [ ] AMP pages

## 🎯 **Beneficios**

### **Para SEO**

- ✅ Mejor indexación en Google
- ✅ Rich snippets en búsquedas
- ✅ Compartir optimizado en redes sociales
- ✅ Navegación estructurada

### **Para Analytics**

- ✅ Métricas de rendimiento en tiempo real
- ✅ Identificación de productos más populares
- ✅ Análisis de comportamiento de usuarios
- ✅ Toma de decisiones basada en datos

---

**Desarrollado para Mautik E-commerce** 🛍️
_Artesanía Panameña con tecnología moderna_
