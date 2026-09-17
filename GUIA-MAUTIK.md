# Mautik — Guía de la tienda

Todo lo que hay que saber para seguir trabajando en la tienda sin tener que
reconstruir el contexto. Última actualización: **12 de septiembre de 2026**.

En vivo: **https://mautik-web.vercel.app**

---

## 1. Qué es y cómo está hecha

Tienda propia de Estéfani Torres (crochet + bisutería hecha a mano en La
Chorrera, Panamá Oeste). IG **@mautik_official**.

| Pieza | Qué se usa |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilos | Tailwind CSS |
| Base de datos | PostgreSQL en **Neon**, vía Prisma |
| Sesiones | NextAuth (Google) + un JWT propio en cookie `auth-token` |
| Imágenes de producto | Archivos WebP en `public/productos/` |
| Subida desde el panel | Cloudinary |
| Correos | Resend |
| Formulario de contacto | FormSubmit (sin servidor propio) |
| Pagos | **PayPal** (activo) · Yappy (pendiente del banco) |
| Hosting | Vercel, proyecto `mautik-web` |

**Ojo:** en Vercel hay dos proyectos. El bueno es **`mautik-web`**
(mautik-web.vercel.app). El otro, `mautik`, es un preview abandonado.

---

## 2. Cómo se trabaja

```bash
# desarrollo
npm run dev                       # http://localhost:3000

# publicar (NO por git: el repo tiene cambios viejos sin commitear)
npm run build
npx vercel deploy --prod --yes
```

### Agregar o cambiar productos

El catálogo vive en **`scripts/catalogo-mautik.json`**. Ese archivo es la
única fuente: el `.ts` que está al lado ya no se usa.

```bash
# 1. dejar las fotos en ~/Downloads/"imagenes de mautik"/"fotos de producto"/
#    con el nombre del SKU: mtk-cr-001.jpg, mtk-cr-001-2.jpg, ...
node scripts/ingest-fotos.mjs     # las convierte a WebP en public/productos/

# 2. editar scripts/catalogo-mautik.json
node scripts/seed-catalogo.mjs    # vuelca el catálogo a la base (por SKU)
```

El seed es idempotente: se puede correr las veces que haga falta. **Pero si
borrás un producto del JSON, NO se borra de la base** — hay que borrarlo a
mano con Prisma.

Las fotos van todas en **3:4** (1200×1600). La tarjeta usa `aspect-[3/4]`, así
que lo que ves en el archivo es exactamente lo que se ve en la tienda.

---

## 3. Estado actual (verificado el 12 de septiembre de 2026)

```
CÓDIGO
  0 errores de TypeScript        build correcto
  0 formas de voseo              0 grises sin variante oscura
  0 archivos basura              proyecto 1,0 GB (942 MB son node_modules)

CATÁLOGO
  68 productos                   128 fotos, todas en 3:4
  0 sin foto                     0 rotas          0 duplicadas
  0 sin descripción              0 con precio <= 0
  0 con categoría inválida
  37 productos con 2+ fotos      31 con una sola
  crochet 30 · otros 11 · pulseras 11 · anillos 5 · aretes 4 · llaveros 4 · collares 3

WEB
  23 rutas públicas en 200       0 enlaces internos rotos
  /shop/<inventada> y /product/<inventado> -> 404 real
  checkout, admin y orders redirigen si no hay sesión
  18 rutas de escritura -> ninguna accesible sin sesión
  82 URLs en el sitemap          títulos propios por página
  modo claro y oscuro verificados

SERVICIOS
  PayPal: configurado, entorno live, sin problemas
  Formulario de contacto: activo y entregando
  Correo masivo: funcionando (5 destinatarias)

VELOCIDAD
  portada 0,38 s · tienda 0,35 s · lookbook 0,35 s · nosotros 0,42 s
```

Por categoría: crochet 30 · pulseras 11 · otros 11 · anillos 5 · llaveros 4 ·
aretes 4 · collares 3.

**37 productos tienen 2+ fotos** (ahí funciona el cambio de imagen al pasar el
cursor, con 2 segundos de retardo). **31 tienen una sola.**

---

## 4. Qué se arregló

### Seguridad — lo más importante

Se encontraron y cerraron **siete agujeros**, todos verificados en producción
antes y después:

1. **`POST /api/auth/issue-jwt` era un bypass total del login.** Mandabas un
   correo cualquiera en el cuerpo y devolvía una sesión válida de esa persona,
   sin contraseña. Con el correo de la administradora, cualquiera era
   administradora. Ahora el correo sale de la sesión verificada en el
   servidor, nunca del cuerpo.
2. **Crear, editar y borrar productos no pedía nada.** Los ids son públicos,
   así que cualquiera podía cambiar precios o vaciar el catálogo. Ahora pasan
   por `lib/solo-admin.ts`.
3. **`GET /api/orders` devolvía los pedidos de todas las clientas** —con el
   objeto `user` completo, o sea el hash de la contraseña— sin pedir sesión.
4. **El botón de PayPal cobraba en el navegador**, con el monto que mandaba el
   navegador: se podía pagar $0.01 por algo de $30. Las rutas de servidor que
   recalculan el total ya existían pero nadie las llamaba.
5. **`/api/orders` guardaba el precio y el total del cliente** y marcaba
   "pagado" con cualquier id de pago inventado.
6. **`/api/upload` lo podía usar cualquier clienta registrada** para mandar
   archivos a la cuenta de Cloudinary.
7. **`GET /api/admin/orders` también devolvía el hash de contraseña** de cada
   clienta.

### Pagos

- Flujo nuevo: el pedido nace **pendiente** con precios de la base → PayPal se
  abre desde el servidor → el pedido pasa a pagado **solo** cuando PayPal
  confirma el monto exacto. Ahí, y solo ahí, se descuenta stock y sale el
  correo.
- Stripe se sacó del checkout: no opera con entidades panameñas, así que el
  botón "Tarjeta" abría un formulario que nunca iba a poder cobrar.
- El Client ID de PayPal se lee del servidor (`/api/paypal/config`), no de una
  variable `NEXT_PUBLIC_*`. Esa ruta además **avisa si la credencial está mal
  formada** — pasó que se pegó en Vercel la versión abreviada con "..." que
  muestra el panel de PayPal, y el botón simplemente no aparecía sin decir por
  qué.

### Contenido que era falso

- El formulario de contacto **no mandaba nada**: esperaba un segundo y decía
  "Mensaje enviado". Cada persona que escribió se fue creyendo que había
  llegado.
- La página "Nosotros" tenía de foto principal una **imagen ajena** que venía
  con la plantilla, presentada como el taller de Mautik. Y el texto decía que
  Mautik "selecciona productos curados de todo el mundo" — falso, y encima le
  quita el mérito.
- El Lookbook enlazaba a **ocho fotos que daban 404** y sus botones apuntaban a
  filtros que la tienda no entiende.

### Diseño

- Grilla: 2 columnas en móvil, 3 en tablet, 4 en escritorio.
- Hero con **carrusel de 4 fotos propias**, cambio cada 5 segundos. Se detiene
  si la pestaña no está a la vista y respeta a quien pide menos animación.
- Modo oscuro unificado en el morado de marca (tono 265). Se eliminaron 261
  líneas de CSS heredado que metían gris azulado.
- Botones redondeados, colores sólidos, **sin degradados**.
- Se quitaron: reseñas, favoritos, el botón "Vaciar carrito", el encabezado
  "Productos (N)", las etiquetas "Quedan N" y el subtítulo "Más de la misma
  categoría".
- El carrito va directo al checkout, con selección por artículo estilo Temu.
- Menú hamburguesa desde la derecha. Español neutro, sin voseo argentino.

### Ocultar productos sin borrarlos (16 de septiembre) — ⏸ ESPERANDO A NEON

Campo nuevo `Product.visible` (por defecto `true`). Un producto oculto sigue en
la base con su historial de ventas, pero no aparece en la tienda: es lo que
hace falta cuando una pieza se agota, se retira de temporada o se está
rehaciendo la foto. **Borrarla rompería los pedidos que ya la incluyen.**

 · `GET /api/products` filtra `visible: true` (el panel pide `?incluirOcultos=1`)
 · `GET /api/products/[id]` devuelve 404 si está oculto y quien mira no es admin
 · `PATCH /api/products/[id]` con `{ visible: true|false }` — va aparte del PUT
   a propósito: el PUT exige el producto entero y para un interruptor eso es
   pedir que algo quede a medio guardar
 · En el panel: botón de ojo junto a editar/eliminar, e insignia "Oculto"

⚠️ **NO ESTÁ DESPLEGADO.** La columna no existe todavía en la base porque
`prisma db push` falla con la cuota de Neon agotada. Si se despliega el código
sin la columna, **todas** las consultas de productos fallarían y la tienda
seguiría caída incluso después de que Neon vuelva.

**Cuando Neon vuelva, en este orden:**

```bash
npx prisma db push        # crea la columna
npx vercel deploy --prod --yes
```

O, si se prefiere SQL directo (es idempotente):

```sql
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "visible" BOOLEAN NOT NULL DEFAULT true;
```

### Mudanza a una base nueva de Neon (16 de septiembre) — RESUELTO

La cuota de cómputo del proyecto viejo se agotó y la tienda quedó caída. En vez
de esperar tres semanas al reinicio del ciclo, se migró a un proyecto nuevo.

**Cómo se hizo, sin que ninguna credencial pasara por el chat:**

```bash
npx vercel integration add neon                  # crea el recurso Neon
npx vercel env rm DATABASE_URL production        # (y preview, development)
npx vercel storage connect neon-gray-helmet --yes
```

La integración de Vercel con Neon **escribe la contraseña directamente en las
variables del proyecto**: nadie la copia ni la pega. Escribe `DATABASE_URL` y
17 variables más (`POSTGRES_*`, `PG*`, `NEON_PROJECT_ID`), de las cuales la app
solo usa `DATABASE_URL`.

⚠️ La conexión falla si ya existe un `DATABASE_URL` en el proyecto: hay que
borrarlo antes, en los tres entornos.

**Restauración del catálogo:**

```bash
npx prisma db push          # crea las tablas
node respaldos/sembrar.cjs  # carga los 68 productos
```

`respaldos/sembrar.cjs` conserva los **ids originales**, que es lo importante:
las fotos, los enlaces y el sitemap apuntan a esos ids. Es idempotente y vuelve
a marcar los 12 destacados desde `respaldos/destacados-12.txt`.

**Verificado:** 68 productos, 12 destacados, 128 fotos, 0 rotas, tienda en 200.

**Lo que se perdió:** las 5 cuentas de usuaria (3 eran de prueba). Pedidos y
cupones estaban en 0. Estéfani vuelve a entrar con Google y hay que devolverle
`isAdmin`.

⚠️ **No borrar el proyecto viejo de Neon todavía**: cuando su cuota se reinicie
(cerca del día 7) vuelve a ser accesible por si hiciera falta algo de ahí.

### ⚠️ Cuota de Neon agotada (16 de septiembre) — causa y arreglo

`ERROR: Your account or project has exceeded the compute time quota.`

**No era espacio: era tiempo de cómputo.** El plan gratis de Neon da ~192 horas
al mes de base DESPIERTA (el disco, 0.5 GB, ni se acercaba al límite).

**La causa fue un cron propio.** El 10 de septiembre se agregó
`/api/keepalive` corriendo **cada 5 minutos, las 24 horas**, para que Neon no
suspendiera la base y no hubiera arranques en frío. Las cuentas:

 · base despierta 24/7 = **720 horas/mes**
 · plan gratis = **192 horas/mes**
 · → la cuota se agota en ~8 días

Y eso pasó: cron el día 10, tienda caída el 16. Cambiar un arranque en frío de
un segundo por la tienda muerta una semana al mes es un pésimo negocio.

**Arreglado:**

| Qué | Antes | Ahora |
|---|---|---|
| Cron keepalive | cada 5 min, 24/7 | **eliminado** |
| Catálogo para el buscador del header | en CADA carga de página | solo al tocar el buscador |
| Sondeo de stock (carrito, pago, ficha) | cada 20 s, aun de fondo | cada 2 min y solo con la pestaña a la vista |
| Refresco del panel | cada 30 s, aun de fondo | cada 2 min y solo mirando |
| `stale-while-revalidate` del catálogo | 5 min | **1 h** |

Lo último importa: ahora que la base duerme, el edge sigue sirviendo el
catálogo mientras despierta, en vez de mostrar la tienda vacía.

⚠️ **No volver a poner un cron de keepalive.** La ruta sigue existiendo para
diagnosticar a mano, con el aviso escrito adentro.

**La cuota en sí** se resuelve en neon.tech: esperar el reinicio del ciclo o
subir de plan. Eso no es código.

### ⚠️ Cuota de Neon agotada (16 de septiembre)

`ERROR: Your account or project has exceeded the compute time quota.`

La base dejó de responder y con ella **toda la tienda**: sin productos, sin
carrito, sin pedidos. La ficha de producto mostraba "Producto no encontrado",
que es lo peor que podía decir: la clienta entiende que la pieza ya no existe.

Arreglado en el código: la API distingue ahora un fallo de base (**503**, "la
tienda está con un problema técnico, vuelve en un momento") de un producto que
de verdad no existe (**404**). Y la ficha ya no limpia la referencia del
producto ni dice "no encontrado" cuando el problema es nuestro.

La cuota en sí se resuelve en neon.tech: esperar el reinicio del ciclo o subir
de plan. No es código.

### Pago por Yappy funcionando hoy (16 de septiembre)

Mientras el Botón de Pago no esté habilitado, la tienda cobra por Yappy así:

1. La clienta elige **Yappy** en el pago.
2. Se registra el pedido **pendiente**, sin tocar el stock, y se le muestra:
   el número de Mautik (**6778-2931**), el **monto exacto** y una **referencia**
   de 8 caracteres (los primeros del id del pedido) para que la escriba en el
   concepto del Yappy.
3. Estéfani ve el dinero en su app del banco y toca **"Confirmar pago"** en
   Panel → Pedidos.
4. Ahí sí: se marca pagado, **se descuenta el stock**, se consume el cupón y
   sale el correo de confirmación.

⚠️ **"Confirmar pago" NO es lo mismo que cambiar el estado a "pagado".** El
cambio de estado solo cambia la etiqueta; el botón de confirmar hace los cuatro
efectos del cobro. Si se usara el otro, el inventario quedaría intacto y se
podría vender dos veces la misma pieza.

Es idempotente: tocarlo dos veces no descuenta el stock dos veces.

El número vive en `lib/contacto.ts` (`YAPPY_NUMERO`), junto al de WhatsApp, y
se puede cambiar sin tocar el checkout ni el panel.

### Yappy: qué se puede y qué no (16 de septiembre)

**Conclusión corta: las credenciales de "Integraciones" NO pueden cobrar.**

El manual de Banco General (v1.0.0) y su Open API (v1.1.0) exponen tres cosas
y nada más: **Sesión** (login/logout), **Movimientos** (historial y detalle) y
**Métodos de cobro** (consulta). Los únicos endpoints que existen son
`/v1/session/login`, `/v1/session/logout`, `/v1/movement/history`,
`/v1/movement/{id}`, `/v1/collection-method` y un PUT de devolución.
**No hay ningún endpoint que cree un cobro.**

`BOTON_DE_PAGO` aparece ahí solo como un *dato de respuesta* (te informa que
tienes uno configurado). No es la API que cobra.

Son dos productos distintos:

| | Botón de Pago Yappy | APIs de Integración |
|---|---|---|
| Credenciales | ID del Comercio (32 car.) + Clave Secreta | Código de semilla + Clave secreta + API Key |
| API | `apipagosbg.bgeneral.cloud` | host sin publicar |
| Sirve para | **cobrar** en una tienda en línea | consultar historial y conciliar |
| Estado en Mautik | `lib/payments/yappy.ts` — escrito y listo | `lib/payments/yappy-comercial.ts` — escrito, sin host |

**Búsqueda del host (documentada para no repetirla):** no está en el manual, no
está en el swagger (trae `http://localhost:3000` de relleno) y no está en el
panel. Se intentó deducirlo desde fuera:

 · DNS de 10 nombres candidatos: solo existen `comercial.yappy.com.pa` (el
   panel) y `apipagosbg.bgeneral.cloud` (el Botón de Pago).
 · El bundle JavaScript del panel no contiene ninguna URL de API.
 · No hay `config.json`/`environment.json` expuestos (todo devuelve el HTML).
 · Sondeo de `apipagosbg.bgeneral.cloud`: **todas** las rutas responden
   `403 {"message":"Unauthorized"}`, incluso las inventadas. No distingue.

**Hay que pedírselo a Yappy** (botondepagoyappy@bgeneral.com): URL base de
pruebas y producción, y valores válidos del header `channel`.

**Cabeceras exactas** (del panel, ya implementadas): `authorization`,
`api-key`, `secret-key`, `client-ip`, `channel`. Las dos últimas son
obligatorias y es fácil pasarlas por alto: sin ellas responde YP-0008.

**El código de sesión** (manual pág. 16): concatenar `API Key + fecha
YYYY-MM-DD` y firmarlo con HMAC-SHA256 usando la Clave Secreta, en hex.
⚠️ La fecha tiene que ser la de Panamá (UTC-5): Vercel corre en UTC y desde las
7 p.m. hora local ya mandaría la del día siguiente.
⚠️ El manual y el swagger se contradicen sobre si se cifra la API Key o el
Código de semilla; `abrirSesion()` prueba las dos y deja en el log cuál sirvió.

### Yappy (16 de septiembre) — código listo, falta pegar las credenciales

Había una base ya escrita (`lib/payments/yappy.ts`, create-order e IPN), pero
con cuatro agujeros que la habrían hecho fallar o cobrar mal. Cerrados:

1. **`/api/yappy/create-order` no pedía sesión.** Cualquiera que supiera el id
   de un pedido ajeno podía pedirle a Yappy una orden de cobro sobre él. Ahora
   exige sesión y que el pedido sea de quien lo pide, igual que PayPal.
2. **Se perdía el descuento.** Calculaba el total sin pasar el cupón del
   pedido: la clienta veía "−$2.00" en el carrito y Yappy le cobraba los $2
   igual.
3. **La IPN marcaba pagado y nada más.** No descontaba stock, no consumía el
   cupón y no mandaba el correo de confirmación —las tres cosas que sí hace
   PayPal—. O sea que una venta por Yappy dejaba el inventario intacto (se
   podía revender algo que ya no existe) y a la clienta sin aviso. Ahora hace
   las tres, dentro de una transacción e idempotente: si Yappy reintenta la
   notificación, el stock se descuenta una sola vez.
4. **No había botón.** El checkout decía "Yappy · pronto" y estaba apagado.

**Cómo queda el flujo:** se crea el pedido pendiente → se le pide a Yappy la
orden → la clienta paga en la app del banco → **Yappy avisa al servidor por la
IPN firmada**, y esa notificación es la única que marca el pedido como pagado.
Si la clienta cierra el navegador a mitad del pago, el pedido se marca bien
igual.

**Lo que falta, y lo tiene que hacer Estéfani** (son credenciales; yo no entro
a la banca ni las manejo):

En Vercel → Settings → Environment Variables → Production:

| Variable | De dónde sale |
|---|---|
| `YAPPY_MERCHANT_ID` | Panel de Yappy Comercial, sección de integración |
| `YAPPY_SECRET_KEY` | La misma sección (viene en base64) |
| `YAPPY_DOMAIN` | `https://mautik-web.vercel.app` (opcional: si falta usa `NEXT_PUBLIC_SITE_URL`) |
| `YAPPY_ENV` | `test` mientras se prueba; se borra para cobrar de verdad |

Y en el panel de Yappy hay que registrar:
 · el **dominio** `mautik-web.vercel.app` (Yappy lo valida en cada cobro);
 · la **URL de notificación (IPN)**: `https://mautik-web.vercel.app/api/yappy/ipn`

⚠️ **Después de agregar variables hay que volver a desplegar.** Vercel no las
aplica a los despliegues que ya existen.

Para comprobar si ya quedó: `https://mautik-web.vercel.app/api/yappy/config`
responde `configurado: true/false` y qué falta. No devuelve ninguna credencial.

⚠️ **Un aviso honesto:** las direcciones exactas de la API y el orden de los
campos con que se calcula la firma HMAC los define Banco General en el PDF de
integración que entrega al habilitar el comercio, y cambian según la versión
del contrato. El código sigue la versión pública más común. Si el primer cobro
de prueba falla, casi seguro es eso: hay que comparar `YAPPY_API_BASE` y
`firmaIpn()` contra ese PDF. Conviene hacer la primera prueba con `YAPPY_ENV=test`.

### ⚠️ La página de pago estaba caída (14 de septiembre)

**No se podía comprar.** `/checkout` mostraba "¡Ha ocurrido un error
inesperado!" en vez del formulario. Es el fallo más grave de todos los que
aparecieron: la tienda entera funcionaba, pero el último paso no.

Cuatro `useState` estaban declarados en mitad del archivo, **pasados los dos
`return` tempranos** del componente (el de "tu carrito está vacío" y el de
"gracias por tu compra"):

1. Primer render, con el carrito todavía cargando → se corta en el return del
   carrito vacío y solo se ejecutan 53 hooks.
2. Llega el carrito, vuelve a renderizar, pasa de largo ese return y aparece
   el hook 54.

React exige que la cantidad de hooks sea SIEMPRE la misma, así que tiraba
`Rendered more hooks than during the previous render` y el error tumbaba la
página entera.

**Cómo se encontró** (vale la pena anotarlo, porque en producción el mensaje
viene minificado y no dice nada): se levantó el proyecto en local con
`npm run dev`, se desactivó el middleware **solo en local** para poder abrir
`/checkout` sin sesión, y React en modo desarrollo imprimió la tabla completa
de hooks señalando exactamente el número 54. Después se revirtió el middleware.

**La regla:** todos los hooks van antes del primer `return`. Si hay que agregar
un `useState`, va arriba con los demás, nunca junto al código que lo usa.

### Repaso completo del sitio (14 de septiembre)

| Qué se revisó | Resultado |
|---|---|
| TypeScript | 0 errores |
| Rutas públicas (21) | Todas 200 |
| URLs del sitemap (82) | 0 rotas |
| Rutas de escritura sin sesión (17) | Las 17 rechazan con 401 |
| Rutas GET sensibles sin sesión (8) | Ninguna filtra datos |
| Catálogo | 68 productos · 0 sin descripción · 0 sin SKU · 0 precios o stock en cero · 0 ids o SKUs repetidos |
| Fotos (128) | 0 faltantes · 0 de baja resolución · todas 3:4 · 0 repetidas entre productos |
| Tiempos de carga | 0.40 s – 0.73 s |
| Consola | Sin errores en portada, tienda, ficha, carrito, contacto, perfil y panel |

**Arreglado en el repaso:**

 · La página de pago (arriba).
 · La página de acceso mostraba un **destello genérico** de la librería de
   iconos en vez del logo de Mautik, y "Mautik" iba en morado oscuro sin
   variante para modo oscuro. Además tenía un bloque `next/head`, que es API
   del Pages Router y en el App Router no hace nada.
 · **Faltas de ortografía en el buscador**: "pulcera" devolvía CERO resultados
   con once pulseras en el catálogo. Se agregaron las variantes que la gente
   escribe de verdad (pulcera, brasalete, crocher, yavero…). Verificado:
   "pulcera" ahora devuelve 11 y "crocher" 48.
 · **Cabeceras de seguridad**: el sitio solo mandaba HSTS. Se agregaron
   `X-Frame-Options: DENY` (sin ella, cualquiera puede meter el checkout de
   Mautik en un iframe y poner botones falsos encima), `X-Content-Type-Options`,
   `Referrer-Policy` y `Permissions-Policy`.

**Pendiente, para decidir:** las "5 clientas registradas" del panel son en
realidad 3 cuentas de prueba (`testuser@example.com`, `test@test.com`,
`test@mautik.com`), la cuenta `admin@mautik.com` y Estéfani. No hay clientas
reales todavía. Importa porque el envío masivo de correos las incluye, y
escribir a direcciones inventadas perjudica la reputación del remitente.

### Cupones de verdad (13 de septiembre)

Antes eran decorado completo: el panel dejaba crearlos, existía
`/api/coupons/validate`, pero **el carrito nunca llamaba a esa ruta** (tocar
"Aplicar" respondía "Cupón inválido" pasara lo que pasara) y **el pago no sabía
de descuentos**. Ahora funcionan de punta a punta:

| Dónde | Qué hace |
|---|---|
| `lib/payments/cupones.ts` | **La única** validación. Comprueba existencia, activo, vigencia, límite de usos, compra mínima y categorías/productos aplicables, y calcula el descuento. |
| `lib/payments/totales.ts` | Recibe el CÓDIGO y aplica el descuento sobre el subtotal que acaba de calcular el servidor. Se resta antes del envío; el total nunca baja de cero. |
| `/api/coupons/validate` | Informativa, para que el carrito pueda decir en el momento si sirve. Usa el mismo helper. |
| `POST /api/orders` | Recalcula el descuento y guarda `couponCode` y `discount` en el pedido. |
| `/api/paypal/capture` | Suma **uno al contador de usos**, dentro de la misma transacción que marca pagado. |
| Carrito y checkout | Muestran la línea del descuento y revalidan si cambia lo marcado. |

**Reglas que importan:**

 · El navegador manda el **código**, nunca el monto. Verificado: un pedido con
   `couponCode: 'NOEXISTE'`, `discount: 999` y `totalAmount: 0.01` enviados a
   mano se cobró **$4.00**, el precio correcto.
 · El uso se consume **al pagar**, no al crear el pedido: si no, cada carrito
   abandonado gastaría un uso y un cupón de 10 se agotaría sin una sola venta.
 · Un cupón limitado a una categoría descuenta **solo sobre lo que califica**.
   La ruta vieja comprobaba que hubiera algo aplicable y después descontaba
   sobre el total: "20% en pulseras" rebajaba también los peluches.

Prueba hecha en producción con un cupón `PRUEBA10` del 10%: sin cupón $4.00,
con cupón $3.80. El cupón y los tres pedidos de prueba se borraron después
(quedan 0 pedidos y 0 cupones en la base).

### Los 12 destacados (13 de septiembre)

Estaban destacados **58 de 68 productos**, o sea que "Piezas Destacadas" no era
una selección sino casi el catálogo entero, y la portada mostraba los 8
primeros que salieran. Ahora hay 12 elegidos por foto y por variedad, y la
portada los muestra todos:

Capibara con accesorios ($30) · Cartera crema tejida ($25) · Hollow Knight
($23) · Luffy ($23) · Kuromi ($16) · Peluche de Any ($16) · Girasol tejido
($15) · Diadema lila de margaritas ($12) · Husky ($10) · Vaquita ($10) ·
Collar de perlas con inicial ($7.50) · Pulpos de colores ($6).

Se cambian desde el panel, en cada producto, con la casilla "Destacado".

### El carrito que sumaba solo (13 de septiembre) — el peor de la tanda

Estéfani tenía **3 productos y el carrito decía 11 artículos**. En la base
estaban en 4, 4 y 3; por la mañana los mismos tres estaban en 2, 2 y 2. Subían
solas, sin que nadie agregara nada.

El circuito se cerraba en CADA carga de página:

1. Al cargar, la sesión todavía no está resuelta: `user` es `null` por un
   instante, pero el carrito en memoria aún tiene los productos de la vuelta
   anterior.
2. El efecto de guardar decía "si no hay usuario, guardá en
   `mautik_cart_temp`" — y guardaba el carrito de la CLIENTA bajo la llave de
   invitada.
3. Medio segundo después la sesión resuelve, el efecto de migración ve esa
   llave, cree que es un carrito de invitada y lo manda al servidor.
4. `POST /api/cart` no reemplaza: **suma** (`existing.quantity + quantity`).

Resultado: cada visita le sumaba una unidad a cada producto. Con el tiempo, un
carrito de 3 piezas puede llegar a decenas, y si alguien paga, paga de más.

Tres cierres en `context/cart-context.tsx`:
 · Mientras la sesión está cargando no se guarda ni se carga nada.
 · La llave `mautik_cart_temp` se borra ANTES de mandar nada (así dos
   ejecuciones simultáneas no pueden mandar lo mismo dos veces).
 · Una bandera `useRef` para que la mudanza ocurra una sola vez por sesión.

Verificado: 4 recargas seguidas y las cantidades se quedaron en 4, 4, 3.

Además, "11 artículos" con tres productos se lee como si hubiera once cosas
distintas. Ahora dice **"3 productos · 11 unidades"** cuando los dos números no
coinciden.

### Preguntas frecuentes que solo veía Google (13 de septiembre)

`app/layout.tsx` imprimía un bloque `FAQPage` de datos estructurados en TODAS
las páginas —portada, tienda, cada ficha— con seis preguntas que **no se veían
en ninguna parte del sitio**. Google pide que ese dato corresponda a preguntas
visibles en la misma página; si no, lo ignora, y en el peor caso lo cuenta como
marcado engañoso.

Ahora las preguntas se ven en `/contact`, en un desplegable, y el bloque se
declara ahí junto a ellas. La portada ya no lo lleva.

Una de esas respuestas le decía a Google "**Aceptamos Yappy**". Yappy sigue
esperando la cuenta comercial del banco: el checkout lo muestra como "Yappy ·
pronto" y desactivado, pero el dato estructurado prometía que se podía pagar
así. Corregido a PayPal.

### El encabezado al cambiar de claro a oscuro (13 de septiembre)

Medido en los tres tamaños: **el encabezado no se mueve ni un píxel** al tocar
el botón (1009×64 y el contenido en la misma posición antes, durante y
después). Lo que se rompía era el repintado.

`globals.css` tiene una regla que le pone a TODOS los elementos del sitio una
transición de color de 0,3s. Pero los enlaces del encabezado además llevan
`transition-colors` de Tailwind, que son 0,15s. O sea que al cambiar de tema
los enlaces terminaban de cambiar cuando la barra iba por la mitad: durante un
instante quedaba texto claro sobre un fondo todavía claro y la barra parecía
partirse.

Ahora el cambio de tema **apaga todas las transiciones mientras dura**
(`html.cambiando-tema`), repinta la página entera en un solo fotograma y las
vuelve a encender. Se apagan y se encienden en `context/theme-context.tsx`.

⚠️ Al volver a encenderlas hay `requestAnimationFrame` **y** un `setTimeout` de
respaldo: en una pestaña en segundo plano `requestAnimationFrame` no se
ejecuta, y sin el respaldo las transiciones se quedarían apagadas para siempre
en esa pestaña.

### El encabezado que "se encogía" al tocar el perfil (13 de septiembre)

No era el alto —eso ya estaba fijo en 64px— sino el **ancho**. Abrir el menú
del perfil (o el de notificaciones, o cualquier diálogo) bloquea el scroll del
cuerpo, desaparece la barra lateral de desplazamiento y la página gana de golpe
los ~15px que ocupaba. El encabezado es fijo y va de borde a borde, así que se
ensanchaba y su contenido saltaba unos 7px. Medido en producción: **1425px
antes de abrir, 1440px después**.

Se arregla con una línea, `scrollbar-gutter: stable` en `html`: el hueco de la
barra se reserva siempre, así que quitarla ya no mueve nada. Verificado
después: 1425 antes y 1425 después.

### Menú del teléfono, rehecho (13 de septiembre)

Lo anterior era una pila de enlaces grandes: la cuenta quedaba tan abajo que
había que desplazar para llegar, las ocho categorías eran ocho filas más, y
cada bloque tenía su propio tamaño de letra, así que se leía como tres menús
pegados en vez de uno.

Ahora sigue el orden de cualquier tienda: **quién eres arriba** (avatar, nombre,
"Ver mi perfil"), la navegación en filas de la misma altura con una barra
morada en la página activa, **las categorías con su foto** —las de Estéfani, en
rejilla de dos— y abajo los ajustes y el pie con el Instagram.

**Una sola lista de categorías** (`lib/categorias.ts`). Estaban escritas tres
veces y de tres formas: el navbar apuntaba a `/shop?category=<slug>` (el
filtro), el pie a `/shop/<slug>` (la página de verdad) y la portada tenía su
propia copia con foto y descripción. El mismo enlace llevaba a sitios distintos
según desde dónde se tocara, y agregar una categoría obligaba a acordarse de
tres archivos.

**Dos trampas verificadas al hacerlo:**

1. El panel salía aplastado a 63px de alto. El `<header>` lleva
   `backdrop-blur`, y **`backdrop-filter` convierte al elemento en el marco de
   referencia de cualquier hijo `position: fixed`**: el `fixed inset-0` del
   menú se medía contra la barra de 64px, no contra la pantalla. El menú pasó a
   ser hermano del `<header>`, no hijo.
2. El panel quedaba DEBAJO de la barra. El fondo oscuro iba en `z-40` y el
   panel en `z-50`, pero **ese `z-50` solo cuenta dentro de la capa del fondo**:
   contra el `z-50` del encabezado no competía. El fondo subió a `z-[60]`.

### Hero y barra, tercera pasada (13 de septiembre, noche)

**El "marco negro" de la pastilla.** "Hecho a mano en Panamá" era
`bg-white/15` con borde blanco y desenfoque. Sobre una foto clara —la mano, el
satén— ese blanco al 15% se mezcla con lo que hay debajo y sale un gris sucio
con el borde marcado: parecía una caja negra pegada encima. El botón "Nuestra
Historia" tenía el mismo problema (`bg-white/10`). Los dos son sólidos ahora
—morado el uno, blanco con texto morado el otro— y se leen igual sobre
cualquiera de las cuatro fotos del carrusel.

**Descuadrado.** En el teléfono el hero medía 86svh con el texto pegado abajo:
205 px de foto vacía arriba contra 112 abajo. A 78svh los dos huecos se
parecen. Medido después: tablet 185 arriba / 185 abajo, escritorio 168 / 168.

**Botones en escalera.** Tenían anchos distintos y en el teléfono caían uno
debajo del otro desalineados. Del mismo ancho hasta `sm`, lado a lado desde ahí.

**Reparto de la barra** (pedido de Estéfani): fuera solo el **buscador** y el
**carrito**. La campana, el claro/oscuro y toda la cuenta se mudaron dentro del
menú, porque estaban repetidos —el carrito y los accesos de la cuenta salían en
la barra Y otra vez en el panel—. Las **categorías cuelgan de "Tienda"**, que
se despliega hacia abajo, en vez de ser una sección aparte con ocho pastillas
sueltas. En escritorio no hay hamburguesa, así que ahí se quedan los iconos.

El buscador del teléfono vivía SOLO dentro del menú: para buscar algo había que
abrir el menú primero. Ahora hay una lupa en la barra que abre una barra de
búsqueda debajo del encabezado, con las sugerencias (foto, nombre, categoría y
precio).

### Segunda pasada de diseño (13 de septiembre, tarde)

- **El encabezado "se expandía" al tocar la campana.** La barra cambiaba de
  alto al hacer scroll (72 arriba, 56 abajo) con un `minHeight` en línea;
  abrir cualquier menú bloquea el scroll del cuerpo, el detector se disparaba
  con 0 y la barra volvía al tamaño grande. Ahora mide **siempre 64px** y lo
  único que cambia al bajar es la sombra. Verificado: 64 arriba, 64 abajo y 64
  con el menú de notificaciones abierto.
- **Había dos `<header>` y dos `<footer>` anidados**: `app/layout.tsx` envolvía
  `<Navbar />` en un `<header role="banner">` y `<Footer />` en un
  `<footer role="contentinfo">`, y los dos componentes ya traían el suyo. Un
  lector de pantalla anunciaba "encabezado, encabezado" en cada página. Los
  identificadores de los enlaces de salto se mudaron a los elementos reales.
- **El perfil tenía dos iconos de cámara**: uno flotante en `-bottom-2 -right-2`
  (sobresalía del círculo) y otro que aparecía en el centro al pasar el ratón.
  Queda uno solo, apoyado dentro del borde.
- En el diálogo de la foto había **tres botones que hacían lo mismo**:
  "Seleccionar archivo", "Galería" y "Cámara" llamaban los tres a
  `fileInputRef.current.click()`. Queda uno.
- `ProfileAvatar` le colgaba `?t=${Date.now()}` a la foto en cada render: el
  navegador no podía guardarla en caché y la volvía a descargar siempre.
- Los cuatro iconos del encabezado tenían tratamientos distintos (solo la
  campana se redondeaba al pasar el ratón). Ahora los cuatro son el mismo
  botón redondo de 44px.

### Carrito (13 de septiembre)

- **El envío estaba clavado en $10.** `selectedItems.length > 0 ? 10 : 0`. El
  real va de $1.50 (entrega personal en La Chorrera) a $15 (Bocas del Toro) y
  se calcula en el pago con la dirección: el carrito enseñaba un total que casi
  nunca era el de la clienta, y siempre de los caros. Ahora dice "Se calcula al
  pagar" y lo explica debajo del total.
- **El cupón siempre fallaba.** `handleApplyCoupon` ponía el descuento en 0 y
  avisaba "Cupón inválido" sin comprobar nada. Existe `/api/coupons/validate`
  y funciona, pero el checkout NO aplica descuentos, así que conectarlo habría
  prometido una rebaja que al pagar no aparece. Se quitó la caja. Para que los
  cupones sean de verdad hace falta: validar en el servidor al crear el pedido,
  restar el descuento del total que se le cobra a PayPal y sumar el uso. Hoy
  hay 0 cupones creados.
- Botones con variantes oscuras, resumen con la franja de confianza (PayPal,
  envíos, hecho a mano) y **barra fija de pago en el teléfono**: antes había
  que bajar toda la lista de productos para encontrar el botón.
- Los nombres largos se cortaban a la tercera palabra en el teléfono.

### Portada en tablet y teléfono (13 de septiembre)

- "Piezas Destacadas" medía **2.940 px en tablet**: la rejilla saltaba de 2
  columnas a 4 sin escala intermedia, así que a 768px eran dos columnas de
  fichas enormes. Con 3 columnas desde `sm` bajó a 1.874 px.
- "Los personajes" caía a una sola columna en tablet (1.464 px). Lado a lado
  desde `md`: 609 px.
- En las fichas de producto el nombre y el precio iban en la misma línea; con
  dos columnas de 175px la pastilla del precio se comía la mitad y los nombres
  salían cortados. En el teléfono ahora van en dos líneas.

### La cuenta de la clienta (13 de septiembre) — lo más grave de esta tanda

Todo esto estaba roto **en producción**, verificado contra el sitio en vivo
antes de tocar una línea:

- **Guardar el perfil devolvía 401 SIEMPRE.** `PUT /api/users/[id]` y
  `GET /api/auth/me` exigían la cookie `auth-token`, y esa cookie no la tiene
  nadie: se entra con NextAuth (Google o correo), que guarda su propia sesión.
  Nadie podía cambiar su nombre, su teléfono, su dirección ni su foto. Las dos
  rutas usan ahora `getAuthUser`, igual que el resto de la aplicación.
- Como `/api/auth/me` no contestaba, el perfil mostraba **siempre** el
  teléfono y la dirección vacíos ("Calle: -") y "Miembro desde Reciente",
  aunque estuvieran guardados. El contexto de sesión ahora los completa desde
  `/api/auth/me`, que además devuelve `createdAt`.
- **Cambiar la contraseña devolvía 401 SIEMPRE**: la ruta pedía cabecera
  `Authorization: Bearer` y la página solo mandaba `Content-Type`.
- **"Eliminar cuenta" MENTÍA.** Esperaba dos segundos con un `setTimeout`,
  decía "Tu cuenta ha sido eliminada permanentemente" y cerraba la sesión. La
  cuenta seguía entera en la base. Ahora hay `DELETE /api/account`, con las
  mismas protecciones que el panel (no se borra una cuenta con pedidos ni la
  última administradora).
- **"Mis pedidos" (`/orders`) leía `localStorage`**, no la base: quien compraba
  de verdad veía "No tienes pedidos aún", y desde otro dispositivo tampoco
  aparecía nada. Igual el detalle `/orders/[id]`. Los dos salen ahora de
  `/api/orders`.
- En el perfil los pedidos salían con **"Total: N/A"** (el campo es
  `totalAmount`, no `total`), sin nombre de producto y con la imagen de
  relleno: `/api/orders` no devolvía el producto de cada línea. Ahora sí.
- Para guardar el teléfono había que rellenar **calle, ciudad, provincia,
  código postal y país**. En Panamá el código postal casi no se usa.
- Los interruptores de "Notificaciones por email" y "SMS" no guardaban nada en
  ninguna parte y la tienda no manda SMS. Se quitaron.
- `app/profile/purchase-history` era una tercera pantalla de pedidos, sin
  ningún enlace que llevara a ella y con el mismo fallo de `total`. Está en la
  papelera.

### Encabezado, pie y portada (13 de septiembre)

- **La marca se montaba sobre el menú.** A 768 px "Mautik" quedaba encima de
  "Inicio" (no cabían logo + 4 enlaces + buscador de 256 px + cinco iconos), y
  entre 1024 y 1100 px la palabra se salía 32 px de su propia caja y se leía
  "MautikInicio". Medido en el DOM. El menú completo pasó a `lg`, con
  hamburguesa hasta ahí, y el logo lleva `shrink-0`.
- El menú del teléfono tenía la cabecera `bg-card` y el cuerpo
  `bg-white dark:bg-black`: en modo oscuro se partía en dos a media altura.
  Ahora es una sola superficie, con logo, categorías en pastillas y los
  accesos de la cuenta.
- Las sugerencias del buscador eran una lista de nombres; ahora llevan foto,
  categoría y precio, y el mismo componente sirve para escritorio y teléfono.
- El globito del carrito contaba **líneas**, no unidades: tres ositos iguales
  salían como "1".
- Las categorías del desplegable iban a `/shop?category=...` (una sola URL
  para las ocho). Ahora a `/shop/<categoría>`, que son páginas de verdad.
- **La "Colección Destacada" de la portada tenía de fondo `/maar.png`**: una
  playa tropical al atardecer generada por IA, nada que ver con Mautik. Y
  debajo repetía **los mismos ocho productos** de "Piezas Destacadas", porque
  ordenaba por destacados igual que la sección de arriba. Medía 1.755 px para
  no enseñar nada nuevo. Ahora son los personajes (Hollow Knight, Spiderman,
  Luffy, Kuromi), con fotos suyas, en 845 px.
- El pie importaba `Input`, `Button` y seis iconos que no usaba, y el lema
  decía que Mautik "selecciona" productos. Ahora lleva franja de confianza
  (envíos, PayPal, hecho a mano), WhatsApp y los datos desde `lib/contacto`.

### Hero (13 de septiembre)

- En el teléfono el bloque de texto tapaba la foto entera: seis líneas de
  párrafo, tres etiquetas que se partían en dos líneas y dos botones a todo lo
  ancho. Se quitaron las etiquetas genéricas ("Hecho con Amor", "Calidad
  Artesanal", "Único y Especial") y en su lugar va lo que la clienta busca:
  envíos a todo Panamá y entrega personal en La Chorrera.
- El texto usaba `px-6 sm:px-10 lg:pl-16`, que no coincide con ninguna otra
  sección: en pantalla ancha el título quedaba pegado al borde mientras el
  resto de la página estaba centrado. Ahora va dentro del `container`.
- El velo del fondo era lateral (pensado para escritorio) y en el teléfono no
  tapaba donde hacía falta. Ahora sube desde abajo en móvil y va de lado desde
  `sm`. El texto lleva su propia sombra porque las cuatro fotos que rotan son
  muy distintas entre sí.
- Un solo `h1` (antes `h1` + `h2` compitiendo), y `svh` en vez de `vh` para
  que no salte con la barra del navegador del teléfono.
- La fila de categorías del panel flotante se cortaba contra el borde sin
  ninguna señal, y "Ver todo" estaba escondido en móvil.

### Bugs del panel (12 de septiembre)

- **`/admin` se caía entero** con `A.filter is not a function`: `/api/admin/orders`
  pasó a devolver `{ pedidos, total }` y el panel seguía haciendo
  `setOrders(data)` con el objeto. Se creó `lib/lista.ts` (`comoLista`) y se
  aplicó en los **nueve** lugares con el mismo patrón, para que una respuesta
  con otra forma deje una lista vacía y nunca tumbe la página.
- **Guardar un producto fallaba SIEMPRE.** `PUT /api/products/[id]` exigía
  `sku`, y el formulario no lo manda porque el SKU no se edita. Respondía "El
  SKU es obligatorio". Ahora, si no viene, conserva el que ya tiene.
- El formulario de edición **decía "Cambios guardados correctamente" sin haber
  guardado nada** (el mensaje salía con `saving === false`, el estado inicial).
- La descripción era un `<input>` de una línea y la categoría un campo libre
  donde un tipeo dejaba al producto fuera de la tienda. Ahora textarea y
  desplegable con las siete categorías válidas.

### Panel de administración

- **`/admin/orders`** (nuevo): ver pedidos, filtrar, marcar enviado/entregado,
  cancelar devolviendo el stock.
- Stock **editable en la tabla** de productos, sin abrir el formulario.
- Los carritos abandonados se cierran solos todos los días a las 9:00.
- **Logo propio**: una "M" tejida que termina en lazada de crochet, en
  `public/icon.svg` (alternativa en `public/logo-alternativo.svg`).
- **Editor de fotos** en el panel: recorte con recuadro arrastrable, girar,
  descargar, y reordenar arrastrando las miniaturas.
- Todo el texto en **español neutro** (se corrigieron 41 formas de voseo).
- **Correo masivo con HTML y vista previa real** (en iframe, con el marco de
  Mautik), atajos de formato y subida de imágenes.
- Panel compacto en móvil: la tarjeta de producto pasó de 350px a ~190px de
  alto, y las clientas son una lista plegable.
- **Envío masivo habilitado**: la ruta `/api/admin/mass-mail` no existía (404).
  Ahora manda un correo por clienta, en tandas, respetando el límite de Resend.
- Panel rediseñado: pestañas en píldoras (Resumen · Productos · Pedidos ·
  Clientas · Cupones · Métricas · Correos), tarjetas de resumen con icono en
  color, filtros por categoría y stock en Productos, miniaturas 3:4 y el stock
  como etiqueta de color.
- Formulario de edición rediseñado: dos columnas, secciones, cuadrícula de
  fotos con la principal marcada y botón de guardar siempre a la vista.
- Recuperar contraseña (`/forgot-password` y `/reset-password`) rediseñadas,
  con **ojito para ver la contraseña** y botones en vez de enlaces sueltos.
- Todas las pestañas del panel rediseñadas (Resumen, Productos, Pedidos,
  Clientas, Cupones, Métricas, Correos) y checkout/carrito con los grises
  adaptados al modo oscuro.
- "Pedidos" salió del menú Mi cuenta para la administradora (lo tiene en el
  panel), pero sigue visible para las clientas: es su historial de compras.
- Marcos de menús, desplegables y tooltips más suaves: se cambiaron en los
  componentes base (`components/ui/*`), así quedó parejo en toda la app.

---

## 5. Trampas verificadas — leer antes de tocar nada

- **Vercel Cron invoca por GET**, no por POST. Un endpoint de limpieza en POST
  corre todos los días sin hacer nada y sin avisar.
- **Cambiar una variable en Vercel no basta: hay que volver a desplegar.**
- **`next/image` rechaza cualquier URL con query** (`?r=1` → 400 siempre).
- **`next/image` agrega `dpl=<hash del despliegue>`.** Si publicás mientras
  alguien navega, su navegador pide el hash viejo y la foto "desaparece".
  `components/ui/lazy-image.tsx` ya cae al archivo estático en ese caso.
- **`next/image` devuelve 400 con SVG** sin `dangerouslyAllowSVG`. El
  placeholder es `/placeholder.jpg`, no `.svg`.
- **`public/logo.PNG` está en mayúsculas** y Vercel distingue el caso.
- **En Prisma, `Product` se relaciona por `orderItems`, no `items`.**
- **`components/seo/meta-tags.tsx` usa `next/head`, que en App Router no hace
  nada.** El SEO va por `generateMetadata` en un layout servidor.
- **`.env` tiene `NEXT_PUBLIC_SITE_URL=localhost`** y llegaba al build. Está
  neutralizado con `lib/site-url.ts` + `.vercelignore`.
- **Neon se duerme** en el plan gratis: la primera visita tras un rato tarda
  unos segundos o falla, y despierta al reintento.
- **La papelera del Mac no se lee desde la terminal** (`~/.Trash` da
  "Operation not permitted"), pero **sí desde el Finder** por AppleScript:
  `osascript -e 'tell application "Finder" to return name of every item of trash'`.
- **El panel del navegador de la herramienta no compone contra producción**:
  capturas en negro y "0 imágenes cargadas" son artefactos de medición, no
  bugs. Verificar con `curl` o con `naturalWidth` en consola.

---

## 6. Dónde está cada cosa

```
app/
  page.tsx                      portada (hero + carrusel)
  shop/                         tienda y categorías
  product/[id]/                 ficha (layout = SEO y 404 real)
  cart/  checkout/              carrito y pago
  admin/                        panel: productos, pedidos, cupones
  api/
    products/                   catálogo (escritura: solo admin)
    orders/                     pedidos (crea PENDIENTES)
    paypal/                     config · create-order · capture · webhook
    admin/                      orders · stock · limpiar-pendientes · metrics
components/
  product-card.tsx              la tarjeta de producto
  hero-carrusel.tsx             fondo rotatorio de la portada
  ui/lazy-image.tsx             imagen con recuperación ante fallos
lib/
  solo-admin.ts                 guardia de administración
  buscar.ts                     búsqueda con tildes, plurales y sinónimos
  contacto.ts                   correo, WhatsApp y datos de marca
  payments/                     paypal.ts · yappy.ts · totales.ts
scripts/
  catalogo-mautik.json          EL CATÁLOGO
  seed-catalogo.mjs             vuelca el catálogo a la base
  ingest-fotos.mjs              fotos → WebP en public/productos/
```

Fotos originales y respaldos: `~/Downloads/imagenes de mautik/fotos de producto/`
(ahí están `originales-sin-recortar/`, `respaldo-antes-de-recorte-satin/` y
`fuera-de-catalogo/` con lo que se sacó del catálogo).

---

## 7. Qué falta

1. **Probar una compra real.** Es lo único que nadie ejercitó de punta a punta.
   Un anillo de $0.50 alcanza: se confirma que cobra, marca pagado, descuenta
   stock y manda el correo.
2. **Yappy**, cuando Banco General apruebe la cuenta comercial. El código está
   en `lib/payments/yappy.ts` pero hay que confirmar la versión de la API:
   Yappy anunció un proceso de descontinuación del botón de pago.
3. **Foto nueva de `mtk-pu-005-4`**: en la única toma que existe, las dos
   pulseras se salen por los bordes.
4. **La foto del husky con dos perritos** que pidió Estéfani: no apareció en
   las 273 fotos recuperadas de la papelera.
5. **Segunda foto para 31 productos** que hoy tienen una sola (sin segunda
   foto no hay cambio de imagen al pasar el cursor).

### Ideas, sin urgencia

- Separar por color los productos que hoy agrupan varios (como se hizo con las
  bandanas de perro).
- Fondo consistente entre categorías: hoy la bisutería está sobre satén, el
  crochet sobre el arbusto florido y algunas piezas sobre pared naranja.
- Plan de Neon sin auto-suspensión, o caché de catálogo más agresiva.
- Buscador con sugerencias en la portada.

---

## 8. Variables de entorno (Producción)

Puestas y funcionando: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`,
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, `RESEND_API_KEY`,
`EMAIL_FROM_DOMAIN`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_SITE_URL`,
`CLOUDINARY_*`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV=live`.

Opcionales: `PAYPAL_WEBHOOK_ID` (para validar webhooks), `CRON_SECRET` (para
proteger el cron de limpieza), `NEXT_PUBLIC_WHATSAPP` (por defecto
50767782931).

**No hace falta `NEXT_PUBLIC_PAYPAL_CLIENT_ID`.** Si existe, se puede borrar.
