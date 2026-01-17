/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * SingularityNET Node for n8n
 * A comprehensive integration for the SingularityNET decentralized AI marketplace
 * 
 * @author Velocity BPA, LLC
 * @website https://velobpa.com
 * @github https://github.com/Velocity-BPA
 * @license BUSL-1.1
 */

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	INodeProperties,
} from 'n8n-workflow';

// Import action handlers
import { accountOperations, accountFields, executeAccountAction } from './actions/account/account.actions';
import { serviceOperations, serviceFields, executeServiceAction } from './actions/service/service.actions';
import { organizationOperations, organizationFields, executeOrganizationAction } from './actions/organization/organization.actions';
import { invocationOperations, invocationFields, executeInvocationAction } from './actions/invocation/invocation.actions';
import { paymentChannelOperations, paymentChannelFields, executePaymentChannelAction } from './actions/paymentChannel/paymentChannel.actions';
import { escrowOperations, escrowFields, executeEscrowAction } from './actions/escrow/escrow.actions';
import { marketplaceOperations, marketplaceFields, executeMarketplaceAction } from './actions/marketplace/marketplace.actions';
import { stakingOperations, stakingFields, executeStakingAction } from './actions/staking/staking.actions';
import { rfaiOperations, rfaiFields, executeRfaiAction } from './actions/rfai/rfai.actions';
import { publisherOperations, publisherFields, executePublisherAction } from './actions/publisher/publisher.actions';
import { ipfsOperations, ipfsFields, executeIpfsAction } from './actions/ipfs/ipfs.actions';
import { bridgeOperations, bridgeFields, executeBridgeAction } from './actions/bridge/bridge.actions';
import { governanceOperations, governanceFields, executeGovernanceAction } from './actions/governance/governance.actions';
import { daemonOperations, daemonFields, executeDaemonAction } from './actions/daemon/daemon.actions';
import { asiOperations, asiFields, executeAsiAction } from './actions/asi/asi.actions';
import { utilityOperations, utilityFields, executeUtility } from './actions/utility/utility.actions';

// Runtime licensing notice - logged once per node load
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`;

let licensingNoticeShown = false;
function showLicensingNotice() {
	if (!licensingNoticeShown) {
		console.warn(LICENSING_NOTICE);
		licensingNoticeShown = true;
	}
}

export class Singularitynet implements INodeType {
	constructor() {
		showLicensingNotice();
	}

	description: INodeTypeDescription = {
		displayName: 'SingularityNET',
		name: 'singularitynet',
		icon: 'file:singularitynet.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the SingularityNET decentralized AI marketplace - browse services, invoke AI, manage payments, and more',
		defaults: {
			name: 'SingularityNET',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'singularitynetNetworkApi',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'account',
							'paymentChannel',
							'escrow',
							'staking',
							'publisher',
							'bridge',
							'governance',
							'asi',
						],
					},
				},
			},
			{
				name: 'singularitynetPlatformApi',
				required: false,
				displayOptions: {
					show: {
						resource: [
							'service',
							'organization',
							'marketplace',
							'rfai',
						],
					},
				},
			},
			{
				name: 'aiServiceApi',
				required: false,
				displayOptions: {
					show: {
						resource: ['invocation', 'daemon'],
					},
				},
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
						name: 'Account',
						value: 'account',
						description: 'Manage wallet balances, transfers, and escrow',
					},
					{
						name: 'AI Invocation',
						value: 'invocation',
						description: 'Call AI services and manage invocations',
					},
					{
						name: 'ASI Token',
						value: 'asi',
						description: 'ASI token operations (post-merger)',
					},
					{
						name: 'Bridge',
						value: 'bridge',
						description: 'Cross-chain AGIX transfers (Ethereum ↔ Cardano)',
					},
					{
						name: 'Daemon',
						value: 'daemon',
						description: 'Service daemon monitoring and health checks',
					},
					{
						name: 'Escrow',
						value: 'escrow',
						description: 'Multi-Party Escrow deposits and withdrawals',
					},
					{
						name: 'Governance',
						value: 'governance',
						description: 'DAO governance and voting',
					},
					{
						name: 'IPFS',
						value: 'ipfs',
						description: 'IPFS file and metadata management',
					},
					{
						name: 'Marketplace',
						value: 'marketplace',
						description: 'Browse and discover AI services',
					},
					{
						name: 'Organization',
						value: 'organization',
						description: 'Explore AI service organizations',
					},
					{
						name: 'Payment Channel',
						value: 'paymentChannel',
						description: 'Manage payment channels for service access',
					},
					{
						name: 'Publisher',
						value: 'publisher',
						description: 'Publish and manage AI services',
					},
					{
						name: 'RFAI',
						value: 'rfai',
						description: 'Request for AI - bounty marketplace',
					},
					{
						name: 'Service',
						value: 'service',
						description: 'Get AI service information and metadata',
					},
					{
						name: 'Staking',
						value: 'staking',
						description: 'AGIX staking and rewards',
					},
					{
						name: 'Utility',
						value: 'utility',
						description: 'Helper functions and conversions',
					},
				],
				default: 'service',
			},

			// Operation selectors for each resource
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['account'],
					},
				},
				options: accountOperations,
				default: 'getAgixBalance',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['service'],
					},
				},
				options: serviceOperations,
				default: 'getAllServices',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['organization'],
					},
				},
				options: organizationOperations,
				default: 'getAllOrganizations',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['invocation'],
					},
				},
				options: invocationOperations,
				default: 'getServiceMethods',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['paymentChannel'],
					},
				},
				options: paymentChannelOperations,
				default: 'getChannelInfo',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['escrow'],
					},
				},
				options: escrowOperations,
				default: 'getEscrowBalance',
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
				options: marketplaceOperations,
				default: 'browseServices',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['staking'],
					},
				},
				options: stakingOperations,
				default: 'getStakingInfo',
			},
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
				options: rfaiOperations,
				default: 'getAllRequests',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['publisher'],
					},
				},
				options: publisherOperations,
				default: 'getPublishingStatus',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['ipfs'],
					},
				},
				options: ipfsOperations,
				default: 'getMetadata',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['bridge'],
					},
				},
				options: bridgeOperations,
				default: 'getBridgeInfo',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['governance'],
					},
				},
				options: governanceOperations,
				default: 'getProposals',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['daemon'],
					},
				},
				options: daemonOperations,
				default: 'healthCheck',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['asi'],
					},
				},
				options: asiOperations,
				default: 'getAsiBalance',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['utility'],
					},
				},
				options: utilityOperations,
				default: 'convertUnits',
			},

			// Include all fields from each resource
			...(accountFields as INodeProperties[]),
			...(serviceFields as INodeProperties[]),
			...(organizationFields as INodeProperties[]),
			...(invocationFields as INodeProperties[]),
			...(paymentChannelFields as INodeProperties[]),
			...(escrowFields as INodeProperties[]),
			...(marketplaceFields as INodeProperties[]),
			...(stakingFields as INodeProperties[]),
			...(rfaiFields as INodeProperties[]),
			...(publisherFields as INodeProperties[]),
			...(ipfsFields as INodeProperties[]),
			...(bridgeFields as INodeProperties[]),
			...(governanceFields as INodeProperties[]),
			...(daemonFields as INodeProperties[]),
			...(asiFields as INodeProperties[]),
			...(utilityFields as INodeProperties[]),
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: INodeExecutionData[];

				switch (resource) {
					case 'account':
						result = await executeAccountAction.call(this, operation, i);
						break;
					case 'service':
						result = await executeServiceAction.call(this, operation, i);
						break;
					case 'organization':
						result = await executeOrganizationAction.call(this, operation, i);
						break;
					case 'invocation':
						result = await executeInvocationAction.call(this, operation, i);
						break;
					case 'paymentChannel':
						result = await executePaymentChannelAction.call(this, operation, i);
						break;
					case 'escrow':
						result = await executeEscrowAction.call(this, operation, i);
						break;
					case 'marketplace':
						result = await executeMarketplaceAction.call(this, operation, i);
						break;
					case 'staking':
						result = await executeStakingAction.call(this, operation, i);
						break;
					case 'rfai':
						result = await executeRfaiAction.call(this, operation, i);
						break;
					case 'publisher':
						result = await executePublisherAction.call(this, operation, i);
						break;
					case 'ipfs':
						result = await executeIpfsAction.call(this, operation, i);
						break;
					case 'bridge':
						result = await executeBridgeAction.call(this, operation, i);
						break;
					case 'governance':
						result = await executeGovernanceAction.call(this, operation, i);
						break;
					case 'daemon':
						result = await executeDaemonAction.call(this, operation, i);
						break;
					case 'asi':
						result = await executeAsiAction.call(this, operation, i);
						break;
					case 'utility':
						result = await executeUtility.call(this, operation, i);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : String(error),
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
