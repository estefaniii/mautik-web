/**
 * Ajuste de precios del 2026-10-07 (pedido de Estéfani: que sea rentable sin
 * pasarse).
 *
 * Regla:
 *   - Tejidos (crochet, llaveros, otros): +25% hasta $20, +20% desde $20.
 *   - Bisutería (anillos, aretes, collares, pulseras): +30%, mínimo +$0.50.
 *   - Todo redondeado al medio dólar más cercano ($x.00 o $x.50).
 *
 * Solo toca el campo `price`, y solo si el producto todavía tiene el precio
 * viejo (así no pisa un precio que se haya cambiado a mano en el panel).
 * Antes de escribir guarda los precios anteriores en
 * scripts/precios-antes-2026-10-07.json para poder volver atrás.
 *
 *   node scripts/subir-precios.mjs --dry-run   # solo muestra la tabla
 *   node scripts/subir-precios.mjs             # aplica
 */

import { PrismaClient } from "@prisma/client";
import fs from "node:fs";

const prisma = new PrismaClient();
const DRY = process.argv.includes("--dry-run");
const RESPALDO = "scripts/precios-antes-2026-10-07.json";

const BISUTERIA = new Set(["anillos", "aretes", "collares", "pulseras"]);
const medio = (n) => Math.round(n * 2) / 2;

export function precioNuevo(precio, categoria) {
  if (BISUTERIA.has(categoria)) return Math.max(medio(precio * 1.3), precio + 0.5);
  return medio(precio * (precio >= 20 ? 1.2 : 1.25));
}

async function main() {
  const productos = await prisma.product.findMany({
    select: { id: true, sku: true, name: true, price: true, category: true },
    orderBy: [{ category: "asc" }, { price: "asc" }],
  });

  const cambios = productos.map((p) => ({ ...p, nuevo: precioNuevo(p.price, p.category) }));
  let antes = 0;
  let despues = 0;
  for (const c of cambios) {
    antes += c.price;
    despues += c.nuevo;
    console.log(
      `${(c.sku || "").padEnd(11)} ${c.category.padEnd(9)} ${c.name.slice(0, 42).padEnd(42)} $${c.price.toFixed(2).padStart(6)} → $${c.nuevo.toFixed(2).padStart(6)}`
    );
  }
  console.log(`\n${cambios.length} productos · suma $${antes.toFixed(2)} → $${despues.toFixed(2)} (+${((despues / antes - 1) * 100).toFixed(1)}%)`);

  if (DRY) return;

  fs.writeFileSync(
    RESPALDO,
    JSON.stringify(cambios.map(({ sku, name, price }) => ({ sku, name, price })), null, 2)
  );
  let n = 0;
  for (const c of cambios) {
    const r = await prisma.product.updateMany({
      where: { id: c.id, price: c.price },
      data: { price: c.nuevo },
    });
    n += r.count;
  }
  console.log(`\n✅ ${n} precios actualizados. Respaldo en ${RESPALDO}`);
}

main()
  .catch((e) => {
    console.error("\n❌ Error:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
