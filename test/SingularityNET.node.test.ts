/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { SingularityNET } from '../nodes/SingularityNET/SingularityNET.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('SingularityNET Node', () => {
  let node: SingularityNET;

  beforeAll(() => {
    node = new SingularityNET();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('SingularityNET');
      expect(node.description.name).toBe('singularitynet');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 5 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(5);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(5);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('AIService Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://api.singularitynet.io/v1',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	describe('getAll operation', () => {
		it('should successfully get all AI services', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAll')
				.mockReturnValueOnce('computer-vision')
				.mockReturnValueOnce('snet')
				.mockReturnValueOnce(4.5);

			const mockResponse = {
				services: [
					{ id: 'service1', name: 'Face Detection', category: 'computer-vision' },
					{ id: 'service2', name: 'Object Recognition', category: 'computer-vision' },
				],
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAIServiceOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});

		it('should handle getAll operation error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAll')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(0);

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

			await expect(
				executeAIServiceOperations.call(mockExecuteFunctions, [{ json: {} }])
			).rejects.toThrow('API Error');
		});
	});

	describe('get operation', () => {
		it('should successfully get AI service details', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('get')
				.mockReturnValueOnce('face-detect-service');

			const mockResponse = {
				id: 'face-detect-service',
				name: 'Face Detection Service',
				description: 'Detects faces in images',
				category: 'computer-vision',
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAIServiceOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('invoke operation', () => {
		it('should successfully invoke AI service', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('invoke')
				.mockReturnValueOnce('face-detect-service')
				.mockReturnValueOnce({ image_url: 'https://example.com/image.jpg' })
				.mockReturnValueOnce({ confidence_threshold: 0.8 });

			const mockResponse = {
				result: {
					faces: [
						{ x: 100, y: 150, width: 80, height: 100, confidence: 0.95 },
					],
				},
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAIServiceOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('getCategories operation', () => {
		it('should successfully get service categories', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getCategories');

			const mockResponse = {
				categories: ['computer-vision', 'natural-language-processing', 'audio-processing'],
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAIServiceOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('getProviders operation', () => {
		it('should successfully get service providers', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getProviders');

			const mockResponse = {
				providers: [
					{ id: 'snet', name: 'SingularityNET Foundation' },
					{ id: 'partner1', name: 'AI Partner Corp' },
				],
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAIServiceOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});
});

describe('Organization Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-api-key',
				baseUrl: 'https://api.singularitynet.io/v1',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	it('should get all organizations successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getAll')
			.mockReturnValueOnce('')
			.mockReturnValueOnce('')
			.mockReturnValueOnce('');
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue([
			{ id: 'org1', name: 'Test Org 1' },
			{ id: 'org2', name: 'Test Org 2' },
		]);

		const result = await executeOrganizationOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual([
			{ id: 'org1', name: 'Test Org 1' },
			{ id: 'org2', name: 'Test Org 2' },
		]);
	});

	it('should get organization by ID successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('get')
			.mockReturnValueOnce('org-123');
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			id: 'org-123',
			name: 'Test Organization',
		});

		const result = await executeOrganizationOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({
			id: 'org-123',
			name: 'Test Organization',
		});
	});

	it('should create organization successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('create')
			.mockReturnValueOnce('New Organization')
			.mockReturnValueOnce('A test organization')
			.mockReturnValueOnce('company');
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			id: 'org-new',
			name: 'New Organization',
			description: 'A test organization',
			type: 'company',
		});

		const result = await executeOrganizationOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.name).toBe('New Organization');
	});

	it('should update organization successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('update')
			.mockReturnValueOnce('org-123')
			.mockReturnValueOnce('Updated Organization')
			.mockReturnValueOnce('Updated description');
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			id: 'org-123',
			name: 'Updated Organization',
			description: 'Updated description',
		});

		const result = await executeOrganizationOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.name).toBe('Updated Organization');
	});

	it('should delete organization successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('delete')
			.mockReturnValueOnce('org-123');
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			success: true,
			message: 'Organization deleted successfully',
		});

		const result = await executeOrganizationOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.success).toBe(true);
	});

	it('should handle errors when continueOnFail is true', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('get').mockReturnValueOnce('invalid-id');
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Organization not found'));

		const result = await executeOrganizationOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.error).toBe('Organization not found');
	});

	it('should throw error when continueOnFail is false', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('get').mockReturnValueOnce('invalid-id');
		mockExecuteFunctions.continueOnFail.mockReturnValue(false);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Organization not found'));

		await expect(
			executeOrganizationOperations.call(mockExecuteFunctions, [{ json: {} }]),
		).rejects.toThrow('Organization not found');
	});
});

describe('Channel Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://api.singularitynet.io/v1',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	test('should get all channels successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getAll')
			.mockReturnValueOnce('open')
			.mockReturnValueOnce('service-123')
			.mockReturnValueOnce('client-456');
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue([
			{ id: 'channel-1', status: 'open', amount: 100 },
			{ id: 'channel-2', status: 'open', amount: 200 },
		]);

		const result = await executeChannelOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual([
			{ id: 'channel-1', status: 'open', amount: 100 },
			{ id: 'channel-2', status: 'open', amount: 200 },
		]);
	});

	test('should get a channel successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('get')
			.mockReturnValueOnce('channel-123');
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			id: 'channel-123',
			status: 'open',
			amount: 500,
		});

		const result = await executeChannelOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({
			id: 'channel-123',
			status: 'open',
			amount: 500,
		});
	});

	test('should create a channel successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('create')
			.mockReturnValueOnce('service-123')
			.mockReturnValueOnce(1000)
			.mockReturnValueOnce('2024-12-31T23:59:59Z');
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			id: 'channel-new',
			serviceId: 'service-123',
			amount: 1000,
			status: 'pending',
		});

		const result = await executeChannelOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({
			id: 'channel-new',
			serviceId: 'service-123',
			amount: 1000,
			status: 'pending',
		});
	});

	test('should update a channel successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('update')
			.mockReturnValueOnce('channel-123')
			.mockReturnValueOnce(1500)
			.mockReturnValueOnce('0x123abc...');
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			id: 'channel-123',
			amount: 1500,
			status: 'open',
		});

		const result = await executeChannelOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({
			id: 'channel-123',
			amount: 1500,
			status: 'open',
		});
	});

	test('should close a channel successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('close')
			.mockReturnValueOnce('channel-123');
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			id: 'channel-123',
			status: 'closed',
		});

		const result = await executeChannelOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({
			id: 'channel-123',
			status: 'closed',
		});
	});

	test('should handle API errors with continueOnFail', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('get');
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Channel not found'));

		const result = await executeChannelOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({ error: 'Channel not found' });
	});

	test('should throw error for unknown operation', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('unknownOperation');

		await expect(
			executeChannelOperations.call(mockExecuteFunctions, [{ json: {} }])
		).rejects.toThrow('Unknown operation: unknownOperation');
	});
});

describe('Transaction Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://api.singularitynet.io/v1',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	describe('getAll operation', () => {
		it('should get all transactions successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAll')
				.mockReturnValueOnce('pending')
				.mockReturnValueOnce('payment')
				.mockReturnValueOnce('2023-01-01')
				.mockReturnValueOnce('2023-12-31');

			const mockResponse = {
				transactions: [
					{ id: '1', hash: 'tx1', status: 'pending', type: 'payment' },
					{ id: '2', hash: 'tx2', status: 'confirmed', type: 'service_call' },
				],
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.singularitynet.io/v1/transactions?status=pending&type=payment&date_from=2023-01-01&date_to=2023-12-31',
				headers: {
					'Authorization': 'Bearer test-key',
					'Content-Type': 'application/json',
				},
				json: true,
			});
		});

		it('should handle getAll operation error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getAll');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeTransactionOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result[0].json.error).toBe('API Error');
		});
	});

	describe('get operation', () => {
		it('should get transaction details successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('get')
				.mockReturnValueOnce('0x123abc');

			const mockResponse = {
				id: '1',
				hash: '0x123abc',
				status: 'confirmed',
				amount: 100,
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('create operation', () => {
		it('should create transaction successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('create')
				.mockReturnValueOnce('0xrecipient')
				.mockReturnValueOnce(100)
				.mockReturnValueOnce('test data')
				.mockReturnValueOnce(25000);

			const mockResponse = {
				hash: '0x456def',
				status: 'pending',
				amount: 100,
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://api.singularitynet.io/v1/transactions',
				headers: {
					'Authorization': 'Bearer test-key',
					'Content-Type': 'application/json',
				},
				body: {
					to: '0xrecipient',
					amount: 100,
					data: 'test data',
					gas_limit: 25000,
				},
				json: true,
			});
		});
	});

	describe('getStatus operation', () => {
		it('should get transaction status successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getStatus')
				.mockReturnValueOnce('0x789ghi');

			const mockResponse = {
				status: 'confirmed',
				confirmations: 12,
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('getBalance operation', () => {
		it('should get AGIX balance successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getBalance')
				.mockReturnValueOnce('0xwallet');

			const mockResponse = {
				address: '0xwallet',
				balance: '1000.50',
				token: 'AGIX',
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.singularitynet.io/v1/transactions/balance?address=0xwallet',
				headers: {
					'Authorization': 'Bearer test-key',
					'Content-Type': 'application/json',
				},
				json: true,
			});
		});
	});
});

describe('Registry Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://api.singularitynet.io/v1' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  describe('getServices operation', () => {
    it('should get services successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getServices')
        .mockReturnValueOnce('ai')
        .mockReturnValueOnce('0x123')
        .mockReturnValueOnce('vision');

      const mockResponse = { services: [{ id: 'service1', name: 'AI Service' }] };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeRegistryOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.singularitynet.io/v1/registry/services?tag=ai&address=0x123&metadata=vision',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle getServices error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getServices');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeRegistryOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getOrganizations operation', () => {
    it('should get organizations successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getOrganizations')
        .mockReturnValueOnce('MyOrg')
        .mockReturnValueOnce('0x456');

      const mockResponse = { organizations: [{ id: 'org1', name: 'MyOrg' }] };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeRegistryOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.singularitynet.io/v1/registry/organizations?name=MyOrg&owner=0x456',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('registerService operation', () => {
    it('should register service successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('registerService')
        .mockReturnValueOnce('org123')
        .mockReturnValueOnce('service456')
        .mockReturnValueOnce('https://metadata.example.com');

      const mockResponse = { success: true, transactionHash: '0xabc' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeRegistryOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.singularitynet.io/v1/registry/services',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        },
        body: {
          orgId: 'org123',
          serviceId: 'service456',
          metadataURI: 'https://metadata.example.com',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('updateService operation', () => {
    it('should update service successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('updateService')
        .mockReturnValueOnce('service456')
        .mockReturnValueOnce('https://updated-metadata.example.com');

      const mockResponse = { success: true, transactionHash: '0xdef' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeRegistryOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: 'https://api.singularitynet.io/v1/registry/services/service456',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        },
        body: {
          metadataURI: 'https://updated-metadata.example.com',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('unregisterService operation', () => {
    it('should unregister service successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('unregisterService')
        .mockReturnValueOnce('service456');

      const mockResponse = { success: true, transactionHash: '0xghi' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeRegistryOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: 'https://api.singularitynet.io/v1/registry/services/service456',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});
});
