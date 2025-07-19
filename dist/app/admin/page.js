"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const card_1 = require("@/components/ui/card");
const tabs_1 = require("@/components/ui/tabs");
const table_1 = require("@/components/ui/table");
const badge_1 = require("@/components/ui/badge");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const recharts_1 = require("recharts");
function AdminPage() {
    const { toast } = (0, use_toast_1.useToast)();
    const [tab, setTab] = (0, react_1.useState)('dashboard');
    const [products, setProducts] = (0, react_1.useState)([]);
    const [users, setUsers] = (0, react_1.useState)([]);
    const [orders, setOrders] = (0, react_1.useState)([]);
    const [reviews, setReviews] = (0, react_1.useState)([]);
    const [metrics, setMetrics] = (0, react_1.useState)({
        totalSales: 0,
        totalProducts: 0,
        totalUsers: 0,
        pendingOrders: 0,
        salesGrowth: 0
    });
    const [loadingProducts, setLoadingProducts] = (0, react_1.useState)(false);
    const [loadingUsers, setLoadingUsers] = (0, react_1.useState)(false);
    const [loadingOrders, setLoadingOrders] = (0, react_1.useState)(false);
    const [loadingReviews, setLoadingReviews] = (0, react_1.useState)(false);
    const [searchProducts, setSearchProducts] = (0, react_1.useState)('');
    const [searchUsers, setSearchUsers] = (0, react_1.useState)('');
    const [searchOrders, setSearchOrders] = (0, react_1.useState)('');
    const [searchReviews, setSearchReviews] = (0, react_1.useState)('');
    // Calcular ventas por mes para el año actual
    const [monthlySales, setMonthlySales] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        if (tab === 'dashboard') {
            fetchMetrics();
        }
        else if (tab === 'products') {
            fetchProducts();
        }
        else if (tab === 'users') {
            fetchUsers();
        }
        else if (tab === 'orders') {
            fetchOrders();
        }
        else if (tab === 'reviews') {
            fetchReviews();
        }
    }, [tab]);
    // Calcular ventas mensuales después de obtener los pedidos
    (0, react_1.useEffect)(() => {
        if (tab === 'dashboard' && orders.length > 0) {
            const now = new Date();
            const year = now.getFullYear();
            const months = [
                'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
            ];
            const salesByMonth = Array(12).fill(0);
            orders.forEach((order) => {
                if (order.status === 'delivered') {
                    const date = new Date(order.createdAt);
                    if (date.getFullYear() === year) {
                        salesByMonth[date.getMonth()] += order.total || 0;
                    }
                }
            });
            setMonthlySales(months.map((m, i) => ({ month: m, total: salesByMonth[i] })));
        }
    }, [orders, tab]);
    const fetchMetrics = async () => {
        try {
            const [productsRes, usersRes, ordersRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/users'),
                fetch('/api/orders')
            ]);
            let products = [];
            let users = [];
            let orders = [];
            if (productsRes.ok) {
                const data = await productsRes.json();
                products = Array.isArray(data) ? data : [];
            }
            if (usersRes.ok) {
                users = await usersRes.json();
            }
            if (ordersRes.ok) {
                orders = await ordersRes.json();
            }
            // Calcular ventas totales reales (solo pedidos entregados)
            const totalSales = (orders || [])
                .filter((order) => order.status === 'delivered')
                .reduce((sum, order) => sum + (order.total || 0), 0);
            // Calcular pedidos pendientes reales
            const pendingOrders = (orders || [])
                .filter((order) => order.status === 'pending' || order.status === 'processing').length;
            // Calcular ventas del mes actual y anterior
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            const salesThisMonth = (orders || [])
                .filter((order) => order.status === 'delivered' && new Date(order.createdAt).getMonth() === currentMonth && new Date(order.createdAt).getFullYear() === currentYear)
                .reduce((sum, order) => sum + (order.total || 0), 0);
            const salesLastMonth = (orders || [])
                .filter((order) => order.status === 'delivered' && new Date(order.createdAt).getMonth() === lastMonth && new Date(order.createdAt).getFullYear() === lastMonthYear)
                .reduce((sum, order) => sum + (order.total || 0), 0);
            let salesGrowth = 0;
            if (salesLastMonth > 0) {
                salesGrowth = ((salesThisMonth - salesLastMonth) / salesLastMonth) * 100;
            }
            else if (salesThisMonth > 0) {
                salesGrowth = 100;
            }
            else {
                salesGrowth = 0;
            }
            setMetrics({
                totalSales,
                totalProducts: products.length,
                totalUsers: users.length,
                pendingOrders,
                salesGrowth
            });
        }
        catch (error) {
            console.error('Error fetching metrics:', error);
            setMetrics({
                totalSales: 0,
                totalProducts: 0,
                totalUsers: 0,
                pendingOrders: 0,
                salesGrowth: 0
            });
        }
    };
    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            const res = await fetch('/api/products');
            if (res.ok) {
                const data = await res.json();
                // La API ahora devuelve directamente el array de productos
                setProducts(Array.isArray(data) ? data : []);
            }
        }
        catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        }
        finally {
            setLoadingProducts(false);
        }
    };
    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
            else {
                setUsers([]);
            }
        }
        catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        }
        finally {
            setLoadingUsers(false);
        }
    };
    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        }
        catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        }
        finally {
            setLoadingOrders(false);
        }
    };
    const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
            const res = await fetch('/api/reviews');
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        }
        catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
        }
        finally {
            setLoadingReviews(false);
        }
    };
    const handleDeleteProduct = async (productId) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto?'))
            return;
        try {
            const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
            if (res.ok) {
                toast({ title: "Producto eliminado", description: "El producto se ha eliminado exitosamente." });
                fetchProducts();
            }
        }
        catch (error) {
            toast({ title: "Error", description: "No se pudo eliminar el producto.", variant: "destructive" });
        }
    };
    const handleToggleUserRole = async (userId, isAdmin) => {
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAdmin: !isAdmin })
            });
            if (res.ok) {
                toast({ title: "Rol actualizado", description: "El rol del usuario se ha actualizado." });
                fetchUsers();
            }
        }
        catch (error) {
            toast({ title: "Error", description: "No se pudo actualizar el rol.", variant: "destructive" });
        }
    };
    const handleDeleteUser = async (userId) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este usuario?'))
            return;
        try {
            const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
            if (res.ok) {
                toast({ title: "Usuario eliminado", description: "El usuario se ha eliminado exitosamente." });
                fetchUsers();
            }
        }
        catch (error) {
            toast({ title: "Error", description: "No se pudo eliminar el usuario.", variant: "destructive" });
        }
    };
    const filteredProducts = (products || []).filter(product => product.name.toLowerCase().includes(searchProducts.toLowerCase()) ||
        product.category.toLowerCase().includes(searchProducts.toLowerCase()));
    const filteredUsers = (users || []).filter(user => user.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
        user.email.toLowerCase().includes(searchUsers.toLowerCase()));
    const filteredOrders = (orders || []).filter(order => order.user.name.toLowerCase().includes(searchOrders.toLowerCase()) ||
        order.status.toLowerCase().includes(searchOrders.toLowerCase()));
    const filteredReviews = (reviews || []).filter(review => review.user.name.toLowerCase().includes(searchReviews.toLowerCase()) ||
        review.product.name.toLowerCase().includes(searchReviews.toLowerCase()));
    return ((0, jsx_runtime_1.jsxs)("div", { className: "container mx-auto p-6 space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100", children: "Panel de Administraci\u00F3n" }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-4", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/admin/cleanup", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", className: "text-orange-600 hover:text-orange-700 hover:bg-orange-50", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }), "Limpiar localStorage"] }) }) })] }), (0, jsx_runtime_1.jsxs)(tabs_1.Tabs, { value: tab, onValueChange: setTab, className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)(tabs_1.TabsList, { className: "grid w-full grid-cols-6", children: [(0, jsx_runtime_1.jsxs)(tabs_1.TabsTrigger, { value: "dashboard", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { size: 16 }), "Dashboard"] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsTrigger, { value: "products", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Package, { size: 16 }), "Productos"] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsTrigger, { value: "users", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Users, { size: 16 }), "Usuarios"] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsTrigger, { value: "orders", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingCart, { size: 16 }), "Pedidos"] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsTrigger, { value: "reviews", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Star, { size: 16 }), "Rese\u00F1as"] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsTrigger, { value: "coupons", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { size: 16 }), "Cupones"] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsTrigger, { value: "analytics", className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BarChart, { size: 16 }), "Analytics"] })] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsContent, { value: "dashboard", className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Ventas Totales" }), (0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { className: "h-4 w-4 text-muted-foreground" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-2xl font-bold", children: ["$", metrics.totalSales.toFixed(2)] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-muted-foreground", children: [metrics.salesGrowth > 0 ? '+' : '', metrics.salesGrowth.toFixed(1), "% desde el mes pasado"] })] })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Productos" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Package, { className: "h-4 w-4 text-muted-foreground" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold", children: metrics.totalProducts }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-muted-foreground", children: "Productos en cat\u00E1logo" })] })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Usuarios" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Users, { className: "h-4 w-4 text-muted-foreground" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold", children: metrics.totalUsers }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-muted-foreground", children: "Usuarios registrados" })] })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Pedidos Pendientes" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-4 w-4 text-muted-foreground" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold", children: metrics.pendingOrders }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-muted-foreground", children: "Requieren atenci\u00F3n" })] })] })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { children: ["Ventas por Mes (", new Date().getFullYear(), ")"] }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Ventas totales de pedidos entregados por mes" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { style: { height: 300 }, children: (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: "100%", children: (0, jsx_runtime_1.jsxs)(recharts_1.BarChart, { data: monthlySales, margin: { top: 10, right: 30, left: 0, bottom: 0 }, children: [(0, jsx_runtime_1.jsx)(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "month" }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, {}), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { formatter: (value) => `$${Number(value).toFixed(2)}` }), (0, jsx_runtime_1.jsx)(recharts_1.Bar, { dataKey: "total", fill: "#7c3aed", radius: [4, 4, 0, 0] })] }) }) })] })] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsContent, { value: "products", className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "h-4 w-4 text-muted-foreground" }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Buscar productos...", value: searchProducts, onChange: (e) => setSearchProducts(e.target.value), className: "w-64" })] }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/admin/products/new", children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "default", children: "+ Nuevo Producto" }) })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Gesti\u00F3n de Productos" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Administra los productos de la tienda" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: loadingProducts ? ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8", children: "Cargando productos..." })) : ((0, jsx_runtime_1.jsxs)(table_1.Table, { children: [(0, jsx_runtime_1.jsx)(table_1.TableHeader, { className: "hidden sm:table-header-group", children: (0, jsx_runtime_1.jsxs)(table_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Imagen" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Nombre" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Categor\u00EDa" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Precio" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Stock" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Etiquetas" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Acciones" })] }) }), (0, jsx_runtime_1.jsx)(table_1.TableBody, { children: filteredProducts.map((product) => ((0, jsx_runtime_1.jsxs)(table_1.TableRow, { className: "sm:table-row flex flex-col sm:flex-row mb-4 sm:mb-0 border sm:border-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none p-3 sm:p-0 bg-white sm:bg-transparent", children: [(0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "flex items-center gap-3 sm:table-cell", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Imagen:" }), (0, jsx_runtime_1.jsx)("div", { className: "w-16 h-16 rounded-md overflow-hidden", children: (0, jsx_runtime_1.jsx)("img", { src: product.images[0] || "/placeholder.svg", alt: product.name, className: "w-full h-full object-cover" }) })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Nombre:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: product.name })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Categor\u00EDa:" }), product.category] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Precio:" }), "$", product.price.toFixed(2)] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Stock:" }), product.stock] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Etiquetas:" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1 flex-wrap", children: [product.isNew && (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "secondary", children: "Nuevo" }), product.featured && (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", children: "Destacado" }), (product.discount || 0) > 0 && ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "destructive", children: ["-", product.discount, "%"] }))] })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Acciones:" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 flex-col sm:flex-row", children: [(0, jsx_runtime_1.jsx)(link_1.default, { href: `/admin/products/${product.id}/edit`, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", className: "w-full sm:w-auto", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "h-4 w-4" }) }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", className: "w-full sm:w-auto", onClick: () => handleDeleteProduct(String(product.id)), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4" }) })] })] })] }, product.id))) })] })) })] })] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsContent, { value: "users", className: "space-y-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-between items-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "h-4 w-4 text-muted-foreground" }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Buscar usuarios...", value: searchUsers, onChange: (e) => setSearchUsers(e.target.value), className: "w-64" })] }) }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Gesti\u00F3n de Usuarios" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Administra los usuarios registrados" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: loadingUsers ? ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8", children: "Cargando usuarios..." })) : ((0, jsx_runtime_1.jsxs)(table_1.Table, { children: [(0, jsx_runtime_1.jsx)(table_1.TableHeader, { className: "hidden sm:table-header-group", children: (0, jsx_runtime_1.jsxs)(table_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Usuario" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Email" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Rol" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Fecha de Registro" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Acciones" })] }) }), (0, jsx_runtime_1.jsx)(table_1.TableBody, { children: filteredUsers.map((user) => ((0, jsx_runtime_1.jsxs)(table_1.TableRow, { className: "sm:table-row flex flex-col sm:flex-row mb-4 sm:mb-0 border sm:border-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none p-3 sm:p-0 bg-white sm:bg-transparent", children: [(0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "flex items-center gap-3 sm:table-cell", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Usuario:" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded-full overflow-hidden", children: (0, jsx_runtime_1.jsx)("img", { src: user.avatar || "/placeholder-user.jpg", alt: user.name, className: "w-full h-full object-cover" }) }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: user.name })] })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Email:" }), (0, jsx_runtime_1.jsx)("span", { children: user.email })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Rol:" }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: user.isAdmin ? "default" : "secondary", children: user.isAdmin ? "Admin" : "Usuario" })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Fecha:" }), user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Acciones:" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 flex-col sm:flex-row", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", className: "w-full sm:w-auto", onClick: () => handleToggleUserRole(String(user._id), user.isAdmin), children: user.isAdmin ? "Quitar Admin" : "Hacer Admin" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", className: "w-full sm:w-auto", onClick: () => handleDeleteUser(String(user._id)), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4" }) })] })] })] }, user._id))) })] })) })] })] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsContent, { value: "orders", className: "space-y-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-between items-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "h-4 w-4 text-muted-foreground" }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Buscar pedidos...", value: searchOrders, onChange: (e) => setSearchOrders(e.target.value), className: "w-64" })] }) }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Gesti\u00F3n de Pedidos" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Administra los pedidos de los clientes" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: loadingOrders ? ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8", children: "Cargando pedidos..." })) : ((0, jsx_runtime_1.jsxs)(table_1.Table, { children: [(0, jsx_runtime_1.jsx)(table_1.TableHeader, { className: "hidden sm:table-header-group", children: (0, jsx_runtime_1.jsxs)(table_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Cliente" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Productos" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Total" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Estado" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Fecha" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Acciones" })] }) }), (0, jsx_runtime_1.jsx)(table_1.TableBody, { children: filteredOrders.map((order) => ((0, jsx_runtime_1.jsxs)(table_1.TableRow, { className: "sm:table-row flex flex-col sm:flex-row mb-4 sm:mb-0 border sm:border-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none p-3 sm:p-0 bg-white sm:bg-transparent", children: [(0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "flex items-center gap-3 sm:table-cell", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Cliente:" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "font-medium", children: order.user.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground", children: order.user.email })] })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Productos:" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-sm", children: [order.items.length, " productos"] })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Total:" }), (0, jsx_runtime_1.jsxs)("div", { className: "font-medium", children: ["$", order.total.toFixed(2)] })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Estado:" }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: order.status === 'pending' ? 'secondary' :
                                                                            order.status === 'processing' ? 'default' :
                                                                                order.status === 'shipped' ? 'outline' :
                                                                                    order.status === 'delivered' ? 'default' :
                                                                                        'destructive', children: order.status === 'pending' ? 'Pendiente' :
                                                                            order.status === 'processing' ? 'Procesando' :
                                                                                order.status === 'shipped' ? 'Enviado' :
                                                                                    order.status === 'delivered' ? 'Entregado' :
                                                                                        'Cancelado' })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Fecha:" }), new Date(order.createdAt).toLocaleDateString()] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Acciones:" }), (0, jsx_runtime_1.jsx)("div", { className: "flex gap-2 flex-col sm:flex-row", children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", className: "w-full sm:w-auto", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "h-4 w-4" }) }) })] })] }, order._id))) })] })) })] })] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsContent, { value: "reviews", className: "space-y-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-between items-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "h-4 w-4 text-muted-foreground" }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Buscar rese\u00F1as...", value: searchReviews, onChange: (e) => setSearchReviews(e.target.value), className: "w-64" })] }) }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Gesti\u00F3n de Rese\u00F1as" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Administra las rese\u00F1as de los productos" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: loadingReviews ? ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8", children: "Cargando rese\u00F1as..." })) : ((0, jsx_runtime_1.jsxs)(table_1.Table, { children: [(0, jsx_runtime_1.jsx)(table_1.TableHeader, { className: "hidden sm:table-header-group", children: (0, jsx_runtime_1.jsxs)(table_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Usuario" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Producto" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Calificaci\u00F3n" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Comentario" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Fecha" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Acciones" })] }) }), (0, jsx_runtime_1.jsx)(table_1.TableBody, { children: filteredReviews.map((review) => ((0, jsx_runtime_1.jsxs)(table_1.TableRow, { className: "sm:table-row flex flex-col sm:flex-row mb-4 sm:mb-0 border sm:border-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none p-3 sm:p-0 bg-white sm:bg-transparent", children: [(0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "flex items-center gap-3 sm:table-cell", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Usuario:" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded-full overflow-hidden", children: (0, jsx_runtime_1.jsx)("img", { src: review.user.avatar || "/placeholder-user.jpg", alt: review.user.name, className: "w-full h-full object-cover" }) }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: review.user.name })] })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Producto:" }), (0, jsx_runtime_1.jsx)("span", { children: review.product.name })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Calificaci\u00F3n:" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [[...Array(5)].map((_, i) => ((0, jsx_runtime_1.jsx)(lucide_react_1.Star, { className: `h-4 w-4 ${i < review.rating
                                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                                    : "text-gray-300"}` }, i))), (0, jsx_runtime_1.jsxs)("span", { className: "ml-1 text-sm", children: [review.rating, "/5"] })] })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Comentario:" }), (0, jsx_runtime_1.jsx)("div", { className: "max-w-xs truncate", children: review.comment })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Fecha:" }), new Date(review.createdAt).toLocaleDateString()] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Acciones:" }), (0, jsx_runtime_1.jsx)("div", { className: "flex gap-2 flex-col sm:flex-row", children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", onClick: () => {
                                                                                if (confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
                                                                                    // Aquí iría la lógica para eliminar la reseña
                                                                                    toast({ title: "Reseña eliminada", description: "La reseña se ha eliminado exitosamente." });
                                                                                }
                                                                            }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4" }) }) })] })] }, review._id))) })] })) })] })] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsContent, { value: "coupons", className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "h-4 w-4 text-muted-foreground" }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Buscar cupones...", value: searchProducts, onChange: (e) => setSearchProducts(e.target.value), className: "w-64" })] }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/admin/coupons/new", children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "default", children: "+ Nuevo Cup\u00F3n" }) })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Gesti\u00F3n de Cupones" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Administra los cupones de descuento disponibles para los usuarios." })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: loadingProducts ? ( // Reusing loadingProducts for now
                                        (0, jsx_runtime_1.jsx)("div", { className: "text-center py-8", children: "Cargando cupones..." })) : ((0, jsx_runtime_1.jsxs)(table_1.Table, { children: [(0, jsx_runtime_1.jsx)(table_1.TableHeader, { className: "hidden sm:table-header-group", children: (0, jsx_runtime_1.jsxs)(table_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "C\u00F3digo" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Tipo" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Valor" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Estado" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Acciones" })] }) }), (0, jsx_runtime_1.jsxs)(table_1.TableBody, { children: [(0, jsx_runtime_1.jsxs)(table_1.TableRow, { className: "sm:table-row flex flex-col sm:flex-row mb-4 sm:mb-0 border sm:border-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none p-3 sm:p-0 bg-white sm:bg-transparent", children: [(0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "C\u00F3digo:" }), (0, jsx_runtime_1.jsx)("span", { children: "SUMMER2023" })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Tipo:" }), (0, jsx_runtime_1.jsx)("span", { children: "Porcentaje" })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Valor:" }), (0, jsx_runtime_1.jsx)("span", { children: "10%" })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Estado:" }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "default", children: "Activo" })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Acciones:" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 flex-col sm:flex-row", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", className: "w-full sm:w-auto", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "h-4 w-4" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", className: "w-full sm:w-auto", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4" }) })] })] })] }), (0, jsx_runtime_1.jsxs)(table_1.TableRow, { className: "sm:table-row flex flex-col sm:flex-row mb-4 sm:mb-0 border sm:border-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none p-3 sm:p-0 bg-white sm:bg-transparent", children: [(0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "C\u00F3digo:" }), (0, jsx_runtime_1.jsx)("span", { children: "WELCOME10" })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Tipo:" }), (0, jsx_runtime_1.jsx)("span", { children: "Fijo" })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Valor:" }), (0, jsx_runtime_1.jsx)("span", { children: "$10" })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Estado:" }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "secondary", children: "Inactivo" })] }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "sm:table-cell flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0", children: [(0, jsx_runtime_1.jsx)("span", { className: "sm:hidden text-xs text-gray-500 w-24", children: "Acciones:" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 flex-col sm:flex-row", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", className: "w-full sm:w-auto", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "h-4 w-4" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", className: "w-full sm:w-auto", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4" }) })] })] })] })] })] })) })] })] }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "analytics", className: "space-y-6", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Analytics Avanzado" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "M\u00E9tricas detalladas y reportes de rendimiento" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center py-8", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-4", children: "Accede a analytics avanzados con m\u00E9tricas detalladas de ventas, productos m\u00E1s vendidos y comportamiento de usuarios." }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/admin/analytics", children: (0, jsx_runtime_1.jsx)(button_1.Button, { className: "bg-purple-600 hover:bg-purple-700", children: "Ver Analytics Detallado" }) })] }) })] }) })] })] }));
}
