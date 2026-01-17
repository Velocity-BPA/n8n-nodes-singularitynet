import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * SingularityNET Network Credentials
 *
 * Handles authentication for blockchain networks (Ethereum/Cardano)
 * used to interact with SingularityNET smart contracts and services.
 */
export class SingularitynetNetwork implements ICredentialType {
	name = 'singularitynetNetwork';
	displayName = 'SingularityNET Network';
	documentationUrl = 'https://dev.singularitynet.io/docs/';
	properties: INodeProperties[] = [
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{
					name: 'Ethereum Mainnet',
					value: 'ethereumMainnet',
					description: 'Ethereum mainnet for production use',
				},
				{
					name: 'Ethereum Sepolia (Testnet)',
					value: 'ethereumSepolia',
					description: 'Ethereum Sepolia testnet for development',
				},
				{
					name: 'Cardano Mainnet',
					value: 'cardanoMainnet',
					description: 'Cardano mainnet for production use',
				},
				{
					name: 'Cardano Preprod (Testnet)',
					value: 'cardanoPreprod',
					description: 'Cardano pre-production testnet',
				},
				{
					name: 'Custom Endpoint',
					value: 'custom',
					description: 'Custom RPC endpoint',
				},
			],
			default: 'ethereumMainnet',
			description: 'Select the blockchain network to connect to',
		},
		{
			displayName: 'Ethereum RPC URL',
			name: 'ethereumRpcUrl',
			type: 'string',
			default: '',
			placeholder: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
			description: 'Ethereum JSON-RPC endpoint URL (Infura, Alchemy, or custom)',
			displayOptions: {
				show: {
					network: ['ethereumMainnet', 'ethereumSepolia', 'custom'],
				},
			},
		},
		{
			displayName: 'Cardano Node URL',
			name: 'cardanoNodeUrl',
			type: 'string',
			default: '',
			placeholder: 'https://cardano-mainnet.blockfrost.io/api/v0',
			description: 'Cardano node endpoint URL (Blockfrost or custom)',
			displayOptions: {
				show: {
					network: ['cardanoMainnet', 'cardanoPreprod', 'custom'],
				},
			},
		},
		{
			displayName: 'Cardano API Key',
			name: 'cardanoApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Blockfrost API key for Cardano network access',
			displayOptions: {
				show: {
					network: ['cardanoMainnet', 'cardanoPreprod'],
				},
			},
		},
		{
			displayName: 'Authentication Method',
			name: 'authMethod',
			type: 'options',
			options: [
				{
					name: 'Private Key',
					value: 'privateKey',
					description: 'Use a private key directly',
				},
				{
					name: 'Mnemonic Phrase',
					value: 'mnemonic',
					description: 'Use a 12/24 word seed phrase',
				},
			],
			default: 'privateKey',
			description: 'Method to authenticate with the blockchain',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: '0x...',
			description: 'Your wallet private key (never share this!)',
			displayOptions: {
				show: {
					authMethod: ['privateKey'],
				},
			},
		},
		{
			displayName: 'Mnemonic Phrase',
			name: 'mnemonic',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'word1 word2 word3 ...',
			description: 'Your 12 or 24 word recovery phrase (never share this!)',
			displayOptions: {
				show: {
					authMethod: ['mnemonic'],
				},
			},
		},
		{
			displayName: 'Derivation Path',
			name: 'derivationPath',
			type: 'string',
			default: "m/44'/60'/0'/0/0",
			description: 'HD wallet derivation path (default for Ethereum)',
			displayOptions: {
				show: {
					authMethod: ['mnemonic'],
				},
			},
		},
		{
			displayName: 'IPFS Gateway URL',
			name: 'ipfsGateway',
			type: 'string',
			default: 'https://ipfs.singularitynet.io',
			placeholder: 'https://ipfs.io',
			description: 'IPFS gateway for retrieving service metadata',
		},
		{
			displayName: 'Daemon Endpoint',
			name: 'daemonEndpoint',
			type: 'string',
			default: '',
			placeholder: 'https://daemon.example.com:7000',
			description: 'Optional: Direct daemon endpoint for service calls',
		},
	];

	// Test the credential by checking network connectivity
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.ethereumRpcUrl || "https://mainnet.infura.io/v3/"}}',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				jsonrpc: '2.0',
				method: 'eth_blockNumber',
				params: [],
				id: 1,
			}),
		},
	};
}
