import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * SingularityNET Platform Credentials
 *
 * Handles authentication for the SingularityNET platform API
 * used for marketplace operations, organization management, etc.
 */
export class SingularitynetPlatform implements ICredentialType {
	name = 'singularitynetPlatform';
	displayName = 'SingularityNET Platform';
	documentationUrl = 'https://dev.singularitynet.io/docs/platform/';
	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
					description: 'Production SingularityNET platform',
				},
				{
					name: 'Staging',
					value: 'staging',
					description: 'Staging environment for testing',
				},
				{
					name: 'Custom',
					value: 'custom',
					description: 'Custom platform endpoint',
				},
			],
			default: 'production',
			description: 'Platform environment to use',
		},
		{
			displayName: 'Custom API Endpoint',
			name: 'customEndpoint',
			type: 'string',
			default: '',
			placeholder: 'https://custom.singularitynet.io/api',
			description: 'Custom platform API endpoint',
			displayOptions: {
				show: {
					environment: ['custom'],
				},
			},
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Platform API key for authenticated requests',
		},
		{
			displayName: 'Identity Address',
			name: 'identityAddress',
			type: 'string',
			default: '',
			placeholder: '0x...',
			description: 'Your blockchain wallet address for identity verification',
		},
		{
			displayName: 'User Token',
			name: 'userToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Optional: User authentication token for marketplace operations',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				'X-Identity-Address': '={{$credentials.identityAddress}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.environment === "production" ? "https://marketplace-api.singularitynet.io" : $credentials.environment === "staging" ? "https://marketplace-api-staging.singularitynet.io" : $credentials.customEndpoint}}',
			url: '/health',
			method: 'GET',
		},
	};
}
