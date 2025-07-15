export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	originalPrice?: number;
	category: string;
	images: string[];
	stock: number;
	rating?: number;
	reviewCount?: number;
	featured?: boolean;
	isNew?: boolean;
	discount?: number;
	attributes?: { name: string; value: string }[];
	details?: { name: string; value: string }[];
	sku?: string;
}
