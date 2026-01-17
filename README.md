# n8n-nodes-singularitynet

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for the **SingularityNET** decentralized AI marketplace. Access and automate AI services, manage payment channels, stake AGIX tokens, and interact with the entire SingularityNET ecosystem directly from your n8n workflows.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![SingularityNET](https://img.shields.io/badge/SingularityNET-AGIX-purple)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **100+ Operations** across 16 resource categories
- **Multi-Chain Support** for Ethereum and Cardano networks
- **Real-Time Triggers** for blockchain event monitoring
- **AI Service Invocation** with payment channel management
- **Full Marketplace Access** to browse, discover, and use AI services

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-singularitynet`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation
cd ~/.n8n

# Install the package
npm install n8n-nodes-singularitynet

# Restart n8n
```

### Development Installation

```bash
# 1. Extract the zip file
unzip n8n-nodes-singularitynet.zip
cd n8n-nodes-singularitynet

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Create symlink to n8n custom nodes directory
# For Linux/macOS:
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-singularitynet

# For Windows (run as Administrator):
# mklink /D %USERPROFILE%\.n8n\custom\n8n-nodes-singularitynet %CD%

# 5. Restart n8n
# If running n8n locally:
n8n start

# If running n8n via Docker, restart the container:
# docker restart n8n
```

## Credentials Setup

### SingularityNET Network Credentials

| Field | Description |
|-------|-------------|
| Network | Select: Ethereum Mainnet, Sepolia, Cardano Mainnet, or Preprod |
| RPC URL | Ethereum RPC endpoint (e.g., Infura, Alchemy) |
| Private Key | Your wallet private key (keep secure!) |
| Mnemonic | Alternative: 12/24 word seed phrase |
| IPFS Gateway | Optional custom IPFS gateway URL |

### SingularityNET Platform Credentials

| Field | Description |
|-------|-------------|
| Platform Endpoint | API endpoint URL |
| API Key | Your platform API key |
| Identity Address | Your blockchain identity address |

### AI Service Credentials

| Field | Description |
|-------|-------------|
| Organization ID | Service provider organization |
| Service ID | Specific service identifier |
| Service Endpoint | gRPC service endpoint |

## Resources & Operations

| Resource | Operations | Description |
|----------|------------|-------------|
| **Account** | 11 ops | Balance queries, transfers, escrow management |
| **Service** | 14 ops | Browse, search, and get AI service information |
| **Organization** | 9 ops | Organization management and discovery |
| **AI Invocation** | 12 ops | Call AI services with payment handling |
| **Payment Channel** | 11 ops | Open, fund, extend, and claim channels |
| **Escrow** | 8 ops | Multi-Party Escrow (MPE) operations |
| **Marketplace** | 10 ops | Browse featured, popular, and new services |
| **Staking** | 10 ops | AGIX staking and rewards |
| **RFAI** | 10 ops | Request for AI bounty system |
| **Publisher** | 11 ops | Service publishing and management |
| **IPFS** | 8 ops | Metadata storage and retrieval |
| **Bridge** | 9 ops | Cross-chain AGIX transfers (ETH ↔ ADA) |
| **Governance** | 8 ops | Proposals and voting |
| **Daemon** | 7 ops | Service daemon monitoring |
| **ASI Token** | 6 ops | ASI token operations (post-merger) |
| **Utility** | 9 ops | Unit conversion, gas estimation, validation |

## Trigger Node

The **SingularityNET Trigger** node monitors blockchain events in real-time:

- **Account Events**: Balance changes, deposits, withdrawals
- **Payment Channel Events**: Open, fund, extend, claim
- **Service Events**: Updates, ratings, new services
- **Staking Events**: Stake added, rewards available
- **Organization Events**: Created, updated, member changes

## Usage Examples

### Browse Featured AI Services

```json
{
  "resource": "marketplace",
  "operation": "getFeaturedServices"
}
```

### Check AGIX Balance

```json
{
  "resource": "account",
  "operation": "getAgixBalance",
  "address": "0x..."
}
```

### Open Payment Channel

```json
{
  "resource": "paymentChannel",
  "operation": "openChannel",
  "recipientAddress": "0x...",
  "groupId": "default_group",
  "amount": 10,
  "expiration": 11520
}
```

### Search Services

```json
{
  "resource": "service",
  "operation": "searchServices",
  "query": "image recognition"
}
```

## SingularityNET Concepts

### AGIX Token

The native utility token of SingularityNET. Used for paying for AI services, staking for rewards, and governance voting.

### Cogs

Smallest unit of AGIX: **1 AGIX = 10^8 cogs**

### Multi-Party Escrow (MPE)

Smart contract system enabling trustless payments:
- Users deposit AGIX to escrow
- Open payment channels with service providers
- Pay per service call via signed messages
- Claim unused funds after channel expiration

### Payment Channels

Pre-funded accounts for AI service calls:
- Open channel with initial deposit
- Make multiple calls without on-chain transactions
- Extend expiration as needed
- Claim timeout to recover unused funds

### ASI Token

The merged token (AGIX + FET + OCEAN) of the Artificial Superintelligence Alliance.

## Networks

| Network | Chain ID | Token |
|---------|----------|-------|
| Ethereum Mainnet | 1 | AGIX (ERC-20) |
| Ethereum Sepolia | 11155111 | Test AGIX |
| Cardano Mainnet | - | AGIX (Native) |
| Cardano Preprod | - | Test AGIX |

### Contract Addresses

**Ethereum Mainnet:**
- AGIX Token: `0x5B7533812759B45C2B44C19e320ba2cD2681b542`
- MPE Contract: `0x5e592F9b1d303183d963635f895f0f0C48284f4e`
- Registry: `0xb3180fEB962c597De6521a7D88c4d58d41E68aDf`

**Ethereum Sepolia:**
- AGIX Token: `0xdA80c3B9A7C7E2cB42151BbFc94aa9A54F0a9bfe`
- MPE Contract: `0x7E6366fBe3bDfa0a0F282Fab9cC2B1Ca7c90b55a`
- Registry: `0x663422c6999ff94933dbcb388623952cf2407f6f`

## Error Handling

The node includes comprehensive error handling for:
- Network connectivity issues
- Insufficient balance errors
- Channel expiration errors
- Invalid address formats
- Transaction failures

## Security Best Practices

1. **Never share private keys** - Use environment variables or n8n credentials
2. **Test on Sepolia first** - Verify workflows before mainnet
3. **Monitor channel expiration** - Reclaim funds before expiry
4. **Verify service endpoints** - Ensure services are authentic
5. **Use appropriate gas limits** - Avoid transaction failures

## Development

### Building

```bash
# Development build
npm run build

# Watch mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Testing the Node

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Verify Installation in n8n

1. Open n8n in your browser (default: http://localhost:5678)
2. Create a new workflow
3. Click the "+" button to add a node
4. Search for "SingularityNET"
5. The node should appear in the list
6. Add the node and configure credentials
7. Test the node operations

### Project Structure

```
n8n-nodes-singularitynet/
├── credentials/
│   ├── SingularitynetNetwork.credentials.ts
│   ├── SingularitynetPlatform.credentials.ts
│   └── AiService.credentials.ts
├── nodes/Singularitynet/
│   ├── Singularitynet.node.ts
│   ├── SingularitynetTrigger.node.ts
│   ├── actions/
│   │   ├── account/
│   │   ├── service/
│   │   ├── organization/
│   │   ├── invocation/
│   │   ├── paymentChannel/
│   │   ├── escrow/
│   │   ├── marketplace/
│   │   ├── staking/
│   │   ├── rfai/
│   │   ├── publisher/
│   │   ├── ipfs/
│   │   ├── bridge/
│   │   ├── governance/
│   │   ├── daemon/
│   │   ├── asi/
│   │   └── utility/
│   ├── transport/
│   │   ├── ethereumClient.ts
│   │   ├── cardanoClient.ts
│   │   ├── platformApi.ts
│   │   ├── grpcClient.ts
│   │   ├── ipfsClient.ts
│   │   └── snetSdk.ts
│   ├── constants/
│   │   ├── networks.ts
│   │   ├── contracts.ts
│   │   ├── organizations.ts
│   │   └── services.ts
│   └── utils/
│       ├── unitConverter.ts
│       ├── paymentUtils.ts
│       ├── serviceUtils.ts
│       └── protobufUtils.ts
├── test/
│   ├── unit/
│   │   ├── unitConverter.test.ts
│   │   └── ipfsClient.test.ts
│   └── integration/
│       └── platformApi.test.ts
├── scripts/
│   ├── test.sh
│   ├── build.sh
│   └── install-local.sh
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
├── .gitignore
├── .npmignore
├── LICENSE
├── COMMERCIAL_LICENSE.md
├── LICENSING_FAQ.md
└── README.md
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use

Permitted for personal, educational, research, and internal business use.

### Commercial Use

Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

**Change Date**: January 1, 2030
**Change License**: Apache License, Version 2.0

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Support

- **Documentation**: [SingularityNET Docs](https://dev.singularitynet.io/)
- **Discord**: [SingularityNET Community](https://discord.gg/snet)
- **GitHub Issues**: [Report a Bug](https://github.com/Velocity-BPA/n8n-nodes-singularitynet/issues)

## Acknowledgments

- [SingularityNET](https://singularitynet.io/) - Decentralized AI marketplace
- [n8n](https://n8n.io/) - Workflow automation platform
- The SingularityNET developer community
