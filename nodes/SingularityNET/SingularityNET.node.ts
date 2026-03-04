/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-singularitynet/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class SingularityNET implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'SingularityNET',
    name: 'singularitynet',
    icon: 'file:singularitynet.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the SingularityNET API',
    defaults: {
      name: 'SingularityNET',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'singularitynetApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'AIServices',
            value: 'aIServices',
          },
          {
            name: 'Organizations',
            value: 'organizations',
          },
          {
            name: 'Channels',
            value: 'channels',
          },
          {
            name: 'Transactions',
            value: 'transactions',
          },
          {
            name: 'Marketplace',
            value: 'marketplace',
          }
        ],
        default: 'aIServices',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['aIServices'],
    },
  },
  options: [
    {
      name: 'Get All Services',
      value: 'getAllServices',
      description: 'List all available AI services',
      action: 'Get all services',
    },
    {
      name: 'Get Service',
      value: 'getService',
      description: 'Get specific service details',
      action: 'Get service details',
    },
    {
      name: 'Invoke Service',
      value: 'invokeService',
      description: 'Call an AI service',
      action: 'Invoke AI service',
    },
    {
      name: 'Get Service Methods',
      value: 'getServiceMethods',
      description: 'Get available methods for a service',
      action: 'Get service methods',
    },
    {
      name: 'Search Services',
      value: 'searchServices',
      description: 'Search for services by criteria',
      action: 'Search services',
    },
  ],
  default: 'getAllServices',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['organizations'],
    },
  },
  options: [
    {
      name: 'Get All Organizations',
      value: 'getAllOrganizations',
      description: 'List all organizations on the platform',
      action: 'Get all organizations',
    },
    {
      name: 'Get Organization',
      value: 'getOrganization',
      description: 'Get details of a specific organization',
      action: 'Get organization',
    },
    {
      name: 'Create Organization',
      value: 'createOrganization',
      description: 'Create a new organization',
      action: 'Create organization',
    },
    {
      name: 'Update Organization',
      value: 'updateOrganization',
      description: 'Update organization information',
      action: 'Update organization',
    },
    {
      name: 'Get Organization Services',
      value: 'getOrganizationServices',
      description: 'Get all services published by an organization',
      action: 'Get organization services',
    },
  ],
  default: 'getAllOrganizations',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['channels'],
    },
  },
  options: [
    {
      name: 'Get All Channels',
      value: 'getAllChannels',
      description: 'List all payment channels',
      action: 'Get all channels',
    },
    {
      name: 'Get Channel',
      value: 'getChannel',
      description: 'Get specific channel details',
      action: 'Get channel',
    },
    {
      name: 'Create Channel',
      value: 'createChannel',
      description: 'Open new payment channel',
      action: 'Create channel',
    },
    {
      name: 'Update Channel',
      value: 'updateChannel',
      description: 'Update channel state',
      action: 'Update channel',
    },
    {
      name: 'Close Channel',
      value: 'closeChannel',
      description: 'Close payment channel',
      action: 'Close channel',
    },
  ],
  default: 'getAllChannels',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
    },
  },
  options: [
    {
      name: 'Get All Transactions',
      value: 'getAllTransactions',
      description: 'List transaction history',
      action: 'Get all transactions',
    },
    {
      name: 'Get Transaction',
      value: 'getTransaction',
      description: 'Get transaction details by hash',
      action: 'Get transaction',
    },
    {
      name: 'Create Transfer',
      value: 'createTransfer',
      description: 'Transfer AGIX tokens',
      action: 'Create transfer',
    },
    {
      name: 'Get Balance',
      value: 'getBalance',
      description: 'Get AGIX token balance',
      action: 'Get balance',
    },
    {
      name: 'Approve Spending',
      value: 'approveSpending',
      description: 'Approve token spending',
      action: 'Approve spending',
    },
  ],
  default: 'getAllTransactions',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['marketplace'],
    },
  },
  options: [
    {
      name: 'Get Featured Services',
      value: 'getFeaturedServices',
      description: 'Get featured services from the marketplace',
      action: 'Get featured services',
    },
    {
      name: 'Get Categories',
      value: 'getCategories',
      description: 'List all service categories',
      action: 'Get categories',
    },
    {
      name: 'Create Review',
      value: 'createReview',
      description: 'Submit a service review',
      action: 'Create review',
    },
    {
      name: 'Get Service Reviews',
      value: 'getServiceReviews',
      description: 'Get reviews for a specific service',
      action: 'Get service reviews',
    },
    {
      name: 'Get Marketplace Stats',
      value: 'getMarketplaceStats',
      description: 'Get marketplace statistics',
      action: 'Get marketplace stats',
    },
  ],
  default: 'getFeaturedServices',
},
      // Parameter definitions
{
  displayName: 'Category',
  name: 'category',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['aIServices'],
      operation: ['getAllServices'],
    },
  },
  default: '',
  description: 'Filter services by category',
},
{
  displayName: 'Provider',
  name: 'provider',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['aIServices'],
      operation: ['getAllServices'],
    },
  },
  default: '',
  description: 'Filter services by provider',
},
{
  displayName: 'Minimum Rating',
  name: 'rating_min',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['aIServices'],
      operation: ['getAllServices'],
    },
  },
  default: 0,
  description: 'Minimum rating for services',
},
{
  displayName: 'Service ID',
  name: 'serviceId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['aIServices'],
      operation: ['getService', 'invokeService', 'getServiceMethods'],
    },
  },
  default: '',
  description: 'The ID of the service',
},
{
  displayName: 'Input Data',
  name: 'input_data',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['aIServices'],
      operation: ['invokeService'],
    },
  },
  default: '{}',
  description: 'Input data for the AI service call',
},
{
  displayName: 'Method Name',
  name: 'method_name',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['aIServices'],
      operation: ['invokeService'],
    },
  },
  default: '',
  description: 'Specific method to call on the service',
},
{
  displayName: 'Query',
  name: 'query',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['aIServices'],
      operation: ['searchServices'],
    },
  },
  default: '',
  description: 'Search query for services',
},
{
  displayName: 'Tags',
  name: 'tags',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['aIServices'],
      operation: ['searchServices'],
    },
  },
  default: '',
  description: 'Comma-separated list of tags to filter by',
},
{
  displayName: 'Price Range',
  name: 'price_range',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['aIServices'],
      operation: ['searchServices'],
    },
  },
  default: '',
  description: 'Price range filter (e.g., "0-100")',
},
{
  displayName: 'Type',
  name: 'type',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['organizations'],
      operation: ['getAllOrganizations'],
    },
  },
  options: [
    {
      name: 'All',
      value: '',
    },
    {
      name: 'Individual',
      value: 'individual',
    },
    {
      name: 'Organization',
      value: 'organization',
    },
  ],
  default: '',
  description: 'Filter organizations by type',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['organizations'],
      operation: ['getAllOrganizations'],
    },
  },
  options: [
    {
      name: 'All',
      value: '',
    },
    {
      name: 'Active',
      value: 'active',
    },
    {
      name: 'Inactive',
      value: 'inactive',
    },
  ],
  default: '',
  description: 'Filter organizations by status',
},
{
  displayName: 'Organization ID',
  name: 'orgId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['organizations'],
      operation: ['getOrganization'],
    },
  },
  default: '',
  description: 'The unique identifier of the organization',
},
{
  displayName: 'Organization ID',
  name: 'orgId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['organizations'],
      operation: ['updateOrganization'],
    },
  },
  default: '',
  description: 'The unique identifier of the organization to update',
},
{
  displayName: 'Organization ID',
  name: 'orgId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['organizations'],
      operation: ['getOrganizationServices'],
    },
  },
  default: '',
  description: 'The unique identifier of the organization',
},
{
  displayName: 'Name',
  name: 'name',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['organizations'],
      operation: ['createOrganization'],
    },
  },
  default: '',
  description: 'The name of the organization',
},
{
  displayName: 'Name',
  name: 'name',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['organizations'],
      operation: ['updateOrganization'],
    },
  },
  default: '',
  description: 'The updated name of the organization',
},
{
  displayName: 'Description',
  name: 'description',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['organizations'],
      operation: ['createOrganization'],
    },
  },
  default: '',
  description: 'Description of the organization',
},
{
  displayName: 'Description',
  name: 'description',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['organizations'],
      operation: ['updateOrganization'],
    },
  },
  default: '',
  description: 'Updated description of the organization',
},
{
  displayName: 'Organization Type',
  name: 'org_type',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['organizations'],
      operation: ['createOrganization'],
    },
  },
  options: [
    {
      name: 'Individual',
      value: 'individual',
    },
    {
      name: 'Organization',
      value: 'organization',
    },
  ],
  default: 'organization',
  description: 'The type of organization',
},
{
  displayName: 'Channel ID',
  name: 'channelId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['channels'],
      operation: ['getChannel', 'updateChannel', 'closeChannel'],
    },
  },
  default: '',
  description: 'The unique identifier of the payment channel',
},
{
  displayName: 'Recipient',
  name: 'recipient',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['channels'],
      operation: ['getAllChannels'],
    },
  },
  default: '',
  description: 'Filter channels by recipient address',
},
{
  displayName: 'Sender',
  name: 'sender',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['channels'],
      operation: ['getAllChannels'],
    },
  },
  default: '',
  description: 'Filter channels by sender address',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  required: false,
  displayOptions: {
    show: {
      resource: ['channels'],
      operation: ['getAllChannels'],
    },
  },
  options: [
    {
      name: 'Open',
      value: 'open',
    },
    {
      name: 'Closed',
      value: 'closed',
    },
    {
      name: 'Pending',
      value: 'pending',
    },
  ],
  default: '',
  description: 'Filter channels by status',
},
{
  displayName: 'Recipient',
  name: 'recipient',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['channels'],
      operation: ['createChannel'],
    },
  },
  default: '',
  description: 'The recipient address for the new payment channel',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['channels'],
      operation: ['createChannel', 'updateChannel'],
    },
  },
  default: 0,
  description: 'The amount in AGIX tokens',
},
{
  displayName: 'Expiration',
  name: 'expiration',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['channels'],
      operation: ['createChannel'],
    },
  },
  default: 0,
  description: 'Channel expiration time in Unix timestamp',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getAllTransactions'],
    },
  },
  default: '',
  description: 'The wallet address to get transactions for',
},
{
  displayName: 'Transaction Type',
  name: 'type',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getAllTransactions'],
    },
  },
  options: [
    {
      name: 'All',
      value: '',
    },
    {
      name: 'Transfer',
      value: 'transfer',
    },
    {
      name: 'Approval',
      value: 'approval',
    },
    {
      name: 'Service Call',
      value: 'service_call',
    },
  ],
  default: '',
  description: 'Filter transactions by type',
},
{
  displayName: 'Date From',
  name: 'dateFrom',
  type: 'dateTime',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getAllTransactions'],
    },
  },
  default: '',
  description: 'Start date for transaction history',
},
{
  displayName: 'Date To',
  name: 'dateTo',
  type: 'dateTime',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getAllTransactions'],
    },
  },
  default: '',
  description: 'End date for transaction history',
},
{
  displayName: 'Transaction Hash',
  name: 'txHash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransaction'],
    },
  },
  default: '',
  description: 'The transaction hash to look up',
},
{
  displayName: 'To Address',
  name: 'toAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['createTransfer'],
    },
  },
  default: '',
  description: 'The recipient wallet address',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['createTransfer', 'approveSpending'],
    },
  },
  default: '',
  description: 'The amount of AGIX tokens',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getBalance'],
    },
  },
  default: '',
  description: 'The wallet address to check balance for',
},
{
  displayName: 'Spender Address',
  name: 'spender',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['approveSpending'],
    },
  },
  default: '',
  description: 'The address to approve for spending tokens',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['marketplace'],
      operation: ['getFeaturedServices'],
    },
  },
  default: 10,
  description: 'Maximum number of featured services to return',
},
{
  displayName: 'Service ID',
  name: 'serviceId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['marketplace'],
      operation: ['createReview'],
    },
  },
  default: '',
  description: 'ID of the service to review',
},
{
  displayName: 'Rating',
  name: 'rating',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['marketplace'],
      operation: ['createReview'],
    },
  },
  default: 5,
  typeOptions: {
    minValue: 1,
    maxValue: 5,
  },
  description: 'Rating from 1 to 5 stars',
},
{
  displayName: 'Comment',
  name: 'comment',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['marketplace'],
      operation: ['createReview'],
    },
  },
  default: '',
  description: 'Review comment',
  typeOptions: {
    rows: 4,
  },
},
{
  displayName: 'Service ID',
  name: 'serviceId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['marketplace'],
      operation: ['getServiceReviews'],
    },
  },
  default: '',
  description: 'ID of the service to get reviews for',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['marketplace'],
      operation: ['getServiceReviews'],
    },
  },
  default: 20,
  description: 'Maximum number of reviews to return',
},
{
  displayName: 'Period',
  name: 'period',
  type: 'options',
  required: false,
  displayOptions: {
    show: {
      resource: ['marketplace'],
      operation: ['getMarketplaceStats'],
    },
  },
  options: [
    {
      name: '24 Hours',
      value: '24h',
    },
    {
      name: '7 Days',
      value: '7d',
    },
    {
      name: '30 Days',
      value: '30d',
    },
    {
      name: '90 Days',
      value: '90d',
    },
    {
      name: '1 Year',
      value: '1y',
    },
    {
      name: 'All Time',
      value: 'all',
    },
  ],
  default: '30d',
  description: 'Time period for statistics',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'aIServices':
        return [await executeAIServicesOperations.call(this, items)];
      case 'organizations':
        return [await executeOrganizationsOperations.call(this, items)];
      case 'channels':
        return [await executeChannelsOperations.call(this, items)];
      case 'transactions':
        return [await executeTransactionsOperations.call(this, items)];
      case 'marketplace':
        return [await executeMarketplaceOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeAIServicesOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('singularitynetApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getAllServices': {
          const category = this.getNodeParameter('category', i) as string;
          const provider = this.getNodeParameter('provider', i) as string;
          const ratingMin = this.getNodeParameter('rating_min', i) as number;

          const params = new URLSearchParams();
          if (category) params.append('category', category);
          if (provider) params.append('provider', provider);
          if (ratingMin) params.append('rating_min', ratingMin.toString());

          const url = `${credentials.baseUrl}/services${params.toString() ? `?${params.toString()}` : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getService': {
          const serviceId = this.getNodeParameter('serviceId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/services/${serviceId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'invokeService': {
          const serviceId = this.getNodeParameter('serviceId', i) as string;
          const inputData = this.getNodeParameter('input_data', i) as any;
          const methodName = this.getNodeParameter('method_name', i) as string;

          const body: any = {
            input_data: inputData,
          };

          if (methodName) {
            body.method_name = methodName;
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/services/${serviceId}/invoke`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
            timeout: 300000, // 5 minutes for AI service calls
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getServiceMethods': {
          const serviceId = this.getNodeParameter('serviceId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/services/${serviceId}/methods`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'searchServices': {
          const query = this.getNodeParameter('query', i) as string;
          const tags = this.getNodeParameter('tags', i) as string;
          const priceRange = this.getNodeParameter('price_range', i) as string;

          const params = new URLSearchParams();
          params.append('query', query);
          if (tags) params.append('tags', tags);
          if (priceRange) params.append('price_range', priceRange);

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/services/search?${params.toString()}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(
            this.getNode(),
            `Unknown operation: ${operation}`,
          );
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        if (error.cause?.code === 'ECONNABORTED') {
          throw new NodeApiError(
            this.getNode(),
            {
              message: 'AI service call timeout - operation may still be processing',
              description: 'Consider increasing timeout or checking service status',
            },
          );
        }
        if (error.httpCode === 402) {
          throw new NodeApiError(
            this.getNode(),
            {
              message: 'Insufficient AGIX token balance',
              description: 'Please ensure you have sufficient AGIX tokens for this operation',
            },
          );
        }
        throw error;
      }
    }
  }

  return returnData;
}

async function executeOrganizationsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('singularitynetApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      const baseUrl = credentials.baseUrl || 'https://api.singularitynet.io/v1';
      
      switch (operation) {
        case 'getAllOrganizations': {
          const type = this.getNodeParameter('type', i) as string;
          const status = this.getNodeParameter('status', i) as string;
          
          const queryParams: any = {};
          if (type) queryParams.type = type;
          if (status) queryParams.status = status;
          
          const queryString = Object.keys(queryParams).length > 0 
            ? '?' + new URLSearchParams(queryParams).toString() 
            : '';

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/organizations${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
            timeout: 30000,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getOrganization': {
          const orgId = this.getNodeParameter('orgId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/organizations/${orgId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
            timeout: 30000,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createOrganization': {
          const name = this.getNodeParameter('name', i) as string;
          const description = this.getNodeParameter('description', i) as string;
          const orgType = this.getNodeParameter('org_type', i) as string;
          
          const body: any = {
            name,
            org_type: orgType,
          };
          
          if (description) {
            body.description = description;
          }

          const options: any = {
            method: 'POST',
            url: `${baseUrl}/organizations`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
            timeout: 300000,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updateOrganization': {
          const orgId = this.getNodeParameter('orgId', i) as string;
          const name = this.getNodeParameter('name', i) as string;
          const description = this.getNodeParameter('description', i) as string;
          
          const body: any = {};
          if (name) body.name = name;
          if (description) body.description = description;

          const options: any = {
            method: 'PUT',
            url: `${baseUrl}/organizations/${orgId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
            timeout: 300000,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getOrganizationServices': {
          const orgId = this.getNodeParameter('orgId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/organizations/${orgId}/services`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
            timeout: 30000,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ 
        json: result, 
        pairedItem: { item: i } 
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { 
            error: error.message,
            operation,
            item: i 
          }, 
          pairedItem: { item: i } 
        });
      } else {
        if (error.response && error.response.data) {
          throw new NodeApiError(this.getNode(), error.response.data, { 
            message: `SingularityNET API Error: ${error.response.data.message || error.message}`,
            httpCode: error.response.status.toString()
          });
        }
        throw new NodeOperationError(this.getNode(), `Failed to execute ${operation}: ${error.message}`);
      }
    }
  }

  return returnData;
}

async function executeChannelsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('singularitynetApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getAllChannels': {
          const recipient = this.getNodeParameter('recipient', i, '') as string;
          const sender = this.getNodeParameter('sender', i, '') as string;
          const status = this.getNodeParameter('status', i, '') as string;
          
          const queryParams: any = {};
          if (recipient) queryParams.recipient = recipient;
          if (sender) queryParams.sender = sender;
          if (status) queryParams.status = status;
          
          const queryString = Object.keys(queryParams).length > 0 
            ? '?' + new URLSearchParams(queryParams).toString()
            : '';

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://api.singularitynet.io/v1'}/channels${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
            timeout: 300000,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getChannel': {
          const channelId = this.getNodeParameter('channelId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://api.singularitynet.io/v1'}/channels/${channelId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
            timeout: 300000,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'createChannel': {
          const recipient = this.getNodeParameter('recipient', i) as string;
          const amount = this.getNodeParameter('amount', i) as number;
          const expiration = this.getNodeParameter('expiration', i) as number;
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl || 'https://api.singularitynet.io/v1'}/channels`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              recipient,
              amount,
              expiration,
            },
            json: true,
            timeout: 300000,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'updateChannel': {
          const channelId = this.getNodeParameter('channelId', i) as string;
          const amount = this.getNodeParameter('amount', i) as number;
          
          const options: any = {
            method: 'PUT',
            url: `${credentials.baseUrl || 'https://api.singularitynet.io/v1'}/channels/${channelId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              amount,
            },
            json: true,
            timeout: 300000,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'closeChannel': {
          const channelId = this.getNodeParameter('channelId', i) as string;
          
          const options: any = {
            method: 'DELETE',
            url: `${credentials.baseUrl || 'https://api.singularitynet.io/v1'}/channels/${channelId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
            timeout: 300000,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({ 
        json: result,
        pairedItem: { item: i }
      });
      
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message },
          pairedItem: { item: i }
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }
  
  return returnData;
}

async function executeTransactionsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('singularitynetApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      const baseUrl = credentials.baseUrl || 'https://api.singularitynet.io/v1';

      switch (operation) {
        case 'getAllTransactions': {
          const address = this.getNodeParameter('address', i) as string;
          const type = this.getNodeParameter('type', i) as string;
          const dateFrom = this.getNodeParameter('dateFrom', i) as string;
          const dateTo = this.getNodeParameter('dateTo', i) as string;

          const params: any = { address };
          if (type) params.type = type;
          if (dateFrom) params.date_from = dateFrom;
          if (dateTo) params.date_to = dateTo;

          const queryString = new URLSearchParams(params).toString();

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/transactions?${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTransaction': {
          const txHash = this.getNodeParameter('txHash', i) as string;

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/transactions/${txHash}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createTransfer': {
          const toAddress = this.getNodeParameter('toAddress', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;

          const options: any = {
            method: 'POST',
            url: `${baseUrl}/transactions/transfer`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              to_address: toAddress,
              amount: amount,
            },
            json: true,
            timeout: 300000, // 5 minute timeout for blockchain operations
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBalance': {
          const address = this.getNodeParameter('address', i) as string;

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/transactions/balance?address=${encodeURIComponent(address)}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'approveSpending': {
          const spender = this.getNodeParameter('spender', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;

          const options: any = {
            method: 'POST',
            url: `${baseUrl}/transactions/approve`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              spender: spender,
              amount: amount,
            },
            json: true,
            timeout: 300000, // 5 minute timeout for blockchain operations
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (error.httpCode === 400) {
        throw new NodeApiError(this.getNode(), error, {
          message: 'Invalid request parameters',
          description: 'Please check your transaction parameters and try again.',
        });
      }
      if (error.httpCode === 403) {
        throw new NodeApiError(this.getNode(), error, {
          message: 'Insufficient permissions or balance',
          description: 'Check your API key permissions and AGIX token balance.',
        });
      }
      if (error.httpCode === 404) {
        throw new NodeApiError(this.getNode(), error, {
          message: 'Transaction not found',
          description: 'The specified transaction hash could not be found.',
        });
      }

      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeMarketplaceOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('singularitynetApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getFeaturedServices': {
          const limit = this.getNodeParameter('limit', i, 10) as number;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/marketplace/featured`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            qs: limit ? { limit } : {},
            json: true,
            timeout: 30000,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getCategories': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/marketplace/categories`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
            timeout: 30000,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createReview': {
          const serviceId = this.getNodeParameter('serviceId', i) as string;
          const rating = this.getNodeParameter('rating', i) as number;
          const comment = this.getNodeParameter('comment', i) as string;

          if (!serviceId) {
            throw new NodeOperationError(this.getNode(), 'Service ID is required for creating a review');
          }

          if (rating < 1 || rating > 5) {
            throw new NodeOperationError(this.getNode(), 'Rating must be between 1 and 5');
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/marketplace/reviews`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              serviceId,
              rating,
              comment,
            },
            json: true,
            timeout: 60000,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getServiceReviews': {
          const serviceId = this.getNodeParameter('serviceId', i) as string;
          const limit = this.getNodeParameter('limit', i, 20) as number;

          if (!serviceId) {
            throw new NodeOperationError(this.getNode(), 'Service ID is required for getting reviews');
          }

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/marketplace/reviews/${serviceId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            qs: limit ? { limit } : {},
            json: true,
            timeout: 30000,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getMarketplaceStats': {
          const period = this.getNodeParameter('period', i, '30d') as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/marketplace/stats`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            qs: period ? { period } : {},
            json: true,
            timeout: 30000,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (error instanceof NodeApiError || error instanceof NodeOperationError) {
        throw error;
      }

      const errorMessage = error.response?.body?.message || error.message || 'Unknown error occurred';
      const statusCode = error.response?.statusCode || 500;

      if (this.continueOnFail()) {
        returnData.push({
          json: {
            error: errorMessage,
            statusCode,
            operation,
          },
          pairedItem: { item: i },
        });
      } else {
        throw new NodeApiError(this.getNode(), error.response?.body || error, {
          message: `SingularityNET Marketplace API error: ${errorMessage}`,
          httpCode: statusCode.toString(),
        });
      }
    }
  }

  return returnData;
}
