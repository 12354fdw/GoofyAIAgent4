const SI_PREFIXES = [
	{ value: 1e24, symbol: "Y" },
	{ value: 1e21, symbol: "Z" },
	{ value: 1e18, symbol: "E" },
	{ value: 1e15, symbol: "P" },
	{ value: 1e12, symbol: "T" },
	{ value: 1e9, symbol: "G" },
	{ value: 1e6, symbol: "M" },
	{ value: 1e3, symbol: "k" },
	{ value: 1, symbol: "" },
	{ value: 1e-3, symbol: "m" },
	{ value: 1e-6, symbol: "μ" },
	{ value: 1e-9, symbol: "n" },
	{ value: 1e-12, symbol: "p" },
	{ value: 1e-15, symbol: "f" },
	{ value: 1e-18, symbol: "a" },
	{ value: 1e-21, symbol: "z" },
	{ value: 1e-24, symbol: "y" },
] as const;

/**
 * Formats a number to an SI-prefixed string.
 * @param num The numeric value to format.
 * @param digits The number of decimal places to include.
 */
export function formatSIPrefix(num: number, digits: number = 2): string {
	if (num === 0) return "0";

	const absNum = Math.abs(num);
	const match = SI_PREFIXES.find((prefix) => absNum >= prefix.value) || SI_PREFIXES[SI_PREFIXES.length - 1];

	const scaled = num / match.value;
	return `${parseFloat(scaled.toFixed(digits))}${match.symbol}`;
}
