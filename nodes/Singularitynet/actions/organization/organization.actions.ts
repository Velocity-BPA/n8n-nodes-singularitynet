/**
 * Organization Actions
 * Explore AI service organizations on SingularityNET
 */

import type { IExecuteFunctions, INodeExecutionData, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { PlatformApi } from '../../transport/platformApi';

export const organizationOperations: INodePropertyOptions[] = [
	{ name: 'Get All Organizations', value: 'getAllOrganizations', description: 'Get all organizations' },
	{ name: 'Get Organization Info', value: 'getOrganizationInfo', description: 'Get organization details' },
	{ name: 'Get Organization Services', value: 'getOrganizationServices', description: 'Get services from organization' },
];

export const organizationFields = [
	{
		displayName: 'Organization ID',
		name: 'organizationId',
		type: 'string' as const,
		default: '',
		required: true,
		description: 'The organization ID',
		displayOptions: {
			show: {
				resource: ['organization'],
				operation: ['getOrganizationInfo', 'getOrganizationServices'],
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
				resource: ['organization'],
				operation: ['getAllOrganizations'],
			},
		},
	},
];

export async function executeOrganizationAction(
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
		case 'getAllOrganizations': {
			const limit = this.getNodeParameter('limit', itemIndex, 20) as number;
			const organizations = await platformApi.getOrganizations();
			result = { organizations: organizations.slice(0, limit), count: organizations.length };
			break;
		}

		case 'getOrganizationInfo': {
			const orgId = this.getNodeParameter('organizationId', itemIndex) as string;
			const organization = await platformApi.getOrganization(orgId);
			result = { organization, organizationId: orgId };
			break;
		}

		case 'getOrganizationServices': {
			const orgId = this.getNodeParameter('organizationId', itemIndex) as string;
			const services = await platformApi.getOrganizationServices(orgId);
			result = { organizationId: orgId, services, count: services.length };
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown organization operation: ${operation}`);
	}

	return [{ json: result }];
}
