/**
 * gRPC Client
 *
 * Handles gRPC/gRPC-Web communication with SingularityNET AI services.
 * Supports both unary and streaming calls.
 */

import axios, { AxiosInstance } from 'axios';

/**
 * gRPC call options
 */
export interface GrpcCallOptions {
	metadata?: Record<string, string>;
	timeout?: number;
	streaming?: boolean;
}

/**
 * gRPC call result
 */
export interface GrpcCallResult {
	success: boolean;
	data?: unknown;
	error?: string;
	statusCode?: number;
}

/**
 * Streaming callback
 */
export type StreamCallback = (data: unknown) => void;

/**
 * gRPC Client class
 *
 * Uses gRPC-Web protocol for browser/Node.js compatibility
 */
export class GrpcClient {
	private endpoint: string;
	private httpClient: AxiosInstance;

	constructor(endpoint: string, useSsl: boolean = true) {
		this.endpoint = this.normalizeEndpoint(endpoint, useSsl);
		this.httpClient = axios.create({
			baseURL: this.endpoint,
			timeout: 300000, // 5 minutes default
			headers: {
				'Content-Type': 'application/grpc-web+proto',
				Accept: 'application/grpc-web+proto',
			},
		});
	}

	/**
	 * Normalize endpoint URL
	 */
	private normalizeEndpoint(endpoint: string, useSsl: boolean): string {
		if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
			return endpoint;
		}
		return `${useSsl ? 'https' : 'http'}://${endpoint}`;
	}

	/**
	 * Make a unary gRPC call
	 */
	async call(
		method: string,
		input: Record<string, unknown>,
		options: GrpcCallOptions = {}
	): Promise<unknown> {
		const { metadata = {}, timeout = 60000 } = options;

		// Build the full method path
		const methodPath = method.startsWith('/') ? method : `/${method}`;

		// Prepare headers with metadata
		const headers: Record<string, string> = {
			'Content-Type': 'application/json', // Using JSON proxy approach
			...metadata,
		};

		// Add SingularityNET specific headers
		Object.entries(metadata).forEach(([key, value]) => {
			headers[key] = value;
		});

		try {
			const response = await this.httpClient.post(methodPath, input, {
				headers,
				timeout,
			});

			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(
					`gRPC call failed: ${error.response?.data?.message || error.message}`
				);
			}
			throw error;
		}
	}

	/**
	 * Make a streaming gRPC call (server-side streaming)
	 */
	async stream(
		method: string,
		input: Record<string, unknown>,
		callback: StreamCallback,
		options: GrpcCallOptions = {}
	): Promise<void> {
		const { metadata = {}, timeout = 300000 } = options;
		const methodPath = method.startsWith('/') ? method : `/${method}`;

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			Accept: 'text/event-stream',
			...metadata,
		};

		try {
			const response = await this.httpClient.post(methodPath, input, {
				headers,
				timeout,
				responseType: 'stream',
			});

			// Process streamed responses
			response.data.on('data', (chunk: Buffer) => {
				try {
					const text = chunk.toString();
					// Handle potential multiple JSON objects in stream
					const lines = text.split('\n').filter((line: string) => line.trim());
					for (const line of lines) {
						try {
							const data = JSON.parse(line);
							callback(data);
						} catch {
							// Not JSON, might be raw data
							callback({ raw: line });
						}
					}
				} catch (err) {
					callback({ error: 'Failed to parse stream data' });
				}
			});

			return new Promise((resolve, reject) => {
				response.data.on('end', () => resolve());
				response.data.on('error', (err: Error) => reject(err));
			});
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(
					`gRPC stream failed: ${error.response?.data?.message || error.message}`
				);
			}
			throw error;
		}
	}

	/**
	 * Health check the service
	 */
	async healthCheck(): Promise<boolean> {
		try {
			const response = await this.httpClient.get('/health', {
				timeout: 5000,
			});
			return response.status === 200;
		} catch {
			return false;
		}
	}

	/**
	 * Get service endpoint
	 */
	getEndpoint(): string {
		return this.endpoint;
	}

	/**
	 * Update endpoint
	 */
	setEndpoint(endpoint: string, useSsl: boolean = true): void {
		this.endpoint = this.normalizeEndpoint(endpoint, useSsl);
		this.httpClient.defaults.baseURL = this.endpoint;
	}

	/**
	 * Set default timeout
	 */
	setTimeout(timeout: number): void {
		this.httpClient.defaults.timeout = timeout;
	}

	/**
	 * Add default header
	 */
	addHeader(key: string, value: string): void {
		this.httpClient.defaults.headers.common[key] = value;
	}

	/**
	 * Remove default header
	 */
	removeHeader(key: string): void {
		delete this.httpClient.defaults.headers.common[key];
	}

	/**
	 * Create payment metadata for gRPC calls
	 */
	static createPaymentMetadata(
		channelId: number,
		nonce: number,
		amount: bigint,
		signature: string
	): Record<string, string> {
		return {
			'snet-payment-type': 'escrow',
			'snet-payment-channel-id': channelId.toString(),
			'snet-payment-channel-nonce': nonce.toString(),
			'snet-payment-channel-amount': amount.toString(),
			'snet-payment-channel-signature-bin': Buffer.from(signature.slice(2), 'hex').toString('base64'),
		};
	}

	/**
	 * Create free call metadata for gRPC calls
	 */
	static createFreeCallMetadata(
		userId: string,
		organizationId: string,
		serviceId: string,
		token: string,
		blockNumber: number
	): Record<string, string> {
		return {
			'snet-payment-type': 'free-call',
			'snet-free-call-user-id': userId,
			'snet-current-block-number': blockNumber.toString(),
			'snet-free-call-auth-token-bin': token,
			'snet-payment-channel-signature-bin': '',
		};
	}
}

/**
 * Create gRPC client for a service endpoint
 */
export function createGrpcClient(endpoint: string, useSsl: boolean = true): GrpcClient {
	return new GrpcClient(endpoint, useSsl);
}
