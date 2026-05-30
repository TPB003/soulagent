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
- **Fuse** — Select two Agent NFTs. They merge, inheriting traits from both parents with random mutations. Offspring records full lineage on-chain.
- **Market** — Browse, filter by rarity (Common / Rare) or generation (Gen 0 / Gen 1), buy and sell Agent NFTs.
- **Lineage** — Track an Agent's family tree across generations of fusion.

## Homepage

Dual-column hero with live NFT preview card. Content flow:

```
Hero (title + preview card) → How it works → Core features → Agent market (with filters)
```

- Responsive: desktop 2-col hero / 3-col features / auto-fill market; tablet 2-col; mobile single-col with nav simplified to logo + wallet.

## Design system: Linear Dark

Inspired by [Linear](https://linear.app)'s dark-mode-first design language.

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#08090a` | Page canvas |
| Brand | `#5e6ad2` / `#7170ff` | CTA buttons, accent icons, active states |
| Text primary | `#f7f8f8` | Headlines, card names |
| Text secondary | `#d0d6e0` | Nav links, button labels |
| Text tertiary | `#8a8f98` | Body descriptions |
| Text quaternary | `#62666d` | Metadata, timestamps |
| Border | `rgba(255,255,255,0.05)` default, `0.08` standard | Cards, dividers |
| Font | Inter with `cv01, ss03` OpenType features | All text |
| Weight | 510 (signature), 590 (emphasis) | UI text, headings |
| Letter-spacing | -1.584px at 56px, -0.24px at 20px | Display → body |
| Radius | 6px buttons, 8px cards, 9999px pills | Component hierarchy |

Sketch variants in `sketches/` — chose `001-linear-dark` over `001-hacker-terminal` (web3privacy pure-black achromatic).

## Tech stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 + Tailwind CSS | App router, server components, utility CSS |
| Web3 | wagmi + RainbowKit | Wallet connection, contract interaction |
| Contract | Solidity 0.8.x | ERC-721 NFT with mint, fuse, trade logic |
| Chain | Base Sepolia | Low-cost testnet for demo and hackathon |
| AI | Local rule engine (pluggable) | Personality generation from user input |

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
│   │   └── agent/[id]/page.tsx # Agent detail — chat, lineage, fuse
│   ├── components/
│   │   ├── NavBar.tsx         # Top nav + wallet connect
│   │   ├── NFTCard.tsx        # Rarity-tiered NFT card (common/rare/legendary)
│   │   ├── GenerativeAvatar.tsx # Procedural SVG avatar from personality
│   │   ├── Icons.tsx          # Custom SVG icon system
│   │   └── ui/effects.tsx     # ShimmerText, GlowCard, ParticleField, etc.
│   └── lib/
│       ├── ai.ts              # Personality generation engine
│       ├── contract.ts        # ABI + contract address
│       └── providers.tsx      # wagmi + RainbowKit config
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

The smart contract (`contracts/SoulAgent.sol`) is ready for deployment to Base Sepolia.

- RPC: `https://sepolia.base.org`
- Chain ID: 84532
- Mint price: 0.001 ETH

Deploy via Remix IDE or Hardhat, then update the contract address in `src/lib/contract.ts`.

## Roadmap

- [ ] Deploy SoulAgent.sol to Base Sepolia
- [ ] Connect mint flow to live contract
- [ ] Integrate real AI model (DeepSeek / Qwen / MiMo) for personality generation
- [ ] On-chain dialogue history
- [ ] Agent evolution mechanics (experience-based trait growth)
- [ ] Multi-chain support (OP Mainnet, Arbitrum)

## License

MIT
