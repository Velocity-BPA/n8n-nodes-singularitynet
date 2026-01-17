/**
 * Utility Actions for SingularityNET
 * Helper functions for unit conversion, encoding/decoding, and network utilities
 */

import type { IExecuteFunctions, INodeExecutionData, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createEthereumClient } from '../../transport/ethereumClient';
import { cogsToAgix, agixToCogs, weiToEth, ethToWei, formatTokenAmount } from '../../utils/unitConverter';

export const utilityOperations: INodePropertyOptions[] = [
	{ name: 'Convert Units', value: 'convertUnits', description: 'Convert between token units' },
	{ name: 'Get Gas Estimate', value: 'getGasEstimate', description: 'Get current gas price' },
	{ name: 'Get Network Status', value: 'getNetworkStatus', description: 'Get network status' },
	{ name: 'Validate Address', value: 'validateAddress', description: 'Validate Ethereum address' },
];

export const utilityFields = [
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number' as const,
		default: 1,
		required: true,
		description: 'Amount to convert',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['convertUnits'],
			},
		},
	},
	{
		displayName: 'From Unit',
		name: 'fromUnit',
		type: 'options' as const,
		default: 'agix',
		options: [
			{ name: 'AGIX', value: 'agix' },
			{ name: 'Cogs', value: 'cogs' },
			{ name: 'ETH', value: 'eth' },
			{ name: 'Wei', value: 'wei' },
		],
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['convertUnits'],
			},
		},
	},
	{
		displayName: 'To Unit',
		name: 'toUnit',
		type: 'options' as const,
		default: 'cogs',
		options: [
			{ name: 'AGIX', value: 'agix' },
			{ name: 'Cogs', value: 'cogs' },
			{ name: 'ETH', value: 'eth' },
			{ name: 'Wei', value: 'wei' },
		],
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['convertUnits'],
			},
		},
	},
	{
		displayName: 'Address',
		name: 'address',
		type: 'string' as const,
		default: '',
		required: true,
		description: 'Address to validate',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['validateAddress'],
			},
		},
	},
];

export async function executeUtility(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	let result: { [key: string]: any };

	switch (operation) {
		case 'convertUnits': {
			const amount = this.getNodeParameter('amount', itemIndex) as number;
			const fromUnit = this.getNodeParameter('fromUnit', itemIndex) as string;
			const toUnit = this.getNodeParameter('toUnit', itemIndex) as string;

			let converted: number | bigint = amount;
			let fromValue = amount;
			let toValue: number | string = 0;

			if (fromUnit === 'agix' && toUnit === 'cogs') {
				toValue = agixToCogs(amount).toString();
			} else if (fromUnit === 'cogs' && toUnit === 'agix') {
				toValue = cogsToAgix(BigInt(amount));
			} else if (fromUnit === 'eth' && toUnit === 'wei') {
				toValue = ethToWei(amount).toString();
			} else if (fromUnit === 'wei' && toUnit === 'eth') {
				toValue = weiToEth(BigInt(amount));
			} else {
				toValue = amount;
			}

			result = {
				fromAmount: amount,
				fromUnit,
				toAmount: toValue,
				toUnit,
			};
			break;
		}

		case 'getGasEstimate': {
			const credentials = await this.getCredentials('singularitynetNetworkApi');
			const ethClient = createEthereumClient(credentials as Record<string, unknown>);
			const gasPrice = await ethClient.getGasPrice();

			result = {
				gasPriceWei: gasPrice.toString(),
				gasPriceGwei: Number(gasPrice) / 1e9,
				network: ethClient.getNetworkConfig().name,
			};
			break;
		}

		case 'getNetworkStatus': {
			const credentials = await this.getCredentials('singularitynetNetworkApi');
			const ethClient = createEthereumClient(credentials as Record<string, unknown>);
			const currentBlock = await ethClient.getCurrentBlock();
			const gasPrice = await ethClient.getGasPrice();

			result = {
				network: ethClient.getNetworkConfig().name,
				chainId: ethClient.getNetworkConfig().chainId,
				currentBlock,
				gasPriceGwei: Number(gasPrice) / 1e9,
				timestamp: new Date().toISOString(),
			};
			break;
		}

		case 'validateAddress': {
			const address = this.getNodeParameter('address', itemIndex) as string;
			const { EthereumClient } = await import('../../transport/ethereumClient');
			const isValid = EthereumClient.isValidAddress(address);

			result = {
				address,
				isValid,
				type: isValid ? 'ethereum' : 'invalid',
			};
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown utility operation: ${operation}`);
	}

	return [{ json: result }];
}
