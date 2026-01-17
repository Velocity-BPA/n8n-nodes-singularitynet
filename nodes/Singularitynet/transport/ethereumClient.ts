/**
 * Ethereum Client
 *
 * Handles all Ethereum blockchain interactions for SingularityNET,
 * including token transfers, contract calls, and wallet operations.
 */

import { ethers } from 'ethers';
import {
	AGIX_TOKEN_ABI,
	MPE_CONTRACT_ABI,
	REGISTRY_CONTRACT_ABI,
	STAKING_CONTRACT_ABI,
	ASI_TOKEN_ABI,
	CONTRACT_ADDRESSES,
} from '../constants/contracts';
import { getNetworkConfig, NetworkConfig } from '../constants/networks';

/**
 * Ethereum client configuration
 */
export interface EthereumClientConfig {
	network: string;
	rpcUrl?: string;
	privateKey?: string;
	mnemonic?: string;
	derivationPath?: string;
}

/**
 * Transaction result
 */
export interface TransactionResult {
	hash: string;
	blockNumber?: number;
	status: 'pending' | 'success' | 'failed';
	gasUsed?: bigint;
	effectiveGasPrice?: bigint;
}

/**
 * Channel info from contract
 */
export interface ChannelInfo {
	channelId: number;
	nonce: number;
	sender: string;
	signer: string;
	recipient: string;
	groupId: string;
	value: bigint;
	expiration: number;
}

/**
 * Ethereum Client class
 */
export class EthereumClient {
	private provider: ethers.JsonRpcProvider;
	private wallet: ethers.Wallet | null = null;
	private networkConfig: NetworkConfig;
	private contracts: {
		agixToken?: ethers.Contract;
		mpe?: ethers.Contract;
		registry?: ethers.Contract;
		staking?: ethers.Contract;
		asiToken?: ethers.Contract;
	} = {};

	constructor(config: EthereumClientConfig) {
		const networkConfig = getNetworkConfig(config.network);
		if (!networkConfig) {
			throw new Error(`Unknown network: ${config.network}`);
		}

		this.networkConfig = networkConfig;
		const rpcUrl = config.rpcUrl || networkConfig.rpcUrl;
		this.provider = new ethers.JsonRpcProvider(rpcUrl);

		// Initialize wallet if credentials provided
		if (config.privateKey) {
			this.wallet = new ethers.Wallet(config.privateKey, this.provider);
		} else if (config.mnemonic) {
			const path = config.derivationPath || "m/44'/60'/0'/0/0";
			this.wallet = ethers.Wallet.fromPhrase(config.mnemonic, this.provider).derivePath(path) as any;
		}

		this.initializeContracts();
	}

	/**
	 * Initialize contract instances
	 */
	private initializeContracts(): void {
		const addresses = CONTRACT_ADDRESSES[this.networkConfig.name === 'Ethereum Mainnet' ? 'ethereumMainnet' : 'ethereumSepolia'];
		const signerOrProvider = this.wallet || this.provider;

		if (addresses.agixToken) {
			this.contracts.agixToken = new ethers.Contract(addresses.agixToken, AGIX_TOKEN_ABI, signerOrProvider);
		}
		if (addresses.mpe) {
			this.contracts.mpe = new ethers.Contract(addresses.mpe, MPE_CONTRACT_ABI, signerOrProvider);
		}
		if (addresses.registry) {
			this.contracts.registry = new ethers.Contract(addresses.registry, REGISTRY_CONTRACT_ABI, signerOrProvider);
		}
		if (addresses.staking && addresses.staking !== '0x0000000000000000000000000000000000000000') {
			this.contracts.staking = new ethers.Contract(addresses.staking, STAKING_CONTRACT_ABI, signerOrProvider);
		}
		if (addresses.asiToken && addresses.asiToken !== '0x0000000000000000000000000000000000000000') {
			this.contracts.asiToken = new ethers.Contract(addresses.asiToken, ASI_TOKEN_ABI, signerOrProvider);
		}
	}

	/**
	 * Get wallet address
	 */
	getAddress(): string {
		if (!this.wallet) {
			throw new Error('No wallet configured');
		}
		return this.wallet.address;
	}

	/**
	 * Get ETH balance
	 */
	async getEthBalance(address?: string): Promise<bigint> {
		const addr = address || this.getAddress();
		return this.provider.getBalance(addr);
	}

	/**
	 * Get AGIX token balance
	 */
	async getAgixBalance(address?: string): Promise<bigint> {
		if (!this.contracts.agixToken) {
			throw new Error('AGIX token contract not initialized');
		}
		const addr = address || this.getAddress();
		return this.contracts.agixToken.balanceOf(addr);
	}

	/**
	 * Transfer AGIX tokens
	 */
	async transferAgix(to: string, amount: bigint): Promise<TransactionResult> {
		if (!this.contracts.agixToken || !this.wallet) {
			throw new Error('AGIX token contract or wallet not initialized');
		}

		const tx = await this.contracts.agixToken.transfer(to, amount);
		const receipt = await tx.wait();

		return {
			hash: tx.hash,
			blockNumber: receipt.blockNumber,
			status: receipt.status === 1 ? 'success' : 'failed',
			gasUsed: receipt.gasUsed,
			effectiveGasPrice: receipt.gasPrice,
		};
	}

	/**
	 * Approve AGIX spending for MPE contract
	 */
	async approveAgix(amount: bigint): Promise<TransactionResult> {
		if (!this.contracts.agixToken || !this.wallet) {
			throw new Error('AGIX token contract or wallet not initialized');
		}

		const mpeAddress = await this.getMpeAddress();
		const tx = await this.contracts.agixToken.approve(mpeAddress, amount);
		const receipt = await tx.wait();

		return {
			hash: tx.hash,
			blockNumber: receipt.blockNumber,
			status: receipt.status === 1 ? 'success' : 'failed',
			gasUsed: receipt.gasUsed,
			effectiveGasPrice: receipt.gasPrice,
		};
	}

	/**
	 * Get MPE escrow balance
	 */
	async getEscrowBalance(address?: string): Promise<bigint> {
		if (!this.contracts.mpe) {
			throw new Error('MPE contract not initialized');
		}
		const addr = address || this.getAddress();
		return this.contracts.mpe.balances(addr);
	}

	/**
	 * Deposit AGIX to MPE escrow
	 */
	async depositToEscrow(amount: bigint): Promise<TransactionResult> {
		if (!this.contracts.mpe || !this.wallet) {
			throw new Error('MPE contract or wallet not initialized');
		}

		// First approve the transfer
		await this.approveAgix(amount);

		const tx = await this.contracts.mpe.deposit(amount);
		const receipt = await tx.wait();

		return {
			hash: tx.hash,
			blockNumber: receipt.blockNumber,
			status: receipt.status === 1 ? 'success' : 'failed',
			gasUsed: receipt.gasUsed,
			effectiveGasPrice: receipt.gasPrice,
		};
	}

	/**
	 * Withdraw AGIX from MPE escrow
	 */
	async withdrawFromEscrow(amount: bigint): Promise<TransactionResult> {
		if (!this.contracts.mpe || !this.wallet) {
			throw new Error('MPE contract or wallet not initialized');
		}

		const tx = await this.contracts.mpe.withdraw(amount);
		const receipt = await tx.wait();

		return {
			hash: tx.hash,
			blockNumber: receipt.blockNumber,
			status: receipt.status === 1 ? 'success' : 'failed',
			gasUsed: receipt.gasUsed,
			effectiveGasPrice: receipt.gasPrice,
		};
	}

	/**
	 * Open a payment channel
	 */
	async openChannel(
		recipient: string,
		groupId: string,
		amount: bigint,
		expiration: number
	): Promise<{ channelId: number; tx: TransactionResult }> {
		if (!this.contracts.mpe || !this.wallet) {
			throw new Error('MPE contract or wallet not initialized');
		}

		const signer = this.wallet.address;

		const tx = await this.contracts.mpe.openChannel(signer, recipient, groupId, amount, expiration);
		const receipt = await tx.wait();

		// Extract channel ID from event
		const event = receipt.logs.find(
			(log: ethers.Log) => log.topics[0] === ethers.id('ChannelOpen(uint256,uint256,address,address,address,bytes32,uint256,uint256)')
		);
		const channelId = event ? parseInt(event.topics[1], 16) : 0;

		return {
			channelId,
			tx: {
				hash: tx.hash,
				blockNumber: receipt.blockNumber,
				status: receipt.status === 1 ? 'success' : 'failed',
				gasUsed: receipt.gasUsed,
				effectiveGasPrice: receipt.gasPrice,
			},
		};
	}

	/**
	 * Get channel information
	 */
	async getChannel(channelId: number): Promise<ChannelInfo> {
		if (!this.contracts.mpe) {
			throw new Error('MPE contract not initialized');
		}

		const channel = await this.contracts.mpe.channels(channelId);

		return {
			channelId,
			nonce: Number(channel[0]),
			sender: channel[1],
			signer: channel[2],
			recipient: channel[3],
			groupId: channel[4],
			value: channel[5],
			expiration: Number(channel[6]),
		};
	}

	/**
	 * Add funds to existing channel
	 */
	async addFundsToChannel(channelId: number, amount: bigint): Promise<TransactionResult> {
		if (!this.contracts.mpe || !this.wallet) {
			throw new Error('MPE contract or wallet not initialized');
		}

		const tx = await this.contracts.mpe.channelAddFunds(channelId, amount);
		const receipt = await tx.wait();

		return {
			hash: tx.hash,
			blockNumber: receipt.blockNumber,
			status: receipt.status === 1 ? 'success' : 'failed',
			gasUsed: receipt.gasUsed,
			effectiveGasPrice: receipt.gasPrice,
		};
	}

	/**
	 * Extend channel expiration
	 */
	async extendChannel(channelId: number, newExpiration: number): Promise<TransactionResult> {
		if (!this.contracts.mpe || !this.wallet) {
			throw new Error('MPE contract or wallet not initialized');
		}

		const tx = await this.contracts.mpe.channelExtend(channelId, newExpiration);
		const receipt = await tx.wait();

		return {
			hash: tx.hash,
			blockNumber: receipt.blockNumber,
			status: receipt.status === 1 ? 'success' : 'failed',
			gasUsed: receipt.gasUsed,
			effectiveGasPrice: receipt.gasPrice,
		};
	}

	/**
	 * Claim channel timeout (sender reclaims after expiration)
	 */
	async claimChannelTimeout(channelId: number): Promise<TransactionResult> {
		if (!this.contracts.mpe || !this.wallet) {
			throw new Error('MPE contract or wallet not initialized');
		}

		const tx = await this.contracts.mpe.channelClaimTimeout(channelId);
		const receipt = await tx.wait();

		return {
			hash: tx.hash,
			blockNumber: receipt.blockNumber,
			status: receipt.status === 1 ? 'success' : 'failed',
			gasUsed: receipt.gasUsed,
			effectiveGasPrice: receipt.gasPrice,
		};
	}

	/**
	 * Get current block number
	 */
	async getCurrentBlock(): Promise<number> {
		return this.provider.getBlockNumber();
	}

	/**
	 * Get gas price
	 */
	async getGasPrice(): Promise<bigint> {
		const feeData = await this.provider.getFeeData();
		return feeData.gasPrice || 0n;
	}

	/**
	 * Estimate gas for a transaction
	 */
	async estimateGas(to: string, data: string): Promise<bigint> {
		return this.provider.estimateGas({ to, data });
	}

	/**
	 * Get transaction by hash
	 */
	async getTransaction(hash: string): Promise<ethers.TransactionResponse | null> {
		return this.provider.getTransaction(hash);
	}

	/**
	 * Get transaction receipt
	 */
	async getTransactionReceipt(hash: string): Promise<ethers.TransactionReceipt | null> {
		return this.provider.getTransactionReceipt(hash);
	}

	/**
	 * Validate Ethereum address
	 */
	static isValidAddress(address: string): boolean {
		return ethers.isAddress(address);
	}

	/**
	 * Get MPE contract address
	 */
	getMpeAddress(): string {
		return this.networkConfig.mpeAddress;
	}

	/**
	 * Get Registry contract address
	 */
	getRegistryAddress(): string {
		return this.networkConfig.registryAddress;
	}

	/**
	 * Get network configuration
	 */
	getNetworkConfig(): NetworkConfig {
		return this.networkConfig;
	}

	/**
	 * Get wallet signer for external use
	 */
	getWallet(): ethers.Wallet | null {
		return this.wallet;
	}

	/**
	 * Get provider for external use
	 */
	getProvider(): ethers.JsonRpcProvider {
		return this.provider;
	}
}

/**
 * Create Ethereum client from n8n credentials
 */
export function createEthereumClient(credentials: Record<string, unknown>): EthereumClient {
	const config: EthereumClientConfig = {
		network: credentials.network as string,
		rpcUrl: credentials.ethereumRpcUrl as string | undefined,
	};

	if (credentials.authMethod === 'privateKey') {
		config.privateKey = credentials.privateKey as string;
	} else if (credentials.authMethod === 'mnemonic') {
		config.mnemonic = credentials.mnemonic as string;
		config.derivationPath = credentials.derivationPath as string;
	}

	return new EthereumClient(config);
}
