/**
 * Daemon Actions
 * Service daemon monitoring
 */

import type { IExecuteFunctions, INodeExecutionData, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import axios from 'axios';

export const daemonOperations: INodePropertyOptions[] = [
	{ name: 'Health Check', value: 'healthCheck', description: 'Check daemon health status' },
	{ name: 'Get Daemon Status', value: 'getDaemonStatus', description: 'Get daemon status' },
	{ name: 'Get Daemon Config', value: 'getDaemonConfig', description: 'Get daemon configuration' },
];

export const daemonFields = [
	{
		displayName: 'Daemon Endpoint',
		name: 'daemonEndpoint',
		type: 'string' as const,
		default: '',
		required: true,
		description: 'The daemon endpoint URL',
		displayOptions: {
			show: {
				resource: ['daemon'],
				operation: ['healthCheck', 'getDaemonStatus', 'getDaemonConfig'],
			},
		},
	},
];

export async function executeDaemonAction(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const daemonEndpoint = this.getNodeParameter('daemonEndpoint', itemIndex) as string;

	let result: Record<string, any>;

	switch (operation) {
		case 'healthCheck': {
			try {
				const response = await axios.get(`${daemonEndpoint}/health`, { timeout: 5000 });
				result = {
					endpoint: daemonEndpoint,
					status: 'healthy',
					response: response.data,
					timestamp: new Date().toISOString(),
				};
			} catch (error) {
				result = {
					endpoint: daemonEndpoint,
					status: 'unhealthy',
					error: (error as Error).message,
					timestamp: new Date().toISOString(),
				};
			}
			break;
		}

		case 'getDaemonStatus': {
			try {
				const response = await axios.get(`${daemonEndpoint}/status`, { timeout: 5000 });
				result = {
					endpoint: daemonEndpoint,
					status: response.data,
					timestamp: new Date().toISOString(),
				};
			} catch (error) {
				result = {
					endpoint: daemonEndpoint,
					error: (error as Error).message,
					note: 'Daemon may not be running or endpoint is incorrect',
				};
			}
			break;
		}

		case 'getDaemonConfig': {
			result = {
				endpoint: daemonEndpoint,
				note: 'Daemon configuration is typically not exposed via public endpoints',
				suggestedEndpoints: [
					`${daemonEndpoint}/health`,
					`${daemonEndpoint}/status`,
					`${daemonEndpoint}/encoding`,
				],
			};
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown daemon operation: ${operation}`);
	}

	return [{ json: result }];
}
