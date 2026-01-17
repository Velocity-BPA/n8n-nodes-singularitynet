/**
 * IPFS Actions
 * IPFS file and metadata operations
 */

import type { IExecuteFunctions, INodeExecutionData, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { IpfsClient } from '../../transport/ipfsClient';

export const ipfsOperations: INodePropertyOptions[] = [
	{ name: 'Get Metadata', value: 'getMetadata', description: 'Get metadata from IPFS hash' },
	{ name: 'Get IPFS Hash', value: 'getIpfsHash', description: 'Calculate IPFS hash for content' },
	{ name: 'Validate Metadata', value: 'validateMetadata', description: 'Validate service metadata format' },
];

export const ipfsFields = [
	{
		displayName: 'IPFS Hash',
		name: 'ipfsHash',
		type: 'string' as const,
		default: '',
		required: true,
		description: 'The IPFS hash (CID)',
		displayOptions: {
			show: {
				resource: ['ipfs'],
				operation: ['getMetadata'],
			},
		},
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'string' as const,
		default: '',
		required: true,
		description: 'Content to hash',
		displayOptions: {
			show: {
				resource: ['ipfs'],
				operation: ['getIpfsHash'],
			},
		},
	},
	{
		displayName: 'Metadata JSON',
		name: 'metadataJson',
		type: 'json' as const,
		default: '{}',
		description: 'Metadata JSON to validate',
		displayOptions: {
			show: {
				resource: ['ipfs'],
				operation: ['validateMetadata'],
			},
		},
	},
];

export async function executeIpfsAction(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const ipfsClient = new IpfsClient();

	let result: Record<string, any>;

	switch (operation) {
		case 'getMetadata': {
			const ipfsHash = this.getNodeParameter('ipfsHash', itemIndex) as string;
			
			try {
				const metadata = await ipfsClient.getJson(ipfsHash);
				result = {
					ipfsHash,
					metadata,
					success: true,
				};
			} catch (error) {
				result = {
					ipfsHash,
					error: (error as Error).message,
					success: false,
				};
			}
			break;
		}

		case 'getIpfsHash': {
			const content = this.getNodeParameter('content', itemIndex) as string;
			
			result = {
				content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
				note: 'Hash calculation requires IPFS client',
			};
			break;
		}

		case 'validateMetadata': {
			const metadataJson = this.getNodeParameter('metadataJson', itemIndex) as string;
			
			try {
				const metadata = JSON.parse(metadataJson);
				const hasRequiredFields = metadata.display_name && metadata.description;
				
				result = {
					valid: hasRequiredFields,
					metadata,
					requiredFields: ['display_name', 'description'],
					missingFields: [
						...(!metadata.display_name ? ['display_name'] : []),
						...(!metadata.description ? ['description'] : []),
					],
				};
			} catch (error) {
				result = {
					valid: false,
					error: 'Invalid JSON format',
				};
			}
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown IPFS operation: ${operation}`);
	}

	return [{ json: result }];
}
