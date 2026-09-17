/*
  Siembra una base nueva de Neon con el catálogo de Mautik.

  Se usa cuando hay que mudar de proyecto en Neon (por ejemplo, al agotarse la
  cuota de cómputo del plan gratis). Carga los 68 productos desde el respaldo,
  conservando sus ids originales —importante, porque las fotos, los enlaces y
  el sitemap apuntan a esos ids— y vuelve a marcar los 12 destacados elegidos.

  Uso:
    DATABASE_URL="<la nueva URL de Neon>" node respaldos/sembrar.cjs

  Es idempotente: si un producto ya existe, lo actualiza en vez de duplicarlo.
*/
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const aqui = __dirname

const productos = JSON.parse(
  fs.readFileSync(path.join(aqui, 'productos-2026-09-13.json'), 'utf8'),
)
const destacados = new Set(
  fs
    .readFileSync(path.join(aqui, 'destacados-12.txt'), 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean),
)

;(async () => {
  console.log(`Sembrando ${productos.length} productos…`)
  let creados = 0
  let actualizados = 0

  for (const p of productos) {
    const datos = {
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      images: p.images || [],
      category: p.category,
      sku: p.sku,
      discount: p.discount ?? null,
      originalPrice: p.originalPrice ?? null,
      featured: destacados.has(p.id),
      isNew: Boolean(p.isNew),
      visible: true,
      createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
    }

    const existe = await prisma.product.findUnique({ where: { id: p.id } })
    if (existe) {
      await prisma.product.update({ where: { id: p.id }, data: datos })
      actualizados++
    } else {
      await prisma.product.create({ data: { id: p.id, ...datos } })
      creados++
    }
  }

  const total = await prisma.product.count()
  const dest = await prisma.product.count({ where: { featured: true } })
  const fotos = productos.reduce((n, p) => n + (p.images || []).length, 0)

  console.log(`\n✅ Listo`)
  console.log(`   creados: ${creados} · actualizados: ${actualizados}`)
  console.log(`   en la base: ${total} productos, ${dest} destacados, ${fotos} fotos`)

  await prisma.$disconnect()
})().catch(async (e) => {
  console.error('❌ Falló:', e.message)
  await prisma.$disconnect()
  process.exit(1)
})
