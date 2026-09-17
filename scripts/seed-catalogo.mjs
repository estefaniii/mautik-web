#!/usr/bin/env node
/**
 * Carga el catálogo real de Mautik (49 productos de los catálogos de Canva)
 * en la base de datos. Es idempotente: hace upsert por SKU, así que se puede
 * correr varias veces sin duplicar nada.
 *
 *   node scripts/seed-catalogo.mjs             # crea/actualiza
 *   node scripts/seed-catalogo.mjs --dry-run   # solo muestra qué haría
 *   node scripts/seed-catalogo.mjs --limpiar-demo   # además borra los productos de prueba
 *
 * Las imágenes salen de public/productos/ (generadas con ingest-fotos.mjs).
 * Si un producto todavía no tiene foto se usa /placeholder.jpg y se avisa.
 */

import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const DRY = process.argv.includes("--dry-run");
const LIMPIAR = process.argv.includes("--limpiar-demo");
const DIR_FOTOS = path.resolve("public/productos");

/** Devuelve todas las fotos de un producto: mtk-cr-003.webp, mtk-cr-003-2.webp, ... */
function imagenesDe(producto) {
  if (!fs.existsSync(DIR_FOTOS)) return [];
  const base = producto.foto.replace(/\.webp$/, "");
  return fs
    .readdirSync(DIR_FOTOS)
    .filter((f) => f === producto.foto || f.startsWith(`${base}-`))
    .sort((a, b) => a.length - b.length || a.localeCompare(b))
    .map((f) => `/productos/${f}`);
}

async function main() {
  const { productos, _meta } = JSON.parse(
    fs.readFileSync("scripts/catalogo-mautik.json", "utf8")
  );

  console.log(`\nCatálogo Mautik — ${productos.length} productos (${_meta.extraido})`);
  if (DRY) console.log("MODO PRUEBA: no se escribe nada en la base de datos.\n");

  let creados = 0;
  let actualizados = 0;
  const sinFoto = [];
  const aRevisar = [];

  for (const p of productos) {
    const images = imagenesDe(p);
    if (!images.length) sinFoto.push(p);
    if (p.verificar) aRevisar.push(p);

    const datos = {
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: p.category,
      images: images.length ? images : ["/placeholder.jpg"],
      // Un producto solo se destaca si tiene foto de verdad. Si no, la portada
      // se llena de placeholders y parece que la tienda está vacía. A medida
      // que se agreguen fotos, los productos marcados como destacados en el
      // catálogo van apareciendo solos.
      featured: Boolean(p.featured) && images.length > 0,
      isNew: Boolean(p.isNew),
    };

    if (DRY) {
      console.log(`  ${p.sku}  ${p.name.padEnd(38)} $${p.price.toFixed(2).padStart(6)}  ${p.category.padEnd(9)} ${images.length} foto(s)`);
      continue;
    }

    const existente = await prisma.product.findUnique({ where: { sku: p.sku } });
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: datos,
      create: { ...datos, sku: p.sku },
    });
    existente ? actualizados++ : creados++;
  }

  if (!DRY) {
    console.log(`\n✅ ${creados} creados, ${actualizados} actualizados.`);

    if (LIMPIAR) {
      const skusReales = productos.map((p) => p.sku);
      const demo = await prisma.product.findMany({
        where: { sku: { notIn: skusReales } },
        select: { id: true, sku: true, name: true },
      });
      if (demo.length) {
        console.log(`\n🧹 Productos de prueba que NO están en el catálogo real (${demo.length}):`);
        demo.forEach((d) => console.log(`   - ${d.sku}  ${d.name}`));
        // Solo se borran los que no tengan pedidos asociados, para no romper el historial.
        let borrados = 0;
        for (const d of demo) {
          const conPedidos = await prisma.orderItem.count({ where: { productId: d.id } });
          if (conPedidos > 0) {
            console.log(`     (conservo ${d.sku}: tiene ${conPedidos} pedido(s))`);
            continue;
          }
          await prisma.cartItem.deleteMany({ where: { productId: d.id } });
          await prisma.wishlistItem.deleteMany({ where: { productId: d.id } });
          await prisma.review.deleteMany({ where: { productId: d.id } });
          await prisma.productAnalytics.deleteMany({ where: { productId: d.id } });
          await prisma.product.delete({ where: { id: d.id } });
          borrados++;
        }
        console.log(`   Borrados ${borrados}.`);
      } else {
        console.log("\n🧹 No quedan productos de prueba.");
      }
    }
  }

  if (sinFoto.length) {
    console.log(`\n📷 ${sinFoto.length} producto(s) sin foto (quedan con /placeholder.jpg):`);
    sinFoto.forEach((p) => console.log(`   - ${p.sku}  ${p.name}`));
    console.log("   Copiá las fotos a ~/Downloads/imagenes de mautik/fotos de producto/ y corré: node scripts/ingest-fotos.mjs");
  }

  if (aRevisar.length) {
    console.log(`\n⚠️  ${aRevisar.length} producto(s) que hay que confirmar con Estéfani:`);
    aRevisar.forEach((p) => console.log(`   - ${p.sku}  ${p.name}\n     ${p.verificar}`));
  }
}

main()
  .catch((e) => {
    console.error("\n❌ Error:", e.message);
    if (/DATABASE_URL|connect/i.test(e.message)) {
      console.error("   Revisá que DATABASE_URL apunte a la base correcta en .env.local");
    }
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
