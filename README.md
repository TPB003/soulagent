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

Dual-column hero with live NFT preview card. Content flow:

```
Hero (title + preview card) → How it works → Core features → Agent market (with filters)
```

- Responsive: desktop 2-col hero / 3-col features / auto-fill market; tablet 2-col; mobile single-col with nav simplified to logo + wallet.

## Design system: Dark Cosmos

Pure black canvas with indigo+cyan ambient glow. Glass-morphism cards with micro-animations.

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#030303` (void) | Page canvas |
| Brand | `#6366f1` (indigo) | CTA buttons, accent, glow |
| Accent | `#818cf8` | Hover states, links |
| Cyan | `#22d3ee` | Secondary glow, gradient |
| Text | `#f0f0f2` → `#b0b4bc` → `#7a7f8a` → `#4e5260` | 4-level hierarchy |
| Glass | `rgba(255,255,255,0.02)` + `0.04` hover | Card surfaces |
| Border | `0.04` faint → `0.06` subtle → `0.08` default → `0.12` strong | 4-level borders |
| Font | Inter + JetBrains Mono | All text + code |
| Radius | 6px buttons, 8px cards, 12px panels, 9999px pills | Component hierarchy |

Ambient background: dual radial gradients (indigo top-left, cyan top-right) + masked grid pattern.

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
- **Agent detail**: on-chain metadata for the page; `/api/chat` loads that agent with `getAgent(tokenId)` and builds the system prompt on the server. The browser does not send a system prompt.
- **Market**: contract read calls per token ID
- **Evolution**: localStorage tracks dialogue count → 4 levels (初始/觉醒/进化/超进化)
- **BaseScan links**: NavBar contract badge, agent detail NFT/owner/creator links
- **Dialogue history**: localStorage (100 messages per agent), with clear button

## Tech stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 + Tailwind CSS | App router, server components, utility CSS |
| Web3 | wagmi + RainbowKit | Wallet connection, contract interaction |
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
│   │   ├── NFTCard.tsx        # Rarity-tiered NFT card (common/rare/legendary)
│   │   ├── GenerativeAvatar.tsx # Procedural SVG avatar from personality
│   │   ├── Icons.tsx          # Custom SVG icon system
│   │   └── ui/effects.tsx     # ShimmerText, GlowCard, ParticleField, etc.
│   └── lib/
│       ├── ai.ts              # Personality generation (MiMo API)
│       ├── api-limits.ts      # Shared size limits for chat and generate
│       ├── api-guard.ts       # Rate limit, origin gate, request/output checks
│       ├── onchain-agent.ts   # Server-side getAgent + chat system prompt
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

## Environment variables

Copy `.env.example` to `.env.local`. `XIAOMI_API_KEY` stays on the server (do not use a `NEXT_PUBLIC_` prefix).

| Variable | Required | Purpose |
|----------|----------|---------|
| `XIAOMI_API_KEY` | yes, for live AI | Xiaomi MiMo key used by `/api/chat` and `/api/generate` |
| `XIAOMI_BASE_URL` | no | OpenAI-compatible base URL. Default `https://token-plan-cn.xiaomimimo.com/v1` |
| `BASE_RPC_URL` | no | Base Sepolia RPC for `getAgent`. Default `https://sepolia.base.org` |
| `API_ABUSE_GATE` | no | `origin` (default) or `off` |
| `ALLOWED_ORIGINS` | no | Comma-separated extra browser origins allowed to call the API |
| `RATE_LIMIT_CHAT_MAX` | no | Chat requests per window per IP. Default `20` |
| `RATE_LIMIT_CHAT_WINDOW_SEC` | no | Chat window length in seconds. Default `60` |
| `RATE_LIMIT_GENERATE_MAX` | no | Generate requests per window per IP. Default `6` |
| `RATE_LIMIT_GENERATE_WINDOW_SEC` | no | Generate window length in seconds. Default `60` |
| `UPSTASH_REDIS_REST_URL` | no | Upstash Redis REST URL for a shared rate-limit counter |
| `UPSTASH_REDIS_REST_TOKEN` | no | Upstash Redis REST token |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | no | Vercel KV aliases, used when the Upstash pair is unset |
| `TRUST_PROXY_HEADERS` | no | `1` to rate-limit by the last `X-Forwarded-For` hop. Unset on Vercel uses `x-vercel-forwarded-for`. `0` forces one shared bucket |
| `TRUST_PROXY_IP_HEADER` | no | Set to `x-real-ip` together with `TRUST_PROXY_HEADERS=1` only when the proxy overwrites that header |

`/api/chat` and `/api/generate` rate-limit by client address. On Vercel the address is the platform's `x-vercel-forwarded-for` value (Vercel sets `VERCEL=1` and replaces that header). Off Vercel, forwarding headers are ignored and every caller shares one bucket, because `X-Real-IP` and `X-Forwarded-For` are otherwise chosen by the client. Set `TRUST_PROXY_HEADERS=1` only when your own proxy appends the address it saw; the limiter then uses the last hop, not a caller-supplied `X-Real-IP`. When the Upstash (or Vercel KV) variables are set, counters live in Redis so they hold across serverless instances. When they are unset, each instance keeps an in-memory window. That fallback still limits a hot instance, but it resets on a cold start and is not shared, so set Upstash before a public deployment.

`API_ABUSE_GATE=origin` requires the `Origin` host (or, if `Origin` is missing, the `Referer` host) to match this deployment's `Host` / `X-Forwarded-Host`, or to be listed in `ALLOWED_ORIGINS`. The mint, chat, and fuse pages send same-origin requests, so this does not add a wallet popup. It is not authentication: a script can set `Origin` itself. A per-message wallet signature would tie spend to an address, but it would interrupt every reply unless a separate login session were added. The gate is off when `API_ABUSE_GATE=off`.

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
