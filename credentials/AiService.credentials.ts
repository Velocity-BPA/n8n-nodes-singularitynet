import type {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * AI Service Credentials
 *
 * Handles authentication for specific AI services on SingularityNET.
 * Used when directly connecting to a service daemon.
 */
export class AiService implements ICredentialType {
	name = 'aiService';
	displayName = 'SingularityNET AI Service';
	documentationUrl = 'https://dev.singularitynet.io/docs/concepts/service/';
	properties: INodeProperties[] = [
		{
			displayName: 'Organization ID',
			name: 'organizationId',
			type: 'string',
			default: '',
			placeholder: 'snet',
			description: 'The organization that owns this service',
			required: true,
		},
		{
			displayName: 'Service ID',
			name: 'serviceId',
			type: 'string',
			default: '',
			placeholder: 'example-service',
			description: 'The unique identifier for this service',
			required: true,
		},
		{
			displayName: 'Service Endpoint',
			name: 'serviceEndpoint',
			type: 'string',
			default: '',
			placeholder: 'https://service.example.com:7000',
			description: 'Direct endpoint URL for the service daemon',
		},
		{
			displayName: 'Service Group',
			name: 'serviceGroup',
			type: 'string',
			default: 'default_group',
			description: 'Service group name for payment channel routing',
		},
		{
			displayName: 'Use Free Calls',
			name: 'useFreeCalls',
			type: 'boolean',
			default: true,
			description: 'Whether to use free demo calls when available',
		},
		{
			displayName: 'Free Call Token',
			name: 'freeCallToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Token for free call authentication',
			displayOptions: {
				show: {
					useFreeCalls: [true],
				},
			},
		},
		{
			displayName: 'Protocol',
			name: 'protocol',
			type: 'options',
			options: [
				{
					name: 'gRPC',
					value: 'grpc',
					description: 'Standard gRPC protocol',
				},
				{
					name: 'gRPC-Web',
					value: 'grpcWeb',
					description: 'gRPC over HTTP for browser compatibility',
				},
				{
					name: 'REST',
					value: 'rest',
					description: 'REST API (if supported by service)',
				},
			],
			default: 'grpcWeb',
			description: 'Communication protocol for service invocation',
		},
		{
			displayName: 'SSL/TLS',
			name: 'useSsl',
			type: 'boolean',
			default: true,
			description: 'Whether to use SSL/TLS for secure communication',
		},
	];

	// Credentials tested at node level due to service-specific validation
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.serviceEndpoint}}',
			url: '/health',
			method: 'GET',
			skipSslCertificateValidation: '={{!$credentials.useSsl}}',
		},
	};
}
