/**
 * Escrow Actions
 * Manage MPE (Multi-Party Escrow) on SingularityNET
 */

import type { IExecuteFunctions, INodeExecutionData, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createEthereumClient } from '../../transport/ethereumClient';
import { cogsToAgix, agixToCogs, formatTokenAmount } from '../../utils/unitConverter';

export const escrowOperations: INodePropertyOptions[] = [
	{ name: 'Get Escrow Balance', value: 'getEscrowBalance', description: 'Get MPE escrow balance' },
	{ name: 'Deposit AGIX', value: 'depositAgix', description: 'Deposit AGIX to MPE escrow' },
	{ name: 'Withdraw AGIX', value: 'withdrawAgix', description: 'Withdraw AGIX from MPE escrow' },
	{ name: 'Get Escrow Contract', value: 'getEscrowContract', description: 'Get MPE contract information' },
	{ name: 'Calculate Required Deposit', value: 'calculateDeposit', description: 'Calculate required deposit' },
];

export const escrowFields = [
	{
		displayName: 'Address',
		name: 'address',
		type: 'string' as const,
		default: '',
		description: 'Wallet address (uses configured wallet if empty)',
		displayOptions: {
			show: {
				resource: ['escrow'],
				operation: ['getEscrowBalance'],
			},
		},
	},
	{
		displayName: 'Amount (AGIX)',
		name: 'amount',
		type: 'number' as const,
		default: 1,
		required: true,
		description: 'Amount in AGIX',
		displayOptions: {
			show: {
				resource: ['escrow'],
				operation: ['depositAgix', 'withdrawAgix'],
			},
		},
	},
	{
		displayName: 'Price Per Call (AGIX)',
		name: 'pricePerCall',
		type: 'number' as const,
		default: 0.001,
		description: 'Service price per call in AGIX',
		displayOptions: {
			show: {
				resource: ['escrow'],
				operation: ['calculateDeposit'],
			},
		},
	},
	{
		displayName: 'Number of Calls',
		name: 'numberOfCalls',
		type: 'number' as const,
		default: 100,
		description: 'Expected number of service calls',
		displayOptions: {
			show: {
				resource: ['escrow'],
				operation: ['calculateDeposit'],
			},
		},
	},
];

export async function executeEscrowAction(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('singularitynetNetworkApi');
	const ethClient = createEthereumClient(credentials as Record<string, unknown>);

	let result: { [key: string]: any };

	switch (operation) {
		case 'getEscrowBalance': {
			const address = this.getNodeParameter('address', itemIndex, '') as string;
			const walletAddress = address || ethClient.getAddress();
			const balance = await ethClient.getEscrowBalance(walletAddress);

			result = {
				address: walletAddress,
				escrowBalanceInCogs: balance.toString(),
				escrowBalanceInAgix: cogsToAgix(balance),
				formatted: formatTokenAmount(cogsToAgix(balance), 'AGIX'),
				mpeAddress: ethClient.getMpeAddress(),
			};
			break;
		}

		case 'depositAgix': {
			const amount = this.getNodeParameter('amount', itemIndex) as number;
			const amountCogs = agixToCogs(amount);
			const tx = await ethClient.depositToEscrow(amountCogs);

			result = {
				success: tx.status === 'success',
				transactionHash: tx.hash,
				blockNumber: tx.blockNumber,
				amountDepositedAgix: amount,
				amountDepositedCogs: amountCogs.toString(),
			};
			break;
		}

		case 'withdrawAgix': {
			const amount = this.getNodeParameter('amount', itemIndex) as number;
			const amountCogs = agixToCogs(amount);
			const tx = await ethClient.withdrawFromEscrow(amountCogs);

			result = {
				success: tx.status === 'success',
				transactionHash: tx.hash,
				blockNumber: tx.blockNumber,
				amountWithdrawnAgix: amount,
				amountWithdrawnCogs: amountCogs.toString(),
			};
			break;
		}

		case 'getEscrowContract': {
			const networkConfig = ethClient.getNetworkConfig();

			result = {
				mpeAddress: ethClient.getMpeAddress(),
				registryAddress: ethClient.getRegistryAddress(),
				network: networkConfig.name,
				chainId: networkConfig.chainId,
			};
			break;
		}

		case 'calculateDeposit': {
			const pricePerCall = this.getNodeParameter('pricePerCall', itemIndex) as number;
			const numberOfCalls = this.getNodeParameter('numberOfCalls', itemIndex) as number;
			
			const totalAgix = pricePerCall * numberOfCalls;
			const totalCogs = agixToCogs(totalAgix);
			const recommendedBuffer = totalAgix * 1.1;

			result = {
				pricePerCall,
				numberOfCalls,
				totalRequiredAgix: totalAgix,
				totalRequiredCogs: totalCogs.toString(),
				recommendedDepositAgix: recommendedBuffer,
				formatted: formatTokenAmount(recommendedBuffer, 'AGIX'),
			};
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown escrow operation: ${operation}`);
	}

	return [{ json: result }];
}
