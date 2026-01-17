/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * SingularityNET Trigger Node
 * Monitors blockchain events for SingularityNET
 * 
 * @author Velocity BPA, LLC
 * @website https://velobpa.com
 * @github https://github.com/Velocity-BPA
 * @license BUSL-1.1
 */

import {
	IPollFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { createEthereumClient } from './transport/ethereumClient';

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

export class SingularitynetTrigger implements INodeType {
	constructor() {
		showLicensingNotice();
	}

	description: INodeTypeDescription = {
		displayName: 'SingularityNET Trigger',
		name: 'singularitynetTrigger',
		icon: 'file:singularitynet.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Trigger on SingularityNET blockchain events',
		defaults: {
			name: 'SingularityNET Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'singularitynetNetworkApi',
				required: true,
			},
		],
		polling: true,
		properties: [
			{
				displayName: 'Event Category',
				name: 'eventCategory',
				type: 'options',
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Payment Channel', value: 'paymentChannel' },
					{ name: 'Service', value: 'service' },
					{ name: 'Staking', value: 'staking' },
					{ name: 'Organization', value: 'organization' },
				],
				default: 'account',
				description: 'Category of events to monitor',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['account'],
					},
				},
				options: [
					{ name: 'AGIX Received', value: 'agixReceived' },
					{ name: 'AGIX Sent', value: 'agixSent' },
					{ name: 'Balance Changed', value: 'balanceChanged' },
				],
				default: 'agixReceived',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['paymentChannel'],
					},
				},
				options: [
					{ name: 'Channel Opened', value: 'channelOpened' },
					{ name: 'Channel Funded', value: 'channelFunded' },
					{ name: 'Channel Extended', value: 'channelExtended' },
					{ name: 'Channel Claimed', value: 'channelClaimed' },
				],
				default: 'channelOpened',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['service'],
					},
				},
				options: [
					{ name: 'Service Called', value: 'serviceCalled' },
					{ name: 'Service Added', value: 'serviceAdded' },
					{ name: 'Service Updated', value: 'serviceUpdated' },
				],
				default: 'serviceCalled',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['staking'],
					},
				},
				options: [
					{ name: 'Stake Added', value: 'stakeAdded' },
					{ name: 'Stake Removed', value: 'stakeRemoved' },
					{ name: 'Rewards Claimed', value: 'rewardsClaimed' },
				],
				default: 'stakeAdded',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['organization'],
					},
				},
				options: [
					{ name: 'Organization Created', value: 'organizationCreated' },
					{ name: 'Organization Updated', value: 'organizationUpdated' },
					{ name: 'Member Added', value: 'memberAdded' },
				],
				default: 'organizationCreated',
			},
			{
				displayName: 'Watch Address',
				name: 'watchAddress',
				type: 'string',
				default: '',
				description: 'Specific address to watch (optional, uses wallet if empty)',
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const eventCategory = this.getNodeParameter('eventCategory') as string;
		const event = this.getNodeParameter('event') as string;
		const watchAddress = this.getNodeParameter('watchAddress', '') as string;

		const credentials = await this.getCredentials('singularitynetNetworkApi');
		
		try {
			const ethClient = createEthereumClient(credentials as Record<string, unknown>);
			const currentBlock = await ethClient.getCurrentBlock();
			
			// Get the last processed block from static data
			const staticData = this.getWorkflowStaticData('node');
			const lastBlock = (staticData.lastBlock as number) || currentBlock - 100;

			// For now, return a placeholder event structure
			// Full implementation would query contract events
			const events: INodeExecutionData[] = [];

			if (currentBlock > lastBlock) {
				// Simplified event detection
				events.push({
					json: {
						eventCategory,
						event,
						watchAddress: watchAddress || ethClient.getAddress(),
						blockRange: {
							from: lastBlock + 1,
							to: currentBlock,
						},
						timestamp: new Date().toISOString(),
						network: credentials.network,
						message: 'Polling for events. Full event detection requires contract event parsing.',
					},
				});
			}

			// Update last processed block
			staticData.lastBlock = currentBlock;

			if (events.length === 0) {
				return null;
			}

			return [events];
		} catch (error) {
			// Return error info but don't fail the trigger
			return [[{
				json: {
					error: true,
					message: (error as Error).message,
					eventCategory,
					event,
					timestamp: new Date().toISOString(),
				},
			}]];
		}
	}
}
