// lib/shipping.ts
export type ShippingMethod = 'personal' | 'unoexpress';

export function getAvailableShippingMethods(address: any) {
	if (!address || !address.country) return [];
	if (
		address.country === 'Panamá' &&
		address.province?.toLowerCase() === 'panamá oeste' &&
		address.city?.toLowerCase() === 'la chorrera'
	) {
		return ['personal', 'unoexpress'];
	}
	if (address.country === 'Panamá') return ['unoexpress'];
	return [];
}

export function calcularEnvioUnoExpress(address: any, peso: number) {
	// Normaliza el peso a libras
	const lbs = peso || 1;
	const destino = (address.city || address.province || '').toLowerCase();

	// Tarifas según destino
	if (
		[
			'changuinola',
			'puerto armuelles',
			'volcán',
			'almirante',
			'chiriquí grande',
			'pedasí',
			'el valle de antón',
		].includes(destino)
	) {
		return lbs <= 7 ? 8.5 : 12.5;
	}
	if (['isla colón', 'bocas del toro'].includes(destino)) {
		return lbs <= 10 ? 12.5 : 15.0;
	}
	// Resto de destinos principales
	return lbs <= 7 ? 6.5 : 8.5;
}

export function calculateShipping(
	address: any,
	products: any[],
	method: ShippingMethod,
) {
	const totalWeight = products.reduce((sum, p) => sum + (p.weight || 1), 0); // Asume 1lb si no hay peso
	if (method === 'personal') {
		// Si es La Chorrera, $1.50
		if (
			address.province?.toLowerCase() === 'panamá oeste' &&
			address.city?.toLowerCase() === 'la chorrera'
		) {
			return 1.5;
		}
		return 2; // $2 entrega personal en otras zonas
	}
	if (method === 'unoexpress')
		return calcularEnvioUnoExpress(address, totalWeight);
	return 0;
}
