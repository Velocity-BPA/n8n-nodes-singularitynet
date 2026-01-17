/**
 * SingularityNET SDK Wrapper
 *
 * Provides a unified interface for interacting with the SingularityNET
 * platform, combining blockchain operations with platform APIs.
 */

import { EthereumClient, createEthereumClient } from './ethereumClient';
import { CardanoClient, createCardanoClient } from './cardanoClient';
import { PlatformApi, createPlatformApi } from './platformApi';
import { GrpcClient } from './grpcClient';
import { IpfsClient, createIpfsClient } from './ipfsClient';
import { isEthereumNetwork, isCardanoNetwork } from '../constants/networks';

/**
 * SDK configuration
 */
export interface SnetSdkConfig {
	networkCredentials: Record<string, unknown>;
	platformCredentials?: Record<string, unknown>;
	serviceCredentials?: Record<string, unknown>;
}

/**
 * Service call options
 */
export interface ServiceCallOptions {
	method: string;
	input: Record<string, unknown>;
	timeout?: number;
	useFreeCall?: boolean;
}

/**
 * Service call result
 */
export interface ServiceCallResult {
	success: boolean;
	output?: Record<string, unknown>;
	error?: string;
	executionTime?: number;
	channelId?: number;
	amountUsed?: bigint;
}

/**
 * SingularityNET SDK class
 */
export class SnetSdk {
	private ethereumClient: EthereumClient | null = null;
	private cardanoClient: CardanoClient | null = null;
	private platformApi: PlatformApi | null = null;
	private ipfsClient: IpfsClient | null = null;
	private grpcClients: Map<string, GrpcClient> = new Map();

	constructor(private config: SnetSdkConfig) {
		this.initialize();
	}

	/**
	 * Initialize SDK components
	 */
	private initialize(): void {
		const network = this.config.networkCredentials.network as string;

		// Initialize blockchain client based on network
		if (isEthereumNetwork(network)) {
			this.ethereumClient = createEthereumClient(this.config.networkCredentials);
		} else if (isCardanoNetwork(network)) {
			this.cardanoClient = createCardanoClient(this.config.networkCredentials);
		}

		// Initialize platform API if credentials provided
		if (this.config.platformCredentials) {
			this.platformApi = createPlatformApi(this.config.platformCredentials);
		}

		// Initialize IPFS client
		const ipfsGateway = this.config.networkCredentials.ipfsGateway as string | undefined;
		this.ipfsClient = createIpfsClient(ipfsGateway);
	}

	/**
	 * Get Ethereum client
	 */
	getEthereumClient(): EthereumClient {
		if (!this.ethereumClient) {
			throw new Error('Ethereum client not initialized. Use Ethereum network.');
		}
		return this.ethereumClient;
	}

	/**
	 * Get Cardano client
	 */
	getCardanoClient(): CardanoClient {
		if (!this.cardanoClient) {
			throw new Error('Cardano client not initialized. Use Cardano network.');
		}
		return this.cardanoClient;
	}

	/**
	 * Get Platform API client
	 */
	getPlatformApi(): PlatformApi {
		if (!this.platformApi) {
			throw new Error('Platform API not initialized. Provide platform credentials.');
		}
		return this.platformApi;
	}

	/**
	 * Get IPFS client
	 */
	getIpfsClient(): IpfsClient {
		if (!this.ipfsClient) {
			throw new Error('IPFS client not initialized.');
		}
		return this.ipfsClient;
	}

	/**
	 * Get or create gRPC client for a service
	 */
	getGrpcClient(endpoint: string): GrpcClient {
		let client = this.grpcClients.get(endpoint);
		if (!client) {
			client = new GrpcClient(endpoint);
			this.grpcClients.set(endpoint, client);
		}
		return client;
	}

	/**
	 * Get wallet address
	 */
	getAddress(): string {
		if (this.ethereumClient) {
			return this.ethereumClient.getAddress();
		}
		throw new Error('No wallet configured');
	}

	/**
	 * Get AGIX balance (Ethereum or Cardano)
	 */
	async getAgixBalance(address?: string): Promise<bigint> {
		if (this.ethereumClient) {
			return this.ethereumClient.getAgixBalance(address);
		} else if (this.cardanoClient && address) {
			return this.cardanoClient.getAgixBalance(address);
		}
		throw new Error('No blockchain client available');
	}

	/**
	 * Get escrow balance (Ethereum only)
	 */
	async getEscrowBalance(address?: string): Promise<bigint> {
		const ethClient = this.getEthereumClient();
		return ethClient.getEscrowBalance(address);
	}

	/**
	 * Deposit AGIX to escrow (Ethereum only)
	 */
	async depositToEscrow(amount: bigint): Promise<{ hash: string; status: string }> {
		const ethClient = this.getEthereumClient();
		const result = await ethClient.depositToEscrow(amount);
		return { hash: result.hash, status: result.status };
	}

	/**
	 * Withdraw AGIX from escrow (Ethereum only)
	 */
	async withdrawFromEscrow(amount: bigint): Promise<{ hash: string; status: string }> {
		const ethClient = this.getEthereumClient();
		const result = await ethClient.withdrawFromEscrow(amount);
		return { hash: result.hash, status: result.status };
	}

	/**
	 * Open payment channel
	 */
	async openChannel(
		recipient: string,
		groupId: string,
		amount: bigint,
		expirationBlocks: number
	): Promise<{ channelId: number; hash: string }> {
		const ethClient = this.getEthereumClient();
		const currentBlock = await ethClient.getCurrentBlock();
		const expiration = currentBlock + expirationBlocks;

		const result = await ethClient.openChannel(recipient, groupId, amount, expiration);
		return { channelId: result.channelId, hash: result.tx.hash };
	}

	/**
	 * Get service metadata from IPFS
	 */
	async getServiceMetadata(
		organizationId: string,
		serviceId: string
	): Promise<Record<string, unknown>> {
		const platformApi = this.getPlatformApi();
		const service = await platformApi.getService(organizationId, serviceId);
		return service as unknown as Record<string, unknown>;
	}

	/**
	 * Call an AI service
	 */
	async callService(
		organizationId: string,
		serviceId: string,
		options: ServiceCallOptions
	): Promise<ServiceCallResult> {
		const startTime = Date.now();

		try {
			// Get service info
			const serviceInfo = await this.getServiceMetadata(organizationId, serviceId);
			const endpoint = serviceInfo.endpoint as string;

			// Create gRPC client
			const grpcClient = this.getGrpcClient(endpoint);

			// Prepare payment (if not free call)
			let paymentMetadata: Record<string, string> = {};
			if (!options.useFreeCall) {
				// Would need to get channel and create payment signature
				// Simplified for now
			}

			// Call service
			const response = await grpcClient.call(options.method, options.input, {
				metadata: paymentMetadata,
				timeout: options.timeout,
			});

			return {
				success: true,
				output: response as Record<string, unknown>,
				executionTime: Date.now() - startTime,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				executionTime: Date.now() - startTime,
			};
		}
	}

	/**
	 * Check if network is Ethereum
	 */
	isEthereumNetwork(): boolean {
		return this.ethereumClient !== null;
	}

	/**
	 * Check if network is Cardano
	 */
	isCardanoNetwork(): boolean {
		return this.cardanoClient !== null;
	}

	/**
	 * Get current block number
	 */
	async getCurrentBlock(): Promise<number> {
		if (this.ethereumClient) {
			return this.ethereumClient.getCurrentBlock();
		} else if (this.cardanoClient) {
			return this.cardanoClient.getCurrentSlot();
		}
		throw new Error('No blockchain client available');
	}
}

/**
 * Create SDK instance from n8n credentials
 */
export function createSnetSdk(
	networkCredentials: Record<string, unknown>,
	platformCredentials?: Record<string, unknown>,
	serviceCredentials?: Record<string, unknown>
): SnetSdk {
	return new SnetSdk({
		networkCredentials,
		platformCredentials,
		serviceCredentials,
	});
}
