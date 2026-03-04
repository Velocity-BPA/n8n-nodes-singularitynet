import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class SingularityNETApi implements ICredentialType {
	name = 'singularityNetApi';
	displayName = 'SingularityNET API';
	documentationUrl = 'https://docs.singularitynet.io/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'API key for SingularityNET platform authentication',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.singularitynet.io/v1',
			required: true,
			description: 'Base URL for SingularityNET API endpoints',
		},
	];
}