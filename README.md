# n8n-nodes-singularitynet

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

An n8n community node for SingularityNET integration, providing access to 5 core resources for decentralized AI service management. Access AI services, manage organizations and payment channels, track blockchain transactions, and interact with the service registry through n8n workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Blockchain](https://img.shields.io/badge/Blockchain-Ethereum-blue)
![AI Services](https://img.shields.io/badge/AI-Services-green)
![Decentralized](https://img.shields.io/badge/Network-Decentralized-purple)

## Features

- **AI Service Integration** - Call and manage decentralized AI services on the SingularityNET platform
- **Organization Management** - Create, update, and manage AI service organizations
- **Payment Channel Operations** - Handle micropayments and channel management for service usage
- **Transaction Tracking** - Monitor blockchain transactions and payment flows
- **Registry Access** - Search and discover available AI services in the network
- **Blockchain Integration** - Native support for Ethereum-based operations
- **Decentralized Architecture** - Connect to the distributed AI marketplace
- **Real-time Monitoring** - Track service performance and usage metrics

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
| API Key | Your SingularityNET platform API key | Yes |
| Network | Ethereum network (mainnet/testnet) | Yes |
| Wallet Address | Your wallet address for transactions | Yes |

## Resources & Operations

### 1. AIService

| Operation | Description |
|-----------|-------------|
| Get | Retrieve AI service details and metadata |
| Call | Execute an AI service with input parameters |
| List | Get available AI services from organizations |
| Get Pricing | Retrieve service pricing and payment information |
| Get Metadata | Fetch service metadata and configuration |

### 2. Organization

| Operation | Description |
|-----------|-------------|
| Create | Create a new AI service organization |
| Get | Retrieve organization details and information |
| Update | Modify organization settings and metadata |
| List | Get all organizations in the network |
| Delete | Remove an organization from the platform |
| Get Members | Retrieve organization member list |

### 3. Channel

| Operation | Description |
|-----------|-------------|
| Open | Open a new payment channel for services |
| Close | Close an existing payment channel |
| Extend | Extend payment channel expiration |
| Get Balance | Check current channel balance |
| Fund | Add funds to an existing channel |
| List | Get all channels for an organization |

### 4. Transaction

| Operation | Description |
|-----------|-------------|
| Get | Retrieve transaction details by hash |
| List | Get transaction history for an account |
| Create | Create a new blockchain transaction |
| Get Status | Check transaction confirmation status |
| Get Receipt | Retrieve transaction receipt and logs |

### 5. Registry

| Operation | Description |
|-----------|-------------|
| Search Services | Search for AI services by criteria |
| Get Service | Retrieve specific service from registry |
| List Organizations | Get all registered organizations |
| Get Tags | Retrieve available service tags |
| Filter by Category | Find services by category or type |

## Usage Examples

```javascript
// Call an AI service for image classification
{
  "service_id": "image-classifier-v2",
  "organization_id": "example-ai-org",
  "method": "classify",
  "input": {
    "image_url": "https://example.com/image.jpg",
    "max_results": 5
  }
}
```

```javascript
// Open a payment channel for service usage
{
  "organization_id": "example-ai-org",
  "service_group_id": "default-group",
  "amount": "1000000000", // Amount in AGI tokens (wei)
  "expiration": "2024-12-31T23:59:59Z"
}
```

```javascript
// Search for AI services in the registry
{
  "query": "natural language processing",
  "tags": ["nlp", "text-analysis"],
  "category": "language",
  "max_results": 10
}
```

```javascript
// Get organization details and services
{
  "organization_id": "example-ai-org",
  "include_services": true,
  "include_members": true
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key is correct and active |
| Insufficient Funds | Not enough AGI tokens for service call | Add funds to wallet or payment channel |
| Service Unavailable | AI service is temporarily offline | Retry later or use alternative service |
| Channel Expired | Payment channel has expired | Open new channel or extend existing one |
| Network Error | Blockchain network connection issues | Check network status and retry |
| Invalid Parameters | Service call parameters are malformed | Review service documentation and fix parameters |

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
- **SingularityNET Documentation**: [dev.singularitynet.io](https://dev.singularitynet.io)
- **Platform Portal**: [beta.singularitynet.io](https://beta.singularitynet.io)