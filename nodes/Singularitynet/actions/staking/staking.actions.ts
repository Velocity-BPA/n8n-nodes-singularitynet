/**
 * Staking Actions
 * AGIX staking operations
 */

import type { IExecuteFunctions, INodeExecutionData, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createEthereumClient } from '../../transport/ethereumClient';
import { cogsToAgix } from '../../utils/unitConverter';

export const stakingOperations: INodePropertyOptions[] = [
	{ name: 'Get Staking Info', value: 'getStakingInfo', description: 'Get staking contract information' },
	{ name: 'Get Stake Position', value: 'getStakePosition', description: 'Get current stake for an address' },
	{ name: 'Get Staking APY', value: 'getStakingApy', description: 'Get current staking APY' },
];

export const stakingFields = [
	{
		displayName: 'Address',
		name: 'address',
		type: 'string' as const,
		default: '',
		description: 'Wallet address (uses configured wallet if empty)',
		displayOptions: {
			show: {
				resource: ['staking'],
				operation: ['getStakePosition'],
			},
		},
	},
];

export async function executeStakingAction(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('singularitynetNetworkApi');
	const ethClient = createEthereumClient(credentials as Record<string, unknown>);

	let result: Record<string, any>;

	switch (operation) {
		case 'getStakingInfo': {
			const networkConfig = ethClient.getNetworkConfig();
			
			result = {
				stakingContract: networkConfig.stakingAddress || 'Not configured',
				token: 'AGIX',
				network: networkConfig.name,
				note: 'Full staking info requires staking contract query',
			};
			break;
		}

		case 'getStakePosition': {
			const address = this.getNodeParameter('address', itemIndex, '') as string;
			const walletAddress = address || ethClient.getAddress();
			const agixBalance = await ethClient.getAgixBalance(walletAddress);

			result = {
				address: walletAddress,
				walletBalance: cogsToAgix(agixBalance),
				stakedAmount: 'Requires staking contract query',
				pendingRewards: 'Requires staking contract query',
				network: ethClient.getNetworkConfig().name,
			};
			break;
		}

		case 'getStakingApy': {
			result = {
				estimatedApy: 'Variable',
				note: 'APY is calculated from staking rewards and total staked amount',
				network: ethClient.getNetworkConfig().name,
			};
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown staking operation: ${operation}`);
	}

	return [{ json: result }];
}
