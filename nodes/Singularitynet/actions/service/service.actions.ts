/**
 * Service Actions
 * Browse and discover AI services on SingularityNET
 */

import type { IExecuteFunctions, INodeExecutionData, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { PlatformApi } from '../../transport/platformApi';

export const serviceOperations: INodePropertyOptions[] = [
	{ name: 'Get All Services', value: 'getAllServices', description: 'Get all available AI services' },
	{ name: 'Get Service Info', value: 'getServiceInfo', description: 'Get detailed service information' },
	{ name: 'Search Services', value: 'searchServices', description: 'Search for AI services' },
	{ name: 'Get Services by Organization', value: 'getServicesByOrg', description: 'Get services from an organization' },
	{ name: 'Get Service Rating', value: 'getServiceRating', description: 'Get service rating' },
];

export const serviceFields = [
	{
		displayName: 'Organization ID',
		name: 'organizationId',
		type: 'string' as const,
		default: '',
		required: true,
		description: 'The organization ID',
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['getServiceInfo', 'getServicesByOrg', 'getServiceRating'],
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
				resource: ['service'],
				operation: ['getServiceInfo', 'getServiceRating'],
			},
		},
	},
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string' as const,
		default: '',
		required: true,
		description: 'Search query for services',
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['searchServices'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number' as const,
		default: 20,
		description: 'Maximum number of results',
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['getAllServices', 'searchServices', 'getServicesByOrg'],
			},
		},
	},
];

export async function executeServiceAction(
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
		case 'getAllServices': {
			const limit = this.getNodeParameter('limit', itemIndex, 20) as number;
			const response = await platformApi.getServices({ limit });
			result = { services: response.services, count: response.total_count, limit };
			break;
		}

		case 'getServiceInfo': {
			const orgId = this.getNodeParameter('organizationId', itemIndex) as string;
			const serviceId = this.getNodeParameter('serviceId', itemIndex) as string;
			const service = await platformApi.getService(orgId, serviceId);
			result = { service, organizationId: orgId, serviceId };
			break;
		}

		case 'searchServices': {
			const query = this.getNodeParameter('searchQuery', itemIndex) as string;
			const limit = this.getNodeParameter('limit', itemIndex, 20) as number;
			const services = await platformApi.searchServices(query, limit);
			result = { services, query, count: services.length };
			break;
		}

		case 'getServicesByOrg': {
			const orgId = this.getNodeParameter('organizationId', itemIndex) as string;
			const limit = this.getNodeParameter('limit', itemIndex, 20) as number;
			const services = await platformApi.getOrganizationServices(orgId);
			result = { services: services.slice(0, limit), organizationId: orgId, count: services.length };
			break;
		}

		case 'getServiceRating': {
			const orgId = this.getNodeParameter('organizationId', itemIndex) as string;
			const serviceId = this.getNodeParameter('serviceId', itemIndex) as string;
			const rating = await platformApi.getServiceRating(orgId, serviceId);
			result = { organizationId: orgId, serviceId, rating };
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown service operation: ${operation}`);
	}

	return [{ json: result }];
}
