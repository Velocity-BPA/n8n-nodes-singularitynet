/**
 * Unit Converter Utilities
 *
 * Handles conversion between different token units on SingularityNET.
 * AGIX uses 8 decimal places (1 AGIX = 10^8 cogs)
 * ETH uses 18 decimal places (1 ETH = 10^18 wei)
 * ADA uses 6 decimal places (1 ADA = 10^6 lovelace)
 */

import { COGS_PER_AGIX, TOKEN_DECIMALS } from '../constants/networks';

/**
 * Convert AGIX to cogs (smallest unit)
 * 1 AGIX = 100,000,000 cogs (10^8)
 */
export function agixToCogs(agix: number | string): bigint {
	const agixNum = typeof agix === 'string' ? parseFloat(agix) : agix;
	return BigInt(Math.floor(agixNum * COGS_PER_AGIX));
}

/**
 * Convert cogs to AGIX
 */
export function cogsToAgix(cogs: bigint | number | string): number {
	const cogsNum = typeof cogs === 'bigint' ? cogs : BigInt(cogs);
	return Number(cogsNum) / COGS_PER_AGIX;
}

/**
 * Convert ETH to wei
 */
export function ethToWei(eth: number | string): bigint {
	const ethNum = typeof eth === 'string' ? parseFloat(eth) : eth;
	return BigInt(Math.floor(ethNum * 1e18));
}

/**
 * Convert wei to ETH
 */
export function weiToEth(wei: bigint | number | string): number {
	const weiNum = typeof wei === 'bigint' ? wei : BigInt(wei);
	return Number(weiNum) / 1e18;
}

/**
 * Convert ADA to lovelace
 */
export function adaToLovelace(ada: number | string): bigint {
	const adaNum = typeof ada === 'string' ? parseFloat(ada) : ada;
	return BigInt(Math.floor(adaNum * 1e6));
}

/**
 * Convert lovelace to ADA
 */
export function lovelaceToAda(lovelace: bigint | number | string): number {
	const lovelaceNum = typeof lovelace === 'bigint' ? lovelace : BigInt(lovelace);
	return Number(lovelaceNum) / 1e6;
}

/**
 * Format token amount with symbol
 */
export function formatTokenAmount(
	amount: number | string,
	symbol: 'AGIX' | 'ASI' | 'ETH' | 'ADA',
	decimals: number = 4
): string {
	const num = typeof amount === 'string' ? parseFloat(amount) : amount;
	return `${num.toFixed(decimals)} ${symbol}`;
}

/**
 * Format cogs as AGIX with symbol
 */
export function formatCogsAsAgix(cogs: bigint | number | string, decimals: number = 8): string {
	const agix = cogsToAgix(cogs);
	return formatTokenAmount(agix, 'AGIX', decimals);
}

/**
 * Parse token amount string to number
 */
export function parseTokenAmount(amountStr: string): number {
	// Remove any non-numeric characters except decimal point
	const cleaned = amountStr.replace(/[^0-9.]/g, '');
	return parseFloat(cleaned) || 0;
}

/**
 * Convert between token units generically
 */
export function convertUnits(
	amount: number | string,
	fromUnit: string,
	toUnit: string
): number {
	const num = typeof amount === 'string' ? parseFloat(amount) : amount;

	// Get decimals for each unit
	const fromDecimals = getUnitDecimals(fromUnit);
	const toDecimals = getUnitDecimals(toUnit);

	// Convert to base unit then to target unit
	const baseAmount = num * Math.pow(10, fromDecimals);
	return baseAmount / Math.pow(10, toDecimals);
}

/**
 * Get decimal places for a unit
 */
function getUnitDecimals(unit: string): number {
	const unitLower = unit.toLowerCase();

	switch (unitLower) {
		case 'agix':
			return 0;
		case 'cogs':
			return TOKEN_DECIMALS.AGIX;
		case 'eth':
		case 'ether':
			return 0;
		case 'wei':
		case 'gwei':
			return unitLower === 'gwei' ? 9 : TOKEN_DECIMALS.ETH;
		case 'ada':
			return 0;
		case 'lovelace':
			return TOKEN_DECIMALS.ADA;
		case 'asi':
			return 0;
		default:
			return 0;
	}
}

/**
 * Validate token amount (non-negative, within reasonable bounds)
 */
export function validateAmount(amount: number | string): boolean {
	const num = typeof amount === 'string' ? parseFloat(amount) : amount;
	return !isNaN(num) && num >= 0 && num < Number.MAX_SAFE_INTEGER;
}

/**
 * Calculate service call cost in cogs
 */
export function calculateServiceCost(pricePerCall: number, numCalls: number = 1): bigint {
	return agixToCogs(pricePerCall * numCalls);
}

/**
 * Check if amount is sufficient for service calls
 */
export function isSufficientBalance(
	balance: bigint,
	pricePerCall: number,
	numCalls: number = 1
): boolean {
	const requiredCogs = calculateServiceCost(pricePerCall, numCalls);
	return balance >= requiredCogs;
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number | string): string {
	const n = typeof num === 'string' ? parseFloat(num) : num;
	return n.toLocaleString('en-US');
}

/**
 * Convert AGIX to ASI (post-merger conversion)
 * The exact conversion rate should be fetched from the contract
 */
export function agixToAsi(agix: number, conversionRate: number = 1): number {
	return agix * conversionRate;
}

/**
 * Convert ASI to AGIX (reverse calculation)
 */
export function asiToAgix(asi: number, conversionRate: number = 1): number {
	return asi / conversionRate;
}
