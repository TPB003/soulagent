"use client";

import Link from "next/link";
import { useState } from "react";

export function NFTCard({
  id, name, summary, traits, avatar, gen, price, rarity = "common",
}: {
  id: number; name: string; summary: string; traits: string[];
  avatar: string; gen: number; price: string; rarity?: "common" | "rare" | "legendary";
}) {
  const [hover, setHover] = useState(false);

  const cfg = {
    common: {
      border: hover ? "var(--border-strong)" : "var(--border-subtle)",
      glow: "none",
      badge: "var(--glass-active)", badgeText: "var(--text-tertiary)",
      accent: "var(--border-subtle)",
      visualBg: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.3) 100%)",
    },
    rare: {
      border: hover ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.15)",
      glow: hover ? "0 0 40px rgba(99,102,241,0.12)" : "0 0 20px rgba(99,102,241,0.06)",
      badge: "var(--brand-dim)", badgeText: "var(--accent)",
      accent: "linear-gradient(90deg, rgba(99,102,241,0.3), transparent)",
      visualBg: "linear-gradient(180deg, rgba(99,102,241,0.05) 0%, rgba(0,0,0,0.4) 100%)",
    },
    legendary: {
      border: hover ? "rgba(251,191,36,0.5)" : "rgba(251,191,36,0.2)",
      glow: hover ? "0 0 50px rgba(251,191,36,0.15)" : "0 0 25px rgba(251,191,36,0.08)",
      badge: "rgba(251,191,36,0.12)", badgeText: "var(--amber)",
      accent: "linear-gradient(90deg, rgba(251,191,36,0.3), transparent)",
      visualBg: "linear-gradient(180deg, rgba(251,191,36,0.05) 0%, rgba(0,0,0,0.4) 100%)",
    },
  }[rarity];

  return (
    <Link
      href={`/agent/${id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", flexDirection: "column", textDecoration: "none",
        borderRadius: "var(--r-md)", overflow: "hidden",
        background: "var(--glass)",
        border: `1px solid ${cfg.border}`,
        boxShadow: cfg.glow,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      {/* Visual */}
      <div style={{
        position: "relative", height: 160,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: cfg.visualBg, overflow: "hidden",
      }}>
        {/* Subtle grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: hover ? 0.6 : 0.2, transition: "opacity 0.3s",
        }} />
        {/* Glow orb */}
        {rarity !== "common" && (
          <div style={{
            position: "absolute", width: 100, height: 100, borderRadius: "50%",
            background: rarity === "legendary"
              ? "radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
            filter: "blur(24px)",
            opacity: hover ? 1 : 0.5, transition: "opacity 0.3s",
          }} />
        )}
        {/* Avatar */}
        <div style={{
          position: "relative", zIndex: 1, fontSize: 48,
          filter: hover ? `drop-shadow(0 0 20px ${rarity === "legendary" ? "rgba(251,191,36,0.3)" : "rgba(99,102,241,0.3)"})` : "none",
          transition: "all 0.3s",
          transform: hover ? "scale(1.12)" : "scale(1)",
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
          background: "rgba(0,0,0,0.6)", border: "var(--border-faint)",
          fontSize: 10, fontWeight: 500, color: "var(--text-quaternary)",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          Gen {gen}
        </div>
      </div>

      {/* Accent line */}
      <div style={{ height: 1, background: cfg.accent }} />

      {/* Info */}
      <div style={{ padding: "14px 16px" }}>
        <h3 style={{
          fontSize: 14, fontWeight: 600, color: "var(--text-primary)",
          marginBottom: 4, letterSpacing: "-0.2px",
        }}>{name}</h3>
        <p style={{
          fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.6, marginBottom: 10,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{summary}</p>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
          {traits.map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 10, borderTop: "1px solid var(--border-faint)",
        }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--text-quaternary)", marginBottom: 2 }}>Price</div>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600,
              color: "var(--text-primary)",
            }}>{price} ETH</span>
          </div>
          <span className={rarity === "rare" ? "pill-accent" : "pill"} style={{ cursor: "pointer", fontSize: 11 }}>
            购买
          </span>
        </div>
      </div>
    </Link>
  );
}

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
    <div className="grid-market">
      {agents.map((a) => <NFTCard key={a.id} {...a} />)}
    </div>
  );
}
