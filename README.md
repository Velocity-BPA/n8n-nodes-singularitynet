# n8n-nodes-singularitynet

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with SingularityNET's decentralized AI marketplace, featuring 5 core resources (AIServices, Organizations, Channels, Transactions, Marketplace) with full CRUD operations and marketplace interactions for seamless AI service discovery, execution, and payment management.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![SingularityNET](https://img.shields.io/badge/SingularityNET-AI%20Marketplace-purple)
![Blockchain](https://img.shields.io/badge/Blockchain-Ethereum-green)
![AGI Token](https://img.shields.io/badge/Token-AGI-orange)

## Features

- **AI Service Discovery** - Search, filter, and discover AI services across the SingularityNET marketplace
- **Service Execution** - Execute AI services directly from n8n workflows with automatic payment handling
- **Organization Management** - Create, update, and manage AI service provider organizations
- **Channel Operations** - Handle payment channels for efficient micropayments to AI services
- **Transaction Monitoring** - Track and manage blockchain transactions for service payments
- **Marketplace Integration** - Browse marketplace categories, ratings, and service metadata
- **Automated Token Management** - Handle AGI token transactions and balance monitoring
- **Multi-Network Support** - Compatible with Ethereum mainnet and testnets

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-singularitynet`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-singularitynet
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-singularitynet.git
cd n8n-nodes-singularitynet
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-singularitynet
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | SingularityNET platform API key for service discovery and metadata | Yes |
| Wallet Private Key | Ethereum wallet private key for transaction signing | Yes |
| Network | Blockchain network (mainnet, ropsten, kovan) | Yes |
| Registry Address | SingularityNET registry contract address | No |

## Resources & Operations

### 1. AI Services

| Operation | Description |
|-----------|-------------|
| List Services | Retrieve all available AI services from the marketplace |
| Get Service | Get detailed information about a specific AI service |
| Execute Service | Call an AI service with input parameters and handle payment |
| Search Services | Search for AI services by keywords, tags, or categories |
| Get Service Metadata | Retrieve service metadata including pricing and endpoints |

### 2. Organizations

| Operation | Description |
|-----------|-------------|
| List Organizations | Get all organizations providing AI services |
| Get Organization | Retrieve detailed organization information |
| Create Organization | Register a new AI service provider organization |
| Update Organization | Modify organization details and metadata |
| Delete Organization | Remove an organization from the registry |
| Get Organization Services | List all services provided by an organization |

### 3. Channels

| Operation | Description |
|-----------|-------------|
| List Channels | Get all payment channels for the authenticated user |
| Create Channel | Open a new payment channel with an organization |
| Get Channel | Retrieve details of a specific payment channel |
| Fund Channel | Add AGI tokens to an existing payment channel |
| Close Channel | Close a payment channel and settle remaining balance |
| Get Channel Balance | Check available balance in a payment channel |

### 4. Transactions

| Operation | Description |
|-----------|-------------|
| List Transactions | Get transaction history for the authenticated wallet |
| Get Transaction | Retrieve details of a specific blockchain transaction |
| Monitor Transaction | Track transaction status and confirmations |
| Get Transaction Receipt | Get transaction receipt and execution details |
| Estimate Gas | Estimate gas costs for pending transactions |

### 5. Marketplace

| Operation | Description |
|-----------|-------------|
| Browse Categories | List all available AI service categories |
| Get Featured Services | Retrieve featured and trending AI services |
| Get Service Rankings | Get services ranked by popularity and ratings |
| Search Marketplace | Advanced marketplace search with filters |
| Get Service Reviews | Retrieve user reviews and ratings for services |
| Submit Review | Submit a review and rating for a used service |

## Usage Examples

```javascript
// Execute an AI image processing service
{
  "resource": "aiServices",
  "operation": "executeService",
  "serviceId": "snet-image-enhancement-v2",
  "organizationId": "snet-ai-vision",
  "parameters": {
    "image_url": "https://example.com/image.jpg",
    "enhancement_type": "super_resolution",
    "scale_factor": 2
  },
  "maxPrice": "100000000" // 0.1 AGI in cogs
}
```

```javascript
// Search for natural language processing services
{
  "resource": "aiServices",
  "operation": "searchServices",
  "query": "sentiment analysis",
  "category": "nlp",
  "filters": {
    "priceRange": { "min": 0, "max": 50000000 },
    "minRating": 4.0,
    "tags": ["sentiment", "text-analysis"]
  }
}
```

```javascript
// Create a payment channel with an AI service provider
{
  "resource": "channels",
  "operation": "createChannel",
  "organizationId": "snet-nlp-services",
  "amount": "1000000000", // 1 AGI in cogs
  "expiration": "2024-12-31T23:59:59Z"
}
```

```javascript
// Monitor marketplace for trending AI services
{
  "resource": "marketplace",
  "operation": "getFeaturedServices",
  "category": "computer-vision",
  "limit": 10,
  "sortBy": "popularity"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided API key | Verify API key is correct and active |
| Insufficient Balance | Not enough AGI tokens for service execution | Fund wallet or payment channel with AGI tokens |
| Service Unavailable | AI service is temporarily offline or unreachable | Try again later or contact service provider |
| Transaction Failed | Blockchain transaction was rejected or failed | Check gas settings and wallet balance (ETH) |
| Channel Expired | Payment channel has exceeded expiration time | Create a new payment channel with the organization |
| Network Error | Connection to SingularityNET network failed | Check network connectivity and blockchain node status |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
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

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-singularitynet/issues)
- **SingularityNET Developer Portal**: [dev.singularitynet.io](https://dev.singularitynet.io)
- **SingularityNET Community**: [community.singularitynet.io](https://community.singularitynet.io)