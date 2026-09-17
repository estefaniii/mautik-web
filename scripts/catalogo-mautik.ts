/**
 * ⚠️ ESTE ARCHIVO NO SE USA. La fuente real es `catalogo-mautik.json`.
 *
 * `scripts/seed-catalogo.mjs` lee ÚNICAMENTE el .json (es .mjs y no puede
 * importar TypeScript), y nada más en el proyecto importa este archivo.
 * Editarlo no cambia nada: el 2026-09-10 corregí acá las descripciones de los
 * anillos, corrí el seed, y la base siguió con el texto viejo justamente por
 * esto. Si vas a cambiar el catálogo, cambiá el .json.
 *
 * Se deja como referencia porque tiene los comentarios de dónde salió cada
 * dato, pero cualquier cambio hay que replicarlo en el .json.
 *
 * ---
 *
 * Catálogo real de Mautik, extraído de los catálogos de Canva (09/09/2026).
 *
 * `foto` es el nombre del archivo WebP que debe existir en public/productos/.
 * Corré `node scripts/ingest-fotos.mjs` para generar esos WebP desde las fotos originales.
 *
 * REVISAR (marcado con `verificar`): nombres que aparecen repetidos en distintas
 * páginas del Canva con precios distintos.
 */

/** Valores canónicos que usan la tienda, los filtros y el admin (minúscula). */
export type CategoriaMautik =
  | "crochet"
  | "llaveros"
  | "pulseras"
  | "collares"
  | "anillos"
  | "aretes"
  | "otros";

export interface ProductoMautik {
  sku: string;
  name: string;
  description: string;
  price: number;
  category: CategoriaMautik;
  stock: number;
  featured?: boolean;
  isNew?: boolean;
  foto: string;
  verificar?: string;
}

/** Peluches y piezas tejidas a crochet. */
export const TEJIDOS: ProductoMautik[] = [
  { sku: "MTK-CR-001", name: "Peluche de Vaquita", price: 10.0, category: "crochet", stock: 3, featured: true, isNew: true, foto: "mtk-cr-001.webp",
    description: "Vaquita tejida a crochet, suave y con carita bordada a mano. Una pieza tierna que queda perfecta en un estante, una cuna o como regalo de cumpleaños." },
  { sku: "MTK-CR-002", name: "Peluche de oso pequeño", price: 6.0, category: "crochet", stock: 5, featured: true, foto: "mtk-cr-002.webp",
    description: "Osito pequeño tejido a mano, del tamaño de la palma. Ideal para acompañar un detalle, un ramo o para empezar tu colección de amigurumis." },
  { sku: "MTK-CR-003", name: "Capibara grande de Crochet", price: 25.0, category: "crochet", stock: 1, featured: true, foto: "mtk-cr-003.webp",
    description: "Capibara grande tejida a crochet, nuestra pieza más pedida. Requiere varias horas de trabajo y queda con ese gesto tranquilo tan característico del capibara." },
  { sku: "MTK-CR-004", name: "Peluche de pulpo", price: 6.0, category: "crochet", stock: 6, featured: true, foto: "mtk-cr-004.webp",
    description: "Pulpito tejido a crochet con tentáculos en espiral. Cabe en la mano y funciona muy bien como regalo pequeño o como detalle de escritorio." },
  { sku: "MTK-CR-005", name: "Peluche de patito", price: 6.0, category: "crochet", stock: 5, featured: true, foto: "mtk-cr-005.webp",
    description: "Patito amarillo tejido a mano, con pico y patas en contraste. Sencillo, alegre y del tamaño justo para regalar." },
  { sku: "MTK-CR-006", name: "Peluche de Capibara Pequeño", price: 7.5, category: "crochet", stock: 4, featured: true, foto: "mtk-cr-006.webp",
    description: "La versión mini de nuestra capibara. Mismo diseño y mismo carácter, en un tamaño más cómodo para llevar o para acompañar un regalo." },
  { sku: "MTK-CR-007", name: "Peluche de Any", price: 16.0, category: "crochet", stock: 2, featured: true, foto: "mtk-cr-007.webp",
    description: "Peluche de Any tejido a crochet, con detalles de vestuario hechos pieza por pieza. Para quienes coleccionan personajes de sus series favoritas." },
  { sku: "MTK-CR-008", name: "Spiderman mediano", price: 22.0, category: "crochet", stock: 1, featured: true, foto: "mtk-cr-008.webp",
    description: "Spiderman tejido a crochet en tamaño mediano, con el patrón de la máscara trabajado a mano puntada por puntada. Pieza de colección." },
  { sku: "MTK-CR-009", name: "Hollow Knight mediano", price: 23.0, category: "crochet", stock: 1, featured: true, foto: "mtk-cr-009.webp",
    description: "Hollow Knight tejido a crochet en tamaño mediano, con su casco de cuernos y la capa característica. Un regalo que cualquier gamer reconoce al instante.",
    verificar: "Confirmado el 2026-09-09 leyendo el texto agrupado del Canva: aparece igual en la página 3 y en la página 4, ambas a $23.00. Es el mismo producto repetido en el catálogo, no dos tamaños." },
  { sku: "MTK-CR-010", name: "Peluche de Conejo", price: 16.0, category: "crochet", stock: 2, featured: true, foto: "mtk-cr-010.webp",
    description: "Conejo tejido a crochet con orejas largas y cuerpo suave. Una pieza clásica que funciona igual de bien para bebés que para decorar." },
  { sku: "MTK-CR-011", name: "Ranita pequeña", price: 4.5, category: "crochet", stock: 8, featured: true, foto: "mtk-cr-011.webp",
    description: "Ranita verde tejida a mano, la pieza más accesible del catálogo. Perfecta para regalar sin motivo o para sumar a un pedido más grande." },
  { sku: "MTK-CR-012", name: "Luffy mediano", price: 23.0, category: "crochet", stock: 1, featured: true, foto: "mtk-cr-012.webp",
    description: "Luffy tejido a crochet en tamaño mediano, con su sombrero de paja y el chaleco rojo. Hecho a mano para fanáticos de One Piece." },
  { sku: "MTK-CR-013", name: "Husky de crochet", price: 10.0, category: "crochet", stock: 3, featured: true, foto: "mtk-cr-013.webp",
    description: "Husky tejido a crochet con las marcas de la cara en dos tonos. Un perrito con mucha personalidad para su tamaño." },
  { sku: "MTK-CR-014", name: "Oso Panda pequeño", price: 8.0, category: "crochet", stock: 4, featured: true, foto: "mtk-cr-014.webp",
    description: "Panda pequeño tejido a mano en blanco y negro. Simple, reconocible y siempre de los primeros en salir." },
  { sku: "MTK-CR-015", name: "Patito pequeño", price: 7.0, category: "crochet", stock: 5, featured: true, foto: "mtk-cr-015.webp",
    description: "Patito en tamaño mini, tejido a crochet con hilo suave. Un detalle económico que se ve mucho más caro de lo que cuesta." },
  { sku: "MTK-CR-016", name: "Perritos de crochet", price: 8.0, category: "crochet", stock: 4, featured: true, foto: "mtk-cr-016.webp",
    description: "Perritos tejidos a mano, cada uno con su propio carácter según el hilo que le toque. Escribinos si querés un color en particular." },
  { sku: "MTK-CR-017", name: "Kuromi de crochet", price: 16.0, category: "crochet", stock: 2, featured: true, foto: "mtk-cr-017.webp",
    description: "Kuromi tejida a crochet con su capucha de calavera y las orejas de jester. Uno de los personajes que más nos piden." },
  { sku: "MTK-CR-018", name: "Conejito de crochet", price: 8.0, category: "crochet", stock: 4, featured: true, foto: "mtk-cr-018.webp",
    description: "Conejito tejido a mano en tonos claros, con orejas paradas y cola de pompón. Tierno sin ser infantil." },
  { sku: "MTK-CR-019", name: "Osito de crochet", price: 10.0, category: "crochet", stock: 3, featured: true, foto: "mtk-cr-019.webp",
    description: "Osito tejido a crochet en tamaño intermedio, relleno firme para que mantenga la forma. Un peluche que dura años.",
    verificar: "Aparece en la página 5 y en la página 6 del Canva, ambas a $10.00. Igual que Hollow Knight, parece el mismo producto repetido." },
  { sku: "MTK-CR-020", name: "Vaquita de crochet", price: 10.0, category: "crochet", stock: 3, featured: true, foto: "mtk-cr-020.webp",
    description: "Vaquita tejida a crochet con manchas hechas a mano, así que ninguna sale igual a otra. Pieza única de verdad." },
  { sku: "MTK-CR-021", name: "Conejita pequeña de crochet", price: 7.0, category: "crochet", stock: 5, featured: true, foto: "mtk-cr-021.webp",
    description: "Conejita pequeña tejida a mano, con lacito y orejas caídas. Del tamaño ideal para meter en una bolsa de regalo." },
  { sku: "MTK-CR-022", name: "Peluche de Radiohead", price: 8.0, category: "crochet", stock: 2, featured: true, foto: "mtk-cr-022.webp",
    description: "Peluche inspirado en el osito de Radiohead, tejido a crochet. Un guiño para quien conoce la referencia." },
  { sku: "MTK-CR-023", name: "Perrito de Peluche con corazón", price: 9.0, category: "crochet", stock: 3, featured: true, foto: "mtk-cr-023.webp",
    description: "Perrito tejido a crochet abrazando un corazón. El regalo directo para aniversarios, San Valentín o un 'pensé en ti'." },
  { sku: "MTK-CR-024", name: "Conejitos de crochet", price: 8.0, category: "crochet", stock: 4, featured: true, foto: "mtk-cr-024.webp",
    description: "Conejitos tejidos a mano en varios colores de hilo. Se pueden pedir en pareja para regalo doble." },
  { sku: "MTK-CR-025", name: "Pompompurin pequeño", price: 8.0, category: "crochet", stock: 3, featured: true, foto: "mtk-cr-025.webp",
    description: "Pompompurin tejido a crochet en tamaño pequeño, con su boina marrón. Otro de los favoritos de Sanrio." },
  { sku: "MTK-CR-026", name: "Peluches de pulpo de colores", price: 6.0, category: "crochet", stock: 8, featured: true, foto: "mtk-cr-026.webp",
    description: "Pulpitos tejidos a mano en distintos colores de hilo. Elegí el tuyo o pedí el set completo para decorar." },
  { sku: "MTK-CR-027", name: "Peluche de Gallina que cuelga", price: 6.0, category: "crochet", stock: 4, featured: true, foto: "mtk-cr-027.webp",
    description: "Gallina tejida a crochet con cordón para colgar. Queda muy bien en la cocina, en el espejo del carro o en una mochila." },
  { sku: "MTK-CR-028", name: "Perrito a crochet", price: 9.0, category: "crochet", stock: 3, featured: true, foto: "mtk-cr-028.webp",
    description: "Perrito tejido a mano con orejas y hocico en contraste. Relleno suave y costuras reforzadas para que aguante el uso." },
  { sku: "MTK-CR-029", name: "Capibara con accesorios crochet", price: 30.0, category: "crochet", stock: 1, featured: true, foto: "mtk-cr-029.webp",
    description: "Nuestra pieza más completa: capibara tejida a crochet con sus accesorios incluidos, cada uno hecho por separado. La opción para un regalo importante." },
  { sku: "MTK-LL-001", name: "Llavero de gatito", price: 6.0, category: "llaveros", stock: 6, featured: true, foto: "mtk-ll-001.webp",
    description: "Llavero de gatito tejido a crochet con anilla metálica reforzada. Liviano, así que no pesa en la cartera ni raya el celular." },
  { sku: "MTK-LL-002", name: "Patito que cuelga", price: 5.5, category: "llaveros", stock: 7, featured: true, foto: "mtk-ll-002.webp",
    description: "Patito tejido a mano con cordón y anilla para colgar. Para las llaves, la mochila del colegio o el bolso." },
  { sku: "MTK-LL-003", name: "Abejitas a crochet llavero", price: 5.5, category: "llaveros", stock: 8, isNew: true, featured: true, foto: "mtk-ll-003.webp",
    description: "Abejitas tejidas a crochet en amarillo y negro, montadas como llavero. Pequeñas, alegres y de las que más se regalan entre amigas." },
  { sku: "MTK-LL-004", name: "Flor que cuelga para bálsamo", price: 5.0, category: "llaveros", stock: 6, isNew: true, featured: true, foto: "mtk-ll-004.webp",
    description: "Portabálsamo tejido a crochet en forma de flor, con anilla para colgar del bolso. Tu labial deja de perderse en el fondo de la cartera." },
  { sku: "MTK-OT-001", name: "Diadema de rosas grandes", price: 8.0, category: "otros", stock: 3, isNew: true, featured: true, foto: "mtk-ot-001.webp",
    description: "Diadema forrada a crochet con rosas grandes tejidas a mano. Se usa cómoda todo el día y funciona muy bien para sesiones de foto y eventos." },
  { sku: "MTK-OT-002", name: "Diadema de rosas pequeñas", price: 8.0, category: "otros", stock: 3, isNew: true, featured: true, foto: "mtk-ot-002.webp",
    description: "La misma diadema en versión discreta, con rosas pequeñas tejidas a crochet. Más fácil de combinar en el día a día." },
  { sku: "MTK-OT-003", name: "Pieza de baño a crochet", price: 15.0, category: "otros", stock: 2, featured: true, foto: "mtk-ot-003.webp",
    description: "Pieza de baño tejida a crochet con hilo resistente, pensada para uso real y lavado frecuente. Le da un toque artesanal al baño." },
  { sku: "MTK-OT-004", name: "Cartera de rosas a crochet", price: 15.0, category: "otros", stock: 2, featured: true, isNew: true, foto: "mtk-ot-004.webp",
    description: "Cartera tejida a crochet con rosas en relieve, forrada por dentro. Del tamaño justo para celular, llaves y labial." },
];

/** Bisutería: alambre bañado en oro, perlas e hilo. */
export const BISUTERIA: ProductoMautik[] = [
  { sku: "MTK-AN-001", name: "Anillo de alambre bañado en oro", price: 3.5, category: "anillos", stock: 6, featured: true, foto: "mtk-an-001.webp",
    description: "Anillo trabajado a mano en alambre bañado en oro. Se moldea pieza por pieza, así que el diseño nunca sale idéntico dos veces." },
  { sku: "MTK-AN-002", name: "Anillo de perlas", price: 0.5, category: "anillos", stock: 12, featured: true, foto: "mtk-an-002.webp",
    description: "Anillo delicado de perlas montadas a mano, con una cuenta de diseño al centro: carita, corazón o la que prefieras. El detalle más accesible del catálogo y el que mejor se ve en conjunto con otros." },
  { sku: "MTK-AR-001", name: "Aretes de alambre bañado en oro", price: 3.0, category: "aretes", stock: 8, featured: true, foto: "mtk-ar-001.webp",
    description: "Aretes moldeados a mano en alambre bañado en oro. Livianos, no molestan en todo el día y combinan con cualquier look." },
  { sku: "MTK-AR-002", name: "Aretes de alambre bañado en oro (chico)", price: 2.5, category: "aretes", stock: 8, featured: true, foto: "mtk-ar-002.webp",
    description: "La versión pequeña de nuestros aretes de alambre dorado. Discretos, para uso diario o para oficina." },
  { sku: "MTK-AR-003", name: "Arete piercing", price: 1.0, category: "aretes", stock: 15, featured: true, foto: "mtk-ar-003.webp",
    description: "Arete tipo piercing hecho a mano, para segundos huecos o para usar en conjunto. Ideal para armar tu propia combinación de orejas." },
  { sku: "MTK-PU-001", name: "Pulsera de alambre bañado en oro", price: 8.0, category: "pulseras", stock: 4, featured: true, foto: "mtk-pu-001.webp",
    description: "Pulsera trabajada a mano en alambre bañado en oro, con cierre ajustable. La pieza más vistosa de la línea de bisutería." },
  { sku: "MTK-PU-002", name: "Brazalete de hilo", price: 1.5, category: "pulseras", stock: 15, featured: true, foto: "mtk-pu-002.webp",
    description: "Brazalete tejido en hilo, resistente al agua y al uso diario. Se puede pedir en tu combinación de colores." },
  { sku: "MTK-PU-003", name: "Brazalete de hilo con diseño", price: 2.5, category: "pulseras", stock: 10, featured: true, foto: "mtk-pu-003.webp",
    description: "Brazalete de hilo con patrón tejido a mano. Cada diseño se arma puntada por puntada, así que no hay dos iguales." },
  { sku: "MTK-PU-004", name: "Pulsera de perlas", price: 1.5, category: "pulseras", stock: 12, featured: true, foto: "mtk-pu-004.webp",
    description: "Pulsera de perlas montada a mano en hilo resistente. Sencilla, elegante y fácil de combinar con otras pulseras." },
  { sku: "MTK-PU-005", name: "Pulsera de perlas con diseño", price: 2.0, category: "pulseras", stock: 10, featured: true, foto: "mtk-pu-005.webp",
    description: "Pulsera de perlas con patrón trabajado a mano. Un paso más de detalle sobre la versión clásica, por muy poca diferencia." },
  { sku: "MTK-CO-001", name: "Collar de perlas con inicial dorada", price: 7.5, category: "collares", stock: 5, featured: true, isNew: true, foto: "mtk-co-001.webp",
    description: "Collar de perlas con la inicial que elijas en dorado. Es nuestro regalo personalizado más pedido: decinos la letra al hacer el pedido." },
  { sku: "MTK-CO-002", name: "Collar de perlas e hilo nilon", price: 5.0, category: "collares", stock: 6, foto: "mtk-co-002.webp",
    description: "Collar de perlas montado en hilo de nilón, casi invisible, para que las perlas parezcan flotar sobre la piel." },
];


/**
 * Productos de las páginas 4 y 5 del Canva de Bisutería, que en la primera
 * extracción no se habían renderizado. Precios leídos directamente del diseño.
 */
export const BISUTERIA_EXTRA: ProductoMautik[] = [
  { sku: "MTK-PU-006", name: "Pulseras de perlas con diseños", price: 3.5, category: "pulseras", stock: 8, featured: true, foto: "mtk-pu-006.webp",
    description: "Pulseras de perlas con flores hechas cuenta por cuenta. Se pueden pedir en la combinación de colores que quieras." },
  { sku: "MTK-PU-007", name: "Pulsera de hilo con ojo turco", price: 3.5, category: "pulseras", stock: 10, featured: true, foto: "mtk-pu-007.webp",
    description: "Pulsera de hilo tejida a mano con el ojo turco al centro, el amuleto de protección. Cierre ajustable." },
  { sku: "MTK-PU-008", name: "Pulsera de perlas con alambre bañado en oro", price: 5.0, category: "pulseras", stock: 5, featured: true, foto: "mtk-pu-008.webp",
    description: "Perlas engarzadas una por una con alambre bañado en oro. La pieza más trabajada de la línea de pulseras." },
  { sku: "MTK-PU-009", name: "Par de Pulseras de hilo", price: 3.75, category: "pulseras", stock: 6, featured: true, foto: "mtk-pu-009.webp",
    description: "Par de pulseras de hilo con las iniciales que elijas: una para cada quien. El regalo clásico entre amigas o parejas." },
  { sku: "MTK-PU-010", name: "Pulseras de hilo", price: 3.0, category: "pulseras", stock: 12, featured: true, foto: "mtk-pu-010.webp",
    description: "Pulseras de hilo tejidas a mano en los colores que pidas. Resisten el agua y el uso diario." },
  { sku: "MTK-PU-011", name: "Pulsera de hilo con perla", price: 3.5, category: "pulseras", stock: 8, featured: true, foto: "mtk-pu-011.webp",
    description: "Pulsera de hilo con una perla al centro. Sencilla de llevar y fácil de combinar con otras." },
  { sku: "MTK-CO-003", name: "Chocker de hilo", price: 3.5, category: "collares", stock: 6, featured: true, foto: "mtk-co-003.webp",
    description: "Chocker tejido en hilo, ajustable al cuello. Vuelve a estar en todas partes y este es hecho a mano." },
  { sku: "MTK-AN-003", name: "Anillos con diseños", price: 1.5, category: "anillos", stock: 12, featured: true, foto: "mtk-an-003.webp",
    description: "Anillos de metal con diseños trabajados: flor de loto, filigrana y piedra negra. Cada uno tiene su propio dibujo, así que se pueden combinar de a varios en la misma mano." },
  { sku: "MTK-AN-004", name: "Anillos con diseño sencillo", price: 1.0, category: "anillos", stock: 15, featured: true, foto: "mtk-an-004.webp",
    description: "Anillos de metal con un dibujo más simple, para llevar solos o de a dos. La versión más discreta de la línea de anillos." },
];

export const CATALOGO: ProductoMautik[] = [...TEJIDOS, ...BISUTERIA, ...BISUTERIA_EXTRA];

export default CATALOGO;
