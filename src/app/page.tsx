"use client";

import Link from "next/link";
import { useState } from "react";

const AGENTS = [
  { id: 1, name: "小毒舌", summary: "毒舌但内心温暖的程序员，说话犀利但从不恶意伤人", traits: ["毒舌", "技术宅", "理性"], avatar: "🐍", gen: 0, price: "0.005" },
  { id: 2, name: "温暖先生", summary: "永远温柔的治愈系 AI，擅长倾听和安慰", traits: ["温柔", "耐心", "感性"], avatar: "🌸", gen: 0, price: "0.003" },
  { id: 3, name: "代码之神", summary: "代码世界的王者，对完美代码有极致追求", traits: ["技术宅", "完美主义者", "直接"], avatar: "💻", gen: 0, price: "0.008" },
  { id: 4, name: "哲思者", summary: "喜欢思考人生的意义，经常说出让人深思的话", traits: ["哲学家", "理性", "文艺"], avatar: "📚", gen: 0, price: "0.004" },
  { id: 5, name: "融合体Alpha", summary: '继承了"小毒舌"和"温暖先生"的融合灵魂', traits: ["毒舌", "温柔", "理性"], avatar: "🧬", gen: 1, price: "0.012" },
  { id: 6, name: "梦旅人", summary: "天马行空的梦想家，脑洞大到没有边界", traits: ["梦想家", "创意", "乐观"], avatar: "🌈", gen: 0, price: "0.006" },
];

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#030303", paddingTop: 80 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Hero */}
        <section style={{ marginBottom: 100 }}>
          <h1 style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.1,
            marginBottom: 16,
            letterSpacing: "-1.5px",
          }}>
            🧬 SoulAgent
          </h1>
          <p style={{
            fontSize: "clamp(16px, 2vw, 20px)",
            color: "rgba(255,255,255,0.6)",
            maxWidth: 600,
            lineHeight: 1.6,
            marginBottom: 32,
          }}>
            铸造你专属的 AI Agent 人格 NFT。两个灵魂可以融合，诞生全新的数字生命。
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/mint" style={{
              background: "#fff",
              color: "#000",
              padding: "10px 40px",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s",
            }}>开始铸造</Link>
            <a href="#how-it-works" style={{
              background: "#fff",
              color: "#000",
              padding: "10px 40px",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s",
            }}>了解更多</a>
          </div>
        </section>

        {/* Core Features */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <span style={{ fontSize: 20 }}>🧬</span>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>核心功能</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            <FeatureCard icon="🎨" title="铸造灵魂" desc="描述你想要的 AI 性格，铸造为独一无二的 NFT" href="/mint" />
            <FeatureCard icon="🧬" title="融合生命" desc="两个 Agent NFT 融合，继承双方特质并产生突变" href="/mint" />
            <FeatureCard icon="💬" title="对话体验" desc="和你的 Agent 对话，感受它独特的性格魅力" href="/market" />
            <FeatureCard icon="🏪" title="Agent 市场" desc="浏览、购买、出售 AI Agent 人格 NFT" href="/market" />
            <FeatureCard icon="📊" title="性格雷达" desc="可视化展示 Agent 的幽默、温柔、智慧等维度" href="/market" />
            <FeatureCard icon="🌳" title="血统追踪" desc="查看 Agent 的融合历史和家族谱系" href="/agent/5" />
          </div>
        </section>

        {/* Marketplace Preview */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>🏪</span>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>Agent 市场</h2>
            </div>
            <Link href="/market" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>
              查看全部 →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {AGENTS.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" style={{ marginBottom: 80, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 80 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <span style={{ fontSize: 20 }}>⚡</span>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>How it works</h2>
          </div>
          <div style={{ maxWidth: 700 }}>
            {[
              { num: "1", title: "连接钱包", desc: "使用 MetaMask 连接到 Base Sepolia 测试网" },
              { num: "2", title: "描述性格", desc: "输入 Agent 名字和你想要的性格描述" },
              { num: "3", title: "AI 生成", desc: "AI 自动生成专属人格 Prompt、头像和性格标签" },
              { num: "4", title: "铸造上链", desc: "确认交易，Agent NFT 铸造到区块链上" },
              { num: "5", title: "融合进化", desc: "选择两个 Agent 融合，继承双方特质并产生突变" },
            ].map((step) => (
              <div key={step.num} style={{
                display: "flex",
                gap: 20,
                padding: "20px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.3)",
                  minWidth: 20,
                }}>{step.num}</span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          padding: "24px 0",
          textAlign: "center",
          color: "rgba(255,255,255,0.4)",
          fontSize: 13,
        }}>
          SoulAgent © 2026 built on Base Sepolia · Powered by AI + Web3
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, desc, href }: { icon: string; title: string; desc: string; href: string }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 24,
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(8px)",
        border: "1px solid " + (hover ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)"),
        borderRadius: 8,
        textDecoration: "none",
        transition: "all 0.3s",
        minHeight: 160,
      }}
    >
      <span style={{ fontSize: 24, opacity: 0.8 }}>{icon}</span>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{title}</h3>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{desc}</p>
    </Link>
  );
}

function AgentCard({ agent }: { agent: typeof AGENTS[0] }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={`/agent/${agent.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 20,
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(8px)",
        border: "1px solid " + (hover ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)"),
        borderRadius: 8,
        textDecoration: "none",
        transition: "all 0.3s",
        minHeight: 140,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 28 }}>{agent.avatar}</span>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{agent.name}</h3>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>Gen {agent.gen}</span>
        </div>
      </div>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{agent.summary}</p>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: "auto" }}>
        {agent.traits.map((t) => (
          <span key={t} style={{
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 4,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.4)",
          }}>{t}</span>
        ))}
        <span style={{
          marginLeft: "auto",
          fontSize: 12,
          fontFamily: "monospace",
          color: "rgba(255,255,255,0.6)",
        }}>{agent.price} ETH</span>
      </div>
    </Link>
  );
}
