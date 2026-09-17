/**
 * Búsqueda de productos tolerante a cómo escribe la gente de verdad.
 *
 * El filtro anterior era `name.toLowerCase().includes(texto)`. Eso falla en
 * todos los casos que importan acá:
 *   · "capibara" no encontraba "Capybara" (así está escrito en el catálogo).
 *   · "corazon" no encontraba "corazón" — y nadie escribe tildes en un buscador.
 *   · "llavero" no encontraba "Llaveros" por la s del plural.
 *   · "manilla" o "gargantilla", que es como le dicen algunas clientas, no
 *     encontraban nada.
 */

/** minúsculas, sin tildes, sin puntuación */
export function normalizar(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ]+/g, " ")
    .trim();
}

/** quita la s/es del plural para comparar "llavero" con "llaveros" */
function singular(p: string): string {
  if (p.length > 4 && p.endsWith("es")) return p.slice(0, -2);
  if (p.length > 3 && p.endsWith("s")) return p.slice(0, -1);
  return p;
}

/**
 * Palabras que significan lo mismo. Cada fila es un grupo: si alguien escribe
 * cualquiera de ellas, se buscan todas.
 */
/*
  Sinónimos Y faltas de ortografía frecuentes.

  Lo segundo importa tanto como lo primero: buscar "pulcera" —que es como se
  escribe muchísimas veces— devolvía CERO resultados con once pulseras en el
  catálogo, y quien busca así se va pensando que no hay. Verificado en la
  tienda antes de agregarlo.
*/
const SINONIMOS: string[][] = [
  ["capybara", "capibara", "carpincho"],
  ["chocker", "choker", "gargantilla"],
  ["pulsera", "pulcera", "puclera", "brazalete", "brasalete", "manilla", "pulsera de hilo"],
  ["arete", "arito", "pendiente", "zarcillo", "aro"],
  ["anillo", "sortija"],
  ["collar", "collarcito", "cadena", "cadenita"],
  ["crochet", "croche", "crocher", "cruchet", "tejido", "amigurumi", "ganchillo"],
  ["peluche", "peluchito", "muneco", "munequito", "juguete"],
  ["oso", "osito", "teddy"],
  ["vaca", "vaquita"],
  ["conejo", "conejito", "conejita"],
  ["perro", "perrito", "perruno"],
  ["gato", "gatito", "michi"],
  ["pato", "patito"],
  ["pollo", "pollito", "gallina"],
  ["diadema", "diadema de flores", "vincha", "cintillo", "banda"],
  ["bandana", "panoleta", "panuelo"],
  ["cartera", "carterita", "bolso", "bolsa", "bolsito"],
  ["llavero", "llaverito", "yavero"],
  ["girasol", "flor"],
  ["pin", "prendedor", "broche"],
  ["dorado", "oro", "dorada"],
  ["plateado", "plata", "plateada"],
];

/** todas las formas equivalentes a una palabra (ella incluida) */
function equivalentes(palabra: string): string[] {
  const base = singular(palabra);
  const grupo = SINONIMOS.find((g) => g.some((w) => singular(w) === base));
  return grupo ? grupo.map(singular) : [base];
}

/**
 * ¿El texto buscado aparece en el producto?
 * Tienen que estar TODAS las palabras (o algún sinónimo de cada una), no una
 * cualquiera: buscar "oso pequeño" no debería traer todos los osos.
 */
export function coincide(
  producto: { name?: string; description?: string; category?: string; sku?: string },
  texto: string
): boolean {
  const consulta = normalizar(texto);
  if (!consulta) return true;

  const heno = normalizar(
    [producto.name, producto.description, producto.category, producto.sku]
      .filter(Boolean)
      .join(" ")
  );
  // el texto del producto, también en singular, para que "llaveros" case con
  // una búsqueda de "llavero" y al revés
  const henoPalabras = new Set(heno.split(" ").map(singular));

  return consulta.split(" ").filter(Boolean).every((palabra) => {
    const formas = equivalentes(palabra);
    return formas.some(
      (f) => henoPalabras.has(f) || heno.includes(f) || singular(palabra).length >= 3 && heno.includes(singular(palabra))
    );
  });
}
