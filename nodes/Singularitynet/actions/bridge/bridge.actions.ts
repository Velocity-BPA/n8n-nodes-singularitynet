/**
 * Bridge Actions
 * Cross-chain AGIX transfers between Ethereum and Cardano
 */

import type { IExecuteFunctions, INodeExecutionData, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createEthereumClient, EthereumClient } from '../../transport/ethereumClient';
import { createCardanoClient, CardanoClient } from '../../transport/cardanoClient';

export const bridgeOperations: INodePropertyOptions[] = [
	{ name: 'Get Bridge Info', value: 'getBridgeInfo', description: 'Get bridge contract information' },
	{ name: 'Get Bridge Status', value: 'getBridgeStatus', description: 'Get current bridge status' },
	{ name: 'Get Bridge Limits', value: 'getBridgeLimits', description: 'Get bridge transfer limits' },
	{ name: 'Get Conversion Fee', value: 'getConversionFee', description: 'Get bridge conversion fee' },
	{ name: 'Validate Addresses', value: 'validateAddresses', description: 'Validate ETH and Cardano addresses' },
];

export const bridgeFields = [
	{
		displayName: 'Ethereum Address',
		name: 'ethereumAddress',
		type: 'string' as const,
		default: '',
		description: 'Ethereum wallet address',
		displayOptions: {
			show: {
				resource: ['bridge'],
				operation: ['validateAddresses'],
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
				resource: ['bridge'],
				operation: ['validateAddresses'],
			},
		},
	},
];

export async function executeBridgeAction(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('singularitynetNetworkApi');
	const ethClient = createEthereumClient(credentials as Record<string, unknown>);

	let result: Record<string, any>;

	switch (operation) {
		case 'getBridgeInfo': {
			const networkConfig = ethClient.getNetworkConfig();
			
			result = {
				name: 'SingularityNET Cross-Chain Bridge',
				description: 'Bridge for transferring AGIX between Ethereum and Cardano',
				supportedChains: ['Ethereum', 'Cardano'],
				token: 'AGIX',
				network: networkConfig.name,
				bridgeContract: networkConfig.bridgeAddress || 'Not configured',
			};
			break;
		}

		case 'getBridgeStatus': {
			const currentBlock = await ethClient.getCurrentBlock();
			
			result = {
				status: 'operational',
				ethereumBlock: currentBlock,
				network: ethClient.getNetworkConfig().name,
				timestamp: new Date().toISOString(),
				note: 'Full bridge status requires bridge contract query',
			};
			break;
		}

		case 'getBridgeLimits': {
			result = {
				minimumTransfer: '1 AGIX',
				maximumTransfer: 'Determined by bridge contract',
				dailyLimit: 'Determined by bridge contract',
				note: 'Actual limits are set in the bridge smart contract',
				network: ethClient.getNetworkConfig().name,
			};
			break;
		}

		case 'getConversionFee': {
			result = {
				baseFee: '0.1%',
				networkFee: 'Variable based on gas prices',
				note: 'Actual fees determined by bridge contract and network conditions',
				network: ethClient.getNetworkConfig().name,
			};
			break;
		}

		case 'validateAddresses': {
			const ethereumAddress = this.getNodeParameter('ethereumAddress', itemIndex, '') as string;
			const cardanoAddress = this.getNodeParameter('cardanoAddress', itemIndex, '') as string;

			const ethValid = ethereumAddress ? EthereumClient.isValidAddress(ethereumAddress) : null;
			const cardanoValid = cardanoAddress ? CardanoClient.isValidAddress(cardanoAddress) : null;

			result = {
				ethereum: ethereumAddress ? {
					address: ethereumAddress,
					valid: ethValid,
					type: ethValid ? 'ethereum' : 'invalid',
				} : null,
				cardano: cardanoAddress ? {
					address: cardanoAddress,
					valid: cardanoValid,
					type: cardanoValid ? 'cardano' : 'invalid',
				} : null,
			};
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown bridge operation: ${operation}`);
	}

	return [{ json: result }];
}
