// SoulAgent Contract Configuration
// 合约已部署到 Base Sepolia

export const SOUL_AGENT_ABI = [
  // Write
  { name: "mint", type: "function", stateMutability: "payable", inputs: [{ name: "name", type: "string" }, { name: "personalityHash", type: "string" }, { name: "personalitySummary", type: "string" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "breed", type: "function", stateMutability: "payable", inputs: [{ name: "parent1Id", type: "uint256" }, { name: "parent2Id", type: "uint256" }, { name: "childName", type: "string" }, { name: "personalityHash", type: "string" }, { name: "personalitySummary", type: "string" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "listForSale", type: "function", stateMutability: "nonpayable", inputs: [{ name: "tokenId", type: "uint256" }, { name: "price", type: "uint256" }], outputs: [] },
  { name: "delist", type: "function", stateMutability: "nonpayable", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [] },
  { name: "buyAgent", type: "function", stateMutability: "payable", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [] },
  // Read
  { name: "agents", type: "function", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [{ components: [{ name: "name", type: "string" }, { name: "personalityHash", type: "string" }, { name: "personalitySummary", type: "string" }, { name: "parent1", type: "uint256" }, { name: "parent2", type: "uint256" }, { name: "generation", type: "uint256" }, { name: "price", type: "uint256" }, { name: "creator", type: "address" }, { name: "createdAt", type: "uint256" }], name: "", type: "tuple" }] },
  { name: "getChildren", type: "function", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "", type: "uint256[]" }] },
  { name: "totalSupply", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "mintFee", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "breedFee", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "ownerOf", type: "function", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "", type: "address" }] },
  // Events
  { anonymous: false, name: "AgentMinted", type: "event", inputs: [{ indexed: true, name: "tokenId", type: "uint256" }, { indexed: false, name: "name", type: "string" }, { indexed: true, name: "creator", type: "address" }] },
  { anonymous: false, name: "AgentBred", type: "event", inputs: [{ indexed: true, name: "childId", type: "uint256" }, { indexed: true, name: "parent1", type: "uint256" }, { indexed: true, name: "parent2", type: "uint256" }] },
  { anonymous: false, name: "AgentSold", type: "event", inputs: [{ indexed: true, name: "tokenId", type: "uint256" }, { indexed: true, name: "seller", type: "address" }, { indexed: true, name: "buyer", type: "address" }, { indexed: false, name: "price", type: "uint256" }] },
] as const;

export const SOUL_AGENT_ADDRESS = "0x9f0d52e03FB0D5Fb40F20EB10803D855D51772f3" as `0x${string}`;

// BaseScan helpers
export const BASESCAN_TX = (hash: string) => `https://sepolia.basescan.org/tx/${hash}`;
export const BASESCAN_ADDR = (addr: string) => `https://sepolia.basescan.org/address/${addr}`;
export const BASESCAN_NFT = (id: number | string) => `https://sepolia.basescan.org/token/${SOUL_AGENT_ADDRESS}?a=${id}`;
export const BASESCAN_CONTRACT = () => `https://sepolia.basescan.org/address/${SOUL_AGENT_ADDRESS}`;

// Chain config
export const TARGET_CHAIN = {
  id: 84532,
  name: "Base Sepolia",
  network: "base-sepolia",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://sepolia.base.org"] }, public: { http: ["https://sepolia.base.org"] } },
  blockExplorers: { default: { name: "BaseScan", url: "https://sepolia.basescan.org" } },
};

// Agent type from contract
export interface OnChainAgent {
  name: string;
  personalityHash: string;
  personalitySummary: string;
  parent1: bigint;
  parent2: bigint;
  generation: bigint;
  price: bigint;
  creator: string;
  createdAt: bigint;
}

// Emoji from name/traits
export const NAME_EMOJI: Record<string, string> = {
  "小毒舌": "🐍", "温暖先生": "🌸", "代码之神": "💻", "哲思者": "📚",
  "融合体Alpha": "🧬", "梦旅人": "🌈", "暗影领主": "👑",
};
export const getAgentEmoji = (name: string) => NAME_EMOJI[name] || "🤖";
