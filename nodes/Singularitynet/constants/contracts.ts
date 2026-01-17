/**
 * SingularityNET Smart Contract Constants
 *
 * Contains ABIs and constants for interacting with SingularityNET
 * smart contracts on Ethereum.
 */

/**
 * AGIX Token Contract ABI (ERC-20)
 */
export const AGIX_TOKEN_ABI = [
	'function name() view returns (string)',
	'function symbol() view returns (string)',
	'function decimals() view returns (uint8)',
	'function totalSupply() view returns (uint256)',
	'function balanceOf(address owner) view returns (uint256)',
	'function transfer(address to, uint256 value) returns (bool)',
	'function transferFrom(address from, address to, uint256 value) returns (bool)',
	'function approve(address spender, uint256 value) returns (bool)',
	'function allowance(address owner, address spender) view returns (uint256)',
	'event Transfer(address indexed from, address indexed to, uint256 value)',
	'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

/**
 * Multi-Party Escrow (MPE) Contract ABI
 *
 * The MPE contract handles payment channels for service invocations.
 * Users deposit AGIX, open channels with services, and pay per call.
 */
export const MPE_CONTRACT_ABI = [
	// Balance management
	'function balances(address account) view returns (uint256)',
	'function deposit(uint256 value)',
	'function withdraw(uint256 value)',

	// Channel operations
	'function openChannel(address signer, address recipient, bytes32 groupId, uint256 value, uint256 expiration) returns (uint256)',
	'function depositAndOpenChannel(address signer, address recipient, bytes32 groupId, uint256 value, uint256 expiration) returns (uint256)',
	'function channelAddFunds(uint256 channelId, uint256 amount)',
	'function channelExtend(uint256 channelId, uint256 newExpiration)',
	'function channelExtendAndAddFunds(uint256 channelId, uint256 newExpiration, uint256 amount)',
	'function channelClaimTimeout(uint256 channelId)',

	// Multi-claim for recipients
	'function multiChannelClaim(uint256[] memory channelIds, uint256[] memory amounts, uint256[] memory plannedAmounts, bool[] memory isSendbacks, uint8[] memory v, bytes32[] memory r, bytes32[] memory s)',

	// Channel queries
	'function channels(uint256 channelId) view returns (uint256 nonce, address sender, address signer, address recipient, bytes32 groupId, uint256 value, uint256 expiration)',
	'function nextChannelId() view returns (uint256)',

	// Events
	'event ChannelOpen(uint256 indexed channelId, uint256 nonce, address indexed sender, address signer, address indexed recipient, bytes32 groupId, uint256 amount, uint256 expiration)',
	'event ChannelClaim(uint256 indexed channelId, uint256 indexed nonce, address indexed recipient, uint256 claimAmount, uint256 plannedAmount, uint256 sendBackAmount, uint256 keepAmount)',
	'event ChannelSenderClaim(uint256 indexed channelId, uint256 indexed nonce, uint256 claimAmount)',
	'event ChannelExtend(uint256 indexed channelId, uint256 newExpiration)',
	'event ChannelAddFunds(uint256 indexed channelId, uint256 additionalFunds)',
	'event DepositFunds(address indexed sender, uint256 amount)',
	'event WithdrawFunds(address indexed sender, uint256 amount)',
];

/**
 * Registry Contract ABI
 *
 * The Registry contract stores organization and service metadata.
 */
export const REGISTRY_CONTRACT_ABI = [
	// Organization operations
	'function createOrganization(bytes32 orgId, bytes memory orgMetadataURI, address[] memory members)',
	'function changeOrganizationOwner(bytes32 orgId, address newOwner)',
	'function changeOrganizationMetadataURI(bytes32 orgId, bytes memory orgMetadataURI)',
	'function addOrganizationMembers(bytes32 orgId, address[] memory newMembers)',
	'function removeOrganizationMembers(bytes32 orgId, address[] memory existingMembers)',
	'function deleteOrganization(bytes32 orgId)',

	// Service operations
	'function createServiceRegistration(bytes32 orgId, bytes32 serviceId, bytes memory metadataURI)',
	'function updateServiceRegistration(bytes32 orgId, bytes32 serviceId, bytes memory metadataURI)',
	'function deleteServiceRegistration(bytes32 orgId, bytes32 serviceId)',

	// Query functions
	'function getOrganizationById(bytes32 orgId) view returns (bool found, bytes32 id, bytes memory metadataURI, address owner, address[] memory members, bytes32[] memory serviceIds)',
	'function getServiceRegistrationById(bytes32 orgId, bytes32 serviceId) view returns (bool found, bytes32 id, bytes memory metadataURI)',
	'function listOrganizations() view returns (bytes32[] memory orgIds)',
	'function listServicesForOrganization(bytes32 orgId) view returns (bool found, bytes32[] memory serviceIds)',

	// Events
	'event OrganizationCreated(bytes32 indexed orgId)',
	'event OrganizationModified(bytes32 indexed orgId)',
	'event OrganizationDeleted(bytes32 indexed orgId)',
	'event ServiceCreated(bytes32 indexed orgId, bytes32 indexed serviceId, bytes metadataURI)',
	'event ServiceMetadataModified(bytes32 indexed orgId, bytes32 indexed serviceId, bytes metadataURI)',
	'event ServiceTagsModified(bytes32 indexed orgId, bytes32 indexed serviceId)',
	'event ServiceDeleted(bytes32 indexed orgId, bytes32 indexed serviceId)',
];

/**
 * Staking Contract ABI
 */
export const STAKING_CONTRACT_ABI = [
	'function stake(uint256 amount)',
	'function unstake(uint256 amount)',
	'function claimRewards()',
	'function getStakedAmount(address staker) view returns (uint256)',
	'function getPendingRewards(address staker) view returns (uint256)',
	'function getTotalStaked() view returns (uint256)',
	'function getCurrentAPY() view returns (uint256)',
	'function getStakingWindow() view returns (uint256 start, uint256 end)',
	'event Staked(address indexed staker, uint256 amount)',
	'event Unstaked(address indexed staker, uint256 amount)',
	'event RewardsClaimed(address indexed staker, uint256 amount)',
];

/**
 * Bridge Contract ABI (Ethereum <-> Cardano)
 */
export const BRIDGE_CONTRACT_ABI = [
	'function initiateConversion(uint256 amount, bytes memory cardanoAddress)',
	'function completeConversion(bytes32 conversionId)',
	'function getConversionStatus(bytes32 conversionId) view returns (uint8 status, uint256 amount, bytes memory targetAddress, uint256 timestamp)',
	'function getConversionFee() view returns (uint256)',
	'function getPendingConversions(address user) view returns (bytes32[] memory)',
	'function getBridgeLimits() view returns (uint256 minAmount, uint256 maxAmount, uint256 dailyLimit)',
	'event ConversionInitiated(bytes32 indexed conversionId, address indexed sender, uint256 amount, bytes targetAddress)',
	'event ConversionCompleted(bytes32 indexed conversionId)',
	'event ConversionFailed(bytes32 indexed conversionId, string reason)',
];

/**
 * ASI Token Contract ABI (Post-merger token)
 */
export const ASI_TOKEN_ABI = [
	'function name() view returns (string)',
	'function symbol() view returns (string)',
	'function decimals() view returns (uint8)',
	'function totalSupply() view returns (uint256)',
	'function balanceOf(address owner) view returns (uint256)',
	'function transfer(address to, uint256 value) returns (bool)',
	'function transferFrom(address from, address to, uint256 value) returns (bool)',
	'function approve(address spender, uint256 value) returns (bool)',
	'function allowance(address owner, address spender) view returns (uint256)',
	// Migration functions
	'function convertFromAGIX(uint256 agixAmount)',
	'function getConversionRate() view returns (uint256)',
	'event Transfer(address indexed from, address indexed to, uint256 value)',
	'event Converted(address indexed user, uint256 agixAmount, uint256 asiAmount)',
];

/**
 * RFAI (Request for AI) Contract ABI
 */
export const RFAI_CONTRACT_ABI = [
	'function createRequest(bytes memory metadata, uint256 expiration) returns (uint256)',
	'function fundRequest(uint256 requestId, uint256 amount)',
	'function submitSolution(uint256 requestId, bytes memory solutionMetadata)',
	'function voteOnSolution(uint256 requestId, uint256 solutionId)',
	'function claimBounty(uint256 requestId, uint256 solutionId)',
	'function getRequest(uint256 requestId) view returns (bytes memory metadata, address creator, uint256 totalFunding, uint256 expiration, uint8 status)',
	'function getSolutions(uint256 requestId) view returns (uint256[] memory solutionIds)',
	'function getSolution(uint256 requestId, uint256 solutionId) view returns (bytes memory metadata, address submitter, uint256 votes)',
	'event RequestCreated(uint256 indexed requestId, address indexed creator)',
	'event RequestFunded(uint256 indexed requestId, address indexed funder, uint256 amount)',
	'event SolutionSubmitted(uint256 indexed requestId, uint256 indexed solutionId, address indexed submitter)',
	'event BountyClaimed(uint256 indexed requestId, uint256 indexed solutionId, address indexed claimer, uint256 amount)',
];

/**
 * Governance Contract ABI
 */
export const GOVERNANCE_CONTRACT_ABI = [
	'function propose(bytes memory proposalData) returns (uint256)',
	'function vote(uint256 proposalId, bool support)',
	'function execute(uint256 proposalId)',
	'function delegate(address delegatee)',
	'function getProposal(uint256 proposalId) view returns (bytes memory data, address proposer, uint256 forVotes, uint256 againstVotes, uint256 startBlock, uint256 endBlock, bool executed)',
	'function getVotingPower(address account) view returns (uint256)',
	'function hasVoted(uint256 proposalId, address account) view returns (bool)',
	'event ProposalCreated(uint256 indexed proposalId, address indexed proposer)',
	'event VoteCast(address indexed voter, uint256 indexed proposalId, bool support, uint256 votes)',
	'event ProposalExecuted(uint256 indexed proposalId)',
];

/**
 * Contract addresses by network
 */
export const CONTRACT_ADDRESSES = {
	ethereumMainnet: {
		agixToken: '0x5B7533812759B45C2B44C19e320ba2cD2681b542',
		mpe: '0x5e592F9b1d303183d963635f895f0f0C48284f4e',
		registry: '0x663422c6999Ff94933DBCb388623952CF2407F6f',
		staking: '0x6e3e2Cf40Ee42f25B13e2DDd8FA51178c0C51E21',
		bridge: '0x2775E72C4e7fc98B8c5B0Ff1E6b54e6bEe9C8b4C',
		rfai: '0x0000000000000000000000000000000000000000', // Placeholder
		governance: '0x0000000000000000000000000000000000000000', // Placeholder
		asiToken: '0x0000000000000000000000000000000000000000', // Placeholder for ASI
	},
	ethereumSepolia: {
		agixToken: '0x5B7533812759B45C2B44C19e320ba2cD2681b542',
		mpe: '0x7E0aF8988eb8d127D74cc1F8D07B34dA31d3C76d',
		registry: '0x663422c6999Ff94933DBCb388623952CF2407F6f',
		staking: '0x0000000000000000000000000000000000000000',
		bridge: '0x0000000000000000000000000000000000000000',
		rfai: '0x0000000000000000000000000000000000000000',
		governance: '0x0000000000000000000000000000000000000000',
		asiToken: '0x0000000000000000000000000000000000000000',
	},
};

/**
 * Channel status enum
 */
export enum ChannelStatus {
	OPEN = 0,
	CLAIMED = 1,
	EXPIRED = 2,
}

/**
 * Request status enum for RFAI
 */
export enum RequestStatus {
	OPEN = 0,
	FUNDED = 1,
	SOLUTION_SUBMITTED = 2,
	COMPLETED = 3,
	EXPIRED = 4,
}

/**
 * Conversion status enum for Bridge
 */
export enum ConversionStatus {
	PENDING = 0,
	PROCESSING = 1,
	COMPLETED = 2,
	FAILED = 3,
}
