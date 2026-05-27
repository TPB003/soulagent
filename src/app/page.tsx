"use client";

import Link from "next/link";
import { useState } from "react";
import { Icons } from "@/components/Icons";

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
        <section style={{ marginBottom: 100, paddingTop: 40 }}>
          <h1 style={{
            fontSize: "clamp(36px, 6vw, 72px)",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.05,
            marginBottom: 20,
            letterSpacing: "-2px",
          }}>
            铸造你的
            <br />
            AI 灵魂
          </h1>
          <p style={{
            fontSize: "clamp(15px, 1.8vw, 18px)",
            color: "rgba(255,255,255,0.45)",
            maxWidth: 500,
            lineHeight: 1.7,
            marginBottom: 36,
          }}>
            每个 Agent 都是独一无二的数字灵魂。
            <br />
            铸造、对话、融合，见证生命的进化。
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/mint" className="hover-shine" style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              color: "#000",
              padding: "12px 36px",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}>
              {Icons.sparkle}
              <span>开始铸造</span>
            </Link>
            <a href="#features" className="hover-shine" style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              padding: "12px 36px",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.1)",
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
            <FeatureCard icon={Icons.mint} title="铸造灵魂" desc="描述你想要的 AI 性格，铸造为独一无二的 NFT" href="/mint" />
            <FeatureCard icon={Icons.dna} title="融合生命" desc="两个 Agent NFT 融合，继承双方特质并产生突变" href="/mint" />
            <FeatureCard icon={Icons.chat} title="对话体验" desc="和你的 Agent 对话，感受它独特的性格魅力" href="/market" />
            <FeatureCard icon={Icons.market} title="Agent 市场" desc="浏览、购买、出售 AI Agent 人格 NFT" href="/market" />
            <FeatureCard icon={Icons.radar} title="性格雷达" desc="可视化展示 Agent 的幽默、温柔、智慧等维度" href="/market" />
            <FeatureCard icon={Icons.tree} title="血统追踪" desc="查看 Agent 的融合历史和家族谱系" href="/agent/5" />
          </div>
        </section>

        {/* Market Preview */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <SectionHeader icon={Icons.market} title="Agent 市场" />
            <Link href="/market" style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: "rgba(255,255,255,0.35)",
              fontSize: 13,
              textDecoration: "none",
            }}>
              <span>查看全部</span>
              {Icons.arrow}
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {AGENTS.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>

        {/* How it works */}
        <section style={{ marginBottom: 80, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 80 }}>
          <SectionHeader icon={Icons.sparkle} title="How it works" />
          <div style={{ maxWidth: 640 }}>
            {[
              { num: "01", title: "连接钱包", desc: "使用 MetaMask 连接到 Base Sepolia 测试网", icon: Icons.wallet },
              { num: "02", title: "描述性格", desc: "输入 Agent 名字和你想要的性格描述", icon: Icons.chat },
              { num: "03", title: "AI 生成人格", desc: "AI 自动生成专属 Prompt、头像和性格标签", icon: Icons.sparkle },
              { num: "04", title: "铸造上链", desc: "确认交易，Agent NFT 铸造到区块链上", icon: Icons.mint },
              { num: "05", title: "融合进化", desc: "选择两个 Agent 融合，继承双方特质并产生突变", icon: Icons.dna },
            ].map((step) => (
              <div key={step.num} style={{
                display: "flex",
                gap: 16,
                padding: "20px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.2)",
                  minWidth: 24,
                  paddingTop: 2,
                }}>{step.num}</span>
                <div style={{ color: "rgba(255,255,255,0.3)", paddingTop: 2 }}>{step.icon}</div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{step.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "24px 0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "rgba(255,255,255,0.3)",
          fontSize: 12,
        }}>
          <span>SoulAgent © 2026</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            Built on Base Sepolia · Powered by AI + Web3
          </span>
        </footer>
      </div>
    </main>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
      <span style={{ display: "flex", color: "rgba(255,255,255,0.5)" }}>{icon}</span>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>{title}</h2>
    </div>
  );
}

function FeatureCard({ icon, title, desc, href }: { icon: React.ReactNode; title: string; desc: string; href: string }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="hover-shine"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
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
      <span style={{ display: "flex", color: hover ? "#fff" : "rgba(255,255,255,0.5)", transition: "color 0.2s" }}>{icon}</span>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{title}</h3>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{desc}</p>
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
      className="hover-shine"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 20,
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(8px)",
        border: "1px solid " + (hover ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)"),
        borderRadius: 8,
        textDecoration: "none",
        transition: "all 0.3s",
        minHeight: 150,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          background: "rgba(255,255,255,0.05)",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.08)",
        }}>{agent.avatar}</div>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{agent.name}</h3>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
            Gen {agent.gen}
          </span>
        </div>
      </div>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{agent.summary}</p>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: "auto", alignItems: "center" }}>
        {agent.traits.map((t) => (
          <span key={t} style={{
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 4,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.35)",
          }}>{t}</span>
        ))}
        <span style={{
          marginLeft: "auto",
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          color: "rgba(255,255,255,0.5)",
        }}>{agent.price} ETH</span>
      </div>
    </Link>
  );
}
