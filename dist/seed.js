"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var sampleProducts = [
    {
        name: 'Smartphone Premium X1',
        description: 'El último smartphone con tecnología avanzada, cámara de 108MP, pantalla OLED de 6.7 pulgadas y procesador de última generación.',
        price: 899.99,
        originalPrice: 1099.99,
        category: 'electronics',
        subcategory: 'smartphones',
        images: [
            '/placeholder.svg?height=400&width=400',
            '/placeholder.svg?height=400&width=400',
        ],
        stock: 50,
        sku: 'PHONE-X1-001',
        brand: 'TechBrand',
        tags: ['smartphone', 'premium', '5G', 'cámara'],
        specifications: {
            screen: '6.7 OLED',
            camera: '108MP',
            battery: '4500mAh',
            storage: '256GB',
        },
        reviews: [],
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Laptop Gaming Pro',
        description: 'Laptop para gaming con RTX 4070, Intel i7, 32GB RAM y SSD de 1TB. Perfecta para juegos y trabajo profesional.',
        price: 1599.99,
        originalPrice: 1899.99,
        category: 'electronics',
        subcategory: 'laptops',
        images: [
            '/placeholder.svg?height=400&width=400',
            '/placeholder.svg?height=400&width=400',
        ],
        stock: 25,
        sku: 'LAPTOP-GAMING-001',
        brand: 'GameTech',
        tags: ['laptop', 'gaming', 'RTX', 'i7'],
        specifications: {
            processor: 'Intel i7-13700H',
            graphics: 'RTX 4070',
            ram: '32GB DDR5',
            storage: '1TB SSD',
        },
        reviews: [],
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Camiseta Casual Premium',
        description: 'Camiseta de algodón 100% orgánico, corte moderno y colores vibrantes. Perfecta para el día a día.',
        price: 29.99,
        originalPrice: 39.99,
        category: 'clothing',
        subcategory: 'shirts',
        images: [
            '/placeholder.svg?height=400&width=400',
            '/placeholder.svg?height=400&width=400',
        ],
        stock: 100,
        sku: 'SHIRT-CASUAL-001',
        brand: 'FashionCo',
        tags: ['camiseta', 'algodón', 'casual', 'orgánico'],
        specifications: {
            material: '100% Algodón Orgánico',
            fit: 'Regular',
            care: 'Lavado a máquina',
        },
        reviews: [],
        isActive: true,
        isFeatured: false,
    },
    {
        name: 'Auriculares Inalámbricos Pro',
        description: 'Auriculares con cancelación de ruido activa, 30 horas de batería y sonido Hi-Fi premium.',
        price: 199.99,
        originalPrice: 249.99,
        category: 'electronics',
        subcategory: 'audio',
        images: [
            '/placeholder.svg?height=400&width=400',
            '/placeholder.svg?height=400&width=400',
        ],
        stock: 75,
        sku: 'HEADPHONES-PRO-001',
        brand: 'AudioTech',
        tags: ['auriculares', 'inalámbricos', 'cancelación ruido', 'Hi-Fi'],
        specifications: {
            battery: '30 horas',
            connectivity: 'Bluetooth 5.3',
            features: 'Cancelación de ruido activa',
            weight: '250g',
        },
        reviews: [],
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Reloj Inteligente Sport',
        description: 'Reloj inteligente con GPS, monitor de salud, resistente al agua y más de 100 modos deportivos.',
        price: 299.99,
        category: 'electronics',
        subcategory: 'wearables',
        images: [
            '/placeholder.svg?height=400&width=400',
            '/placeholder.svg?height=400&width=400',
        ],
        stock: 60,
        sku: 'WATCH-SPORT-001',
        brand: 'SportTech',
        tags: ['reloj', 'inteligente', 'GPS', 'deporte', 'salud'],
        specifications: {
            display: '1.4 AMOLED',
            battery: '14 días',
            waterproof: '5ATM',
            sensors: 'GPS, Corazón, SpO2',
        },
        reviews: [],
        isActive: true,
        isFeatured: true,
    },
];
function seedDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var adminPassword, userPassword, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, prisma.$connect()];
                case 1:
                    _a.sent();
                    console.log('Conectado a MongoDB');
                    // Limpiar datos existentes
                    return [4 /*yield*/, prisma.product.deleteMany({})];
                case 2:
                    // Limpiar datos existentes
                    _a.sent();
                    return [4 /*yield*/, prisma.user.deleteMany({})];
                case 3:
                    _a.sent();
                    console.log('Datos existentes eliminados');
                    // Crear productos
                    return [4 /*yield*/, prisma.product.createMany({ data: sampleProducts })];
                case 4:
                    // Crear productos
                    _a.sent();
                    console.log('Productos de ejemplo creados');
                    adminPassword = 'admin123';
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: 'Administrador',
                                email: 'admin@mautik.com',
                                password: adminPassword,
                                isAdmin: true,
                            },
                        })];
                case 5:
                    _a.sent();
                    userPassword = 'user123';
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: 'Usuario Demo',
                                email: 'user@mautik.com',
                                password: userPassword,
                                isAdmin: false,
                            },
                        })];
                case 6:
                    _a.sent();
                    console.log('Usuarios de ejemplo creados');
                    console.log('✅ Base de datos poblada exitosamente');
                    console.log('');
                    console.log('Credenciales de acceso:');
                    console.log('Admin: admin@mautik.com / admin123');
                    console.log('Usuario: user@mautik.com / user123');
                    process.exit(0);
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error('Error poblando la base de datos:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
seedDatabase();
