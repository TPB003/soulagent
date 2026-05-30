"use client";

import Link from "next/link";
import { useState } from "react";

// NFT Card — Linear Dark 风格
export function NFTCard({
  id, name, summary, traits, avatar, gen, price, rarity = "common",
}: {
  id: number; name: string; summary: string; traits: string[];
  avatar: string; gen: number; price: string; rarity?: "common" | "rare" | "legendary";
}) {
  const [hover, setHover] = useState(false);

  const cfg = {
    common: {
      gradient: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
      glow: "none",
      border: "rgba(255,255,255,0.05)",
      borderHover: "rgba(255,255,255,0.12)",
      badge: "rgba(255,255,255,0.05)",
      badgeText: "#8a8f98",
      accentLine: "rgba(255,255,255,0.05)",
    },
    rare: {
      gradient: "linear-gradient(135deg, rgba(94,106,210,0.08) 0%, rgba(94,106,210,0.02) 100%)",
      glow: "0 0 30px rgba(94,106,210,0.1)",
      border: "rgba(94,106,210,0.15)",
      borderHover: "rgba(113,112,255,0.35)",
      badge: "rgba(94,106,210,0.2)",
      badgeText: "#828fff",
      accentLine: "linear-gradient(90deg, rgba(94,106,210,0.3), transparent)",
    },
    legendary: {
      gradient: "linear-gradient(135deg, rgba(234,179,8,0.08) 0%, rgba(234,179,8,0.02) 100%)",
      glow: "0 0 40px rgba(234,179,8,0.15)",
      border: "rgba(234,179,8,0.2)",
      borderHover: "rgba(234,179,8,0.5)",
      badge: "rgba(234,179,8,0.2)",
      badgeText: "#fbbf24",
      accentLine: "linear-gradient(90deg, rgba(234,179,8,0.4), transparent)",
    },
  }[rarity];

  return (
    <Link
      href={`/agent/${id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", flexDirection: "column", textDecoration: "none",
        borderRadius: 8, overflow: "hidden",
        background: cfg.gradient,
        border: `1px solid ${hover ? cfg.borderHover : cfg.border}`,
        boxShadow: hover ? cfg.glow : "rgba(0,0,0,0.2) 0px 0px 0px 1px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      {/* 视觉区 */}
      <div style={{
        position: "relative", height: 160,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: rarity === "legendary"
          ? "linear-gradient(135deg, rgba(234,179,8,0.06) 0%, rgba(0,0,0,0.4) 100%)"
          : rarity === "rare"
          ? "linear-gradient(135deg, rgba(94,106,210,0.06) 0%, rgba(0,0,0,0.4) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.3) 100%)",
        overflow: "hidden",
      }}>
        {/* Grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          opacity: hover ? 0.8 : 0.3, transition: "opacity 0.4s",
        }} />
        {/* Glow */}
        <div style={{
          position: "absolute", width: 120, height: 120, borderRadius: "50%",
          background: rarity === "legendary"
            ? "radial-gradient(circle, rgba(234,179,8,0.2) 0%, transparent 70%)"
            : rarity === "rare"
            ? "radial-gradient(circle, rgba(94,106,210,0.2) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
          filter: "blur(20px)",
          opacity: hover ? 1 : 0.5, transition: "opacity 0.4s",
        }} />
        {/* Avatar */}
        <div style={{
          position: "relative", zIndex: 1, fontSize: 48,
          filter: hover ? "drop-shadow(0 0 20px rgba(255,255,255,0.2))" : "none",
          transition: "filter 0.4s",
          transform: hover ? "scale(1.1)" : "scale(1)",
        }}>
          {avatar}
        </div>
        {/* Rarity badge */}
        <div style={{
          position: "absolute", top: 10, right: 10,
          padding: "3px 8px", borderRadius: 4,
          background: cfg.badge, border: `1px solid ${cfg.border}`,
          fontSize: 10, fontWeight: 600, color: cfg.badgeText,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.5px", textTransform: "uppercase" as const,
        }}>
          {rarity === "legendary" ? "传说" : rarity === "rare" ? "稀有" : "普通"}
        </div>
        {/* Gen badge */}
        <div style={{
          position: "absolute", top: 10, left: 10,
          padding: "3px 8px", borderRadius: 4,
          background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.05)",
          fontSize: 10, fontWeight: 500, color: "#62666d",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          Gen {gen}
        </div>
      </div>

      {/* Accent line */}
      <div style={{ height: 1, background: cfg.accentLine }} />

      {/* Info */}
      <div style={{ padding: "14px 16px" }}>
        <h3 style={{
          fontSize: 14, fontWeight: 590, color: "var(--text-primary)",
          marginBottom: 4, letterSpacing: "-0.182px",
        }}>{name}</h3>
        <p style={{
          fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.6, marginBottom: 10,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{summary}</p>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
          {traits.map((t) => (
            <span key={t} style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 4,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)",
              color: "var(--text-tertiary)",
            }}>{t}</span>
          ))}
        </div>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--text-quaternary)", marginBottom: 2 }}>Price</div>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 590,
              color: "var(--text-primary)",
            }}>{price} ETH</span>
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 6,
            background: rarity === "legendary"
              ? "rgba(234,179,8,0.15)" : rarity === "rare"
              ? "rgba(94,106,210,0.15)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${rarity === "legendary"
              ? "rgba(234,179,8,0.25)" : rarity === "rare"
              ? "rgba(94,106,210,0.25)" : "rgba(255,255,255,0.08)"}`,
            color: rarity === "legendary" ? "#fbbf24" : rarity === "rare" ? "#828fff" : "var(--text-secondary)",
            fontSize: 12, fontWeight: 510, cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            fontFeatureSettings: "\"cv01\", \"ss03\"",
            transition: "all 0.2s",
          }}>
            购买
          </button>
        </div>
      </div>
    </Link>
  );
}

// NFTShowcase 组件
export function NFTShowcase() {
  const agents = [
    { id: 1, name: "小毒舌", summary: "毒舌但内心温暖的程序员", traits: ["毒舌", "技术宅", "理性"], avatar: "🐍", gen: 0, price: "0.005", rarity: "common" as const },
    { id: 2, name: "温暖先生", summary: "永远温柔的治愈系 AI", traits: ["温柔", "耐心", "感性"], avatar: "🌸", gen: 0, price: "0.003", rarity: "common" as const },
    { id: 3, name: "代码之神", summary: "代码世界的王者", traits: ["技术宅", "完美主义者", "直接"], avatar: "💻", gen: 0, price: "0.008", rarity: "rare" as const },
    { id: 4, name: "哲思者", summary: "喜欢思考人生的意义", traits: ["哲学家", "理性", "文艺"], avatar: "📚", gen: 0, price: "0.004", rarity: "common" as const },
    { id: 5, name: "融合体Alpha", summary: "继承了两个灵魂的融合体", traits: ["毒舌", "温柔", "理性"], avatar: "🧬", gen: 1, price: "0.012", rarity: "rare" as const },
    { id: 6, name: "梦旅人", summary: "天马行空的梦想家", traits: ["梦想家", "创意", "乐观"], avatar: "🌈", gen: 0, price: "0.006", rarity: "common" as const },
    { id: 7, name: "暗影领主", summary: "融合了三个初代灵魂的终极存在", traits: ["毒舌", "温柔", "理性", "创意"], avatar: "👑", gen: 2, price: "0.1", rarity: "legendary" as const },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
      {agents.map((a) => <NFTCard key={a.id} {...a} />)}
    </div>
  );
}
