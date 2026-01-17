import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { createEthereumClient } from '../../transport/ethereumClient';

export const paymentChannelOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['paymentChannel'],
			},
		},
		options: [
			{
				name: 'Open Channel',
				value: 'openChannel',
				description: 'Open a new payment channel',
				action: 'Open a payment channel',
			},
			{
				name: 'Get Channel Info',
				value: 'getChannel',
				description: 'Get payment channel information',
				action: 'Get channel info',
			},
			{
				name: 'Add Funds',
				value: 'addFunds',
				description: 'Add funds to an existing channel',
				action: 'Add funds to channel',
			},
			{
				name: 'Extend Expiry',
				value: 'extendExpiry',
				description: 'Extend channel expiration',
				action: 'Extend channel expiry',
			},
			{
				name: 'Claim Timeout',
				value: 'claimTimeout',
				description: 'Claim funds from expired channel',
				action: 'Claim channel timeout',
			},
		],
		default: 'getChannel',
	},
];

export const paymentChannelFields: INodeProperties[] = [
	// Channel ID field
	{
		displayName: 'Channel ID',
		name: 'channelId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['paymentChannel'],
				operation: ['getChannel', 'addFunds', 'extendExpiry', 'claimTimeout'],
			},
		},
		default: 0,
		description: 'The payment channel ID',
	},
	// Open Channel fields
	{
		displayName: 'Recipient Address',
		name: 'recipientAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['paymentChannel'],
				operation: ['openChannel'],
			},
		},
		default: '',
		description: 'The recipient (signer) address for the channel',
	},
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['paymentChannel'],
				operation: ['openChannel'],
			},
		},
		default: '',
		description: 'The service group ID (bytes32)',
	},
	{
		displayName: 'Initial Amount (AGIX)',
		name: 'amount',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['paymentChannel'],
				operation: ['openChannel', 'addFunds'],
			},
		},
		default: 1,
		description: 'Amount of AGIX to deposit',
	},
	{
		displayName: 'Expiration (blocks)',
		name: 'expiration',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['paymentChannel'],
				operation: ['openChannel', 'extendExpiry'],
			},
		},
		default: 11520,
		description: 'Channel expiration in blocks (default ~2 days)',
	},
];

export async function executePaymentChannelAction(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('singularitynetNetwork');
	const ethereumClient = createEthereumClient(credentials as Record<string, unknown>);

	if (operation === 'openChannel') {
		const recipientAddress = this.getNodeParameter('recipientAddress', itemIndex) as string;
		const groupId = this.getNodeParameter('groupId', itemIndex) as string;
		const amount = this.getNodeParameter('amount', itemIndex) as number;
		const expiration = this.getNodeParameter('expiration', itemIndex) as number;

		const currentBlock = await ethereumClient.getCurrentBlock();
		const expirationBlock = currentBlock + expiration;
		// Convert amount to bigint (AGIX has 8 decimals = 10^8 cogs)
		const amountInCogs = BigInt(Math.floor(amount * 1e8));

		const result = await ethereumClient.openChannel(
			recipientAddress,
			groupId,
			amountInCogs,
			expirationBlock,
		);

		return {
			success: true,
			operation: 'openChannel',
			channelId: result.channelId,
			recipient: recipientAddress,
			groupId,
			amount,
			expirationBlock,
			transactionHash: result.tx.hash,
		};
	}

	if (operation === 'getChannel') {
		const channelId = this.getNodeParameter('channelId', itemIndex) as number;
		const channel = await ethereumClient.getChannel(channelId);

		return {
			success: true,
			channelId: channel.channelId,
			nonce: channel.nonce,
			sender: channel.sender,
			signer: channel.signer,
			recipient: channel.recipient,
			groupId: channel.groupId,
			value: channel.value.toString(),
			expiration: channel.expiration,
		};
	}

	if (operation === 'addFunds') {
		const channelId = this.getNodeParameter('channelId', itemIndex) as number;
		const amount = this.getNodeParameter('amount', itemIndex) as number;
		// Convert amount to bigint (AGIX has 8 decimals = 10^8 cogs)
		const amountInCogs = BigInt(Math.floor(amount * 1e8));

		const result = await ethereumClient.addFundsToChannel(channelId, amountInCogs);

		return {
			success: true,
			operation: 'addFunds',
			channelId,
			amount,
			transactionHash: result.hash,
		};
	}

	if (operation === 'extendExpiry') {
		const channelId = this.getNodeParameter('channelId', itemIndex) as number;
		const expiration = this.getNodeParameter('expiration', itemIndex) as number;

		const currentBlock = await ethereumClient.getCurrentBlock();
		const newExpiration = currentBlock + expiration;

		const result = await ethereumClient.extendChannel(channelId, newExpiration);

		return {
			success: true,
			operation: 'extendExpiry',
			channelId,
			newExpiration,
			transactionHash: result.hash,
		};
	}

	if (operation === 'claimTimeout') {
		const channelId = this.getNodeParameter('channelId', itemIndex) as number;
		const result = await ethereumClient.claimChannelTimeout(channelId);

		return {
			success: true,
			operation: 'claimTimeout',
			channelId,
			transactionHash: result.hash,
		};
	}

	throw new Error(`Unknown operation: ${operation}`);
}
