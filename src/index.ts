/**
 * Monad MCP Server
 * 
 * A comprehensive Model Context Protocol (MCP) server that provides
 * tools for interacting with the Monad blockchain testnet.
 */

// Import necessary dependencies
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { 
    createPublicClient, 
    formatUnits, 
    parseUnits,
    http, 
    isAddress,
    getAddress,
    decodeFunctionData,
    encodeFunctionData,
    keccak256,
    toHex,
    fromHex,
    stringToHex,
    hexToString,
    parseAbi,
    formatEther,
    formatGwei
} from "viem";
import { monadTestnet } from "viem/chains";
import fetch from "node-fetch";

// Create a public client to interact with the Monad testnet
const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(),
});

// Common contract addresses on Monad testnet
const COMMON_CONTRACTS = {
    WMON: "0x...", // Add actual WMON address
    // Add other common contract addresses
};

// Initialize the MCP server
const server = new McpServer({
    name: "monad-testnet",
    version: "1.0.0",
});

// Store available tools for reference
const AVAILABLE_TOOLS = [
    "get-mon-balance",
    "get-erc20-balance",
    "get-transaction",
    "get-tx-receipt",
    "get-block",
    "decode-calldata",
    "get-contract-source",
    "readContract",
    "estimate-priority-fee",
    "get-monad-constants",
    "convert",
    "monad-docs",
    "read-monad-docs"
];

// Tool 1: Get MON balance
server.tool(
    "get-mon-balance",
    "Get MON balance for an address on Monad testnet",
    {
        address: z.string().describe("Monad testnet address to check balance for"),
    },
    async ({ address }) => {
        try {
            if (!isAddress(address)) {
                throw new Error("Invalid address format");
            }

            const balance = await publicClient.getBalance({
                address: getAddress(address),
            });

            return {
                content: [{
                    type: "text",
                    text: `Balance for ${address}: ${formatUnits(balance, 18)} MON`,
                }],
            };
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Failed to retrieve balance: ${error instanceof Error ? error.message : String(error)}`,
                }],
            };
        }
    }
);

// Tool 2: Get ERC20 token balance
server.tool(
    "get-erc20-balance",
    "Check ERC20 token balances with automatic token information retrieval",
    {
        address: z.string().describe("Wallet address"),
        tokenAddress: z.string().describe("ERC20 token contract address"),
    },
    async ({ address, tokenAddress }) => {
        try {
            if (!isAddress(address) || !isAddress(tokenAddress)) {
                throw new Error("Invalid address format");
            }

            // ERC20 ABI for balance, name, symbol, and decimals
            const erc20Abi = parseAbi([
                "function balanceOf(address) view returns (uint256)",
                "function name() view returns (string)",
                "function symbol() view returns (string)",
                "function decimals() view returns (uint8)",
            ]);

            // Get token info
            const [balance, name, symbol, decimals] = await Promise.all([
                publicClient.readContract({
                    address: getAddress(tokenAddress),
                    abi: erc20Abi,
                    functionName: "balanceOf",
                    args: [getAddress(address)],
                }),
                publicClient.readContract({
                    address: getAddress(tokenAddress),
                    abi: erc20Abi,
                    functionName: "name",
                }).catch(() => "Unknown"),
                publicClient.readContract({
                    address: getAddress(tokenAddress),
                    abi: erc20Abi,
                    functionName: "symbol",
                }).catch(() => "UNKNOWN"),
                publicClient.readContract({
                    address: getAddress(tokenAddress),
                    abi: erc20Abi,
                    functionName: "decimals",
                }).catch(() => 18),
            ]);

            const formattedBalance = formatUnits(balance as bigint, decimals as number);

            return {
                content: [{
                    type: "text",
                    text: `Token: ${name} (${symbol})\nBalance: ${formattedBalance} ${symbol}\nToken Address: ${tokenAddress}`,
                }],
            };
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Failed to retrieve token balance: ${error instanceof Error ? error.message : String(error)}`,
                }],
            };
        }
    }
);

// Tool 3: Get transaction details
server.tool(
    "get-transaction",
    "Retrieve detailed transaction information by hash",
    {
        txHash: z.string().describe("Transaction hash"),
    },
    async ({ txHash }) => {
        try {
            const tx = await publicClient.getTransaction({
                hash: txHash as `0x${string}`,
            });

            if (!tx) {
                throw new Error("Transaction not found");
            }

            const txInfo = `Transaction Details:
- Hash: ${tx.hash}
- From: ${tx.from}
- To: ${tx.to || "Contract Creation"}
- Value: ${formatEther(tx.value)} MON
- Gas Price: ${formatGwei(tx.gasPrice || 0n)} Gwei
- Gas: ${tx.gas}
- Nonce: ${tx.nonce}
- Block Number: ${tx.blockNumber || "Pending"}
- Block Hash: ${tx.blockHash || "Pending"}`;

            return {
                content: [{
                    type: "text",
                    text: txInfo,
                }],
            };
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Failed to retrieve transaction: ${error instanceof Error ? error.message : String(error)}`,
                }],
            };
        }
    }
);

// Tool 4: Get transaction receipt
server.tool(
    "get-tx-receipt",
    "Get transaction receipts with gas usage and status details",
    {
        txHash: z.string().describe("Transaction hash"),
    },
    async ({ txHash }) => {
        try {
            const receipt = await publicClient.getTransactionReceipt({
                hash: txHash as `0x${string}`,
            });

            const receiptInfo = `Transaction Receipt:
- Status: ${receipt.status === "success" ? "✅ Success" : "❌ Failed"}
- Block Number: ${receipt.blockNumber}
- Gas Used: ${receipt.gasUsed}
- Effective Gas Price: ${formatGwei(receipt.effectiveGasPrice)} Gwei
- Total Cost: ${formatEther(receipt.gasUsed * receipt.effectiveGasPrice)} MON
- Contract Address: ${receipt.contractAddress || "N/A"}
- Logs: ${receipt.logs.length} events emitted`;

            return {
                content: [{
                    type: "text",
                    text: receiptInfo,
                }],
            };
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Failed to retrieve receipt: ${error instanceof Error ? error.message : String(error)}`,
                }],
            };
        }
    }
);

// Tool 5: Get block information
server.tool(
    "get-block",
    "Fetch block information by number or get latest block",
    {
        blockNumber: z.string().optional().describe("Block number (optional, defaults to latest)"),
    },
    async ({ blockNumber }) => {
        try {
            const block = await publicClient.getBlock({
                blockNumber: blockNumber ? BigInt(blockNumber) : undefined,
            });

            const blockInfo = `Block Information:
- Number: ${block.number}
- Hash: ${block.hash}
- Parent Hash: ${block.parentHash}
- Timestamp: ${new Date(Number(block.timestamp) * 1000).toISOString()}
- Gas Used: ${block.gasUsed}
- Gas Limit: ${block.gasLimit}
- Base Fee: ${formatGwei(block.baseFeePerGas || 0n)} Gwei
- Transactions: ${block.transactions.length}
- Miner: ${block.miner}`;

            return {
                content: [{
                    type: "text",
                    text: blockInfo,
                }],
            };
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Failed to retrieve block: ${error instanceof Error ? error.message : String(error)}`,
                }],
            };
        }
    }
);

// Tool 6: Decode calldata
server.tool(
    "decode-calldata",
    "Decode transaction calldata to human-readable function calls",
    {
        data: z.string().describe("Calldata to decode (hex string)"),
        abi: z.string().describe("Contract ABI as JSON string"),
    },
    async ({ data, abi }) => {
        try {
            const parsedAbi = JSON.parse(abi);
            const result = decodeFunctionData({
                abi: parsedAbi,
                data: data as `0x${string}`,
            });

            return {
                content: [{
                    type: "text",
                    text: `Decoded Function Call:
- Function: ${result.functionName}
- Arguments: ${JSON.stringify(result.args, null, 2)}`,
                }],
            };
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Failed to decode calldata: ${error instanceof Error ? error.message : String(error)}`,
                }],
            };
        }
    }
);

// Tool 7: Enhanced contract analysis (source + basic info)
server.tool(
    "get-contract-source",
    "Retrieve contract source code and ABI from Monad testnet, with fallback to basic contract analysis",
    {
        contractAddress: z.string().describe("Contract address"),
    },
    async ({ contractAddress }) => {
        try {
            if (!isAddress(contractAddress)) {
                throw new Error("Invalid contract address format");
            }

            // Step 1: Try to get verified source code from Monadscan
            const apiUrl = `https://api-testnet.monadscan.com/api?module=contract&action=getsourcecode&address=${contractAddress}`;
            let sourceCodeData: any = null;
            
            // Define types for the API response
            interface MonadscanSourceCode {
                SourceCode: string;
                ContractName: string;
                CompilerVersion: string;
                OptimizationUsed: string;
                Runs?: string;
            }

            interface MonadscanResponse {
                status: string;
                result: MonadscanSourceCode[];
            }
            
            try {
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const data = await response.json() as MonadscanResponse;
                    if (data.status === "1" && data.result[0].SourceCode) {
                        sourceCodeData = data.result[0];
                    }
                }
            } catch (apiError) {
                console.log("API call failed, proceeding with on-chain analysis");
            }

            // Step 2: Get basic contract information using on-chain calls
            interface ContractInfo {
                exists: boolean;
                isContract: boolean;
                balance: string;
                bytecodeSize: number;
                isERC20: boolean;
                isERC721: boolean;
                tokenInfo: any;
                transactionCount: number;
            }

            let contractInfo: ContractInfo = {
                exists: false,
                isContract: false,
                balance: "0",
                bytecodeSize: 0,
                isERC20: false,
                isERC721: false,
                tokenInfo: null,
                transactionCount: 0
            };

            // Check if address has code (is a contract)
            const bytecode = await publicClient.getBytecode({
                address: getAddress(contractAddress),
            });

            if (bytecode && bytecode !== "0x") {
                contractInfo.exists = true;
                contractInfo.isContract = true;
                contractInfo.bytecodeSize = (bytecode.length - 2) / 2; // Remove 0x and convert to bytes

                // Get contract balance
                const balance = await publicClient.getBalance({
                    address: getAddress(contractAddress),
                });
                contractInfo.balance = formatEther(balance);

                // Check if it's an ERC20 token
                const erc20Abi = parseAbi([
                    "function name() view returns (string)",
                    "function symbol() view returns (string)",
                    "function decimals() view returns (uint8)",
                    "function totalSupply() view returns (uint256)",
                ]);

                try {
                    const [name, symbol, decimals, totalSupply] = await Promise.all([
                        publicClient.readContract({
                            address: getAddress(contractAddress),
                            abi: erc20Abi,
                            functionName: "name",
                        }),
                        publicClient.readContract({
                            address: getAddress(contractAddress),
                            abi: erc20Abi,
                            functionName: "symbol",
                        }),
                        publicClient.readContract({
                            address: getAddress(contractAddress),
                            abi: erc20Abi,
                            functionName: "decimals",
                        }),
                        publicClient.readContract({
                            address: getAddress(contractAddress),
                            abi: erc20Abi,
                            functionName: "totalSupply",
                        }),
                    ]);

                    contractInfo.isERC20 = true;
                    contractInfo.tokenInfo = {
                        name: name as string,
                        symbol: symbol as string,
                        decimals: decimals as number,
                        totalSupply: formatUnits(totalSupply as bigint, decimals as number),
                    };
                } catch {
                    // Not an ERC20 or missing some functions
                }

                // Check if it's an ERC721 (NFT)
                if (!contractInfo.isERC20) {
                    const erc721Abi = parseAbi([
                        "function name() view returns (string)",
                        "function symbol() view returns (string)",
                        "function totalSupply() view returns (uint256)",
                        "function supportsInterface(bytes4) view returns (bool)",
                    ]);

                    try {
                        const supportsERC721 = await publicClient.readContract({
                            address: getAddress(contractAddress),
                            abi: erc721Abi,
                            functionName: "supportsInterface",
                            args: ["0x80ac58cd"], // ERC721 interface ID
                        });

                        if (supportsERC721) {
                            contractInfo.isERC721 = true;
                            const [name, symbol] = await Promise.all([
                                publicClient.readContract({
                                    address: getAddress(contractAddress),
                                    abi: erc721Abi,
                                    functionName: "name",
                                }).catch(() => "Unknown"),
                                publicClient.readContract({
                                    address: getAddress(contractAddress),
                                    abi: erc721Abi,
                                    functionName: "symbol",
                                }).catch(() => "UNKNOWN"),
                            ]);
                            contractInfo.tokenInfo = { 
                                name: name as string, 
                                symbol: symbol as string 
                            };
                        }
                    } catch {
                        // Not an ERC721
                    }
                }
            } else {
                // It's an EOA (Externally Owned Account)
                const balance = await publicClient.getBalance({
                    address: getAddress(contractAddress),
                });
                contractInfo.balance = formatEther(balance);
            }

            // Step 3: Build comprehensive response
            let response = `📋 Contract Analysis for ${contractAddress}\n\n`;

            if (!contractInfo.isContract) {
                response += `❌ This is not a contract - it's an Externally Owned Account (EOA)
💰 Balance: ${contractInfo.balance} MON

🔗 View on Monadscan: https://testnet.monadscan.com/address/${contractAddress}`;
            } else {
                response += `✅ Contract Information:
💰 Balance: ${contractInfo.balance} MON
📦 Bytecode Size: ${contractInfo.bytecodeSize.toLocaleString()} bytes\n\n`;

                // Token information
                if (contractInfo.isERC20 && contractInfo.tokenInfo) {
                    response += `🪙 ERC-20 Token Detected:
- Name: ${contractInfo.tokenInfo.name}
- Symbol: ${contractInfo.tokenInfo.symbol}
- Decimals: ${contractInfo.tokenInfo.decimals}
- Total Supply: ${contractInfo.tokenInfo.totalSupply} ${contractInfo.tokenInfo.symbol}\n\n`;
                } else if (contractInfo.isERC721 && contractInfo.tokenInfo) {
                    response += `🖼️ ERC-721 NFT Detected:
- Name: ${contractInfo.tokenInfo.name}
- Symbol: ${contractInfo.tokenInfo.symbol}\n\n`;
                } else {
                    response += `🔧 Smart Contract (Unknown Type)
- Could be: DeFi protocol, custom contract, proxy, etc.\n\n`;
                }

                // Source code information
                if (sourceCodeData) {
                    response += `✅ Verified Source Code Available:
📄 Contract Name: ${sourceCodeData.ContractName}
🔧 Compiler: ${sourceCodeData.CompilerVersion}
⚡ Optimization: ${sourceCodeData.OptimizationUsed === '1' ? 'Enabled' : 'Disabled'}
🏃 Runs: ${sourceCodeData.Runs || 'N/A'}

📋 ABI Available: Yes
💻 Source Code: ${sourceCodeData.SourceCode.length > 500 ? 'Available (large file)' : 'Available'}

🔗 View Source: https://testnet.monadscan.com/address/${contractAddress}#code`;
                } else {
                    response += `❌ Source Code Not Verified
The contract exists and functions, but source code hasn't been verified on Monadscan.

To verify (if you're the developer):
- Foundry: forge verify-contract ${contractAddress} [ContractName] --chain 10143 --verifier sourcify --verifier-url https://sourcify-api-monad.blockvision.org
- Hardhat: npx hardhat verify ${contractAddress} --network monadTestnet
- Manual: Use Monadscan's verification interface

🔗 View Contract: https://testnet.monadscan.com/address/${contractAddress}`;
                }
            }

            return {
                content: [{
                    type: "text",
                    text: response,
                }],
            };
            
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Failed to analyze contract: ${error instanceof Error ? error.message : String(error)}
                    
Make sure:
- The address format is valid
- You have internet connectivity
- The Monad testnet RPC is accessible`,
                }],
            };
        }
    }
);

// Tool 8: Read contract
server.tool(
    "readContract",
    "Read data from any contract function with custom ABI support",
    {
        contractAddress: z.string().describe("Contract address"),
        functionName: z.string().describe("Function name to call"),
        abi: z.string().describe("Function ABI as JSON string"),
        args: z.array(z.string()).optional().describe("Function arguments"),
    },
    async ({ contractAddress, functionName, abi, args = [] }) => {
        try {
            if (!isAddress(contractAddress)) {
                throw new Error("Invalid contract address");
            }

            const parsedAbi = JSON.parse(abi);
            
            const result = await publicClient.readContract({
                address: getAddress(contractAddress),
                abi: parsedAbi,
                functionName,
                args,
            });

            return {
                content: [{
                    type: "text",
                    text: `Contract Read Result:
- Contract: ${contractAddress}
- Function: ${functionName}
- Result: ${JSON.stringify(result, null, 2)}`,
                }],
            };
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Failed to read contract: ${error instanceof Error ? error.message : String(error)}`,
                }],
            };
        }
    }
);

// Tool 9: Estimate priority fee
server.tool(
    "estimate-priority-fee",
    "Get current gas price and priority fee estimates",
    {},
    async () => {
        try {
            const [gasPrice, block] = await Promise.all([
                publicClient.getGasPrice(),
                publicClient.getBlock({ blockTag: "latest" }),
            ]);

            const baseFee = block.baseFeePerGas || 0n;
            const priorityFee = gasPrice - baseFee;

            return {
                content: [{
                    type: "text",
                    text: `Gas Estimates:
- Current Gas Price: ${formatGwei(gasPrice)} Gwei
- Base Fee: ${formatGwei(baseFee)} Gwei
- Priority Fee: ${formatGwei(priorityFee)} Gwei
- Recommended Gas Price: ${formatGwei(gasPrice + (priorityFee / 2n))} Gwei`,
                }],
            };
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Failed to estimate gas: ${error instanceof Error ? error.message : String(error)}`,
                }],
            };
        }
    }
);

// Tool 10: Get Monad constants
server.tool(
    "get-monad-constants",
    "Access network information and common contract addresses",
    {},
    async () => {
        try {
            const chainId = await publicClient.getChainId();
            const blockNumber = await publicClient.getBlockNumber();

            return {
                content: [{
                    type: "text",
                    text: `Monad Network Information:
- Chain ID: ${chainId}
- Current Block: ${blockNumber}
- RPC URL: ${monadTestnet.rpcUrls.default.http[0]}
- Block Explorer: ${monadTestnet.blockExplorers?.default.url || "N/A"}

Common Contracts:
${Object.entries(COMMON_CONTRACTS).map(([name, address]) => `- ${name}: ${address}`).join('\n')}`,
                }],
            };
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Failed to get constants: ${error instanceof Error ? error.message : String(error)}`,
                }],
            };
        }
    }
);

// Tool 11: Convert utility
server.tool(
    "convert",
    "Convert between different data formats (hex, string, number, keccak256)",
    {
        input: z.string().describe("Input value to convert"),
        from: z.enum(["hex", "string", "number", "text"]).describe("Input format"),
        to: z.enum(["hex", "string", "number", "keccak256", "address"]).describe("Output format"),
    },
    async ({ input, from, to }) => {
        try {
            let result: string;

            // Convert input to intermediate format if needed
            let intermediate: any = input;
            
            if (from === "hex" && to === "string") {
                result = hexToString(input as `0x${string}`);
            } else if (from === "string" && to === "hex") {
                result = stringToHex(input);
            } else if (from === "number" && to === "hex") {
                result = toHex(BigInt(input));
            } else if (from === "hex" && to === "number") {
                result = fromHex(input as `0x${string}`, "bigint").toString();
            } else if (to === "keccak256") {
                if (from === "hex") {
                    result = keccak256(input as `0x${string}`);
                } else {
                    result = keccak256(stringToHex(input));
                }
            } else if (to === "address" && from === "string") {
                result = getAddress(input);
            } else {
                result = input; // No conversion needed
            }

            return {
                content: [{
                    type: "text",
                    text: `Conversion Result:
- Input: ${input}
- From: ${from}
- To: ${to}
- Result: ${result}`,
                }],
            };
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Conversion failed: ${error instanceof Error ? error.message : String(error)}`,
                }],
            };
        }
    }
);

// Tool 12: Monad docs
server.tool(
    "monad-docs",
    "Access Monad developer documentation directly",
    {
        query: z.string().optional().describe("Search query for documentation"),
    },
    async ({ query }) => {
        try {
            const baseUrl = "https://docs.monad.xyz";
            
            if (!query) {
                return {
                    content: [{
                        type: "text",
                        text: `Monad Documentation: ${baseUrl}

Key sections:
- Getting Started: ${baseUrl}/getting-started
- Building on Monad: ${baseUrl}/building
- Tools & SDKs: ${baseUrl}/tools
- Network Info: ${baseUrl}/network
- FAQ: ${baseUrl}/faq`,
                    }],
                };
            }

            // In a real implementation, this would search the docs
            return {
                content: [{
                    type: "text",
                    text: `Search for "${query}" in Monad docs: ${baseUrl}/search?q=${encodeURIComponent(query)}`,
                }],
            };
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Failed to access docs: ${error instanceof Error ? error.message : String(error)}`,
                }],
            };
        }
    }
);

// Tool 13: Read Monad docs section
server.tool(
    "read-monad-docs",
    "Read specific sections of Monad documentation",
    {
        section: z.string().describe("Documentation section path (e.g., 'getting-started/installation')"),
    },
    async ({ section }) => {
        try {
            const url = `https://docs.monad.xyz/${section}`;
            
            // In a real implementation, this would fetch and parse the docs
            // For now, providing a structured response
            return {
                content: [{
                    type: "text",
                    text: `Documentation section: ${section}
URL: ${url}

To implement full documentation reading, integrate with Monad's documentation API or use web scraping with appropriate permissions.`,
                }],
            };
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Failed to read docs section: ${error instanceof Error ? error.message : String(error)}`,
                }],
            };
        }
    }
);

/**
 * Main function to start the MCP server
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Monad MCP Server v1.0.0 running on stdio");
    console.error(`Available tools: ${AVAILABLE_TOOLS.join(", ")}`);
}

// Start the server
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});