# Mautik — documento maestro del proyecto

Tienda en línea de artesanía hecha a mano (crochet y bisutería) de Estéfani
Torres, en La Chorrera, Panamá Oeste. Instagram **@mautik_official**.

> **Para un chat nuevo:** pega este archivo al empezar. Con esto basta para
> saber qué es cada cosa cuando Estéfani pida algo. El historial largo de
> arreglos está en `GUIA-MAUTIK.md`.

Última actualización: **9 de octubre de 2026**.

---

## 0. Diccionario rápido: «cuando te pida…»

| Si Estéfani dice… | Se refiere a… | Dónde se toca |
|---|---|---|
| «la web», «la tienda», «el e-commerce» | La tienda Next.js en **https://mautik.vercel.app** | este repo |
| «el linktree», «los links», «el link de la bio» | La página **https://mautik.vercel.app/links** (ya NO es un proyecto aparte) | `app/links/page.tsx` |
| «el panel», «el admin» | **https://mautik.vercel.app/admin** | `app/admin/` |
| «el logo», «el logo nuevo» | La **M morada con lazada de crochet** | `public/icon-512.png`, `public/icon.svg` |
| «el logo rosado», «el logo viejo» | El círculo rosado con «Mautik» en letra script | `public/logo.PNG` (3464 px) |
| «los precios» | El campo `price` de cada producto en la base Neon | ver §6 |
| «Vercel» | Cuenta `estefaniii`, equipo *estefaniiis-projects*, proyecto **`mautik`** | vercel.com |
| «GitHub» | Repo **`estefaniii/mautik-web`** (rama `main`) | github.com |
| «el webhook de PayPal» | Webhook live ID **`2X341572J5297101T`** | developer.paypal.com → app «Mautik» |
| «el login con Google» | Cliente OAuth **«Mautik web»**, proyecto GCP `mautik` | console.cloud.google.com |
| «el WhatsApp de Mautik», «el Yappy» | **6778-2931** (+507) | `lib/contacto.ts` |
| «el correo de Mautik» | **mautik.official@gmail.com** | `lib/contacto.ts` |

---

## 1. Dónde vive todo

| Qué | Dónde |
|---|---|
| Tienda en vivo | **https://mautik.vercel.app** |
| Linktree (bio de IG) | **https://mautik.vercel.app/links** |
| Panel de administración | https://mautik.vercel.app/admin |
| Código | `~/Downloads/Mis Apps Web/mautikecommerce` |
| GitHub | https://github.com/estefaniii/mautik-web (rama `main`) |
| Vercel | proyecto **`mautik`** (id `prj_3zBsDZhpZS1qdG1MFJ1rqGD3Zp8h`), equipo `team_ZNx909inFcJifyTTRTuHGxSm` |
| Base de datos | Neon Postgres (plan gratis) vía Prisma |
| Logos sueltos para usar fuera | `~/Downloads/Logo Mautik/` |
| Probar en local | `preview_start "mautik"` (puerto 3000; entrada en el `launch.json` de `agente de páginas web`) |

### Lo que ya NO existe (no buscarlo)
- **`mautik-web.vercel.app`** → dominio **eliminado** el 06-oct-2026. Da 404.
  El proyecto de Vercel se renombró de `mautik-web` a `mautik`.
- **Proyecto aparte del linktree** → el viejo linktree (repo
  `estefaniii/links-page`) quedó **archivado** en Vercel como
  `mautik-links-archivo`, sin dominio. La carpeta local `mautiklinks` se
  mandó a la **Papelera** el 09-oct-2026. Todo lo que hacía ahora está en
  `/links` dentro de la tienda.

---

## 2. Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilos | Tailwind CSS |
| Base de datos | Neon Postgres + Prisma |
| Sesión | NextAuth (Google + correo/contraseña) |
| Alojamiento | Vercel, proyecto `mautik` |
| Correo | Resend (remitente en dominio verificado `dmgurus.com`) |
| Imágenes | Cloudinary (subidas del panel) + `/public/productos` (catálogo) |
| Formulario de contacto | FormSubmit |

### Cómo se publica
- **Lo normal:** hacer commit y `git push origin main`. Vercel está conectado
  al repo y publica solo en ~1 minuto.
- **No** hace falta además `npx vercel deploy --prod` (se publicaría dos
  veces). Usarlo solo si se cambió una variable de entorno sin cambiar código.
- ⚠️ Las variables de entorno nuevas NO se aplican a lo ya publicado: hay
  que volver a publicar.

### Variables de entorno que importan para el dominio
`NEXTAUTH_URL` y `NEXT_PUBLIC_SITE_URL` = `https://mautik.vercel.app`
(cambiadas el 06-oct-2026). `lib/site-url.ts` tiene ese mismo dominio como
valor por defecto.

---

## 3. Marca

| | |
|---|---|
| Logo principal (web, favicon, app) | **M** de trazo redondeado cuyo pie derecho termina en una lazada de crochet. Fondo `#2E1065`, trazo `#E9D5FF`, esquinas redondeadas. Fuente: `public/icon.svg` → `icon-192/512.png`, `apple-touch-icon.png`, `favicon-16/32.png`, `favicon.ico`, `logo-marca.png`, `app/icon.png`, `app/apple-icon.png` |
| Logo rosado (redes, impresos) | Círculo rosado con «Mautik» script blanco: `public/logo.PNG` (3464 px) y `public/logo-512.png` |
| Colores | Morado oscuro `#2E1065` / `#1A0B3D`, violeta `#4C1D95`, lavanda `#E9D5FF`, texto claro `#F3E8FF`, rosado acento `#F0ABFC` |
| Tipografía de títulos | **Montserrat** peso 400–500, **sin negrita**, títulos chicos y en minúscula, la palabra *mautik* en rosado `#F0ABFC` (referencia de Estéfani: «¿Cómo comprar en **mautik**?») |
| Tipografía del cuerpo | Inter |
| Heading Now | La pidió al principio, pero es **de pago**. Se descartó: ella eligió Montserrat. |

### Copia de los logos en Descargas
`~/Downloads/Logo Mautik/`: `mautik-logo-alta-resolucion.png` (rosado,
3464 px), `mautik-logo-512.png`, `mautik-icono-M.svg`, `mautik-icono-M-512.png`.

### El diamante en Vercel
La tarjeta del proyecto en el panel de Vercel muestra un **diamante morado**:
es el favicon de plantilla que tuvo la tienda hasta el 12-sep-2026. Vercel
guarda su propia copia (`vercel.com/api/www/avatar/<hash>`) y **no se puede
forzar** que la renueve. La web en sí ya sirve la M en todos los tamaños
(con `?v=3` para romper la caché del navegador). Solo afecta el panel de
Vercel, no a las clientas.

---

## 4. La página `/links` (el linktree)

Archivo: `app/links/page.tsx`. Se ve **sin** la barra ni el pie de la tienda
gracias a `components/marco-sitio.tsx` (lista `SIN_MARCO = ["/links"]`).

De arriba a abajo:
1. Logo M + **mautik** (Montserrat, rosado, minúscula) + «Crochet ·
   Bisutería» + «Hecho a mano con amor desde Panamá».
2. **Ver la tienda** (botón lavanda principal → `/shop`), «Paga con Yappy o
   PayPal».
3. Instagram · WhatsApp · Facebook · YouTube.
4. **Nuestros diseños**: 4 fotos grandes en 2 columnas (vaquita
   `mtk-cr-001`, capibara `mtk-cr-029`, llavero gatito `mtk-ll-001`, husky
   `mtk-cr-013`), todas enlazan a `/shop`.
5. Correo · La Chorrera, Panamá · Lun a sáb 9 a. m. – 6 p. m.
6. **Pide tu diseño personalizado** → WhatsApp con el mensaje «¡Hola Mautik!
   Quiero un diseño personalizado: ».
7. Pie «© año Mautik · hecho a mano con amor».

**Historial:** el botón «Apoya mi arte» se quitó (09-oct): llevaba a un
PayPal.me **personal** con el nombre completo de Estéfani y no vendía nada.
Regla de Estéfani: todo botón del linktree debe **llevar a una venta**.

**Bio de Instagram:** ✅ @mautik_official ya apunta a
`https://mautik.vercel.app/links` (cambiado por Estéfani el 09-oct-2026).
Si hay que cambiarlo otra vez: solo desde la **app del celular** (Instagram
web no deja editar enlaces).

---

## 5. Catálogo

- **68 productos**, **128 fotos**, todas en proporción 3:4
- Categorías: crochet (30), otros (11), pulseras (11), anillos (5), aretes
  (4), llaveros (4), collares (3)
- **12 destacados** elegidos a mano (salen en la portada)
- Fuente editable: `scripts/catalogo-mautik.ts` (58 productos) y
  `scripts/catalogo-mautik.json` (los 68). **Ojo:** la base manda; estos
  archivos solo alimentan el seed.
- Seed: `node scripts/seed-catalogo.mjs [--dry-run]`. ⚠️ Hace upsert de
  TODOS los campos: pisa fotos, descripciones u orden cambiados en el panel.
  Para tocar un solo campo, usar un script que actualice solo ese campo.

---

## 6. Precios

### Subida del 07-oct-2026 (+25 % promedio)
Pedido de Estéfani: «que sea rentable sin excederme». Regla aplicada:
- **Tejidos** (crochet, llaveros, otros): **+25 %** hasta $20, **+20 %** desde $20.
- **Bisutería** (anillos, aretes, collares, pulseras): **+30 %**, mínimo +$0.50.
- Todo redondeado a **$x.00 o $x.50**.
- Suma de una pieza de cada producto: $586.25 → $732.00.

### Ajustes a mano de Estéfani (mandan sobre la regla)
| Producto | SKU | Precio |
|---|---|---|
| Llavero de gatito | MTK-LL-001 | **$6.00** (se quedó como estaba) |
| Peluche de Conejo | MTK-CR-010 | **$18.00** |
| Kuromi de crochet | MTK-CR-017 | $20.00 — **no tocar** |
| Peluche de Any | MTK-CR-007 | $20.00 — **no tocar** |

### Archivos
- Script: `scripts/subir-precios.mjs` (`--dry-run` muestra la tabla). Solo
  cambia `price` y solo si el precio sigue siendo el viejo.
- **Respaldo de los precios anteriores:** `scripts/precios-antes-2026-10-07.json`.
  Para volver atrás un producto, leer su precio de ahí.

---

## 7. Lo que hace la tienda

### Para la clienta
- Portada con hero de 4 fotos rotando, 12 piezas destacadas, banda de
  personajes y mosaico de categorías
- Tienda con filtros por categoría, orden y búsqueda
- Buscador con **sinónimos y faltas de ortografía** (`lib/buscar.ts`)
- Ficha de producto con galería, descripción y relacionados
- Carrito tipo Temu (se marca con casillas qué se lleva); carrito de invitada
  sin pedir sesión
- **Cupones** de punta a punta
- Pago con **PayPal** o **Yappy**
- Cuenta: datos, dirección, historial, cambio de contraseña, baja
- Modo claro y oscuro
- Contacto con formulario real + preguntas frecuentes

### Para la administración (`/admin`)
- Resumen con métricas de ventas
- Productos: crear, editar, **ocultar sin borrar**, eliminar, reordenar
  fotos, editor de imagen (girar y recortar)
- Pedidos: ver, cambiar estado, **confirmar pago de Yappy**
- Clientas: ver, cambiar rol, cambiar contraseña, eliminar
- Cupones, métricas por mes, envío masivo de correos con vista previa

### Arreglo del panel (09-oct-2026)
El panel se caía entero con «Cannot read properties of undefined (reading
'toFixed')». Causa: los pedidos guardan el monto en **`totalAmount`** y la
tabla leía `order.total` (no existe). Ahora todos los montos pasan por
`dinero()` en `app/admin/page.tsx` (si el dato viene vacío muestra $0.00) y
los pedidos sin usuario dicen «Invitada». Mismo blindaje en
`admin/products` y `admin/analytics`. **Pendiente:** que Estéfani confirme
que el panel abre (no se pudo probar sin su sesión de admin).

---

## 8. Pagos

### PayPal — ✅ en producción
- Credenciales **live**.
- Webhook live **`2X341572J5297101T`** → `https://mautik.vercel.app/api/paypal/webhook`,
  eventos `PAYMENT.CAPTURE.COMPLETED` y `PAYMENT.CAPTURE.DENIED`. El 06-oct se
  **editó la URL** del webhook existente (no se creó otro), por eso
  `PAYPAL_WEBHOOK_ID` no cambió.
- Diagnóstico: `https://mautik.vercel.app/api/paypal/config?probar=1`
- ⚠️ **Nunca se hizo una compra real de punta a punta.** Falta que Estéfani
  compre algo barato para comprobar cobro → stock → correo → panel → dinero.

### Yappy manual — ✅ funcionando
La clienta elige Yappy, se registra el pedido pendiente y ve el número
(**6778-2931**), el monto y una **referencia de 8 caracteres**. Paga desde su
banco y Estéfani toca **«Confirmar pago»** en Panel → Pedidos.

### Yappy automático — ⏳ esperando al banco
Código listo en `lib/payments/yappy.ts`; faltan `YAPPY_MERCHANT_ID` y
`YAPPY_SECRET_KEY` del producto **«Botón de Pago Yappy»**. Las credenciales
que ya tiene son de las APIs de Integración y **no cobran**. Se escribió a
botondepagoyappy@bgeneral.com.

### Correos (Resend)
| Cuándo | A quién | Qué dice |
|---|---|---|
| Pedido Yappy registrado | Estéfani | «⏳ Pedido esperando Yappy» con la referencia |
| Pago confirmado | Estéfani | «💜 Venta de $X» con datos, productos, dirección y botón al panel |
| Pago confirmado | la clienta | Confirmación de su pedido |

Los cuatro caminos de confirmación (`paypal/capture`, `paypal/webhook`,
`yappy/ipn`, `admin/orders/[id]/confirmar-pago`) descuentan stock, consumen
el cupón y mandan el correo. Todos son idempotentes.

---

## 9. Login con Google

Cliente OAuth **«Mautik web»** en el proyecto de Google Cloud `mautik`
(cuenta estefanidelosangelestorres@gmail.com):
- Origen JS: `https://mautik.vercel.app` y `http://localhost:3000`
- Redirección: `https://mautik.vercel.app/api/auth/callback/google` y
  `http://localhost:3000/api/auth/callback/google`

Si algún día cambia el dominio, hay que cambiar estas cuatro cosas juntas:
Google OAuth, webhook de PayPal, `NEXTAUTH_URL` y `NEXT_PUBLIC_SITE_URL`.

---

## 10. Reglas del proyecto (respetar en cualquier chat nuevo)

1. **Español neutro, nunca voseo argentino.** «Tienes», no «tenés».
2. **Credenciales:** el asistente nunca las lee, imprime ni pide por chat. Si
   un script necesita la base de producción, se corre con
   `node --env-file=<archivo de vercel env pull> script.mjs` sin mostrar el
   archivo. Las credenciales **locales** de la base (`.env`) están vencidas.
3. **Contraseñas:** el asistente no las escribe. Si un sitio pide iniciar
   sesión (PayPal, Instagram…), Estéfani entra y el asistente sigue.
4. **Borrar va a la Papelera**, nunca borrado definitivo.
5. **Solo fotos propias de Estéfani.** Nada de plantillas ni de terceros.
6. **Verificar en producción antes de afirmar que algo funciona.**
7. **Sin personas inventadas** en textos de marketing.
8. **El linktree solo lleva a ventas:** nada de donaciones ni enlaces personales.

---

## 11. Trampas verificadas (ahorran horas)

- **`public/logo.PNG` está en MAYÚSCULAS** y Vercel distingue mayúsculas:
  `/logo.png` da 404.
- **`next/image` rechaza URLs locales con `?query`** → 400.
- **Vercel Cron llama por GET**, no POST.
- **Prisma:** `Product` se relaciona por `orderItems`, no `items`.
- **Pedido:** el monto es `totalAmount` (puede ser `null`), no `total`.
- **`/api/admin/orders`** devuelve `{ pedidos, total }`; ese `total` es el
  **conteo** de pedidos, no dinero.
- **Los hooks de React van TODOS antes del primer `return`.**
- **El `<header>` lleva `backdrop-blur`**, así que un hijo `position: fixed`
  se posiciona dentro de la barra.
- **NUNCA un cron de keepalive contra Neon:** el plan gratis da ~192 h de
  cómputo al mes; 24/7 son 720 h y tumba la tienda en 8 días. Ya pasó.
- **Neon se duerme:** la primera visita tras un rato puede tardar ~2 s o
  fallar una vez.
- **Un push a `main` ya publica.** Hacer además `vercel deploy --prod` crea
  dos deploys iguales.
- **Instagram web no deja editar enlaces de la bio**: solo la app.
- **Vercel no deja cambiar el ícono de la tarjeta del proyecto**: lo toma solo
  y lo guarda.

---

## 12. Bitácora de cambios (oct-2026)

| Fecha | Cambio |
|---|---|
| 06-oct | Tienda movida a **mautik.vercel.app**; proyecto Vercel `mautik-web` → `mautik`; viejo linktree archivado como `mautik-links-archivo` |
| 06-oct | Nueva página **/links** dentro de la tienda (logo M, morados) |
| 06-oct | Google OAuth y webhook de PayPal apuntados al dominio nuevo; **`mautik-web.vercel.app` eliminado** |
| 06-oct | Favicon con versión `?v=3` + `app/icon.png` / `app/apple-icon.png` |
| 06-oct | Commit de los cambios de pagos que estaban publicados desde el 18-sep sin guardar en Git |
| 07-oct | `/links`: títulos en Montserrat, «Nuestros diseños», fotos más grandes; luego títulos sin negrita, chicos y en minúscula |
| 07-oct | **Precios +25 %** (ver §6) + ajustes: llavero gatito $6, conejo $18 |
| 09-oct | `/links`: «Apoya mi arte» → **Pide tu diseño personalizado** (WhatsApp); más contraste |
| 09-oct | **Panel admin** arreglado (`totalAmount`) |
| 09-oct | Carpeta local `mautiklinks` a la Papelera |
| 09-oct | Bio de Instagram apuntada a `/links` (Estéfani) |

---

## 13. Pendientes

1. **Estéfani:** confirmar que `/admin` ya abre bien.
2. **La compra real de prueba** (solo puede hacerla Estéfani).
3. **Botón de Pago de Yappy** — esperando a Banco General.
4. **31 productos con una sola foto** (sin cambio de imagen al pasar el dedo).
5. **Credenciales locales de la base vencidas**: para trabajar en local con
   datos reales hay que bajar las de Vercel (`vercel env pull`).
