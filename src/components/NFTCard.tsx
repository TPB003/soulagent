"use client";

import Link from "next/link";
import { useState } from "react";

// NFT Card 组件 — 可复用在首页、市场、详情页
export function NFTCard({
  id,
  name,
  summary,
  traits,
  avatar,
  gen,
  price,
  rarity = "common",
}: {
  id: number;
  name: string;
  summary: string;
  traits: string[];
  avatar: string;
  gen: number;
  price: string;
  rarity?: "common" | "rare" | "legendary";
}) {
  const [hover, setHover] = useState(false);

  const rarityConfig = {
    common: {
      gradient: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
      glow: "none",
      border: "rgba(255,255,255,0.06)",
      borderHover: "rgba(255,255,255,0.15)",
      badge: "rgba(255,255,255,0.08)",
      badgeText: "rgba(255,255,255,0.4)",
      accentLine: "rgba(255,255,255,0.06)",
    },
    rare: {
      gradient: "linear-gradient(135deg, rgba(94,106,210,0.08) 0%, rgba(113,112,255,0.03) 100%)",
      glow: "0 0 30px rgba(113,112,255,0.1)",
      border: "rgba(113,112,255,0.15)",
      borderHover: "rgba(113,112,255,0.4)",
      badge: "rgba(113,112,255,0.15)",
      badgeText: "rgba(130,143,255,0.9)",
      accentLine: "linear-gradient(90deg, rgba(113,112,255,0.3), transparent)",
    },
    legendary: {
      gradient: "linear-gradient(135deg, rgba(234,179,8,0.08) 0%, rgba(234,179,8,0.02) 100%)",
      glow: "0 0 40px rgba(234,179,8,0.15)",
      border: "rgba(234,179,8,0.2)",
      borderHover: "rgba(234,179,8,0.5)",
      badge: "rgba(234,179,8,0.15)",
      badgeText: "rgba(234,179,8,0.9)",
      accentLine: "linear-gradient(90deg, rgba(234,179,8,0.4), transparent)",
    },
  };

  const cfg = rarityConfig[rarity];

  return (
    <Link
      href={`/agent/${id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        borderRadius: 12,
        overflow: "hidden",
        background: cfg.gradient,
        border: "1px solid " + (hover ? cfg.borderHover : cfg.border),
        boxShadow: hover ? cfg.glow : "none",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      {/* NFT 视觉区域 */}
      <div style={{
        position: "relative",
        height: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: rarity === "legendary"
          ? "linear-gradient(135deg, rgba(234,179,8,0.06) 0%, rgba(0,0,0,0.5) 50%, rgba(234,179,8,0.04) 100%)"
          : rarity === "rare"
          ? "linear-gradient(135deg, rgba(113,112,255,0.06) 0%, rgba(0,0,0,0.5) 50%, rgba(113,112,255,0.04) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.3) 100%)",
        overflow: "hidden",
      }}>
        {/* 背景网格 */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          opacity: hover ? 0.8 : 0.3,
          transition: "opacity 0.4s",
        }} />

        {/* 光晕 */}
        <div style={{
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: rarity === "legendary"
            ? "radial-gradient(circle, rgba(234,179,8,0.2) 0%, transparent 70%)"
            : rarity === "rare"
            ? "radial-gradient(circle, rgba(113,112,255,0.2) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
          filter: "blur(20px)",
          opacity: hover ? 1 : 0.5,
          transition: "opacity 0.4s",
        }} />

        {/* Avatar */}
        <div style={{
          position: "relative",
          zIndex: 1,
          fontSize: 56,
          filter: hover ? "drop-shadow(0 0 20px rgba(255,255,255,0.2))" : "none",
          transition: "filter 0.4s",
          transform: hover ? "scale(1.1)" : "scale(1)",
        }}>
          {avatar}
        </div>

        {/* 稀有度标签 */}
        <div style={{
          position: "absolute",
          top: 12,
          right: 12,
          padding: "3px 8px",
          borderRadius: 4,
          background: cfg.badge,
          border: "1px solid " + cfg.border,
          fontSize: 10,
          fontWeight: 600,
          color: cfg.badgeText,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.5px",
          textTransform: "uppercase" as const,
        }}>
          {rarity === "legendary" ? "传说" : rarity === "rare" ? "稀有" : "普通"}
        </div>

        {/* Gen 标签 */}
        <div style={{
          position: "absolute",
          top: 12,
          left: 12,
          padding: "3px 8px",
          borderRadius: 4,
          background: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.06)",
          fontSize: 10,
          fontWeight: 500,
          color: "rgba(255,255,255,0.4)",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          Gen {gen}
        </div>
      </div>

      {/* 分隔线 */}
      <div style={{
        height: 1,
        background: cfg.accentLine,
      }} />

      {/* 信息区域 */}
      <div style={{ padding: "16px 16px 14px" }}>
        <h3 style={{
          fontSize: 15,
          fontWeight: 600,
          color: "#fff",
          marginBottom: 6,
          letterSpacing: "-0.2px",
        }}>{name}</h3>

        <p style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.4)",
          lineHeight: 1.6,
          marginBottom: 12,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>{summary}</p>

        {/* Tags */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
          {traits.map((t) => (
            <span key={t} style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 4,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.35)",
            }}>{t}</span>
          ))}
        </div>

        {/* Price + Action */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 12,
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginBottom: 2 }}>Price</div>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
            }}>{price} ETH</span>
          </div>
          <button
            className="hover-shine"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 6,
              background: rarity === "legendary"
                ? "linear-gradient(135deg, rgba(234,179,8,0.2), rgba(234,179,8,0.1))"
                : rarity === "rare"
                ? "linear-gradient(135deg, rgba(113,112,255,0.2), rgba(113,112,255,0.1))"
                : "rgba(255,255,255,0.06)",
              border: "1px solid " + (rarity === "legendary" ? "rgba(234,179,8,0.3)" : rarity === "rare" ? "rgba(113,112,255,0.3)" : "rgba(255,255,255,0.08)"),
              color: "#fff",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.2s",
            }}
          >
            购买
          </button>
        </div>
      </div>
    </Link>
  );
}

// 预览用的 NFT 卡片展示页
export function NFTShowcase() {
  const agents = [
    { id: 1, name: "小毒舌", summary: "毒舌但内心温暖的程序员，说话犀利但从不恶意伤人", traits: ["毒舌", "技术宅", "理性"], avatar: "🐍", gen: 0, price: "0.005", rarity: "common" as const },
    { id: 2, name: "温暖先生", summary: "永远温柔的治愈系 AI，擅长倾听和安慰", traits: ["温柔", "耐心", "感性"], avatar: "🌸", gen: 0, price: "0.003", rarity: "common" as const },
    { id: 3, name: "代码之神", summary: "代码世界的王者，对完美代码有极致追求", traits: ["技术宅", "完美主义者", "直接"], avatar: "💻", gen: 0, price: "0.008", rarity: "rare" as const },
    { id: 4, name: "哲思者", summary: "喜欢思考人生的意义，经常说出让人深思的话", traits: ["哲学家", "理性", "文艺"], avatar: "📚", gen: 0, price: "0.004", rarity: "common" as const },
    { id: 5, name: "融合体Alpha", summary: '继承了"小毒舌"和"温暖先生"的融合灵魂', traits: ["毒舌", "温柔", "理性"], avatar: "🧬", gen: 1, price: "0.012", rarity: "rare" as const },
    { id: 6, name: "梦旅人", summary: "天马行空的梦想家，脑洞大到没有边界", traits: ["梦想家", "创意", "乐观"], avatar: "🌈", gen: 0, price: "0.006", rarity: "common" as const },
    { id: 7, name: "暗影领主", summary: "融合了三个初代灵魂的终极存在", traits: ["毒舌", "温柔", "理性", "创意"], avatar: "👑", gen: 2, price: "0.1", rarity: "legendary" as const },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
      {agents.map((a) => (
        <NFTCard key={a.id} {...a} />
      ))}
    </div>
  );
}
