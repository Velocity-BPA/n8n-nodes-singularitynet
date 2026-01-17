/**
 * SingularityNET Network Configurations
 *
 * Contains all network-specific configurations for Ethereum and Cardano
 * networks supported by the SingularityNET platform.
 */

export interface NetworkConfig {
	name: string;
	chainId?: number;
	rpcUrl: string;
	explorerUrl: string;
	registryAddress: string;
	mpeAddress: string;
	tokenAddress: string;
	stakingAddress?: string;
	bridgeAddress?: string;
	ipfsGateway: string;
	platformApi: string;
	daemonApi?: string;
}

export const ETHEREUM_MAINNET: NetworkConfig = {
	name: 'Ethereum Mainnet',
	chainId: 1,
	rpcUrl: 'https://mainnet.infura.io/v3/',
	explorerUrl: 'https://etherscan.io',
	registryAddress: '0x663422c6999Ff94933DBCb388623952CF2407F6f',
	mpeAddress: '0x5e592F9b1d303183d963635f895f0f0C48284f4e',
	tokenAddress: '0x5B7533812759B45C2B44C19e320ba2cD2681b542',
	stakingAddress: '0x6e3e2Cf40Ee42f25B13e2DDd8FA51178c0C51E21',
	bridgeAddress: '0x2775E72C4e7fc98B8c5B0Ff1E6b54e6bEe9C8b4C',
	ipfsGateway: 'https://ipfs.singularitynet.io/ipfs/',
	platformApi: 'https://marketplace-api.singularitynet.io',
	daemonApi: 'https://daemon.singularitynet.io',
};

export const ETHEREUM_SEPOLIA: NetworkConfig = {
	name: 'Ethereum Sepolia',
	chainId: 11155111,
	rpcUrl: 'https://sepolia.infura.io/v3/',
	explorerUrl: 'https://sepolia.etherscan.io',
	registryAddress: '0x663422c6999Ff94933DBCb388623952CF2407F6f',
	mpeAddress: '0x7E0aF8988eb8d127D74cc1F8D07B34dA31d3C76d',
	tokenAddress: '0x5B7533812759B45C2B44C19e320ba2cD2681b542',
	ipfsGateway: 'https://ipfs.singularitynet.io/ipfs/',
	platformApi: 'https://marketplace-api-staging.singularitynet.io',
};

export const CARDANO_MAINNET: NetworkConfig = {
	name: 'Cardano Mainnet',
	rpcUrl: 'https://cardano-mainnet.blockfrost.io/api/v0',
	explorerUrl: 'https://cardanoscan.io',
	registryAddress: '', // Cardano uses different addressing
	mpeAddress: '',
	tokenAddress: '', // AGIX policy ID on Cardano
	ipfsGateway: 'https://ipfs.singularitynet.io/ipfs/',
	platformApi: 'https://marketplace-api.singularitynet.io',
};

export const CARDANO_PREPROD: NetworkConfig = {
	name: 'Cardano Preprod',
	rpcUrl: 'https://cardano-preprod.blockfrost.io/api/v0',
	explorerUrl: 'https://preprod.cardanoscan.io',
	registryAddress: '',
	mpeAddress: '',
	tokenAddress: '',
	ipfsGateway: 'https://ipfs.singularitynet.io/ipfs/',
	platformApi: 'https://marketplace-api-staging.singularitynet.io',
};

export const NETWORKS: Record<string, NetworkConfig> = {
	ethereumMainnet: ETHEREUM_MAINNET,
	ethereumSepolia: ETHEREUM_SEPOLIA,
	cardanoMainnet: CARDANO_MAINNET,
	cardanoPreprod: CARDANO_PREPROD,
};

/**
 * Get network configuration by network ID
 */
export function getNetworkConfig(networkId: string): NetworkConfig | undefined {
	return NETWORKS[networkId];
}

/**
 * Check if network is Ethereum-based
 */
export function isEthereumNetwork(networkId: string): boolean {
	return networkId.startsWith('ethereum') || networkId === 'custom';
}

/**
 * Check if network is Cardano-based
 */
export function isCardanoNetwork(networkId: string): boolean {
	return networkId.startsWith('cardano');
}

/**
 * Token decimals
 */
export const TOKEN_DECIMALS = {
	AGIX: 8,
	ASI: 18,
	ETH: 18,
	ADA: 6,
};

/**
 * Unit conversion constants
 * 1 AGIX = 10^8 cogs
 */
export const COGS_PER_AGIX = 100000000; // 10^8
export const WEI_PER_ETH = 1000000000000000000n; // 10^18
export const LOVELACE_PER_ADA = 1000000; // 10^6
