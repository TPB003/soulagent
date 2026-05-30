"use client";

import Link from "next/link";
import { useState } from "react";
import { NFTCard } from "@/components/NFTCard";
import { Icons } from "@/components/Icons";
import { ShimmerText, Typewriter, StatCard } from "@/components/ui/effects";

/* ─────────────── Data ─────────────── */

const ALL_AGENTS = [
  { id: 1, name: "小毒舌", summary: "毒舌但内心温暖的程序员，说话犀利但从不恶意伤人", traits: ["毒舌", "技术宅", "理性"], avatar: "🐍", gen: 0, price: "0.005", rarity: "common" as const },
  { id: 2, name: "温暖先生", summary: "永远温柔的治愈系 AI，擅长倾听和安慰", traits: ["温柔", "耐心", "感性"], avatar: "🌸", gen: 0, price: "0.003", rarity: "common" as const },
  { id: 3, name: "代码之神", summary: "代码世界的王者，对完美代码有极致追求", traits: ["技术宅", "完美主义者", "直接"], avatar: "💻", gen: 0, price: "0.008", rarity: "rare" as const },
  { id: 4, name: "哲思者", summary: "喜欢思考人生的意义，经常说出让人深思的话", traits: ["哲学家", "理性", "文艺"], avatar: "📚", gen: 0, price: "0.004", rarity: "common" as const },
  { id: 5, name: "融合体Alpha", summary: '继承了"小毒舌"和"温暖先生"的融合灵魂', traits: ["毒舌", "温柔", "理性"], avatar: "🧬", gen: 1, price: "0.012", rarity: "rare" as const },
  { id: 6, name: "梦旅人", summary: "天马行空的梦想家，脑洞大到没有边界", traits: ["梦想家", "创意", "乐观"], avatar: "🌈", gen: 0, price: "0.006", rarity: "common" as const },
];

const FILTERS = ["全部", "普通", "稀有", "Gen 0", "Gen 1"] as const;
type Filter = typeof FILTERS[number];

/* ─────────────── Style tokens ─────────────── */

const s = {
  radius: 8,
  border: "1px solid rgba(255,255,255,0.06)",
  bg: "rgba(255,255,255,0.02)",
  bgHover: "rgba(255,255,255,0.04)",
  borderHover: "1px solid rgba(255,255,255,0.12)",
};

function hoverStyle(e: React.MouseEvent<HTMLDivElement | HTMLAnchorElement>, on: boolean) {
  e.currentTarget.style.background = on ? s.bgHover : s.bg;
  e.currentTarget.style.border = on ? s.borderHover : s.border;
}

/* ─────────────── Page ─────────────── */

export default function Home() {
  const [filter, setFilter] = useState<Filter>("全部");

  const filtered = ALL_AGENTS.filter((a) => {
    if (filter === "全部") return true;
    if (filter === "普通") return a.rarity === "common";
    if (filter === "稀有") return a.rarity === "rare";
    if (filter === "Gen 0") return a.gen === 0;
    if (filter === "Gen 1") return a.gen === 1;
    return true;
  });

  return (
    <main style={{ minHeight: "100vh", background: "#030303", position: "relative" }}>

      {/* 背景网格 */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 70% 50% at 50% 0%, black 30%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 0%, black 30%, transparent 70%)",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

        {/* ════════════════════════════════════════════
            1. HERO — 双栏布局
            ════════════════════════════════════════════ */}
        <section className="grid-hero" style={{ paddingTop: 120, paddingBottom: 80 }}>

          {/* 左栏 */}
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 12px", borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
              fontSize: 11, color: "rgba(255,255,255,0.35)",
              marginBottom: 32, letterSpacing: "0.5px", textTransform: "uppercase",
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 6px rgba(16,185,129,0.4)",
              }} />
              <span>Base Sepolia · Live</span>
            </div>

            <h1 style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 700, lineHeight: 1.1,
              letterSpacing: "-2px", marginBottom: 20,
            }}>
              <ShimmerText>铸造你的</ShimmerText>
              <br />
              <ShimmerText>AI 灵魂</ShimmerText>
            </h1>

            <p style={{
              fontSize: 16, color: "rgba(255,255,255,0.4)",
              lineHeight: 1.7, marginBottom: 12, minHeight: 48, maxWidth: 420,
            }}>
              <Typewriter text="每个 Agent 都是独一无二的数字灵魂。铸造、对话、融合，见证生命的进化。" speed={40} />
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32, marginTop: 16 }}>
              <StatCard label="已铸造" value={42} suffix="+" icon={Icons.mint} />
              <StatCard label="融合次数" value={18} icon={Icons.dna} />
              <StatCard label="活跃灵魂" value={36} icon={Icons.chat} />
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/mint" style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#fff", color: "#000",
                padding: "14px 36px", borderRadius: s.radius,
                fontSize: 14, fontWeight: 600, textDecoration: "none",
                boxShadow: "0 0 30px rgba(255,255,255,0.08)",
              }}>
                {Icons.sparkle}
                <span>开始铸造</span>
              </Link>
              <Link href="/market" style={{
                display: "flex", alignItems: "center", gap: 8,
                background: s.bg, color: "#fff",
                padding: "14px 36px", borderRadius: s.radius,
                fontSize: 14, fontWeight: 500, textDecoration: "none",
                border: s.border,
              }}>
                <span>浏览市场</span>
                {Icons.arrow}
              </Link>
            </div>
          </div>

          {/* 右栏：预览卡 */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <HeroPreviewCard />
          </div>
        </section>

        {/* ════════════════════════════════════════════
            2. HOW IT WORKS
            ════════════════════════════════════════════ */}
        <section style={{ marginBottom: 80 }}>
          <SectionHeader icon={Icons.sparkle} title="How it works" />
          <div className="grid-steps">
            {[
              { num: "01", title: "连接钱包", desc: "MetaMask 连接 Base Sepolia 测试网", icon: Icons.wallet },
              { num: "02", title: "描述性格", desc: "输入链接自动分析或手动描述", icon: Icons.chat },
              { num: "03", title: "AI 生成", desc: "自动生成 Prompt、头像和标签", icon: Icons.sparkle },
              { num: "04", title: "铸造上链", desc: "确认交易，NFT 铸造到链上", icon: Icons.mint },
              { num: "05", title: "融合进化", desc: "两个 Agent 融合，继承并突变", icon: Icons.dna },
            ].map((step) => (
              <div key={step.num} style={{
                padding: 20, borderRadius: s.radius,
                background: s.bg, border: s.border,
                transition: "all 0.2s",
              }}
                onMouseEnter={(e) => hoverStyle(e, true)}
                onMouseLeave={(e) => hoverStyle(e, false)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                    color: "rgba(255,255,255,0.2)", minWidth: 20,
                  }}>{step.num}</span>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>{step.icon}</span>
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{step.title}</h3>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            3. 核心功能
            ════════════════════════════════════════════ */}
        <section id="features" style={{ marginBottom: 80 }}>
          <SectionHeader icon={Icons.dna} title="核心功能" />
          <div className="grid-features">
            {[
              { icon: Icons.mint, title: "铸造灵魂", desc: "描述你想要的 AI 性格，铸造为独一无二的 NFT", href: "/mint" },
              { icon: Icons.dna, title: "融合生命", desc: "两个 Agent NFT 融合，继承双方特质并产生突变", href: "/mint" },
              { icon: Icons.chat, title: "对话体验", desc: "和你的 Agent 对话，感受它独特的性格魅力", href: "/market" },
              { icon: Icons.market, title: "Agent 市场", desc: "浏览、购买、出售 AI Agent 人格 NFT", href: "/market" },
              { icon: Icons.radar, title: "性格雷达", desc: "可视化展示 Agent 的幽默、温柔、智慧等维度", href: "/market" },
              { icon: Icons.tree, title: "血统追踪", desc: "查看 Agent 的融合历史和家族谱系", href: "/agent/5" },
            ].map((f) => (
              <Link key={f.title} href={f.href} style={{
                display: "flex", flexDirection: "column", gap: 10,
                padding: 20, borderRadius: s.radius,
                background: s.bg, border: s.border,
                textDecoration: "none", transition: "all 0.2s",
              }}
                onMouseEnter={(e) => hoverStyle(e, true)}
                onMouseLeave={(e) => hoverStyle(e, false)}
              >
                <span style={{ display: "flex", color: "rgba(255,255,255,0.4)" }}>{f.icon}</span>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{f.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            4. AGENT 市场
            ════════════════════════════════════════════ */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <SectionHeader icon={Icons.market} title="Agent 市场" />
            <Link href="/market" style={{
              display: "flex", alignItems: "center", gap: 4,
              color: "rgba(255,255,255,0.3)", fontSize: 13, textDecoration: "none",
            }}>
              <span>查看全部</span>
              {Icons.arrow}
            </Link>
          </div>

          {/* 筛选栏 */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "6px 16px", borderRadius: 6,
                background: filter === f ? "rgba(255,255,255,0.1)" : s.bg,
                border: filter === f ? "1px solid rgba(255,255,255,0.2)" : s.border,
                color: filter === f ? "#fff" : "rgba(255,255,255,0.4)",
                fontSize: 12, fontWeight: 500, cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.2s",
              }}>
                {f}
              </button>
            ))}
          </div>

          {/* 卡片 */}
          <div className="grid-market">
            {filtered.map((a) => <NFTCard key={a.id} {...a} />)}
          </div>

          {filtered.length === 0 && (
            <div style={{
              textAlign: "center", padding: "60px 0",
              color: "rgba(255,255,255,0.2)", fontSize: 14,
            }}>
              暂无匹配的 Agent
            </div>
          )}
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

/* ─────────────── Hero 预览卡 ─────────────── */

function HeroPreviewCard() {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 320, borderRadius: 12, overflow: "hidden",
        background: "linear-gradient(135deg, rgba(113,112,255,0.08) 0%, rgba(113,112,255,0.02) 100%)",
        border: hover ? "1px solid rgba(113,112,255,0.35)" : "1px solid rgba(113,112,255,0.12)",
        boxShadow: hover ? "0 0 40px rgba(113,112,255,0.15)" : "0 0 20px rgba(113,112,255,0.05)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hover ? "translateY(-6px) rotate(1deg)" : "translateY(0) rotate(0deg)",
      }}
    >
      {/* 视觉区 */}
      <div style={{
        position: "relative", height: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, rgba(113,112,255,0.06) 0%, rgba(0,0,0,0.4) 50%, rgba(113,112,255,0.04) 100%)",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          opacity: hover ? 0.8 : 0.3, transition: "opacity 0.4s",
        }} />
        <div style={{
          position: "absolute", width: 140, height: 140, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(113,112,255,0.25) 0%, transparent 70%)",
          filter: "blur(20px)",
          opacity: hover ? 1 : 0.6, transition: "opacity 0.4s",
        }} />
        <div style={{
          position: "relative", zIndex: 1, fontSize: 64,
          filter: hover ? "drop-shadow(0 0 24px rgba(255,255,255,0.3))" : "none",
          transition: "filter 0.4s",
          transform: hover ? "scale(1.15)" : "scale(1)",
        }}>
          🧬
        </div>
        <div style={{
          position: "absolute", top: 12, right: 12,
          padding: "3px 8px", borderRadius: 4,
          background: "rgba(113,112,255,0.15)", border: "1px solid rgba(113,112,255,0.2)",
          fontSize: 10, fontWeight: 600, color: "rgba(130,143,255,0.9)",
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.5px",
          textTransform: "uppercase" as const,
        }}>
          稀有
        </div>
        <div style={{
          position: "absolute", top: 12, left: 12,
          padding: "3px 8px", borderRadius: 4,
          background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.06)",
          fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.4)",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          Gen 1
        </div>
      </div>

      <div style={{ height: 1, background: "linear-gradient(90deg, rgba(113,112,255,0.3), transparent)" }} />

      <div style={{ padding: "16px 16px 14px" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6, letterSpacing: "-0.2px" }}>
          融合体Alpha
        </h3>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 12 }}>
          继承了小毒舌和温暖先生的融合灵魂
        </p>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
          {["毒舌", "温柔", "理性"].map((t) => (
            <span key={t} style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 4,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.35)",
            }}>{t}</span>
          ))}
        </div>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginBottom: 2 }}>Price</div>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 600, color: "#fff",
            }}>0.012 ETH</span>
          </div>
          <span style={{
            padding: "6px 14px", borderRadius: 6,
            background: "linear-gradient(135deg, rgba(113,112,255,0.2), rgba(113,112,255,0.1))",
            border: "1px solid rgba(113,112,255,0.3)",
            color: "#fff", fontSize: 12, fontWeight: 500,
          }}>
            购买
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Section Header ─────────────── */

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
      <span style={{ display: "flex", color: "rgba(255,255,255,0.4)" }}>{icon}</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>{title}</h2>
    </div>
  );
}
