"use client";

import Link from "next/link";
import { useState } from "react";
import { NFTCard } from "@/components/NFTCard";
import { Icons } from "@/components/Icons";
import { GradientBackground, ParticleField, ShimmerText, GlowCard, Typewriter, StatCard } from "@/components/ui/effects";

const AGENTS = [
  { id: 1, name: "小毒舌", summary: "毒舌但内心温暖的程序员，说话犀利但从不恶意伤人", traits: ["毒舌", "技术宅", "理性"], avatar: "🐍", gen: 0, price: "0.005", rarity: "common" as const },
  { id: 2, name: "温暖先生", summary: "永远温柔的治愈系 AI，擅长倾听和安慰", traits: ["温柔", "耐心", "感性"], avatar: "🌸", gen: 0, price: "0.003", rarity: "common" as const },
  { id: 3, name: "代码之神", summary: "代码世界的王者，对完美代码有极致追求", traits: ["技术宅", "完美主义者", "直接"], avatar: "💻", gen: 0, price: "0.008", rarity: "rare" as const },
  { id: 4, name: "哲思者", summary: "喜欢思考人生的意义，经常说出让人深思的话", traits: ["哲学家", "理性", "文艺"], avatar: "📚", gen: 0, price: "0.004", rarity: "common" as const },
  { id: 5, name: "融合体Alpha", summary: '继承了"小毒舌"和"温暖先生"的融合灵魂', traits: ["毒舌", "温柔", "理性"], avatar: "🧬", gen: 1, price: "0.012", rarity: "rare" as const },
  { id: 6, name: "梦旅人", summary: "天马行空的梦想家，脑洞大到没有边界", traits: ["梦想家", "创意", "乐观"], avatar: "🌈", gen: 0, price: "0.006", rarity: "common" as const },
];

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#030303", position: "relative" }}>
      <GradientBackground />
      <ParticleField count={20} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Hero */}
        <section style={{ paddingTop: 120, marginBottom: 80, minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {/* Status badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 9999,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            fontSize: 12, color: "rgba(255,255,255,0.4)",
            marginBottom: 32, width: "fit-content",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 8px rgba(16,185,129,0.5)",
              animation: "glow-pulse 2s ease-in-out infinite",
            }} />
            <span>Base Sepolia Testnet</span>
          </div>

          {/* Title with shimmer */}
          <h1 style={{
            fontSize: "clamp(40px, 8vw, 80px)",
            fontWeight: 700,
            lineHeight: 1,
            marginBottom: 24,
            letterSpacing: "-3px",
          }}>
            <ShimmerText>铸造你的</ShimmerText>
            <br />
            <ShimmerText>AI 灵魂</ShimmerText>
          </h1>

          {/* Typewriter subtitle */}
          <p style={{
            fontSize: "clamp(15px, 1.8vw, 18px)",
            color: "rgba(255,255,255,0.4)",
            maxWidth: 500,
            lineHeight: 1.7,
            marginBottom: 12,
            minHeight: 50,
          }}>
            <Typewriter
              text="每个 Agent 都是独一无二的数字灵魂。铸造、对话、融合，见证生命的进化。"
              speed={40}
            />
          </p>

          {/* Stats */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40, marginTop: 20 }}>
            <StatCard label="已铸造" value={42} suffix="+" icon={Icons.mint} />
            <StatCard label="融合次数" value={18} icon={Icons.dna} />
            <StatCard label="活跃灵魂" value={36} icon={Icons.chat} />
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/mint" className="hover-shine" style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#fff", color: "#000",
              padding: "14px 40px", borderRadius: 8,
              fontSize: 14, fontWeight: 600, textDecoration: "none",
              boxShadow: "0 0 30px rgba(255,255,255,0.1)",
            }}>
              {Icons.sparkle}
              <span>开始铸造</span>
            </Link>
            <a href="#features" className="hover-shine" style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.04)", color: "#fff",
              padding: "14px 40px", borderRadius: 8,
              fontSize: 14, fontWeight: 500, textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <span>了解更多</span>
              {Icons.arrow}
            </a>
          </div>
        </section>

        {/* Features */}
        <section id="features" style={{ marginBottom: 80 }}>
          <SectionHeader icon={Icons.dna} title="核心功能" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[
              { icon: Icons.mint, title: "铸造灵魂", desc: "描述你想要的 AI 性格，铸造为独一无二的 NFT", href: "/mint", glow: "rgba(94,106,210,0.4)" },
              { icon: Icons.dna, title: "融合生命", desc: "两个 Agent NFT 融合，继承双方特质并产生突变", href: "/mint", glow: "rgba(168,85,247,0.4)" },
              { icon: Icons.chat, title: "对话体验", desc: "和你的 Agent 对话，感受它独特的性格魅力", href: "/market", glow: "rgba(59,130,246,0.4)" },
              { icon: Icons.market, title: "Agent 市场", desc: "浏览、购买、出售 AI Agent 人格 NFT", href: "/market", glow: "rgba(16,185,129,0.4)" },
              { icon: Icons.radar, title: "性格雷达", desc: "可视化展示 Agent 的幽默、温柔、智慧等维度", href: "/market", glow: "rgba(234,179,8,0.4)" },
              { icon: Icons.tree, title: "血统追踪", desc: "查看 Agent 的融合历史和家族谱系", href: "/agent/5", glow: "rgba(236,72,153,0.4)" },
            ].map((f) => (
              <GlowCard key={f.title} glowColor={f.glow} style={{ padding: 24, minHeight: 160 }}>
                <Link href={f.href} style={{ display: "flex", flexDirection: "column", gap: 10, textDecoration: "none" }}>
                  <span style={{ display: "flex", color: "rgba(255,255,255,0.5)" }}>{f.icon}</span>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{f.desc}</p>
                </Link>
              </GlowCard>
            ))}
          </div>
        </section>

        {/* NFT Market */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <SectionHeader icon={Icons.market} title="Agent 市场" />
            <Link href="/market" style={{
              display: "flex", alignItems: "center", gap: 4,
              color: "rgba(255,255,255,0.3)", fontSize: 13, textDecoration: "none",
            }}>
              <span>查看全部</span>
              {Icons.arrow}
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {AGENTS.map((a) => <NFTCard key={a.id} {...a} />)}
          </div>
        </section>

        {/* How it works */}
        <section style={{ marginBottom: 80, borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 80 }}>
          <SectionHeader icon={Icons.sparkle} title="How it works" />
          <div style={{ maxWidth: 640 }}>
            {[
              { num: "01", title: "连接钱包", desc: "使用 MetaMask 连接到 Base Sepolia 测试网", icon: Icons.wallet },
              { num: "02", title: "描述性格", desc: "输入 Agent 名字和你想要的性格描述", icon: Icons.chat },
              { num: "03", title: "AI 生成人格", desc: "AI 自动生成专属 Prompt、头像和性格标签", icon: Icons.sparkle },
              { num: "04", title: "铸造上链", desc: "确认交易，Agent NFT 铸造到区块链上", icon: Icons.mint },
              { num: "05", title: "融合进化", desc: "选择两个 Agent 融合，继承双方特质并产生突变", icon: Icons.dna },
            ].map((step, i) => (
              <GlowCard key={step.num} glowColor="rgba(113,112,255,0.3)" style={{
                padding: "20px 24px",
                marginBottom: 8,
                background: "transparent",
              }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                    color: "rgba(255,255,255,0.2)", minWidth: 24, paddingTop: 2,
                  }}>{step.num}</span>
                  <div style={{ color: "rgba(255,255,255,0.3)", paddingTop: 2 }}>{step.icon}</div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{step.title}</h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{step.desc}</p>
                  </div>
                </div>
              </GlowCard>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
          padding: "24px 0 40px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          color: "rgba(255,255,255,0.2)", fontSize: 12,
        }}>
          <span>SoulAgent © 2026</span>
          <span>Built on Base Sepolia · Powered by AI + Web3</span>
        </footer>
      </div>
    </main>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
      <span style={{ display: "flex", color: "rgba(255,255,255,0.4)" }}>{icon}</span>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>{title}</h2>
    </div>
  );
}
