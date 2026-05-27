"use client";

import { useState } from "react";
import Link from "next/link";

const DEMO_AGENTS = [
  { id: 1, name: "小毒舌", summary: "毒舌但内心温暖的程序员，说话犀利但从不恶意伤人", traits: ["毒舌", "技术宅", "理性"], avatar: "🐍", generation: 0, price: "0.005" },
  { id: 2, name: "温暖先生", summary: "永远温柔的治愈系 AI，擅长倾听和安慰", traits: ["温柔", "耐心", "感性"], avatar: "🌸", generation: 0, price: "0.003" },
  { id: 3, name: "代码之神", summary: "代码世界的王者，对完美代码有极致追求", traits: ["技术宅", "完美主义者", "直接"], avatar: "💻", generation: 0, price: "0.008" },
  { id: 4, name: "哲思者", summary: "喜欢思考人生的意义，经常说出让人深思的话", traits: ["哲学家", "理性", "文艺"], avatar: "📚", generation: 0, price: "0.004" },
  { id: 5, name: "融合体Alpha", summary: '继承了"小毒舌"的毒舌和"温暖先生"的温柔', traits: ["毒舌", "温柔", "理性"], avatar: "🧬", generation: 1, price: "0.012" },
  { id: 6, name: "梦旅人", summary: "天马行空的梦想家，脑洞大到没有边界", traits: ["梦想家", "创意", "乐观"], avatar: "🌈", generation: 0, price: "0.006" },
];

export default function MarketPage() {
  const [filter, setFilter] = useState<"all" | "gen0" | "bred">("all");

  const filteredAgents = DEMO_AGENTS.filter((agent) => {
    if (filter === "gen0") return agent.generation === 0;
    if (filter === "bred") return agent.generation > 0;
    return true;
  });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 400, letterSpacing: "-0.288px" }}>市场</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            {DEMO_AGENTS.length} 个 Agent 在售
          </p>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {(["all", "gen0", "bred"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 510,
                border: "1px solid " + (filter === f ? "var(--accent)" : "var(--border)"),
                background: filter === f ? "rgba(94,106,210,0.15)" : "transparent",
                color: filter === f ? "var(--accent-bright)" : "var(--text-tertiary)",
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {f === "all" ? "全部" : f === "gen0" ? "初代" : "融合体"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {filteredAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: (typeof DEMO_AGENTS)[0] }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
        border: "1px solid " + (hover ? "rgba(113,112,255,0.3)" : "var(--border)"),
        borderRadius: 12,
        padding: 20,
        transition: "all 0.2s",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 32 }}>{agent.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 590, letterSpacing: "-0.24px" }}>{agent.name}</span>
            <span
              style={{
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
                color: "var(--text-muted)",
                padding: "1px 6px",
                borderRadius: 4,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              Gen {agent.generation}
            </span>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: "var(--text-tertiary)", lineHeight: 1.6, marginBottom: 12, letterSpacing: "-0.165px" }}>
        {agent.summary}
      </p>

      <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
        {agent.traits.map((trait) => (
          <span
            key={trait}
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 9999,
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
              fontWeight: 510,
            }}
          >
            {trait}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--accent-bright)",
          }}
        >
          {agent.price} ETH
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href={`/agent/${agent.id}`}
            style={{
              fontSize: 12,
              fontWeight: 510,
              color: "var(--text-tertiary)",
              textDecoration: "none",
              padding: "4px 12px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              transition: "all 0.15s",
            }}
          >
            详情
          </Link>
          <button
            style={{
              fontSize: 12,
              fontWeight: 510,
              color: "#fff",
              background: "var(--accent)",
              padding: "4px 12px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            购买
          </button>
        </div>
      </div>
    </div>
  );
}
