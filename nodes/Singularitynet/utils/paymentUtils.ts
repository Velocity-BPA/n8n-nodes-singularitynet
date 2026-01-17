/**
 * Payment Utilities
 *
 * Handles payment signature generation and verification for
 * SingularityNET Multi-Party Escrow (MPE) payment channels.
 */

import { ethers } from 'ethers';

/**
 * Payment channel information
 */
export interface PaymentChannel {
	channelId: number;
	nonce: number;
	sender: string;
	signer: string;
	recipient: string;
	groupId: string;
	value: bigint;
	expiration: number;
}

/**
 * Payment signature data
 */
export interface PaymentSignature {
	signature: string;
	v: number;
	r: string;
	s: string;
}

/**
 * Generate payment signature for service invocation
 *
 * The signature authorizes the service provider to claim a specific
 * amount from the payment channel after providing the service.
 */
export async function generatePaymentSignature(
	signer: ethers.Wallet,
	mpeAddress: string,
	channelId: number,
	nonce: number,
	amount: bigint
): Promise<PaymentSignature> {
	// Create the message hash (EIP-712 style)
	const messageHash = ethers.solidityPackedKeccak256(
		['string', 'address', 'uint256', 'uint256', 'uint256'],
		['__MPE_claim_message', mpeAddress, channelId, nonce, amount]
	);

	// Sign the message
	const signature = await signer.signMessage(ethers.getBytes(messageHash));
	const sig = ethers.Signature.from(signature);

	return {
		signature,
		v: sig.v,
		r: sig.r,
		s: sig.s,
	};
}

/**
 * Verify a payment signature
 */
export function verifyPaymentSignature(
	mpeAddress: string,
	channelId: number,
	nonce: number,
	amount: bigint,
	signature: string,
	expectedSigner: string
): boolean {
	try {
		const messageHash = ethers.solidityPackedKeccak256(
			['string', 'address', 'uint256', 'uint256', 'uint256'],
			['__MPE_claim_message', mpeAddress, channelId, nonce, amount]
		);

		const recoveredAddress = ethers.verifyMessage(ethers.getBytes(messageHash), signature);
		return recoveredAddress.toLowerCase() === expectedSigner.toLowerCase();
	} catch {
		return false;
	}
}

/**
 * Generate group ID bytes32 from group name
 */
export function generateGroupId(groupName: string): string {
	return ethers.id(groupName);
}

/**
 * Calculate channel expiration block number
 */
export function calculateExpirationBlock(
	currentBlock: number,
	daysUntilExpiration: number = 7,
	blocksPerDay: number = 6500 // ~13 seconds per block on Ethereum
): number {
	return currentBlock + daysUntilExpiration * blocksPerDay;
}

/**
 * Check if a channel is expired
 */
export function isChannelExpired(expiration: number, currentBlock: number): boolean {
	return currentBlock >= expiration;
}

/**
 * Calculate minimum deposit for channel
 */
export function calculateMinimumDeposit(
	pricePerCall: bigint,
	estimatedCalls: number,
	safetyMultiplier: number = 1.2
): bigint {
	const baseDeposit = pricePerCall * BigInt(estimatedCalls);
	return BigInt(Math.ceil(Number(baseDeposit) * safetyMultiplier));
}

/**
 * Generate free call authentication token
 *
 * Format: base64(signature(message))
 * Message: dapp_user_address + block_number + org_id + service_id + current_block
 */
export async function generateFreeCallToken(
	signer: ethers.Wallet,
	userAddress: string,
	organizationId: string,
	serviceId: string,
	currentBlock: number
): Promise<string> {
	const message = ethers.solidityPackedKeccak256(
		['string', 'address', 'string', 'string', 'uint256'],
		['__free_call_prefix', userAddress, organizationId, serviceId, currentBlock]
	);

	const signature = await signer.signMessage(ethers.getBytes(message));
	return Buffer.from(signature).toString('base64');
}

/**
 * Create payment metadata for gRPC call
 */
export function createPaymentMetadata(
	channelId: number,
	nonce: number,
	amount: bigint,
	signature: PaymentSignature
): Record<string, string> {
	return {
		'snet-payment-type': 'escrow',
		'snet-payment-channel-id': channelId.toString(),
		'snet-payment-channel-nonce': nonce.toString(),
		'snet-payment-channel-amount': amount.toString(),
		'snet-payment-channel-signature-bin': Buffer.from(signature.signature.slice(2), 'hex').toString(
			'base64'
		),
	};
}

/**
 * Create free call metadata for gRPC call
 */
export function createFreeCallMetadata(
	userAddress: string,
	organizationId: string,
	serviceId: string,
	authToken: string,
	currentBlock: number
): Record<string, string> {
	return {
		'snet-payment-type': 'free-call',
		'snet-free-call-user-id': userAddress,
		'snet-current-block-number': currentBlock.toString(),
		'snet-free-call-auth-token-bin': authToken,
		'snet-payment-channel-signature-bin': '', // Empty for free calls
	};
}

/**
 * Parse channel data from contract response
 */
export function parseChannelData(channelData: unknown[]): PaymentChannel {
	return {
		channelId: 0, // Set by caller
		nonce: Number(channelData[0]),
		sender: channelData[1] as string,
		signer: channelData[2] as string,
		recipient: channelData[3] as string,
		groupId: channelData[4] as string,
		value: BigInt(channelData[5] as string),
		expiration: Number(channelData[6]),
	};
}

/**
 * Estimate gas for channel operations
 */
export const GAS_ESTIMATES = {
	OPEN_CHANNEL: 150000n,
	ADD_FUNDS: 50000n,
	EXTEND_CHANNEL: 50000n,
	CLAIM_TIMEOUT: 100000n,
	DEPOSIT: 60000n,
	WITHDRAW: 60000n,
};

/**
 * Calculate total cost including gas
 */
export function calculateTotalCost(
	amount: bigint,
	gasEstimate: bigint,
	gasPrice: bigint
): bigint {
	return amount + gasEstimate * gasPrice;
}
