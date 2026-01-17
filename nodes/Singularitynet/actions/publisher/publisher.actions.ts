/**
 * Publisher Actions
 * Service publishing operations
 */

import type { IExecuteFunctions, INodeExecutionData, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createEthereumClient } from '../../transport/ethereumClient';
import { PlatformApi } from '../../transport/platformApi';

export const publisherOperations: INodePropertyOptions[] = [
	{ name: 'Get Publishing Status', value: 'getPublishingStatus', description: 'Get publishing status' },
	{ name: 'Get Organization Info', value: 'getOrganizationInfo', description: 'Get organization publishing info' },
];

export const publisherFields = [
	{
		displayName: 'Organization ID',
		name: 'organizationId',
		type: 'string' as const,
		default: '',
		required: true,
		description: 'The organization ID',
		displayOptions: {
			show: {
				resource: ['publisher'],
				operation: ['getOrganizationInfo'],
			},
		},
	},
];

export async function executePublisherAction(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('singularitynetNetworkApi');
	const ethClient = createEthereumClient(credentials as Record<string, unknown>);

	let result: Record<string, any>;

	switch (operation) {
		case 'getPublishingStatus': {
			const networkConfig = ethClient.getNetworkConfig();
			
			result = {
				registryAddress: networkConfig.registryAddress,
				network: networkConfig.name,
				publisherAddress: ethClient.getAddress(),
				note: 'Publishing requires registry contract interaction',
			};
			break;
		}

		case 'getOrganizationInfo': {
			const organizationId = this.getNodeParameter('organizationId', itemIndex) as string;
			
			result = {
				organizationId,
				registryAddress: ethClient.getRegistryAddress(),
				network: ethClient.getNetworkConfig().name,
				note: 'Organization details require registry contract query',
			};
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown publisher operation: ${operation}`);
	}

	return [{ json: result }];
}
