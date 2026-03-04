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
describe('AIServices Resource', () => {
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

  describe('getAllServices', () => {
    it('should get all services successfully', async () => {
      const mockResponse = {
        services: [
          { id: 'service1', name: 'AI Service 1', category: 'nlp' },
          { id: 'service2', name: 'AI Service 2', category: 'vision' },
        ],
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllServices')
        .mockReturnValueOnce('nlp')
        .mockReturnValueOnce('')
        .mockReturnValueOnce(4.0);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAIServicesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.singularitynet.io/v1/services?category=nlp&rating_min=4',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle getAllServices error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllServices')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('')
        .mockReturnValueOnce(0);

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      await expect(
        executeAIServicesOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow('API Error');
    });
  });

  describe('getService', () => {
    it('should get service details successfully', async () => {
      const mockResponse = {
        id: 'service1',
        name: 'AI Service 1',
        description: 'Test AI service',
        methods: ['process', 'analyze'],
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getService')
        .mockReturnValueOnce('service1');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAIServicesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.singularitynet.io/v1/services/service1',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('invokeService', () => {
    it('should invoke service successfully', async () => {
      const mockResponse = {
        result: 'AI processing complete',
        output_data: { processed: true },
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('invokeService')
        .mockReturnValueOnce('service1')
        .mockReturnValueOnce({ text: 'Hello World' })
        .mockReturnValueOnce('process');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAIServicesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.singularitynet.io/v1/services/service1/invoke',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          input_data: { text: 'Hello World' },
          method_name: 'process',
        },
        json: true,
        timeout: 300000,
      });
    });

    it('should handle insufficient AGIX tokens error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('invokeService')
        .mockReturnValueOnce('service1')
        .mockReturnValueOnce({ text: 'Hello' })
        .mockReturnValueOnce('');

      const error = new Error('Payment required');
      (error as any).httpCode = 402;
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      await expect(
        executeAIServicesOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow();
    });
  });

  describe('getServiceMethods', () => {
    it('should get service methods successfully', async () => {
      const mockResponse = {
        methods: [
          { name: 'process', parameters: ['text'] },
          { name: 'analyze', parameters: ['data'] },
        ],
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getServiceMethods')
        .mockReturnValueOnce('service1');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAIServicesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('searchServices', () => {
    it('should search services successfully', async () => {
      const mockResponse = {
        results: [
          { id: 'service1', name: 'NLP Service', relevance: 0.95 },
        ],
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('searchServices')
        .mockReturnValueOnce('natural language processing')
        .mockReturnValueOnce('nlp,ai')
        .mockReturnValueOnce('0-50');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAIServicesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.singularitynet.io/v1/services/search?query=natural+language+processing&tags=nlp%2Cai&price_range=0-50',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });
});

describe('Organizations Resource', () => {
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

  describe('getAllOrganizations', () => {
    it('should successfully get all organizations', async () => {
      const mockResponse = {
        data: [
          { id: 'org1', name: 'Test Org 1', type: 'organization', status: 'active' },
          { id: 'org2', name: 'Test Org 2', type: 'individual', status: 'active' }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        switch (param) {
          case 'operation': return 'getAllOrganizations';
          case 'type': return '';
          case 'status': return 'active';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOrganizationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.singularitynet.io/v1/organizations?status=active',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
        timeout: 30000,
      });
    });

    it('should handle errors when getting all organizations', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        switch (param) {
          case 'operation': return 'getAllOrganizations';
          case 'type': return '';
          case 'status': return '';
          default: return '';
        }
      });

      const error = new Error('API Error');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      await expect(
        executeOrganizationsOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Failed to execute getAllOrganizations: API Error');
    });
  });

  describe('getOrganization', () => {
    it('should successfully get a specific organization', async () => {
      const mockResponse = {
        id: 'org1',
        name: 'Test Organization',
        description: 'Test Description',
        type: 'organization',
        status: 'active'
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        switch (param) {
          case 'operation': return 'getOrganization';
          case 'orgId': return 'org1';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOrganizationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.singularitynet.io/v1/organizations/org1',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
        timeout: 30000,
      });
    });
  });

  describe('createOrganization', () => {
    it('should successfully create a new organization', async () => {
      const mockResponse = {
        id: 'new-org',
        name: 'New Organization',
        description: 'New organization description',
        type: 'organization',
        status: 'active'
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        switch (param) {
          case 'operation': return 'createOrganization';
          case 'name': return 'New Organization';
          case 'description': return 'New organization description';
          case 'org_type': return 'organization';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOrganizationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.singularitynet.io/v1/organizations',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          name: 'New Organization',
          description: 'New organization description',
          org_type: 'organization',
        },
        json: true,
        timeout: 300000,
      });
    });
  });

  describe('updateOrganization', () => {
    it('should successfully update an organization', async () => {
      const mockResponse = {
        id: 'org1',
        name: 'Updated Organization',
        description: 'Updated description',
        type: 'organization',
        status: 'active'
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        switch (param) {
          case 'operation': return 'updateOrganization';
          case 'orgId': return 'org1';
          case 'name': return 'Updated Organization';
          case 'description': return 'Updated description';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOrganizationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: 'https://api.singularitynet.io/v1/organizations/org1',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          name: 'Updated Organization',
          description: 'Updated description',
        },
        json: true,
        timeout: 300000,
      });
    });
  });

  describe('getOrganizationServices', () => {
    it('should successfully get organization services', async () => {
      const mockResponse = {
        data: [
          { id: 'service1', name: 'AI Service 1', organization_id: 'org1' },
          { id: 'service2', name: 'AI Service 2', organization_id: 'org1' }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        switch (param) {
          case 'operation': return 'getOrganizationServices';
          case 'orgId': return 'org1';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOrganizationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.singularitynet.io/v1/organizations/org1/services',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
        timeout: 30000,
      });
    });
  });

  describe('error handling', () => {
    it('should continue on fail when continueOnFail is true', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        switch (param) {
          case 'operation': return 'getAllOrganizations';
          default: return '';
        }
      });

      const error = new Error('API Error');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      const result = await executeOrganizationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
      expect(result[0].json.operation).toBe('getAllOrganizations');
    });
  });
});

describe('Channels Resource', () => {
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

  describe('getAllChannels', () => {
    it('should successfully get all channels', async () => {
      const mockChannels = [
        { id: 'channel1', recipient: '0x123', sender: '0x456', status: 'open', amount: 100 },
        { id: 'channel2', recipient: '0x789', sender: '0xabc', status: 'closed', amount: 50 },
      ];

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getAllChannels';
          case 'recipient': return '';
          case 'sender': return '';
          case 'status': return '';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockChannels);

      const result = await executeChannelsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockChannels);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.singularitynet.io/v1/channels',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
        timeout: 300000,
      });
    });

    it('should handle getAllChannels with filters', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getAllChannels';
          case 'recipient': return '0x123';
          case 'sender': return '0x456';
          case 'status': return 'open';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue([]);

      await executeChannelsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.singularitynet.io/v1/channels?recipient=0x123&sender=0x456&status=open',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
        timeout: 300000,
      });
    });
  });

  describe('getChannel', () => {
    it('should successfully get a specific channel', async () => {
      const mockChannel = { id: 'channel1', recipient: '0x123', sender: '0x456', status: 'open', amount: 100 };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getChannel';
          case 'channelId': return 'channel1';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockChannel);

      const result = await executeChannelsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockChannel);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.singularitynet.io/v1/channels/channel1',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
        timeout: 300000,
      });
    });
  });

  describe('createChannel', () => {
    it('should successfully create a new channel', async () => {
      const mockCreatedChannel = { id: 'new-channel', recipient: '0x123', amount: 100, expiration: 1640995200 };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'createChannel';
          case 'recipient': return '0x123';
          case 'amount': return 100;
          case 'expiration': return 1640995200;
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockCreatedChannel);

      const result = await executeChannelsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockCreatedChannel);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.singularitynet.io/v1/channels',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          recipient: '0x123',
          amount: 100,
          expiration: 1640995200,
        },
        json: true,
        timeout: 300000,
      });
    });
  });

  describe('updateChannel', () => {
    it('should successfully update a channel', async () => {
      const mockUpdatedChannel = { id: 'channel1', amount: 150, updated: true };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'updateChannel';
          case 'channelId': return 'channel1';
          case 'amount': return 150;
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockUpdatedChannel);

      const result = await executeChannelsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockUpdatedChannel);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: 'https://api.singularitynet.io/v1/channels/channel1',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          amount: 150,
        },
        json: true,
        timeout: 300000,
      });
    });
  });

  describe('closeChannel', () => {
    it('should successfully close a channel', async () => {
      const mockClosedChannel = { id: 'channel1', status: 'closed', success: true };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'closeChannel';
          case 'channelId': return 'channel1';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockClosedChannel);

      const result = await executeChannelsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockClosedChannel);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: 'https://api.singularitynet.io/v1/channels/channel1',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
        timeout: 300000,
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getChannel';
          case 'channelId': return 'invalid-channel';
          default: return '';
        }
      });

      const apiError = new Error('Channel not found');
      (apiError as any).httpCode = 404;
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);

      await expect(
        executeChannelsOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow();
    });

    it('should continue on fail when configured', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getChannel';
          case 'channelId': return 'invalid-channel';
          default: return '';
        }
      });

      const apiError = new Error('Channel not found');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);

      const result = await executeChannelsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual({ error: 'Channel not found' });
    });
  });
});

describe('Transactions Resource', () => {
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

  describe('getAllTransactions', () => {
    it('should get all transactions successfully', async () => {
      const mockTransactions = {
        transactions: [
          { hash: '0x123', amount: '100', type: 'transfer' },
          { hash: '0x456', amount: '50', type: 'approval' },
        ],
        total: 2,
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllTransactions')
        .mockReturnValueOnce('0x1234567890abcdef')
        .mockReturnValueOnce('transfer')
        .mockReturnValueOnce('2024-01-01')
        .mockReturnValueOnce('2024-01-31');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTransactions);

      const result = await executeTransactionsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockTransactions);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.singularitynet.io/v1/transactions?address=0x1234567890abcdef&type=transfer&date_from=2024-01-01&date_to=2024-01-31',
        headers: {
          Authorization: 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle getAllTransactions error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllTransactions')
        .mockReturnValueOnce('invalid-address');

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue({
        httpCode: 400,
        message: 'Invalid address format',
      });

      await expect(
        executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow();
    });
  });

  describe('getTransaction', () => {
    it('should get transaction details successfully', async () => {
      const mockTransaction = {
        hash: '0x123abc',
        amount: '100',
        from: '0x1111',
        to: '0x2222',
        status: 'confirmed',
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getTransaction')
        .mockReturnValueOnce('0x123abc');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTransaction);

      const result = await executeTransactionsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockTransaction);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.singularitynet.io/v1/transactions/0x123abc',
        headers: {
          Authorization: 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('createTransfer', () => {
    it('should create transfer successfully', async () => {
      const mockTransferResponse = {
        transaction_hash: '0x789def',
        status: 'pending',
        gas_fee: '0.001',
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createTransfer')
        .mockReturnValueOnce('0x9999999999999999')
        .mockReturnValueOnce('100.5');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTransferResponse);

      const result = await executeTransactionsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockTransferResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.singularitynet.io/v1/transactions/transfer',
        headers: {
          Authorization: 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          to_address: '0x9999999999999999',
          amount: '100.5',
        },
        json: true,
        timeout: 300000,
      });
    });
  });

  describe('getBalance', () => {
    it('should get balance successfully', async () => {
      const mockBalance = {
        address: '0x1234567890abcdef',
        agix_balance: '1500.75',
        eth_balance: '0.5',
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getBalance')
        .mockReturnValueOnce('0x1234567890abcdef');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockBalance);

      const result = await executeTransactionsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockBalance);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.singularitynet.io/v1/transactions/balance?address=0x1234567890abcdef',
        headers: {
          Authorization: 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('approveSpending', () => {
    it('should approve spending successfully', async () => {
      const mockApprovalResponse = {
        transaction_hash: '0xapprove123',
        spender: '0x8888888888888888',
        amount: '500',
        status: 'pending',
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('approveSpending')
        .mockReturnValueOnce('500')
        .mockReturnValueOnce('0x8888888888888888');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockApprovalResponse);

      const result = await executeTransactionsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockApprovalResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.singularitynet.io/v1/transactions/approve',
        headers: {
          Authorization: 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          spender: '0x8888888888888888',
          amount: '500',
        },
        json: true,
        timeout: 300000,
      });
    });
  });
});

describe('Marketplace Resource', () => {
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

  describe('getFeaturedServices', () => {
    it('should get featured services successfully', async () => {
      const mockResponse = {
        services: [
          {
            id: 'service1',
            name: 'AI Vision Service',
            description: 'Computer vision AI service',
            rating: 4.5,
            featured: true,
          },
        ],
        total: 1,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getFeaturedServices';
        if (param === 'limit') return 10;
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeMarketplaceOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.singularitynet.io/v1/marketplace/featured',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        qs: { limit: 10 },
        json: true,
        timeout: 30000,
      });

      expect(result).toEqual([
        {
          json: mockResponse,
          pairedItem: { item: 0 },
        },
      ]);
    });

    it('should handle errors for getFeaturedServices', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getFeaturedServices';
        if (param === 'limit') return 10;
        return undefined;
      });

      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const result = await executeMarketplaceOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getCategories', () => {
    it('should get categories successfully', async () => {
      const mockResponse = {
        categories: [
          { id: '1', name: 'Computer Vision', serviceCount: 25 },
          { id: '2', name: 'Natural Language Processing', serviceCount: 18 },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getCategories';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeMarketplaceOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.singularitynet.io/v1/marketplace/categories',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
        timeout: 30000,
      });

      expect(result).toEqual([
        {
          json: mockResponse,
          pairedItem: { item: 0 },
        },
      ]);
    });
  });

  describe('createReview', () => {
    it('should create review successfully', async () => {
      const mockResponse = {
        id: 'review123',
        serviceId: 'service456',
        rating: 5,
        comment: 'Excellent service!',
        createdAt: '2023-12-01T10:00:00Z',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'createReview';
        if (param === 'serviceId') return 'service456';
        if (param === 'rating') return 5;
        if (param === 'comment') return 'Excellent service!';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeMarketplaceOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.singularitynet.io/v1/marketplace/reviews',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          serviceId: 'service456',
          rating: 5,
          comment: 'Excellent service!',
        },
        json: true,
        timeout: 60000,
      });

      expect(result).toEqual([
        {
          json: mockResponse,
          pairedItem: { item: 0 },
        },
      ]);
    });

    it('should throw error for invalid rating', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'createReview';
        if (param === 'serviceId') return 'service456';
        if (param === 'rating') return 6;
        if (param === 'comment') return 'Test comment';
        return undefined;
      });

      await expect(
        executeMarketplaceOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Rating must be between 1 and 5');
    });
  });

  describe('getServiceReviews', () => {
    it('should get service reviews successfully', async () => {
      const mockResponse = {
        reviews: [
          {
            id: 'review1',
            rating: 5,
            comment: 'Great service!',
            createdAt: '2023-12-01T10:00:00Z',
          },
        ],
        total: 1,
        averageRating: 4.5,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getServiceReviews';
        if (param === 'serviceId') return 'service123';
        if (param === 'limit') return 20;
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeMarketplaceOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.singularitynet.io/v1/marketplace/reviews/service123',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        qs: { limit: 20 },
        json: true,
        timeout: 30000,
      });

      expect(result).toEqual([
        {
          json: mockResponse,
          pairedItem: { item: 0 },
        },
      ]);
    });
  });

  describe('getMarketplaceStats', () => {
    it('should get marketplace stats successfully', async () => {
      const mockResponse = {
        totalServices: 150,
        totalReviews: 500,
        averageRating: 4.2,
        period: '30d',
        topCategories: [
          { name: 'Computer Vision', count: 45 },
          { name: 'NLP', count: 30 },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getMarketplaceStats';
        if (param === 'period') return '30d';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeMarketplaceOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.singularitynet.io/v1/marketplace/stats',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        qs: { period: '30d' },
        json: true,
        timeout: 30000,
      });

      expect(result).toEqual([
        {
          json: mockResponse,
          pairedItem: { item: 0 },
        },
      ]);
    });
  });
});
});
