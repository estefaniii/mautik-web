/**
 * Cálculo del total de un pedido SIEMPRE del lado del servidor.
 *
 * Regla de oro de cualquier checkout: el navegador puede mandar el carrito,
 * pero nunca el precio. Acá se releen los precios y el stock desde la base de
 * datos y se recalcula todo. Si el cliente manipula el JSON, el monto que se
 * le cobra no cambia.
 */

import { prisma } from "@/lib/db";
import { calculateShipping } from "@/lib/shipping";
import { validarCupon, type CuponValido } from "@/lib/payments/cupones";

export interface ItemEntrante {
  productId: string;
  quantity: number;
}

export interface TotalesPedido {
  items: Array<{
    productId: string;
    sku: string;
    name: string;
    category: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  /** Lo que descuenta el cupón, si hay uno válido. 0 si no. */
  descuento: number;
  /** El cupón que se aplicó, para guardarlo en el pedido. */
  cupon: CuponValido | null;
  envio: number;
  impuestos: number;
  total: number;
}

const dos = (n: number) => Math.round(n * 100) / 100;

export async function calcularTotales(
  entrantes: ItemEntrante[],
  opciones: { direccion?: any; metodoEnvio?: string; codigoCupon?: string | null } = {}
): Promise<TotalesPedido> {
  if (!Array.isArray(entrantes) || entrantes.length === 0) {
    throw new Error("El carrito está vacío.");
  }

  // Agrupamos por producto para que enviar el mismo id dos veces no permita
  // saltarse la validación de stock.
  const cantidades = new Map<string, number>();
  for (const it of entrantes) {
    const cant = Number(it.quantity);
    if (!Number.isInteger(cant) || cant < 1 || cant > 999) {
      throw new Error("Cantidad inválida en el carrito.");
    }
    cantidades.set(it.productId, (cantidades.get(it.productId) || 0) + cant);
  }

  const productos = await prisma.product.findMany({
    where: { id: { in: [...cantidades.keys()] } },
    select: {
      id: true,
      sku: true,
      name: true,
      price: true,
      stock: true,
      discount: true,
      // La categoría hace falta para los cupones limitados a una categoría.
      category: true,
    },
  });

  if (productos.length !== cantidades.size) {
    throw new Error("Hay productos en el carrito que ya no existen.");
  }

  const items = productos.map((p) => {
    const quantity = cantidades.get(p.id)!;
    if (p.stock < quantity) {
      throw new Error(`Solo quedan ${p.stock} unidades de ${p.name}.`);
    }
    // El precio efectivo sale de la base, aplicando el descuento vigente.
    const precio = p.discount ? dos(p.price * (1 - p.discount / 100)) : dos(p.price);
    return {
      productId: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      quantity,
      price: precio,
      subtotal: dos(precio * quantity),
    };
  });

  const subtotal = dos(items.reduce((s, i) => s + i.subtotal, 0));

  /*
    El cupón se valida acá, contra la base, con el subtotal que acaba de
    calcular el servidor. El navegador manda el CÓDIGO, nunca el monto: si
    alguien edita la petición y manda "descuento: 50", no se lee.

    Si el código no sirve, no se rompe el pedido: simplemente no hay descuento.
    Quien tiene que avisar "ese cupón venció" es el carrito, antes de llegar
    hasta acá.
  */
  let descuento = 0;
  let cupon: CuponValido | null = null;
  if (opciones.codigoCupon) {
    const r = await validarCupon(opciones.codigoCupon, subtotal, items);
    if (r.ok) {
      cupon = r.cupon;
      descuento = Math.min(r.cupon.descuento, subtotal);
    }
  }

  let envio = 0;
  if (opciones.direccion && opciones.metodoEnvio) {
    // calculateShipping suma 1 lb por elemento del array, así que expandimos
    // cada item según su cantidad para que el peso salga bien.
    const bultos = items.flatMap((i) => Array.from({ length: i.quantity }, () => ({ weight: 1 })));
    try {
      envio = dos(
        Number(calculateShipping(opciones.direccion, bultos, opciones.metodoEnvio as any)) || 0
      );
    } catch {
      envio = 0;
    }
  }

  // Panamá no cobra ITBMS sobre artesanía hecha a mano vendida por el artesano.
  const impuestos = 0;

  return {
    items,
    subtotal,
    descuento,
    cupon,
    envio,
    impuestos,
    // El descuento se resta ANTES del envío: nunca se regala el envío por
    // un cupón de producto, y el total no puede bajar de cero.
    total: dos(Math.max(0, subtotal - descuento) + envio + impuestos),
  };
}
