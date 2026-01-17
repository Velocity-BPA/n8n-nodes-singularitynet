/**
 * IPFS Client
 *
 * Handles IPFS operations for SingularityNET metadata storage and retrieval.
 * Service metadata, organization info, and other data are stored on IPFS.
 */

import axios, { AxiosInstance } from 'axios';

/**
 * IPFS upload result
 */
export interface IpfsUploadResult {
	hash: string;
	size: number;
	url: string;
}

/**
 * IPFS file info
 */
export interface IpfsFileInfo {
	hash: string;
	size: number;
	type: string;
}

/**
 * Default IPFS gateways
 */
export const DEFAULT_GATEWAYS = [
	'https://ipfs.singularitynet.io/ipfs/',
	'https://ipfs.io/ipfs/',
	'https://gateway.pinata.cloud/ipfs/',
	'https://cloudflare-ipfs.com/ipfs/',
];

/**
 * IPFS Client class
 */
export class IpfsClient {
	private gateway: string;
	private apiEndpoint: string | null;
	private httpClient: AxiosInstance;

	constructor(gateway: string = DEFAULT_GATEWAYS[0], apiEndpoint?: string) {
		this.gateway = gateway.endsWith('/') ? gateway : `${gateway}/`;
		this.apiEndpoint = apiEndpoint || null;

		this.httpClient = axios.create({
			timeout: 60000,
		});
	}

	/**
	 * Get content from IPFS by hash
	 */
	async get(hash: string): Promise<unknown> {
		const cleanHash = this.cleanHash(hash);
		const url = `${this.gateway}${cleanHash}`;

		try {
			const response = await this.httpClient.get(url);
			return response.data;
		} catch (error) {
			// Try fallback gateways
			for (const fallbackGateway of DEFAULT_GATEWAYS) {
				if (fallbackGateway !== this.gateway) {
					try {
						const fallbackUrl = `${fallbackGateway}${cleanHash}`;
						const response = await this.httpClient.get(fallbackUrl);
						return response.data;
					} catch {
						continue;
					}
				}
			}
			throw new Error(`Failed to fetch from IPFS: ${hash}`);
		}
	}

	/**
	 * Get raw content as string
	 */
	async getString(hash: string): Promise<string> {
		const cleanHash = this.cleanHash(hash);
		const url = `${this.gateway}${cleanHash}`;

		const response = await this.httpClient.get(url, {
			responseType: 'text',
		});
		return response.data;
	}

	/**
	 * Get content as buffer/bytes
	 */
	async getBytes(hash: string): Promise<Buffer> {
		const cleanHash = this.cleanHash(hash);
		const url = `${this.gateway}${cleanHash}`;

		const response = await this.httpClient.get(url, {
			responseType: 'arraybuffer',
		});
		return Buffer.from(response.data);
	}

	/**
	 * Get JSON content
	 */
	async getJson<T = Record<string, unknown>>(hash: string): Promise<T> {
		const content = await this.get(hash);
		if (typeof content === 'string') {
			return JSON.parse(content) as T;
		}
		return content as T;
	}

	/**
	 * Upload content to IPFS (requires API endpoint)
	 */
	async upload(content: string | Buffer | Record<string, unknown>): Promise<IpfsUploadResult> {
		if (!this.apiEndpoint) {
			throw new Error('IPFS API endpoint not configured for uploads');
		}

		let data: string | Buffer;
		if (typeof content === 'object' && !Buffer.isBuffer(content)) {
			data = JSON.stringify(content);
		} else {
			data = content;
		}

		const formData = new FormData();
		formData.append('file', new Blob([data]));

		const response = await this.httpClient.post(`${this.apiEndpoint}/api/v0/add`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});

		const result = response.data;
		return {
			hash: result.Hash,
			size: parseInt(result.Size, 10),
			url: `${this.gateway}${result.Hash}`,
		};
	}

	/**
	 * Upload JSON metadata
	 */
	async uploadJson(metadata: Record<string, unknown>): Promise<IpfsUploadResult> {
		return this.upload(JSON.stringify(metadata, null, 2));
	}

	/**
	 * Check if content exists on IPFS
	 */
	async exists(hash: string): Promise<boolean> {
		const cleanHash = this.cleanHash(hash);

		try {
			await this.httpClient.head(`${this.gateway}${cleanHash}`);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Get file info without downloading content
	 */
	async getInfo(hash: string): Promise<IpfsFileInfo | null> {
		const cleanHash = this.cleanHash(hash);

		try {
			const response = await this.httpClient.head(`${this.gateway}${cleanHash}`);
			return {
				hash: cleanHash,
				size: parseInt(response.headers['content-length'] || '0', 10),
				type: response.headers['content-type'] || 'application/octet-stream',
			};
		} catch {
			return null;
		}
	}

	/**
	 * Clean IPFS hash (remove prefix if present)
	 */
	private cleanHash(hash: string): string {
		// Remove ipfs:// prefix
		let cleanHash = hash.replace(/^ipfs:\/\//, '');
		// Remove /ipfs/ prefix
		cleanHash = cleanHash.replace(/^\/ipfs\//, '');
		return cleanHash;
	}

	/**
	 * Get full IPFS URL for a hash
	 */
	getUrl(hash: string): string {
		return `${this.gateway}${this.cleanHash(hash)}`;
	}

	/**
	 * Set gateway
	 */
	setGateway(gateway: string): void {
		this.gateway = gateway.endsWith('/') ? gateway : `${gateway}/`;
	}

	/**
	 * Get current gateway
	 */
	getGateway(): string {
		return this.gateway;
	}

	/**
	 * Set API endpoint
	 */
	setApiEndpoint(endpoint: string): void {
		this.apiEndpoint = endpoint;
	}

	/**
	 * Validate IPFS hash format
	 */
	static isValidHash(hash: string): boolean {
		// CIDv0 (Qm...) or CIDv1 (ba...)
		const cleanHash = hash.replace(/^ipfs:\/\//, '').replace(/^\/ipfs\//, '');
		return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cleanHash) || /^ba[a-z2-7]+$/.test(cleanHash);
	}

	/**
	 * Get service metadata from IPFS
	 */
	async getServiceMetadata(metadataUri: string): Promise<Record<string, unknown>> {
		// Handle both ipfs:// and Qm... formats
		const hash = metadataUri.replace(/^ipfs:\/\//, '');
		return this.getJson(hash);
	}

	/**
	 * Get organization metadata from IPFS
	 */
	async getOrganizationMetadata(metadataUri: string): Promise<Record<string, unknown>> {
		const hash = metadataUri.replace(/^ipfs:\/\//, '');
		return this.getJson(hash);
	}

	/**
	 * Pin content (requires API endpoint)
	 */
	async pin(hash: string): Promise<boolean> {
		if (!this.apiEndpoint) {
			throw new Error('IPFS API endpoint not configured for pinning');
		}

		const cleanHash = this.cleanHash(hash);

		try {
			await this.httpClient.post(`${this.apiEndpoint}/api/v0/pin/add`, null, {
				params: { arg: cleanHash },
			});
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Unpin content (requires API endpoint)
	 */
	async unpin(hash: string): Promise<boolean> {
		if (!this.apiEndpoint) {
			throw new Error('IPFS API endpoint not configured for unpinning');
		}

		const cleanHash = this.cleanHash(hash);

		try {
			await this.httpClient.post(`${this.apiEndpoint}/api/v0/pin/rm`, null, {
				params: { arg: cleanHash },
			});
			return true;
		} catch {
			return false;
		}
	}
}

/**
 * Create IPFS client from configuration
 */
export function createIpfsClient(gateway?: string, apiEndpoint?: string): IpfsClient {
	return new IpfsClient(gateway || DEFAULT_GATEWAYS[0], apiEndpoint);
}
