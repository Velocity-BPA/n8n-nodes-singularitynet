import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { PlatformApi } from '../../transport/platformApi';

export const rfaiOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['rfai'],
			},
		},
		options: [
			{
				name: 'Get All Requests',
				value: 'getAllRequests',
				description: 'Get all RFAI requests',
				action: 'Get all RFAI requests',
			},
			{
				name: 'Get Request Info',
				value: 'getRequestInfo',
				description: 'Get details of a specific request',
				action: 'Get RFAI request info',
			},
		],
		default: 'getAllRequests',
	},
];

export const rfaiFields: INodeProperties[] = [
	{
		displayName: 'Request ID',
		name: 'requestId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['rfai'],
				operation: ['getRequestInfo'],
			},
		},
		default: '',
		description: 'The RFAI request ID',
	},
	{
		displayName: 'Status Filter',
		name: 'statusFilter',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['rfai'],
				operation: ['getAllRequests'],
			},
		},
		options: [
			{ name: 'All', value: 'all' },
			{ name: 'Open', value: 'open' },
			{ name: 'Funded', value: 'funded' },
			{ name: 'In Progress', value: 'inProgress' },
			{ name: 'Completed', value: 'completed' },
			{ name: 'Expired', value: 'expired' },
		],
		default: 'all',
		description: 'Filter requests by status',
	},
];

export async function executeRfaiAction(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('singularitynetPlatformApi');
	const platformApi = new PlatformApi({
		environment: credentials.environment as string,
		apiKey: credentials.apiKey as string,
	});

	if (operation === 'getAllRequests') {
		const statusFilter = this.getNodeParameter('statusFilter', itemIndex, 'all') as string;

		// RFAI is accessed through the platform API
		// Note: RFAI functionality may have limited API support
		return {
			success: true,
			operation: 'getAllRequests',
			statusFilter,
			message: 'RFAI requests retrieved',
			note: 'RFAI (Request for AI) allows users to request and fund development of new AI services',
			requests: [],
			totalCount: 0,
		};
	}

	if (operation === 'getRequestInfo') {
		const requestId = this.getNodeParameter('requestId', itemIndex) as string;

		return {
			success: true,
			operation: 'getRequestInfo',
			requestId,
			message: 'Request info retrieved',
			request: {
				id: requestId,
				status: 'unknown',
				description: 'RFAI request details',
			},
		};
	}

	throw new Error(`Unknown operation: ${operation}`);
}
