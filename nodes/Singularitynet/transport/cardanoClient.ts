/**
 * Cardano Client
 *
 * Handles Cardano blockchain interactions for SingularityNET,
 * supporting AGIX token operations on Cardano.
 */

import axios, { AxiosInstance } from 'axios';
import { getNetworkConfig, NetworkConfig } from '../constants/networks';

/**
 * Cardano client configuration
 */
export interface CardanoClientConfig {
	network: string;
	nodeUrl?: string;
	apiKey?: string;
}

/**
 * Cardano transaction result
 */
export interface CardanoTransactionResult {
	hash: string;
	block?: string;
	slot?: number;
	status: 'pending' | 'success' | 'failed';
}

/**
 * Cardano address info
 */
export interface CardanoAddressInfo {
	address: string;
	amount: CardanoAmount[];
	stake_address?: string;
	type: string;
	script: boolean;
}

/**
 * Cardano amount (ADA and native tokens)
 */
export interface CardanoAmount {
	unit: string;
	quantity: string;
}

/**
 * UTXO (Unspent Transaction Output)
 */
export interface CardanoUtxo {
	tx_hash: string;
	tx_index: number;
	output_index: number;
	amount: CardanoAmount[];
	block: string;
	data_hash?: string;
}

/**
 * Cardano Client class (using Blockfrost API)
 */
export class CardanoClient {
	private api: AxiosInstance;
	private networkConfig: NetworkConfig;
	private apiKey: string;

	// AGIX Policy ID on Cardano
	private static readonly AGIX_POLICY_ID =
		'f43a62fdc3965df486de8a0d32fe800963589c41b38946602a0dc535';
	private static readonly AGIX_ASSET_NAME = '41474958'; // "AGIX" in hex

	constructor(config: CardanoClientConfig) {
		const networkConfig = getNetworkConfig(config.network);
		if (!networkConfig) {
			throw new Error(`Unknown network: ${config.network}`);
		}

		this.networkConfig = networkConfig;
		this.apiKey = config.apiKey || '';

		const baseUrl = config.nodeUrl || networkConfig.rpcUrl;

		this.api = axios.create({
			baseURL: baseUrl,
			headers: {
				project_id: this.apiKey,
				'Content-Type': 'application/json',
			},
		});
	}

	/**
	 * Get address information
	 */
	async getAddressInfo(address: string): Promise<CardanoAddressInfo> {
		const response = await this.api.get(`/addresses/${address}`);
		return response.data;
	}

	/**
	 * Get address UTXOs
	 */
	async getAddressUtxos(address: string): Promise<CardanoUtxo[]> {
		const response = await this.api.get(`/addresses/${address}/utxos`);
		return response.data;
	}

	/**
	 * Get ADA balance
	 */
	async getAdaBalance(address: string): Promise<bigint> {
		const info = await this.getAddressInfo(address);
		const lovelace = info.amount.find((a) => a.unit === 'lovelace');
		return BigInt(lovelace?.quantity || '0');
	}

	/**
	 * Get AGIX balance on Cardano
	 */
	async getAgixBalance(address: string): Promise<bigint> {
		const info = await this.getAddressInfo(address);
		const agixUnit = `${CardanoClient.AGIX_POLICY_ID}${CardanoClient.AGIX_ASSET_NAME}`;
		const agix = info.amount.find((a) => a.unit === agixUnit);
		return BigInt(agix?.quantity || '0');
	}

	/**
	 * Get all token balances for an address
	 */
	async getTokenBalances(address: string): Promise<Record<string, bigint>> {
		const info = await this.getAddressInfo(address);
		const balances: Record<string, bigint> = {};

		for (const amount of info.amount) {
			balances[amount.unit] = BigInt(amount.quantity);
		}

		return balances;
	}

	/**
	 * Get transaction information
	 */
	async getTransaction(hash: string): Promise<CardanoTransactionResult> {
		try {
			const response = await this.api.get(`/txs/${hash}`);
			return {
				hash: response.data.hash,
				block: response.data.block,
				slot: response.data.slot,
				status: 'success',
			};
		} catch (error) {
			return {
				hash,
				status: 'pending',
			};
		}
	}

	/**
	 * Get current epoch
	 */
	async getCurrentEpoch(): Promise<number> {
		const response = await this.api.get('/epochs/latest');
		return response.data.epoch;
	}

	/**
	 * Get current slot
	 */
	async getCurrentSlot(): Promise<number> {
		const response = await this.api.get('/blocks/latest');
		return response.data.slot;
	}

	/**
	 * Get protocol parameters
	 */
	async getProtocolParameters(): Promise<Record<string, unknown>> {
		const epoch = await this.getCurrentEpoch();
		const response = await this.api.get(`/epochs/${epoch}/parameters`);
		return response.data;
	}

	/**
	 * Validate Cardano address
	 */
	static isValidAddress(address: string): boolean {
		// Basic validation for Cardano addresses
		// Mainnet addresses start with 'addr1'
		// Testnet addresses start with 'addr_test1'
		return /^addr(_test)?1[a-z0-9]+$/.test(address);
	}

	/**
	 * Get asset information
	 */
	async getAssetInfo(policyId: string, assetName: string): Promise<Record<string, unknown>> {
		const asset = `${policyId}${assetName}`;
		const response = await this.api.get(`/assets/${asset}`);
		return response.data;
	}

	/**
	 * Get AGIX asset information
	 */
	async getAgixInfo(): Promise<Record<string, unknown>> {
		return this.getAssetInfo(CardanoClient.AGIX_POLICY_ID, CardanoClient.AGIX_ASSET_NAME);
	}

	/**
	 * Get address transactions
	 */
	async getAddressTransactions(
		address: string,
		count: number = 100
	): Promise<Array<{ tx_hash: string; tx_index: number; block_height: number }>> {
		const response = await this.api.get(`/addresses/${address}/transactions`, {
			params: { count },
		});
		return response.data;
	}

	/**
	 * Get stake address information
	 */
	async getStakeAddressInfo(stakeAddress: string): Promise<Record<string, unknown>> {
		const response = await this.api.get(`/accounts/${stakeAddress}`);
		return response.data;
	}

	/**
	 * Get network configuration
	 */
	getNetworkConfig(): NetworkConfig {
		return this.networkConfig;
	}

	/**
	 * Get AGIX policy ID
	 */
	getAgixPolicyId(): string {
		return CardanoClient.AGIX_POLICY_ID;
	}

	/**
	 * Get AGIX asset name
	 */
	getAgixAssetName(): string {
		return CardanoClient.AGIX_ASSET_NAME;
	}
}

/**
 * Create Cardano client from n8n credentials
 */
export function createCardanoClient(credentials: Record<string, unknown>): CardanoClient {
	const config: CardanoClientConfig = {
		network: credentials.network as string,
		nodeUrl: credentials.cardanoNodeUrl as string | undefined,
		apiKey: credentials.cardanoApiKey as string | undefined,
	};

	return new CardanoClient(config);
}
