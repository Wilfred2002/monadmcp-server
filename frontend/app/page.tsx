'use client';

import React, { useState } from 'react';
import { Search, Wallet, FileText, Zap, Code, Book, ChevronRight, Github, ExternalLink } from 'lucide-react';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Tools', icon: <Code className="w-5 h-5" /> },
    { id: 'balance', name: 'Balance & Tokens', icon: <Wallet className="w-5 h-5" /> },
    { id: 'transaction', name: 'Transactions & Blocks', icon: <FileText className="w-5 h-5" /> },
    { id: 'contract', name: 'Smart Contracts', icon: <Code className="w-5 h-5" /> },
    { id: 'network', name: 'Network Tools', icon: <Zap className="w-5 h-5" /> },
    { id: 'utility', name: 'Utilities', icon: <Book className="w-5 h-5" /> }
  ];

  const tools = [
    {
      id: 'get-mon-balance',
      category: 'balance',
      name: 'Get MON Balance',
      description: 'Retrieve MON balance for any address on Monad testnet',
      example: 'Check balance for 0x742d35Cc6634C0532925a3b844Bc9D24E013D74E',
      params: ['address: string'],
      response: 'Balance: 1234.56 MON'
    },
    {
      id: 'get-erc20-balance',
      category: 'balance',
      name: 'Get ERC20 Balance',
      description: 'Check ERC20 token balances with automatic token information retrieval',
      example: 'Get USDC balance for wallet 0x123...',
      params: ['address: string', 'tokenAddress: string'],
      response: 'Token: USDC\nBalance: 1000.00 USDC\nDecimals: 6'
    },
    {
      id: 'get-transaction',
      category: 'transaction',
      name: 'Get Transaction',
      description: 'Retrieve detailed transaction information by hash',
      example: 'Get details for tx 0x28a97a768f4b93c46898ba568408b36e08cd6e2ecb02c291754c3cbebe50d0d4',
      params: ['txHash: string'],
      response: 'From: 0xcd4cda9...\nTo: 0x8462c24...\nValue: 0 MON\nGas: 33324'
    },
    {
      id: 'get-block',
      category: 'transaction',
      name: 'Get Block',
      description: 'Fetch block information by number or get latest block',
      example: 'Get the latest block information',
      params: ['blockNumber?: string'],
      response: 'Block: 18423566\nTransactions: 45\nGas Used: 4860343'
    },
    {
      id: 'get-contract-source',
      category: 'contract',
      name: 'Get Contract Source',
      description: 'Retrieve contract source code and analyze contract type (ERC20, NFT, etc)',
      example: 'Analyze contract 0x8462c247356d7deB7e26160dbFab16B351Eef242',
      params: ['contractAddress: string'],
      response: '✅ Smart Contract\n💰 Balance: 0 MON\n📦 Size: 410 bytes'
    },
    {
      id: 'readContract',
      category: 'contract',
      name: 'Read Contract',
      description: 'Read data from any contract function with custom ABI support',
      example: 'Read totalSupply from token contract',
      params: ['contractAddress: string', 'functionName: string', 'abi: string', 'args?: string[]'],
      response: 'Result: 1000000000000000000000'
    },
    {
      id: 'estimate-priority-fee',
      category: 'network',
      name: 'Estimate Gas Fees',
      description: 'Get current gas price and priority fee estimates',
      example: 'What\'s the current gas price?',
      params: [],
      response: 'Gas Price: 52 Gwei\nBase Fee: 50 Gwei\nPriority: 2 Gwei'
    },
    {
      id: 'convert',
      category: 'utility',
      name: 'Convert Data',
      description: 'Convert between hex, string, number, and keccak256',
      example: 'Convert "Hello Monad" to hex',
      params: ['input: string', 'from: string', 'to: string'],
      response: '0x48656c6c6f204d6f6e6164'
    },
    {
      id: 'decode-calldata',
      category: 'utility',
      name: 'Decode Calldata',
      description: 'Decode transaction calldata to human-readable function calls',
      example: 'Decode ERC20 transfer calldata',
      params: ['data: string', 'abi: string'],
      response: 'Function: transfer\nTo: 0x5aae...\nAmount: 1000000000000000000'
    },
    {
      id: 'monad-docs',
      category: 'utility',
      name: 'Monad Documentation',
      description: 'Access Monad developer documentation directly',
      example: 'Search docs for "gas optimization"',
      params: ['query?: string'],
      response: 'Links to relevant documentation sections'
    }
  ];

  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Monad MCP Server
              </h1>
              <p className="text-gray-400 mt-1">Created by Wilfred Naraga</p>
            </div>
            <div className="flex gap-4">
              <a href="https://github.com/Wilfred2002/monadmcp-server" 
                 className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
              <a href="https://docs.monad.xyz" 
                 className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <ExternalLink className="w-5 h-5" />
                <span>Monad Docs</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">
            Monad MCP Server
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A Model Context Protocol (MCP) server that enables Claude and other AI assistants 
            to interact seamlessly with the Monad blockchain testnet. More tools coming soon!
          </p>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">Check out the installation guide below to get started.</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map(tool => (
            <div key={tool.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all hover:shadow-xl hover:shadow-purple-600/10">
              <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
              <p className="text-gray-300 mb-4">{tool.description}</p>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Example:</p>
                  <p className="text-sm bg-black/30 rounded p-2 font-mono">{tool.example}</p>
                </div>
                
                {tool.params.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Parameters:</p>
                    <ul className="text-sm space-y-1">
                      {tool.params.map((param, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <ChevronRight className="w-3 h-3 text-purple-400" />
                          <code className="text-blue-300">{param}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Response:</p>
                  <pre className="text-sm bg-green-900/20 rounded p-2 text-green-300 whitespace-pre-wrap">
                    {tool.response}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Installation Guide */}
        <div className="mt-16 bg-white/5 border border-white/10 rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-4">Quick Installation</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-300 mb-2">1. Clone and install:</p>
              <code className="block bg-black/30 rounded p-3 font-mono text-sm">
                git clone https://github.com/Wilfred2002/monadmcp-server.git<br />
                cd monadmcp-server && npm install && npm run build
              </code>
            </div>
            <div>
              <p className="text-gray-300 mb-2">2. Add to Claude config:</p>
              <code className="block bg-black/30 rounded p-3 font-mono text-sm overflow-x-auto">
                {`{
  "mcpServers": {
    "monad-testnet": {
      "command": "node",
      "args": ["path/to/monad-mcp-server/index.js"]
    }
  }
}`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}