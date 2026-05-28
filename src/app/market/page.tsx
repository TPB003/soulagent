"use client";

import { useState } from "react";
import { NFTCard } from "@/components/NFTCard";
import { Icons } from "@/components/Icons";

const AGENTS = [
  { id: 1, name: "小毒舌", summary: "毒舌但内心温暖的程序员，说话犀利但从不恶意伤人", traits: ["毒舌", "技术宅", "理性"], avatar: "🐍", gen: 0, price: "0.005", rarity: "common" as const },
  { id: 2, name: "温暖先生", summary: "永远温柔的治愈系 AI，擅长倾听和安慰", traits: ["温柔", "耐心", "感性"], avatar: "🌸", gen: 0, price: "0.003", rarity: "common" as const },
  { id: 3, name: "代码之神", summary: "代码世界的王者，对完美代码有极致追求", traits: ["技术宅", "完美主义者", "直接"], avatar: "💻", gen: 0, price: "0.008", rarity: "rare" as const },
  { id: 4, name: "哲思者", summary: "喜欢思考人生的意义，经常说出让人深思的话", traits: ["哲学家", "理性", "文艺"], avatar: "📚", gen: 0, price: "0.004", rarity: "common" as const },
  { id: 5, name: "融合体Alpha", summary: '继承了"小毒舌"和"温暖先生"的融合灵魂', traits: ["毒舌", "温柔", "理性"], avatar: "🧬", gen: 1, price: "0.012", rarity: "rare" as const },
  { id: 6, name: "梦旅人", summary: "天马行空的梦想家，脑洞大到没有边界", traits: ["梦想家", "创意", "乐观"], avatar: "🌈", gen: 0, price: "0.006", rarity: "common" as const },
  { id: 7, name: "暗影领主", summary: "融合了三个初代灵魂的终极存在，拥有最复杂的性格", traits: ["毒舌", "温柔", "理性", "创意"], avatar: "👑", gen: 2, price: "0.1", rarity: "legendary" as const },
];

export default function MarketPage() {
  const [filter, setFilter] = useState<"all" | "common" | "rare" | "legendary">("all");

  const filtered = AGENTS.filter((a) => filter === "all" || a.rarity === filter);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px 40px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", marginBottom: 8 }}>
          Agent 市场
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>
          {AGENTS.length} 个 Agent 在售
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
        {([
          { key: "all", label: "全部", count: AGENTS.length },
          { key: "common", label: "普通", count: AGENTS.filter(a => a.rarity === "common").length },
          { key: "rare", label: "稀有", count: AGENTS.filter(a => a.rarity === "rare").length },
          { key: "legendary", label: "传说", count: AGENTS.filter(a => a.rarity === "legendary").length },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 6,
              background: filter === f.key ? "rgba(255,255,255,0.08)" : "transparent",
              border: "1px solid " + (filter === f.key ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"),
              color: filter === f.key ? "#fff" : "rgba(255,255,255,0.4)",
              fontSize: 12, fontWeight: 500, cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.2s",
            }}
          >
            <span>{f.label}</span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
            }}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {filtered.map((a) => <NFTCard key={a.id} {...a} />)}
      </div>
    </div>
  );
}
