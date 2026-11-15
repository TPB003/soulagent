<div align="center">

# SoulAgent

**AI Personality NFT — Mint, Converse, Fuse**

An on-chain AI Agent personality system. Each Agent is a unique digital soul — mint it, talk to it, and fuse two together to birth a new life.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.x-363636?logo=solidity)](https://soliditylang.org)
[![Chain](https://img.shields.io/badge/Base-Sepolia_Testnet-0052FF?logo=ethereum)](https://base.org)

</div>

---

## What it does

| Problem | Solution |
|---------|----------|
| AI agents are stateless, personality-less tools | On-chain NFT stores unique personality prompts, traits, and lineage |
| No way to own or trade your AI agent | NFT-based ownership — buy, sell, fuse on the marketplace |
| AI personalities can't evolve | Two Agents fuse to inherit both traits + random mutations |

## Core features

- **Mint** — Describe a personality via URL auto-analysis or manual input. AI generates a unique prompt, avatar, and trait tags. Mint as NFT on Base Sepolia.
- **Converse** — Chat with your Agent. Each one has a distinct personality shaped by its on-chain prompt.
- **Fuse** — Select two Agent NFTs you own. AI generates the child personality. They merge on-chain, inheriting traits with mutations. `/fuse` page.
- **Market** — Browse, filter by rarity (Common / Rare) or generation (Gen 0 / Gen 1), buy and sell Agent NFTs.
- **Lineage** — Track an Agent's family tree across generations of fusion.

## Homepage

Left-aligned headline, on-chain stat bar (`totalSupply`, `mintFee`, `breedFee`), and a labeled generative portrait that is explicitly not a listing. Below that: four steps, then only agents that exist on the contract. If `totalSupply` is zero, the page shows an empty state instead of sample cards.

## Design system: Lumen

Near-black canvas, hairline borders, paper-white primary actions. Iris is only for focus, links, and the chain status dot. Saturated color belongs to the generative portrait.

| Token | Value | Usage |
|-------|-------|-------|
| Canvas | `#08090a` | Page background |
| Surface | `#101113` | Cards |
| Ink | `#f4f4f5` / `#c2c2cb` / `#9b9ba6` | Primary, body, captions |
| Action | `#f4f4f5` on `#141416` | Primary buttons |
| Accent | `#8b7cf6` | Focus ring and links only |
| Radius | 10px controls, 14px cards, 22px portraits | |
| Motion | 160–420ms, `cubic-bezier(0.2, 0.8, 0.2, 1)` | Rise, hover, toasts; disabled under reduced motion |
| Type | Inter + Noto Sans SC, JetBrains Mono for numbers | |

Mobile uses a bottom tab bar. Transaction status is a toast, not a full-page spinner.

## Marketplace

Creators can list their agents for other users to buy and interact with.

| Page | Who | What |
|------|-----|------|
| `/my-agents` | Creator | View owned agents, set price, list for sale, delist |
| `/market` | Everyone | Browse all on-chain agents, see listing status |
| `/agent/[id]` | Owner | List/delist agent, see chat history |
| `/agent/[id]` | Visitor | Buy listed agent, chat with AI personality |

Flow:
```
铸造 → 我的 Agent → 设置价格 → 上架 → 市场展示 → 用户购买 → 使用对话
```

## Real data architecture

All data comes from on-chain or AI — no fake placeholders.

- **Homepage stats**: `totalSupply()` read directly from contract via wagmi
- **Agent detail**: `agents(id)` for on-chain metadata, `/api/chat` for MiMo-powered dialogue
- **Market**: contract read calls per token ID
- **Evolution**: localStorage tracks dialogue count → 4 levels (初始/觉醒/进化/超进化)
- **BaseScan links**: NavBar contract badge, agent detail NFT/owner/creator links
- **Dialogue history**: localStorage (100 messages per agent), with clear button

## Tech stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 + Tailwind CSS | App router, server components, utility CSS |
| Web3 | wagmi | Wallet connection, contract interaction |
| Contract | Solidity 0.8.x | ERC-721 NFT with mint, fuse, trade logic |
| Chain | Base Sepolia | Low-cost testnet for demo and hackathon |
| AI | Xiaomi MiMo (mimo-v2.5-pro) | Personality generation via /api/generate |

## Project structure

```
soulagent/
├── contracts/
│   └── SoulAgent.sol          # ERC-721: mint, fuse, trade, lineage
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── mint/page.tsx      # Mint flow — URL analysis + manual input
│   │   ├── market/page.tsx    # Agent marketplace grid
│   │   ├── fuse/page.tsx       # Fuse two agents into new life
│   │   ├── my-agents/page.tsx  # Creator dashboard — list, manage agents
│   │   └── agent/[id]/page.tsx # Agent detail — AI chat, evolution, BaseScan links
│   ├── components/
│   │   ├── NavBar.tsx         # Top nav + wallet connect
│   │   ├── NFTCard.tsx        # On-chain agent card
│   │   ├── GenerativeAvatar.tsx # Procedural SVG avatar from personality
│   │   ├── Icons.tsx          # Custom SVG icon system
│   │   └── ui/                # Toasts, empty states, filters, meters
│   └── lib/
│       ├── ai.ts              # Personality generation (MiMo API)
│       ├── contract.ts        # ABI, address, BaseScan helpers
│       ├── hooks.ts           # wagmi hooks: useAgent, useTotalSupply
│       └── providers.tsx      # wagmi + RainbowKit config
├── src/app/api/
│   ├── generate/route.ts      # POST /api/generate — AI personality
│   └── chat/route.ts          # POST /api/chat — AI dialogue
├── public/
├── README.md
└── package.json
```

## Quick start

```bash
git clone https://github.com/TPB003/soulagent.git
cd soulagent
npm install
npm run dev
```

Open `http://localhost:3000`.

## Contract deployment

The smart contract is deployed on Base Sepolia.

- **Contract:** [`0x9f0d52e03FB0D5Fb40F20EB10803D855D51772f3`](https://sepolia.basescan.org/address/0x9f0d52e03FB0D5Fb40F20EB10803D855D51772f3)
- RPC: `https://sepolia.base.org`
- Chain ID: 84532
- Mint price: 0.001 ETH

## Roadmap

- [x] Deploy SoulAgent.sol to Base Sepolia
- [x] Connect mint flow to live contract
- [x] Integrate real AI model (Xiaomi MiMo) for personality generation
- [x] Agent dialogue via AI (MiMo-powered /api/chat)
- [x] Agent evolution (dialogue count → evolution levels)
- [x] Real on-chain data + BaseScan links throughout

## License

MIT
