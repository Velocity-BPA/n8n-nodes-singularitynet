/**
 * Platform API Client
 *
 * Handles interactions with the SingularityNET Marketplace API
 * for service discovery, organization management, and more.
 */

import axios, { AxiosInstance } from 'axios';

/**
 * Platform API configuration
 */
export interface PlatformApiConfig {
	environment: string;
	customEndpoint?: string;
	apiKey?: string;
	identityAddress?: string;
	userToken?: string;
}

/**
 * Service listing item
 */
export interface ServiceListItem {
	org_id: string;
	service_id: string;
	display_name: string;
	short_description: string;
	media: Array<{
		url: string;
		file_type: string;
		asset_type: string;
	}>;
	tags: string[];
	ranking: number;
	total_users_rated: number;
	service_rating: {
		rating: number;
		total_users_rated: number;
	};
}

/**
 * Organization info
 */
export interface OrganizationInfo {
	org_id: string;
	org_name: string;
	owner_address: string;
	org_type: string;
	description: string;
	contacts: Array<{
		contact_type: string;
		email_id?: string;
		phone?: string;
	}>;
	assets: {
		hero_image?: string;
	};
	groups: Array<{
		group_id: string;
		group_name: string;
		payment_address: string;
	}>;
}

/**
 * Service details
 */
export interface ServiceDetails {
	org_id: string;
	service_id: string;
	display_name: string;
	service_description: {
		url: string;
		short_description: string;
		description: string;
	};
	media: Array<{
		url: string;
		file_type: string;
		asset_type: string;
		alt_text?: string;
	}>;
	tags: string[];
	mpe_address: string;
	metadata_ipfs_hash: string;
	groups: Array<{
		group_id: string;
		group_name: string;
		pricing: Array<{
			default: boolean;
			price_model: string;
			price_in_cogs: string;
		}>;
		endpoints: string[];
		free_calls: number;
		free_call_signer_address: string;
	}>;
	service_rating: {
		rating: number;
		total_users_rated: number;
	};
	contributors: Array<{
		name: string;
		email_id?: string;
	}>;
}

/**
 * Platform API endpoints
 */
const API_ENDPOINTS = {
	production: 'https://marketplace-api.singularitynet.io',
	staging: 'https://marketplace-api-staging.singularitynet.io',
};

/**
 * Platform API Client class
 */
export class PlatformApi {
	private httpClient: AxiosInstance;
	private baseUrl: string;

	constructor(config: PlatformApiConfig) {
		this.baseUrl = this.getBaseUrl(config);

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};

		if (config.apiKey) {
			headers.Authorization = `Bearer ${config.apiKey}`;
		}

		if (config.identityAddress) {
			headers['X-Identity-Address'] = config.identityAddress;
		}

		if (config.userToken) {
			headers['X-User-Token'] = config.userToken;
		}

		this.httpClient = axios.create({
			baseURL: this.baseUrl,
			headers,
			timeout: 30000,
		});
	}

	/**
	 * Get base URL from config
	 */
	private getBaseUrl(config: PlatformApiConfig): string {
		if (config.environment === 'custom' && config.customEndpoint) {
			return config.customEndpoint;
		}
		return API_ENDPOINTS[config.environment as keyof typeof API_ENDPOINTS] || API_ENDPOINTS.production;
	}

	/**
	 * Get all organizations
	 */
	async getOrganizations(): Promise<OrganizationInfo[]> {
		const response = await this.httpClient.get('/org');
		return response.data.data || [];
	}

	/**
	 * Get organization by ID
	 */
	async getOrganization(orgId: string): Promise<OrganizationInfo> {
		const response = await this.httpClient.get(`/org/${orgId}`);
		return response.data.data;
	}

	/**
	 * Get organization's services
	 */
	async getOrganizationServices(orgId: string): Promise<ServiceListItem[]> {
		const response = await this.httpClient.get(`/org/${orgId}/service`);
		return response.data.data || [];
	}

	/**
	 * Get all services
	 */
	async getServices(params?: {
		limit?: number;
		offset?: number;
		q?: string;
		s?: string;
		tags?: string[];
	}): Promise<{ services: ServiceListItem[]; total_count: number }> {
		const response = await this.httpClient.get('/service', { params });
		return {
			services: response.data.data || [],
			total_count: response.data.total_count || 0,
		};
	}

	/**
	 * Get service details
	 */
	async getService(orgId: string, serviceId: string): Promise<ServiceDetails> {
		const response = await this.httpClient.get(`/org/${orgId}/service/${serviceId}`);
		return response.data.data;
	}

	/**
	 * Search services
	 */
	async searchServices(query: string, limit: number = 20): Promise<ServiceListItem[]> {
		const response = await this.httpClient.get('/service', {
			params: { q: query, limit },
		});
		return response.data.data || [];
	}

	/**
	 * Get services by tag
	 */
	async getServicesByTag(tag: string): Promise<ServiceListItem[]> {
		const response = await this.httpClient.get('/service', {
			params: { tags: [tag] },
		});
		return response.data.data || [];
	}

	/**
	 * Get featured services
	 */
	async getFeaturedServices(): Promise<ServiceListItem[]> {
		const response = await this.httpClient.get('/service/featured');
		return response.data.data || [];
	}

	/**
	 * Get popular services
	 */
	async getPopularServices(limit: number = 10): Promise<ServiceListItem[]> {
		const response = await this.httpClient.get('/service', {
			params: { s: 'ranking', order: 'desc', limit },
		});
		return response.data.data || [];
	}

	/**
	 * Get new services
	 */
	async getNewServices(limit: number = 10): Promise<ServiceListItem[]> {
		const response = await this.httpClient.get('/service', {
			params: { s: 'created_at', order: 'desc', limit },
		});
		return response.data.data || [];
	}

	/**
	 * Get service categories
	 */
	async getCategories(): Promise<Array<{ name: string; count: number }>> {
		const response = await this.httpClient.get('/service/tags');
		return response.data.data || [];
	}

	/**
	 * Get service rating
	 */
	async getServiceRating(
		orgId: string,
		serviceId: string
	): Promise<{ rating: number; total_users_rated: number }> {
		const service = await this.getService(orgId, serviceId);
		return service.service_rating;
	}

	/**
	 * Submit service review (requires authentication)
	 */
	async submitReview(
		orgId: string,
		serviceId: string,
		rating: number,
		comment: string
	): Promise<void> {
		await this.httpClient.post(`/org/${orgId}/service/${serviceId}/feedback`, {
			rating,
			comment,
		});
	}

	/**
	 * Get service reviews
	 */
	async getServiceReviews(
		orgId: string,
		serviceId: string
	): Promise<Array<{ user_address: string; rating: number; comment: string; created_at: string }>> {
		const response = await this.httpClient.get(`/org/${orgId}/service/${serviceId}/feedback`);
		return response.data.data || [];
	}

	/**
	 * Get free call info
	 */
	async getFreeCallInfo(
		orgId: string,
		serviceId: string,
		userAddress: string
	): Promise<{ free_calls_remaining: number; total_free_calls: number }> {
		const response = await this.httpClient.get(`/org/${orgId}/service/${serviceId}/free-call`, {
			params: { user_address: userAddress },
		});
		return response.data.data;
	}

	/**
	 * Register free call usage
	 */
	async registerFreeCall(
		orgId: string,
		serviceId: string,
		userAddress: string,
		signature: string,
		currentBlock: number
	): Promise<{ token: string }> {
		const response = await this.httpClient.post(`/org/${orgId}/service/${serviceId}/free-call`, {
			user_address: userAddress,
			signature,
			current_block_number: currentBlock,
		});
		return response.data.data;
	}

	/**
	 * Get user profile
	 */
	async getUserProfile(address: string): Promise<Record<string, unknown>> {
		const response = await this.httpClient.get(`/user/${address}`);
		return response.data.data;
	}

	/**
	 * Get user's service usage
	 */
	async getUserUsage(address: string): Promise<Array<{
		org_id: string;
		service_id: string;
		usage_count: number;
		last_used: string;
	}>> {
		const response = await this.httpClient.get(`/user/${address}/usage`);
		return response.data.data || [];
	}

	/**
	 * Health check
	 */
	async healthCheck(): Promise<boolean> {
		try {
			const response = await this.httpClient.get('/health');
			return response.status === 200;
		} catch {
			return false;
		}
	}

	/**
	 * Get current API base URL
	 */
	getCurrentBaseUrl(): string {
		return this.baseUrl;
	}
}

/**
 * Create Platform API client from n8n credentials
 */
export function createPlatformApi(credentials: Record<string, unknown>): PlatformApi {
	const config: PlatformApiConfig = {
		environment: (credentials.environment as string) || 'production',
		customEndpoint: credentials.customEndpoint as string | undefined,
		apiKey: credentials.apiKey as string | undefined,
		identityAddress: credentials.identityAddress as string | undefined,
		userToken: credentials.userToken as string | undefined,
	};

	return new PlatformApi(config);
}
