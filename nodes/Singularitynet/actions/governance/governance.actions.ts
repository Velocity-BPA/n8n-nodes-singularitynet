/**
 * Governance Actions
 * DAO governance operations for SingularityNET
 */

import type { IExecuteFunctions, INodeExecutionData, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createEthereumClient } from '../../transport/ethereumClient';

export const governanceOperations: INodePropertyOptions[] = [
	{ name: 'Get Proposals', value: 'getProposals', description: 'Get governance proposals' },
	{ name: 'Get Governance Parameters', value: 'getGovernanceParams', description: 'Get governance parameters' },
	{ name: 'Get Voting Power', value: 'getVotingPower', description: 'Get voting power for an address' },
];

export const governanceFields = [
	{
		displayName: 'Address',
		name: 'address',
		type: 'string' as const,
		default: '',
		description: 'Wallet address (uses configured wallet if empty)',
		displayOptions: {
			show: {
				resource: ['governance'],
				operation: ['getVotingPower'],
			},
		},
	},
];

export async function executeGovernanceAction(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('singularitynetNetworkApi');
	const ethClient = createEthereumClient(credentials as Record<string, unknown>);

	let result: Record<string, any>;

	switch (operation) {
		case 'getProposals': {
			result = {
				proposals: [],
				note: 'Governance proposals require governance contract query',
				network: ethClient.getNetworkConfig().name,
				governanceAddress: ethClient.getNetworkConfig().stakingAddress || 'Not configured',
			};
			break;
		}

		case 'getGovernanceParams': {
			result = {
				votingPeriod: 'Determined by governance contract',
				quorum: 'Determined by governance contract',
				proposalThreshold: 'Determined by governance contract',
				network: ethClient.getNetworkConfig().name,
				note: 'Full parameters require governance contract query',
			};
			break;
		}

		case 'getVotingPower': {
			const address = this.getNodeParameter('address', itemIndex, '') as string;
			const walletAddress = address || ethClient.getAddress();
			const agixBalance = await ethClient.getAgixBalance(walletAddress);

			result = {
				address: walletAddress,
				agixBalance: Number(agixBalance) / 1e8,
				votingPowerNote: 'Voting power is typically proportional to AGIX balance',
				network: ethClient.getNetworkConfig().name,
			};
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown governance operation: ${operation}`);
	}

	return [{ json: result }];
}
