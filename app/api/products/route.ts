import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { exigirAdmin } from '@/lib/solo-admin';

// GET - Obtener productos
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const category = searchParams.get('category');
		const search = searchParams.get('search');
		const limit = parseInt(searchParams.get('limit') || '50');
		const offset = parseInt(searchParams.get('offset') || '0');
		const sortBy = searchParams.get('sortBy') || 'createdAt';
		const sortOrder = searchParams.get('sortOrder') || 'desc';
		const minPrice = searchParams.get('minPrice');
		const maxPrice = searchParams.get('maxPrice');
		const inStock = searchParams.get('inStock') === 'true';
		const featured = searchParams.get('featured') === 'true';
		const isNew = searchParams.get('isNew') === 'true';

		// Construir filtros
		const where: any = {};

		if (category) {
			where.category = {
				equals: category,
				mode: 'insensitive',
			};
		}

		if (search) {
			where.OR = [
				{
					name: {
						contains: search,
						mode: 'insensitive',
					},
				},
				{
					description: {
						contains: search,
						mode: 'insensitive',
					},
				},
			];
		}

		if (minPrice || maxPrice) {
			where.price = {};
			if (minPrice) where.price.gte = parseFloat(minPrice);
			if (maxPrice) where.price.lte = parseFloat(maxPrice);
		}

		if (inStock) {
			where.stock = {
				gt: 0,
			};
		}

		if (featured) {
			where.featured = true;
		}

		/*
		  Los productos ocultos no salen en la tienda.

		  El panel puede pedirlos con `?incluirOcultos=1` (es la única forma de
		  poder volver a mostrarlos). Esa vista NO abre un agujero: solo cambia
		  qué filas se listan, y la ficha individual sigue devolviendo 404 para
		  un producto oculto a quien no sea administradora.
		*/
		const incluirOcultos = searchParams.get('incluirOcultos') === '1';
		if (!incluirOcultos) {
			where.visible = true;
		}

		if (isNew) {
			where.isNew = true;
		}

		/*
		 * Ordenamiento con lista blanca.
		 *
		 * Antes era `orderBy[sortBy] = sortOrder` con lo que viniera en la
		 * URL: cualquier campo inexistente hacía que Prisma tirara y la API
		 * devolviera 500. Pasó de verdad — un componente pedía
		 * `?sortBy=totalReviews` después de que las reseñas salieron de la
		 * base, y la ficha de producto registraba un 500 en cada carga.
		 * Siendo un endpoint público, cualquiera podía provocarlo a mano.
		 */
		const CAMPOS_ORDENABLES = [
			'createdAt',
			'updatedAt',
			'price',
			'name',
			'stock',
			'discount',
		] as const;

		const campo = (CAMPOS_ORDENABLES as readonly string[]).includes(sortBy)
			? sortBy
			: 'createdAt';
		const sentido = sortOrder === 'asc' ? 'asc' : 'desc';

		const orderBy: any = { [campo]: sentido };

		// Las reseñas se quitaron de la tienda (era una función que no se usaba
		// y complicaba la app). Con eso desapareció también el `include` de
		// reviews, que traía una fila por reseña de cada producto en cada
		// llamada al catálogo.
		const products = await prisma.product.findMany({
			where,
			orderBy,
			take: limit,
			skip: offset,
		});

		const productosListos = products.map((product) => {
			return {
				id: product.id,
				name: product.name,
				description: product.description,
				price: product.price,
				originalPrice: product.originalPrice,
				stock: product.stock,
				images: product.images,
				category: product.category,
				sku: product.sku,
				featured: product.featured,
				isNew: product.isNew,
				visible: product.visible,
				discount: product.discount,
				createdAt: product.createdAt,
				updatedAt: product.updatedAt,
			};
		});

		return NextResponse.json(productosListos, {
			headers: {
				/*
				 * Vercel consume `s-maxage` y `stale-while-revalidate` en el edge y
				 * al navegador le llega solo `public`, que por heurística puede
				 * cachearse un rato largo: un cliente que vuelve podía ver stock o
				 * precios viejos. Verificado en producción (llegaba `cache-control:
				 * public` pelado).
				 *
				 * `max-age=0, must-revalidate` obliga al navegador a preguntar
				 * siempre, mientras el edge sirve su copia 1 min y hasta 5
				 * revalidando en segundo plano.
				 *
				 * Estuvo en 5 min / 1 h y era demasiado: al corregir una
				 * descripción en la base, el edge seguía sirviendo la vieja
				 * (verificado, `x-vercel-cache: HIT` con el texto anterior).
				 * Un minuto ya le ahorra la base a casi todo el tráfico.
				 *
				 * `stale-while-revalidate` largo (1 h) a propósito: desde que
				 * se quitó el cron de keepalive, la base de Neon duerme cuando
				 * no hay nadie. Con esto, mientras despierta —o si tiene un
				 * mal momento— el edge sigue sirviendo el catálogo en vez de
				 * mostrar la tienda vacía. Revalida en segundo plano.
				 *
				 * Para el stock no hay riesgo en ningún caso: el checkout
				 * relee stock y precios de la base en `calcularTotales`, así
				 * que un catálogo algo viejo no puede vender de más.
				 */
				'Cache-Control':
					'public, max-age=0, must-revalidate, s-maxage=60, stale-while-revalidate=3600',
			},
		});
	} catch (error: any) {
		console.error('Error fetching products:', error);
		// Igual que en la ficha: un fallo de base no es "no hay productos".
		const mensaje = String(error?.message || '');
		const baseCaida =
			mensaje.includes('compute time quota') ||
			mensaje.includes("Can't reach database") ||
			error?.name === 'PrismaClientInitializationError';
		return NextResponse.json(
			{
				error: baseCaida
					? 'La tienda está con un problema técnico. Vuelve en un momento.'
					: 'Error al obtener productos',
				baseCaida,
			},
			{ status: baseCaida ? 503 : 500 },
		);
	}
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
	// Crear productos es solo para la administración.
	const noPuede = await exigirAdmin(request);
	if (noPuede) return noPuede;

	try {
		const body = await request.json();
		const {
			name,
			description,
			price,
			originalPrice,
			stock,
			images,
			category,
			sku,
			featured = false,
			isNew = false,
			discount = 0,
		} = body;

		// Validaciones
		if (!name || !description || !price || !stock || !category || !sku) {
			return NextResponse.json(
				{ error: 'Todos los campos obligatorios deben estar presentes' },
				{ status: 400 },
			);
		}

		if (price <= 0) {
			return NextResponse.json(
				{ error: 'El precio debe ser mayor a 0' },
				{ status: 400 },
			);
		}

		if (stock < 0) {
			return NextResponse.json(
				{ error: 'El stock no puede ser negativo' },
				{ status: 400 },
			);
		}

		if (discount < 0 || discount > 100) {
			return NextResponse.json(
				{ error: 'El descuento debe estar entre 0 y 100' },
				{ status: 400 },
			);
		}

		// Verificar si el SKU ya existe
		const existingProduct = await prisma.product.findUnique({
			where: { sku },
		});

		if (existingProduct) {
			return NextResponse.json({ error: 'El SKU ya existe' }, { status: 400 });
		}

		// Crear producto
		const product = await prisma.product.create({
			data: {
				name,
				description,
				price: parseFloat(price),
				originalPrice: originalPrice ? parseFloat(originalPrice) : null,
				stock: parseInt(stock),
				images: Array.isArray(images) ? images : [],
				category,
				sku,
				featured,
				isNew,
				discount: parseInt(discount),
			},
		});

		return NextResponse.json(product, { status: 201 });
	} catch (error) {
		console.error('Error creating product:', error);
		return NextResponse.json(
			{ error: 'Error al crear producto' },
			{ status: 500 },
		);
	}
}
