/**
 * Marketplace Actions Handler
 * Browse, search, and interact with the SingularityNET AI marketplace
 */

import type { IExecuteFunctions, INodeExecutionData, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { PlatformApi } from '../../transport/platformApi';

export const marketplaceOperations: INodePropertyOptions[] = [
	{ name: 'Browse Services', value: 'browseServices', description: 'Browse available AI services' },
	{ name: 'Get Featured Services', value: 'getFeaturedServices', description: 'Get featured AI services' },
	{ name: 'Get Popular Services', value: 'getPopularServices', description: 'Get popular services' },
	{ name: 'Get New Services', value: 'getNewServices', description: 'Get recently added services' },
	{ name: 'Get Categories', value: 'getCategories', description: 'Get service categories' },
	{ name: 'Get Service Reviews', value: 'getServiceReviews', description: 'Get reviews for a service' },
];

export const marketplaceFields = [
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number' as const,
		default: 20,
		description: 'Maximum number of services to return',
		displayOptions: {
			show: {
				resource: ['marketplace'],
				operation: ['browseServices', 'getFeaturedServices', 'getPopularServices', 'getNewServices'],
			},
		},
	},
	{
		displayName: 'Organization ID',
		name: 'organizationId',
		type: 'string' as const,
		default: '',
		required: true,
		description: 'The organization ID',
		displayOptions: {
			show: {
				resource: ['marketplace'],
				operation: ['getServiceReviews'],
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
				resource: ['marketplace'],
				operation: ['getServiceReviews'],
			},
		},
	},
];

export async function executeMarketplaceAction(
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
		case 'browseServices': {
			const limit = this.getNodeParameter('limit', itemIndex, 20) as number;
			const response = await platformApi.getServices({ limit });
			result = {
				services: response.services,
				totalCount: response.total_count,
				limit,
			};
			break;
		}

		case 'getFeaturedServices': {
			const services = await platformApi.getFeaturedServices();
			result = {
				services,
				count: services.length,
				type: 'featured',
			};
			break;
		}

		case 'getPopularServices': {
			const limit = this.getNodeParameter('limit', itemIndex, 20) as number;
			const services = await platformApi.getPopularServices(limit);
			result = {
				services,
				count: services.length,
				type: 'popular',
			};
			break;
		}

		case 'getNewServices': {
			const limit = this.getNodeParameter('limit', itemIndex, 20) as number;
			const services = await platformApi.getNewServices(limit);
			result = {
				services,
				count: services.length,
				type: 'new',
			};
			break;
		}

		case 'getCategories': {
			const categories = await platformApi.getCategories();
			result = {
				categories,
				count: categories.length,
			};
			break;
		}

		case 'getServiceReviews': {
			const organizationId = this.getNodeParameter('organizationId', itemIndex) as string;
			const serviceId = this.getNodeParameter('serviceId', itemIndex) as string;
			const reviews = await platformApi.getServiceReviews(organizationId, serviceId);
			const rating = await platformApi.getServiceRating(organizationId, serviceId);

			result = {
				organizationId,
				serviceId,
				rating,
				reviews,
				reviewCount: reviews.length,
			};
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown marketplace operation: ${operation}`);
	}

	return [{ json: result }];
}
