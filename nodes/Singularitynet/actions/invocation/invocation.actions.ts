/**
 * AI Invocation Actions
 * Call AI services on SingularityNET
 */

import type { IExecuteFunctions, INodeExecutionData, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { PlatformApi } from '../../transport/platformApi';

export const invocationOperations: INodePropertyOptions[] = [
	{ name: 'Get Service Info', value: 'getServiceInfo', description: 'Get service information for invocation' },
	{ name: 'Get Free Call Info', value: 'getFreeCallInfo', description: 'Get free call availability' },
];

export const invocationFields = [
	{
		displayName: 'Organization ID',
		name: 'organizationId',
		type: 'string' as const,
		default: '',
		required: true,
		description: 'The organization ID',
		displayOptions: {
			show: {
				resource: ['invocation'],
				operation: ['getServiceInfo', 'getFreeCallInfo'],
			},
		},
	},
	{
		displayName: 'Service ID',
		name: 'serviceId',
		type: 'string' as const,
		default: '',
		required: true,
		description: 'The service ID',
		displayOptions: {
			show: {
				resource: ['invocation'],
				operation: ['getServiceInfo', 'getFreeCallInfo'],
			},
		},
	},
	{
		displayName: 'User Address',
		name: 'userAddress',
		type: 'string' as const,
		default: '',
		description: 'User wallet address for free call info',
		displayOptions: {
			show: {
				resource: ['invocation'],
				operation: ['getFreeCallInfo'],
			},
		},
	},
];

export async function executeInvocationAction(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const platformCredentials = await this.getCredentials('singularitynetPlatformApi');
	const platformApi = new PlatformApi({
		environment: platformCredentials.environment as string,
		apiKey: platformCredentials.apiKey as string,
	});

	let result: { [key: string]: any };

	switch (operation) {
		case 'getServiceInfo': {
			const orgId = this.getNodeParameter('organizationId', itemIndex) as string;
			const serviceId = this.getNodeParameter('serviceId', itemIndex) as string;
			const service = await platformApi.getService(orgId, serviceId);
			
			result = {
				organizationId: orgId,
				serviceId,
				displayName: service.display_name,
				description: service.service_description?.description,
				groups: service.groups?.map(g => ({
					groupId: g.group_id,
					groupName: g.group_name,
					endpoints: g.endpoints,
					pricing: g.pricing,
					freeCalls: g.free_calls,
				})),
				mpeAddress: service.mpe_address,
			};
			break;
		}

		case 'getFreeCallInfo': {
			const orgId = this.getNodeParameter('organizationId', itemIndex) as string;
			const serviceId = this.getNodeParameter('serviceId', itemIndex) as string;
			const userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;

			if (userAddress) {
				const freeCallInfo = await platformApi.getFreeCallInfo(orgId, serviceId, userAddress);
				result = {
					organizationId: orgId,
					serviceId,
					userAddress,
					...freeCallInfo,
				};
			} else {
				const service = await platformApi.getService(orgId, serviceId);
				result = {
					organizationId: orgId,
					serviceId,
					freeCalls: service.groups?.[0]?.free_calls || 0,
					note: 'Provide user address for remaining free calls count',
				};
			}
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown invocation operation: ${operation}`);
	}

	return [{ json: result }];
}
