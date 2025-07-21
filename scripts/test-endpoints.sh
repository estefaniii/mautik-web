#!/bin/bash

# Script para probar endpoints de la API
# Ejecutar con: bash scripts/test-endpoints.sh

echo "🛒 Probando endpoints de la API..."
echo "📍 URL base: http://localhost:3001"
echo ""

# Función para probar un endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo "📋 Probando $description..."
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001$endpoint")
    
    case $response in
        200)
            echo "✅ $endpoint - 200 OK"
            ;;
        401)
            echo "🔒 $endpoint - 401 Unauthorized (requiere autenticación)"
            ;;
        404)
            echo "❌ $endpoint - 404 Not Found"
            ;;
        500)
            echo "❌ $endpoint - 500 Internal Server Error"
            ;;
        *)
            echo "⚠️ $endpoint - $response"
            ;;
    esac
    echo ""
}

# Probar endpoints principales
test_endpoint "/api/products" "API de productos"
test_endpoint "/api/products?category=crochet" "Filtro por categoría"
test_endpoint "/api/products?search=pulsera" "Búsqueda de productos"
test_endpoint "/api/auth/me" "Autenticación de usuario"
test_endpoint "/api/cart" "Carrito de compras"
test_endpoint "/api/wishlist" "Lista de deseos"
test_endpoint "/api/orders" "Pedidos"
test_endpoint "/api/notifications" "Notificaciones"

# Probar página principal
echo "📋 Probando página principal..."
main_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001/")
if [ "$main_response" = "200" ]; then
    echo "✅ Página principal - 200 OK"
else
    echo "❌ Página principal - $main_response"
fi
echo ""

# Probar página de tienda
echo "📋 Probando página de tienda..."
shop_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001/shop")
if [ "$shop_response" = "200" ]; then
    echo "✅ Página de tienda - 200 OK"
else
    echo "❌ Página de tienda - $shop_response"
fi
echo ""

echo "🎉 Pruebas completadas!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Abrir http://localhost:3001 en el navegador"
echo "2. Probar el flujo de compra manualmente"
echo "3. Verificar la responsividad en móviles"
echo "4. Probar la autenticación de usuarios" 