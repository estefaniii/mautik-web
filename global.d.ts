declare module 'jsonwebtoken';
declare module 'world-countries-capitals';
declare module 'country-region-data/dist/data-umd' {
	// [countryName, countryShortCode, regions[]]
	const value: [string, string, [string, string, string[]?][]][];
	export default value;
}
