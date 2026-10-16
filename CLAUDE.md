# Mautik Web

Tienda de artesanía con catálogo real de **68 productos**. Repo: `github.com/estefaniii/mautik-web` · rama `main`.
En vivo: **https://mautik.vercel.app** · linktree en `/links` · panel en `/admin`.

> **Antes de tocar nada, lee `RESUMEN-MAUTIK.md`** (documento maestro): diccionario «cuando te pida…», dominio, marca, precios, pagos, reglas, trampas y pendientes. Para buscar algo puntual: `grep -n "<tema>" RESUMEN-MAUTIK.md`.

Ojo: el `name` del package.json es `my-v0-project` (viene de v0), no lo tomes como nombre del proyecto.

## Stack
Next.js + **Prisma** + NextAuth · Cloudinary para imágenes · Stripe en el código, pero los **pagos reales son Yappy y PayPal**.

## Comandos
```bash
npm run dev     # :3000
npm run build
```

## Entorno
`DATABASE_*` (host/name/...), `CLOUDINARY_*`, `ADMIN_EMAIL`, credenciales de NextAuth.

## Trampas
- Stripe está en las dependencias pero **no es la pasarela en producción**: no construyas flujos asumiendo Stripe.
- El catálogo de 68 productos es real: no lo sustituyas por datos de ejemplo.
