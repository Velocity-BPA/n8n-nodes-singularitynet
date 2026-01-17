/**
 * Service Utilities
 *
 * Handles service metadata parsing, URI formatting, and
 * other service-related helper functions.
 */

/**
 * Service metadata structure
 */
export interface ServiceMetadata {
	version: number;
	displayName: string;
	encoding: string;
	serviceType: string;
	modelIpfsHash: string;
	mpeAddress: string;
	groups: ServiceGroup[];
	serviceDescription: ServiceDescription;
	media: ServiceMedia[];
	contributors: Contributor[];
	tags: string[];
}

/**
 * Service group configuration
 */
export interface ServiceGroup {
	groupName: string;
	groupId: string;
	paymentAddress: string;
	endpoints: ServiceEndpoint[];
	pricing: PricingInfo[];
	freeCalls: number;
	freeCallSignerAddress: string;
}

/**
 * Service endpoint
 */
export interface ServiceEndpoint {
	endpointUri: string;
	isAvailable: boolean;
	lastCheckTime?: number;
}

/**
 * Pricing information
 */
export interface PricingInfo {
	default: boolean;
	priceModel: 'fixed_price' | 'method_price';
	priceInCogs: string;
	pricingMatchAll?: boolean;
	details?: MethodPricing[];
}

/**
 * Method-specific pricing
 */
export interface MethodPricing {
	serviceName: string;
	methodName: string;
	priceInCogs: string;
}

/**
 * Service description
 */
export interface ServiceDescription {
	url: string;
	shortDescription: string;
	longDescription: string;
}

/**
 * Service media
 */
export interface ServiceMedia {
	order: number;
	url: string;
	fileType: 'image' | 'video';
	altText?: string;
	assetType: 'hero_image' | 'gallery' | 'thumbnail';
}

/**
 * Contributor information
 */
export interface Contributor {
	name: string;
	emailId?: string;
}

/**
 * Parse service metadata from JSON
 */
export function parseServiceMetadata(metadataJson: string): ServiceMetadata {
	const parsed = JSON.parse(metadataJson);
	return parsed as ServiceMetadata;
}

/**
 * Format service URI
 * Format: snet://{organization_id}/{service_id}
 */
export function formatServiceUri(organizationId: string, serviceId: string): string {
	return `snet://${organizationId}/${serviceId}`;
}

/**
 * Parse service URI
 */
export function parseServiceUri(
	uri: string
): { organizationId: string; serviceId: string } | null {
	const match = uri.match(/^snet:\/\/([^/]+)\/([^/]+)$/);
	if (!match) return null;
	return {
		organizationId: match[1],
		serviceId: match[2],
	};
}

/**
 * Get default endpoint for a service group
 */
export function getDefaultEndpoint(group: ServiceGroup): string | null {
	const available = group.endpoints.find((ep) => ep.isAvailable);
	return available?.endpointUri || group.endpoints[0]?.endpointUri || null;
}

/**
 * Get default pricing for a service
 */
export function getDefaultPricing(group: ServiceGroup): PricingInfo | null {
	return group.pricing.find((p) => p.default) || group.pricing[0] || null;
}

/**
 * Get price for a specific method
 */
export function getMethodPrice(
	group: ServiceGroup,
	serviceName: string,
	methodName: string
): string {
	const pricing = getDefaultPricing(group);
	if (!pricing) return '0';

	if (pricing.priceModel === 'method_price' && pricing.details) {
		const methodPricing = pricing.details.find(
			(d) => d.serviceName === serviceName && d.methodName === methodName
		);
		if (methodPricing) return methodPricing.priceInCogs;
	}

	return pricing.priceInCogs;
}

/**
 * Check if service has free calls available
 */
export function hasFreeCalls(group: ServiceGroup): boolean {
	return group.freeCalls > 0 && !!group.freeCallSignerAddress;
}

/**
 * Get IPFS URL for a hash
 */
export function getIpfsUrl(hash: string, gateway: string = 'https://ipfs.singularitynet.io/ipfs/'): string {
	// Remove ipfs:// prefix if present
	const cleanHash = hash.replace(/^ipfs:\/\//, '').replace(/^Qm/, '');
	const finalHash = hash.includes('Qm') ? hash.replace(/^ipfs:\/\//, '') : `Qm${cleanHash}`;
	return `${gateway}${finalHash}`;
}

/**
 * Validate organization ID format
 */
export function isValidOrganizationId(orgId: string): boolean {
	// Organization IDs should be lowercase alphanumeric with hyphens
	return /^[a-z0-9-]+$/.test(orgId) && orgId.length >= 2 && orgId.length <= 64;
}

/**
 * Validate service ID format
 */
export function isValidServiceId(serviceId: string): boolean {
	// Service IDs should be lowercase alphanumeric with hyphens
	return /^[a-z0-9-]+$/.test(serviceId) && serviceId.length >= 2 && serviceId.length <= 64;
}

/**
 * Calculate estimated cost for service calls
 */
export function calculateEstimatedCost(
	priceInCogs: string,
	numCalls: number
): { cogs: bigint; agix: number } {
	const cogsPerCall = BigInt(priceInCogs);
	const totalCogs = cogsPerCall * BigInt(numCalls);
	const agix = Number(totalCogs) / 1e8; // 1 AGIX = 10^8 cogs

	return { cogs: totalCogs, agix };
}

/**
 * Format service display info
 */
export function formatServiceInfo(metadata: ServiceMetadata): Record<string, unknown> {
	const defaultGroup = metadata.groups[0];
	const defaultPricing = defaultGroup ? getDefaultPricing(defaultGroup) : null;

	return {
		name: metadata.displayName,
		description: metadata.serviceDescription?.shortDescription || '',
		encoding: metadata.encoding,
		type: metadata.serviceType,
		tags: metadata.tags,
		pricing: defaultPricing
			? {
					model: defaultPricing.priceModel,
					priceInCogs: defaultPricing.priceInCogs,
					priceInAgix: Number(defaultPricing.priceInCogs) / 1e8,
				}
			: null,
		freeCalls: defaultGroup?.freeCalls || 0,
		endpoints: defaultGroup?.endpoints.map((ep) => ep.endpointUri) || [],
		contributors: metadata.contributors,
		media: metadata.media,
	};
}

/**
 * Extract tags from service metadata
 */
export function extractServiceTags(metadata: ServiceMetadata): string[] {
	return metadata.tags || [];
}

/**
 * Check if endpoint is secure (HTTPS)
 */
export function isSecureEndpoint(endpoint: string): boolean {
	return endpoint.startsWith('https://');
}

/**
 * Format endpoint URL with protocol
 */
export function formatEndpointUrl(endpoint: string, useSSL: boolean = true): string {
	if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
		return endpoint;
	}
	return `${useSSL ? 'https' : 'http'}://${endpoint}`;
}

/**
 * Generate service call headers
 */
export function generateServiceHeaders(
	organizationId: string,
	serviceId: string,
	groupName: string = 'default_group'
): Record<string, string> {
	return {
		'snet-organization-id': organizationId,
		'snet-service-id': serviceId,
		'snet-service-group': groupName,
		'Content-Type': 'application/grpc-web+proto',
	};
}
