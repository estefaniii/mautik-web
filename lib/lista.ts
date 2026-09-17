/**
 * Convierte lo que devuelva una API en un arreglo, siempre.
 *
 * De dónde sale esto: `/api/admin/orders` pasó a devolver `{ pedidos, total }`
 * para poder paginar, y el panel seguía haciendo `setOrders(data)` con el
 * objeto entero. El siguiente `orders.filter(...)` tiró
 * **"A.filter is not a function"** y la administración quedó inaccesible: una
 * pantalla en blanco con un error que no dice nada.
 *
 * El patrón `const data = await res.json(); setAlgo(data)` estaba repetido en
 * ocho lugares más. Cualquiera de ellos se rompe igual el día que su endpoint
 * cambie de forma, agregue paginación o devuelva un error con `{ error }`.
 *
 * Regla: lo peor que puede pasar cuando una respuesta viene rara es que la
 * lista salga vacía. Nunca que la página se caiga.
 */
export function comoLista<T = any>(datos: unknown, ...claves: string[]): T[] {
  if (Array.isArray(datos)) return datos as T[];
  if (datos && typeof datos === "object") {
    const o = datos as Record<string, unknown>;
    // primero las claves que pida quien llama, después las habituales
    for (const k of [
      ...claves,
      "items",
      "data",
      "results",
      "products",
      "productos",
      "orders",
      "pedidos",
      "users",
      "usuarios",
      "coupons",
      "cupones",
      "addresses",
      "direcciones",
    ]) {
      if (Array.isArray(o[k])) return o[k] as T[];
    }
  }
  return [];
}
