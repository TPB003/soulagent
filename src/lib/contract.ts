// SoulAgent Contract Configuration
// ⚠️ 部署合约后替换为真实地址

export const SOUL_AGENT_ABI = [
  {
    name: "mint",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "name", type: "string" },
      { name: "personalityHash", type: "string" },
      { name: "personalitySummary", type: "string" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "breed",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "parent1Id", type: "uint256" },
      { name: "parent2Id", type: "uint256" },
      { name: "childName", type: "string" },
      { name: "personalityHash", type: "string" },
      { name: "personalitySummary", type: "string" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "listForSale",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "price", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "delist",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "buyAgent",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "agents",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      {
        components: [
          { name: "name", type: "string" },
          { name: "personalityHash", type: "string" },
          { name: "personalitySummary", type: "string" },
          { name: "parent1", type: "uint256" },
          { name: "parent2", type: "uint256" },
          { name: "generation", type: "uint256" },
          { name: "price", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "createdAt", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
  },
  {
    name: "getChildren",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "mintFee",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "breedFee",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    anonymous: false,
    name: "AgentMinted",
    type: "event",
    inputs: [
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: false, name: "name", type: "string" },
      { indexed: true, name: "creator", type: "address" },
    ],
  },
  {
    anonymous: false,
    name: "AgentBred",
    type: "event",
    inputs: [
      { indexed: true, name: "childId", type: "uint256" },
      { indexed: true, name: "parent1", type: "uint256" },
      { indexed: true, name: "parent2", type: "uint256" },
    ],
  },
  {
    anonymous: false,
    name: "AgentSold",
    type: "event",
    inputs: [
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: true, name: "seller", type: "address" },
      { indexed: true, name: "buyer", type: "address" },
      { indexed: false, name: "price", type: "uint256" },
    ],
  },
] as const;

// ⚠️ 部署后替换
export const SOUL_AGENT_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

// Base Sepolia 测试网
export const TARGET_CHAIN = {
  id: 84532,
  name: "Base Sepolia",
  network: "base-sepolia",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://sepolia.base.org"] },
    public: { http: ["https://sepolia.base.org"] },
  },
  blockExplorers: {
    default: { name: "BaseScan", url: "https://sepolia.basescan.org" },
  },
};
