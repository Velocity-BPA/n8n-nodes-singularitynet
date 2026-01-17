/**
 * Account Actions
 *
 * Handles all account-related operations including:
 * - Balance queries (AGIX, escrow)
 * - Wallet information
 * - Token transfers
 * - Escrow operations
 */

import type { IExecuteFunctions, INodeExecutionData, INodePropertyOptions } from 'n8n-workflow';
import { createEthereumClient, EthereumClient } from '../../transport/ethereumClient';
import { createCardanoClient, CardanoClient } from '../../transport/cardanoClient';
import { cogsToAgix, agixToCogs, formatTokenAmount, weiToEth } from '../../utils/unitConverter';
import { isEthereumNetwork, isCardanoNetwork } from '../../constants/networks';

/**
 * Account operations
 */
export const accountOperations: INodePropertyOptions[] = [
	{ name: 'Get AGIX Balance (Ethereum)', value: 'getAgixBalanceEthereum', description: 'Get AGIX token balance on Ethereum' },
	{ name: 'Get AGIX Balance (Cardano)', value: 'getAgixBalanceCardano', description: 'Get AGIX token balance on Cardano' },
	{ name: 'Get Wallet Info', value: 'getWalletInfo', description: 'Get full wallet information' },
	{ name: 'Transfer AGIX', value: 'transferAgix', description: 'Transfer AGIX tokens' },
	{ name: 'Get Transaction History', value: 'getTransactionHistory', description: 'Get transaction history' },
	{ name: 'Get Escrow Balance', value: 'getEscrowBalance', description: 'Get MPE escrow balance' },
	{ name: 'Deposit to Escrow', value: 'depositToEscrow', description: 'Deposit AGIX to MPE escrow' },
	{ name: 'Withdraw from Escrow', value: 'withdrawFromEscrow', description: 'Withdraw AGIX from MPE escrow' },
	{ name: 'Validate Address', value: 'validateAddress', description: 'Validate blockchain address' },
	{ name: 'Get Multi-Chain Balances', value: 'getMultiChainBalances', description: 'Get balances across multiple chains' },
	{ name: 'Get Channel Balances', value: 'getChannelBalances', description: 'Get payment channel balances' },
];

/**
 * Account fields
 */
export const accountFields = [
	{
		displayName: 'Address',
		name: 'address',
		type: 'string' as const,
		default: '',
		description: 'Wallet address (uses configured wallet if empty)',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getAgixBalanceEthereum', 'getAgixBalanceCardano', 'getEscrowBalance', 'getTransactionHistory'],
			},
		},
	},
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string' as const,
		default: '',
		required: true,
		description: 'Recipient address',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['transferAgix'],
			},
		},
	},
	{
		displayName: 'Amount (AGIX)',
		name: 'amount',
		type: 'number' as const,
		default: 0,
		required: true,
		description: 'Amount in AGIX',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['transferAgix', 'depositToEscrow', 'withdrawFromEscrow'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number' as const,
		default: 10,
		description: 'Maximum number of transactions to return',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getTransactionHistory'],
			},
		},
	},
	{
		displayName: 'Network Type',
		name: 'networkType',
		type: 'options' as const,
		default: 'ethereum',
		options: [
			{ name: 'Ethereum', value: 'ethereum' },
			{ name: 'Cardano', value: 'cardano' },
		],
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['validateAddress'],
			},
		},
	},
	{
		displayName: 'Ethereum Address',
		name: 'ethereumAddress',
		type: 'string' as const,
		default: '',
		description: 'Ethereum wallet address',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getMultiChainBalances'],
			},
		},
	},
	{
		displayName: 'Cardano Address',
		name: 'cardanoAddress',
		type: 'string' as const,
		default: '',
		description: 'Cardano wallet address',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getMultiChainBalances'],
			},
		},
	},
	{
		displayName: 'Channel IDs',
		name: 'channelIds',
		type: 'string' as const,
		default: '',
		required: true,
		description: 'Comma-separated list of channel IDs',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getChannelBalances'],
			},
		},
	},
];

/**
 * Get AGIX balance on Ethereum
 */
export async function getAgixBalanceEthereum(
	this: IExecuteFunctions,
	index: number
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('singularitynetNetwork');
	const address = this.getNodeParameter('address', index, '') as string;

	const ethClient = createEthereumClient(credentials);
	const walletAddress = address || ethClient.getAddress();
	
	const balance = await ethClient.getAgixBalance(walletAddress);
	const agixBalance = cogsToAgix(balance);

	return [
		{
			json: {
				address: walletAddress,
				balanceInCogs: balance.toString(),
				balanceInAgix: agixBalance,
				formatted: formatTokenAmount(agixBalance, 'AGIX'),
				network: 'ethereum',
			},
		},
	];
}

/**
 * Get AGIX balance on Cardano
 */
export async function getAgixBalanceCardano(
	this: IExecuteFunctions,
	index: number
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('singularitynetNetwork');
	const address = this.getNodeParameter('address', index) as string;

	if (!address) {
		throw new Error('Cardano address is required');
	}

	const cardanoClient = createCardanoClient(credentials);
	const balance = await cardanoClient.getAgixBalance(address);

	return [
		{
			json: {
				address,
				balance: balance.toString(),
				network: 'cardano',
			},
		},
	];
}

/**
 * Get wallet info
 */
export async function getWalletInfo(
	this: IExecuteFunctions,
	index: number
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('singularitynetNetwork');
	const network = credentials.network as string;

	if (isEthereumNetwork(network)) {
		const ethClient = createEthereumClient(credentials);
		const address = ethClient.getAddress();
		const ethBalance = await ethClient.getEthBalance();
		const agixBalance = await ethClient.getAgixBalance();
		const escrowBalance = await ethClient.getEscrowBalance();

		return [
			{
				json: {
					address,
					network,
					ethBalance: weiToEth(ethBalance),
					agixBalance: cogsToAgix(agixBalance),
					escrowBalance: cogsToAgix(escrowBalance),
					networkConfig: ethClient.getNetworkConfig(),
				},
			},
		];
	} else if (isCardanoNetwork(network)) {
		throw new Error('Cardano wallet info requires external wallet connection');
	}

	throw new Error(`Unsupported network: ${network}`);
}

/**
 * Transfer AGIX tokens
 */
export async function transferAgix(
	this: IExecuteFunctions,
	index: number
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('singularitynetNetwork');
	const toAddress = this.getNodeParameter('toAddress', index) as string;
	const amount = this.getNodeParameter('amount', index) as number;

	const ethClient = createEthereumClient(credentials);
	const amountInCogs = agixToCogs(amount);

	const result = await ethClient.transferAgix(toAddress, amountInCogs);

	return [
		{
			json: {
				success: result.status === 'success',
				transactionHash: result.hash,
				blockNumber: result.blockNumber,
				from: ethClient.getAddress(),
				to: toAddress,
				amountAgix: amount,
				amountCogs: amountInCogs.toString(),
				gasUsed: result.gasUsed?.toString(),
			},
		},
	];
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(
	this: IExecuteFunctions,
	index: number
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('singularitynetNetwork');
	const address = this.getNodeParameter('address', index, '') as string;
	const limit = this.getNodeParameter('limit', index, 10) as number;

	const network = credentials.network as string;

	if (isCardanoNetwork(network)) {
		const cardanoClient = createCardanoClient(credentials);
		const txs = await cardanoClient.getAddressTransactions(address, limit);

		return [
			{
				json: {
					address,
					transactions: txs,
					network: 'cardano',
				},
			},
		];
	}

	// For Ethereum, would need to use an indexer like Etherscan API
	throw new Error('Transaction history for Ethereum requires external indexer');
}

/**
 * Get escrow balance
 */
export async function getEscrowBalance(
	this: IExecuteFunctions,
	index: number
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('singularitynetNetwork');
	const address = this.getNodeParameter('address', index, '') as string;

	const ethClient = createEthereumClient(credentials);
	const walletAddress = address || ethClient.getAddress();
	const balance = await ethClient.getEscrowBalance(walletAddress);

	return [
		{
			json: {
				address: walletAddress,
				escrowBalanceInCogs: balance.toString(),
				escrowBalanceInAgix: cogsToAgix(balance),
				formatted: formatTokenAmount(cogsToAgix(balance), 'AGIX'),
			},
		},
	];
}

/**
 * Deposit AGIX to escrow
 */
export async function depositToEscrow(
	this: IExecuteFunctions,
	index: number
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('singularitynetNetwork');
	const amount = this.getNodeParameter('amount', index) as number;

	const ethClient = createEthereumClient(credentials);
	const amountInCogs = agixToCogs(amount);

	const result = await ethClient.depositToEscrow(amountInCogs);

	return [
		{
			json: {
				success: result.status === 'success',
				transactionHash: result.hash,
				blockNumber: result.blockNumber,
				amountDeposited: amount,
				amountInCogs: amountInCogs.toString(),
			},
		},
	];
}

/**
 * Withdraw from escrow
 */
export async function withdrawFromEscrow(
	this: IExecuteFunctions,
	index: number
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('singularitynetNetwork');
	const amount = this.getNodeParameter('amount', index) as number;

	const ethClient = createEthereumClient(credentials);
	const amountInCogs = agixToCogs(amount);

	const result = await ethClient.withdrawFromEscrow(amountInCogs);

	return [
		{
			json: {
				success: result.status === 'success',
				transactionHash: result.hash,
				blockNumber: result.blockNumber,
				amountWithdrawn: amount,
				amountInCogs: amountInCogs.toString(),
			},
		},
	];
}

/**
 * Validate address
 */
export async function validateAddress(
	this: IExecuteFunctions,
	index: number
): Promise<INodeExecutionData[]> {
	const address = this.getNodeParameter('address', index) as string;
	const networkType = this.getNodeParameter('networkType', index, 'ethereum') as string;

	let isValid = false;
	let addressType = '';

	if (networkType === 'ethereum') {
		isValid = EthereumClient.isValidAddress(address);
		addressType = isValid ? 'ethereum' : 'invalid';
	} else if (networkType === 'cardano') {
		isValid = CardanoClient.isValidAddress(address);
		addressType = isValid ? 'cardano' : 'invalid';
	}

	return [
		{
			json: {
				address,
				isValid,
				networkType,
				addressType,
			},
		},
	];
}

/**
 * Get multi-chain balances
 */
export async function getMultiChainBalances(
	this: IExecuteFunctions,
	index: number
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('singularitynetNetwork');
	const ethereumAddress = this.getNodeParameter('ethereumAddress', index, '') as string;
	const cardanoAddress = this.getNodeParameter('cardanoAddress', index, '') as string;

	const results: { [key: string]: any } = {};

	// Get Ethereum balances if address provided
	if (ethereumAddress || credentials.authMethod) {
		try {
			const ethCreds = { ...credentials, network: 'ethereumMainnet' };
			const ethClient = createEthereumClient(ethCreds);
			const address = ethereumAddress || ethClient.getAddress();

			const ethBalance = await ethClient.getEthBalance(address);
			const agixBalance = await ethClient.getAgixBalance(address);
			const escrowBalance = await ethClient.getEscrowBalance(address);

			results.ethereum = {
				address,
				eth: weiToEth(ethBalance),
				agix: cogsToAgix(agixBalance),
				escrow: cogsToAgix(escrowBalance),
			};
		} catch (error) {
			results.ethereum = { error: (error as Error).message };
		}
	}

	// Get Cardano balances if address provided
	if (cardanoAddress) {
		try {
			const cardanoCreds = { ...credentials, network: 'cardanoMainnet' };
			const cardanoClient = createCardanoClient(cardanoCreds);

			const adaBalance = await cardanoClient.getAdaBalance(cardanoAddress);
			const agixBalance = await cardanoClient.getAgixBalance(cardanoAddress);

			results.cardano = {
				address: cardanoAddress,
				ada: Number(adaBalance) / 1e6,
				agix: Number(agixBalance) / 1e8,
			};
		} catch (error) {
			results.cardano = { error: (error as Error).message };
		}
	}

	return [{ json: results }];
}

/**
 * Get channel balances
 */
export async function getChannelBalances(
	this: IExecuteFunctions,
	index: number
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('singularitynetNetwork');
	const channelIds = this.getNodeParameter('channelIds', index) as string;

	const ethClient = createEthereumClient(credentials);
	const ids = channelIds.split(',').map((id) => parseInt(id.trim(), 10));

	const channels = await Promise.all(
		ids.map(async (channelId) => {
			try {
				const channel = await ethClient.getChannel(channelId);
				return {
					channelId,
					balance: cogsToAgix(channel.value),
					nonce: channel.nonce,
					expiration: channel.expiration,
					sender: channel.sender,
					recipient: channel.recipient,
				};
			} catch (error) {
				return {
					channelId,
					error: (error as Error).message,
				};
			}
		})
	);

	return [
		{
			json: {
				channels,
				totalChannels: channels.length,
			},
		},
	];
}

/**
 * Account action router
 */
export async function executeAccountAction(
	this: IExecuteFunctions,
	operation: string,
	index: number
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getAgixBalanceEthereum':
			return getAgixBalanceEthereum.call(this, index);
		case 'getAgixBalanceCardano':
			return getAgixBalanceCardano.call(this, index);
		case 'getWalletInfo':
			return getWalletInfo.call(this, index);
		case 'transferAgix':
			return transferAgix.call(this, index);
		case 'getTransactionHistory':
			return getTransactionHistory.call(this, index);
		case 'getEscrowBalance':
			return getEscrowBalance.call(this, index);
		case 'depositToEscrow':
			return depositToEscrow.call(this, index);
		case 'withdrawFromEscrow':
			return withdrawFromEscrow.call(this, index);
		case 'validateAddress':
			return validateAddress.call(this, index);
		case 'getMultiChainBalances':
			return getMultiChainBalances.call(this, index);
		case 'getChannelBalances':
			return getChannelBalances.call(this, index);
		default:
			throw new Error(`Unknown account operation: ${operation}`);
	}
}
