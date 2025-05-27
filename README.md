# 🚀 Monad MCP Server

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Monad](https://img.shields.io/badge/Monad-Testnet-purple?style=for-the-badge)](https://monad.xyz/)
[![MCP](https://img.shields.io/badge/MCP-Protocol-green?style=for-the-badge)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **Created by Wilfred Naraga** - This is my first project built to interact with the Monad testnet, combining the power of AI assistants with blockchain technology through the Model Context Protocol.

This is my first Web3 Project, built mainly for the Monad Testnet. I've built a Model Context Protocol (MCP) server that enables AI to interact with the Monad testnet and Ethereum blockchain. This server currently provides a simple suite of tools for blockchain operations and developer utilities. More tools are currently in development.

## 📋 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Available Tools](#-available-tools)
- [Use Cases](#-use-cases)
- [Examples](#-examples)
- [Architecture](#-architecture)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## ✨ Features

- **🔗 Direct Blockchain Access**: Query balances, transactions, blocks, and smart contracts
- **🤖 AI-Powered Integration**: Seamless integration with Claude and other AI assistants
- **📊 Real-time Data**: Access live blockchain data from Monad testnet
- **🛠️ Developer Tools**: Utilities for encoding/decoding, conversions, and contract analysis
- **📚 Documentation Access**: Built-in access to Monad developer documentation
- **🔒 Type-Safe**: Full TypeScript support with comprehensive error handling

## 🛠️ Installation

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- Claude Desktop app (or any MCP-compatible client)

### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/monad-mcp-server.git
cd monad-mcp-server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Build the project:**
```bash
npm run build
```

4. **Configure Claude Desktop:**

Add the following to your Claude Desktop configuration file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "monad-testnet": {
      "command": "node",
      "args": ["path/to/monad-mcp-server/index.js"]
    }
  }
}
```

5. **Restart Claude Desktop**

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Optional: Custom RPC endpoint (defaults to Monad testnet public RPC)
MONAD_RPC_URL=https://testnet-rpc.monad.xyz

# Optional: Monadscan API key for enhanced contract verification
MONADSCAN_API_KEY=your_api_key_here
```

### Common Contract Addresses

Update the `COMMON_CONTRACTS` object in `index.ts` with frequently used contract addresses:

```typescript
const COMMON_CONTRACTS = {
    WMON: "0x...", // Wrapped MON address
    USDC: "0x...", // USDC token address
    // Add more as needed
};
```

## 🔧 Available Tools

### 💰 Balance & Token Tools

| Tool | Description | Use Case |
|------|-------------|----------|
| `get-mon-balance` | Get MON balance for any address | Check wallet balances, monitor accounts |
| `get-erc20-balance` | Check ERC20 token balances with metadata | Track token holdings, portfolio analysis |

### 📊 Transaction & Block Tools

| Tool | Description | Use Case |
|------|-------------|----------|
| `get-transaction` | Get detailed transaction information | Verify transfers, debug transactions |
| `get-tx-receipt` | Get transaction receipt with gas details | Track transaction status, analyze gas costs |
| `get-block` | Fetch block information | Monitor network activity, verify timestamps |
| `decode-calldata` | Decode transaction calldata | Understand contract interactions |

### 📝 Smart Contract Tools

| Tool | Description | Use Case |
|------|-------------|----------|
| `get-contract-source` | Analyze contracts and retrieve source code | Verify contracts, understand functionality |
| `readContract` | Read data from any contract function | Query contract state, get token info |

### ⛽ Network Tools

| Tool | Description | Use Case |
|------|-------------|----------|
| `estimate-priority-fee` | Get current gas price estimates | Optimize transaction costs |
| `get-monad-constants` | Access network information | Get chain ID, RPC URLs, common addresses |

### 🔄 Utility Tools

| Tool | Description | Use Case |
|------|-------------|----------|
| `convert` | Convert between data formats | Encode/decode data, calculate hashes |
| `monad-docs` | Access Monad documentation | Quick reference, learning |
| `read-monad-docs` | Read specific doc sections | Deep dive into topics |

## 💡 Use Cases

### 1. **DeFi Portfolio Management**
Monitor and analyze DeFi positions across multiple protocols:
```
"Check my MON balance and USDC balance at address 0x123..."
"What's the current gas price for a swap transaction?"
"Analyze the USDC token contract"
```

### 2. **Smart Contract Development**
Assist in contract development and debugging:
```
"Decode this calldata: 0xa9059cbb..."
"Read the totalSupply from token contract 0x456..."
"Check if contract 0x789 is verified on Monadscan"
```

### 3. **Transaction Analysis**
Investigate and verify blockchain transactions:
```
"Get details for transaction 0xabc..."
"What was the gas cost for this transaction?"
"Show me the latest block information"
```

### 4. **Token Launch Support**
Help with token deployments and verification:
```
"Is this address an ERC20 token?"
"Get the token name, symbol, and total supply"
"Generate the keccak256 hash for 'transfer(address,uint256)'"
```

### 5. **Blockchain Education**
Learn about Monad and blockchain development:
```
"Show me the Monad documentation"
"What's the chain ID for Monad testnet?"
"Convert 'Hello World' to hex format"
```

## 📖 Examples

### Basic Balance Check
```
User: "Check the balance of 0x742d35Cc6634C0532925a3b844Bc9D24E013D74E"