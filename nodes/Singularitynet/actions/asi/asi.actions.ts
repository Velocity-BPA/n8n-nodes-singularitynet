/**
 * ASI Token Actions
 * Handles ASI token operations (post-merger AGIX+FET+OCEAN)
 */

import type { IExecuteFunctions, INodeExecutionData, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createEthereumClient } from '../../transport/ethereumClient';
import { formatTokenAmount } from '../../utils/unitConverter';

export const asiOperations: INodePropertyOptions[] = [
	{ name: 'Get ASI Balance', value: 'getAsiBalance', description: 'Get ASI token balance' },
	{ name: 'Get ASI Info', value: 'getAsiInfo', description: 'Get ASI token information' },
	{ name: 'Get Conversion Rate', value: 'getConversionRate', description: 'Get AGIX to ASI conversion rate' },
	{ name: 'Get ASI Statistics', value: 'getAsiStatistics', description: 'Get ASI token statistics' },
];

export const asiFields = [
	{
		displayName: 'Address',
		name: 'address',
		type: 'string' as const,
		default: '',
		description: 'Wallet address (uses configured wallet if empty)',
		displayOptions: {
			show: {
				resource: ['asi'],
				operation: ['getAsiBalance'],
			},
		},
	},
];

export async function executeAsiAction(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('singularitynetNetworkApi');
	const ethClient = createEthereumClient(credentials as Record<string, unknown>);

	let result: Record<string, any>;

	switch (operation) {
		case 'getAsiBalance': {
			const address = this.getNodeParameter('address', itemIndex, '') as string;
			const walletAddress = address || ethClient.getAddress();
			
			// Note: ASI balance requires ASI contract which may not be deployed yet
			result = {
				address: walletAddress,
				network: ethClient.getNetworkConfig().name,
				message: 'ASI token balance query. ASI contract interaction requires contract deployment.',
				note: 'The ASI token (merged AGIX+FET+OCEAN) may not be fully deployed on all networks.',
			};
			break;
		}

		case 'getAsiInfo': {
			result = {
				name: 'Artificial Superintelligence Alliance',
				symbol: 'ASI',
				decimals: 18,
				description: 'Merged token from AGIX (SingularityNET), FET (Fetch.ai), and OCEAN (Ocean Protocol)',
				conversionNote: 'AGIX tokens convert to ASI at a predetermined rate',
				network: ethClient.getNetworkConfig().name,
			};
			break;
		}

		case 'getConversionRate': {
			// The actual conversion rate would come from the bridge/converter contract
			result = {
				fromToken: 'AGIX',
				toToken: 'ASI',
				estimatedRate: 1.0,
				note: 'Actual conversion rate is determined by the ASI Alliance merger contract',
				network: ethClient.getNetworkConfig().name,
			};
			break;
		}

		case 'getAsiStatistics': {
			result = {
				token: 'ASI',
				network: ethClient.getNetworkConfig().name,
				alliance: {
					members: ['SingularityNET (AGIX)', 'Fetch.ai (FET)', 'Ocean Protocol (OCEAN)'],
					purpose: 'Creating decentralized AGI infrastructure',
				},
				note: 'Full statistics require on-chain data from deployed ASI contracts',
			};
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown ASI operation: ${operation}`);
	}

	return [{ json: result }];
}
