"use client";

import Link from "next/link";
import { useState } from "react";
import { NFTCard } from "@/components/NFTCard";
import { Icons } from "@/components/Icons";
import { ShimmerText, Typewriter, StatCard } from "@/components/ui/effects";
import { useTotalSupply } from "@/lib/hooks";
import { BASESCAN_CONTRACT } from "@/lib/contract";

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

export default function Home() {
  const [filter, setFilter] = useState<Filter>("全部");
  const { data: totalSupplyRaw } = useTotalSupply();
  const totalMinted = totalSupplyRaw ? Number(totalSupplyRaw) : 0;

  const filtered = ALL_AGENTS.filter((a) => {
    if (filter === "全部") return true;
    if (filter === "普通") return a.rarity === "common";
    if (filter === "稀有") return a.rarity === "rare";
    if (filter === "Gen 0") return a.gen === 0;
    if (filter === "Gen 1") return a.gen === 1;
    return true;
  });

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-void)", position: "relative" }}>
      <div className="ambient-glow" />
      <div className="ambient-grid" />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

        {/* ═══════ HERO ═══════ */}
        <section className="grid-hero" style={{ paddingTop: 140, paddingBottom: 100 }}>
          <div>
            {/* Badge */}
            <div className="pill" style={{ marginBottom: 32 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--green)",
                boxShadow: "0 0 8px rgba(52,211,153,0.5)",
                animation: "glow-pulse 2s ease-in-out infinite",
              }} />
              <span>Base Sepolia · Live</span>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: "clamp(40px, 6vw, 64px)",
              fontWeight: 700, lineHeight: 1.05,
              letterSpacing: "-2.5px", marginBottom: 24,
            }}>
              <ShimmerText>铸造你的</ShimmerText>
              <br />
              <span style={{
                background: "linear-gradient(135deg, var(--accent) 0%, var(--cyan) 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                <ShimmerText>AI 灵魂</ShimmerText>
              </span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: 17, color: "var(--text-tertiary)",
              lineHeight: 1.7, maxWidth: 440, marginBottom: 36,
              letterSpacing: "-0.1px",
            }}>
              <Typewriter text="每个 Agent 都是独一无二的数字灵魂。铸造、对话、融合，见证生命的进化。" speed={35} />
            </p>

            {/* Stats */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 36 }}>
              <StatCard label="已铸造" value={totalMinted} suffix="" icon={Icons.mint} />
              <StatCard label="融合费用" value={2} suffix=" mETH" icon={Icons.dna} />
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/mint" className="btn-primary" style={{ textDecoration: "none" }}>
                {Icons.sparkle}
                <span>开始铸造</span>
              </Link>
              <Link href="/market" className="btn-ghost" style={{ textDecoration: "none" }}>
                <span>浏览市场</span>
                {Icons.arrow}
              </Link>
            </div>
          </div>

          {/* Hero Preview Card */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <HeroPreviewCard />
          </div>
        </section>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <section style={{ marginBottom: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <span style={{ color: "var(--text-quaternary)" }}>{Icons.sparkle}</span>
            <h2 className="section-title">How it works</h2>
          </div>
          <div className="grid-steps">
            {[
              { num: "01", title: "连接钱包", desc: "MetaMask 连接 Base Sepolia", icon: Icons.wallet },
              { num: "02", title: "描述性格", desc: "输入链接自动分析或手动描述", icon: Icons.chat },
              { num: "03", title: "AI 生成", desc: "MiMo 模型生成人格和标签", icon: Icons.sparkle },
              { num: "04", title: "铸造上链", desc: "确认交易，NFT 铸造到链上", icon: Icons.mint },
              { num: "05", title: "融合进化", desc: "两个灵魂融合，继承并突变", icon: Icons.dna },
            ].map((step) => (
              <div key={step.num} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span className="mono" style={{ minWidth: 20 }}>{step.num}</span>
                  <span style={{ color: "var(--accent)", opacity: 0.6 }}>{step.icon}</span>
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{step.title}</h3>
                <p style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ FEATURES ═══════ */}
        <section id="features" style={{ marginBottom: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <span style={{ color: "var(--text-quaternary)" }}>{Icons.dna}</span>
            <h2 className="section-title">核心功能</h2>
          </div>
          <div className="grid-features">
            {[
              { icon: Icons.mint, title: "铸造灵魂", desc: "描述你想要的 AI 性格，铸造为独一无二的 NFT", href: "/mint" },
              { icon: Icons.dna, title: "融合生命", desc: "两个 Agent NFT 融合，继承双方特质并产生突变", href: "/fuse" },
              { icon: Icons.chat, title: "对话体验", desc: "和你的 Agent 对话，感受它独特的性格魅力", href: "/market" },
              { icon: Icons.market, title: "Agent 市场", desc: "浏览、购买、出售 AI Agent 人格 NFT", href: "/market" },
              { icon: Icons.radar, title: "性格雷达", desc: "可视化展示 Agent 的幽默、温柔、智慧等维度", href: "/market" },
              { icon: Icons.tree, title: "血统追踪", desc: "查看 Agent 的融合历史和家族谱系", href: "/agent/5" },
            ].map((f) => (
              <Link key={f.title} href={f.href} className="card" style={{
                display: "flex", flexDirection: "column", gap: 10,
                padding: 20, textDecoration: "none",
              }}>
                <span style={{ display: "flex", color: "var(--accent)", opacity: 0.7 }}>{f.icon}</span>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.6 }}>{f.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══════ MARKET ═══════ */}
        <section style={{ marginBottom: 100 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "var(--text-quaternary)" }}>{Icons.market}</span>
              <h2 className="section-title">Agent 市场</h2>
            </div>
            <Link href="/market" style={{
              display: "flex", alignItems: "center", gap: 4,
              color: "var(--text-quaternary)", fontSize: 13, fontWeight: 500,
              textDecoration: "none", transition: "color 0.2s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-quaternary)"; }}
            >
              <span>查看全部</span>{Icons.arrow}
            </Link>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={filter === f ? "pill-accent" : "pill"}
                style={{ cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.2s" }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid-market">
            {filtered.map((a) => <NFTCard key={a.id} {...a} />)}
          </div>
        </section>

        {/* ═══════ FOOTER ═══════ */}
        <footer style={{
          borderTop: "1px solid var(--border-faint)",
          padding: "32px 0 48px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          color: "var(--text-quaternary)", fontSize: 12,
        }}>
          <span>SoulAgent © 2026</span>
          <a href={BASESCAN_CONTRACT()} target="_blank" rel="noopener noreferrer" style={{
            color: "inherit", textDecoration: "none", transition: "color 0.2s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-quaternary)"; }}
          >
            合约 · BaseScan ↗
          </a>
          <span>Powered by AI + Web3</span>
        </footer>
      </div>
    </main>
  );
}

/* ───────── Hero Preview Card ───────── */

function HeroPreviewCard() {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 320, borderRadius: "var(--r-lg)", overflow: "hidden",
        background: "var(--glass)",
        border: hover ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(99,102,241,0.12)",
        boxShadow: hover
          ? "0 0 60px rgba(99,102,241,0.15), 0 8px 32px rgba(0,0,0,0.3)"
          : "0 0 30px rgba(99,102,241,0.06), var(--shadow-md)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hover ? "translateY(-8px) rotate(0.5deg)" : "translateY(0)",
      }}
    >
      <div style={{
        position: "relative", height: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(180deg, rgba(99,102,241,0.06) 0%, rgba(0,0,0,0.4) 100%)",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "24px 24px", opacity: hover ? 0.6 : 0.2, transition: "opacity 0.3s",
        }} />
        <div style={{
          position: "absolute", width: 160, height: 160, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(34,211,238,0.05) 50%, transparent 70%)",
          filter: "blur(24px)", opacity: hover ? 1 : 0.5, transition: "opacity 0.4s",
        }} />
        <div style={{
          position: "relative", zIndex: 1, fontSize: 64,
          filter: hover ? "drop-shadow(0 0 30px rgba(99,102,241,0.4))" : "none",
          transition: "all 0.4s", transform: hover ? "scale(1.15)" : "scale(1)",
        }}>🧬</div>
        <div style={{
          position: "absolute", top: 12, right: 12,
          padding: "3px 8px", borderRadius: 4,
          background: "var(--brand-dim)", border: "1px solid rgba(99,102,241,0.2)",
          fontSize: 10, fontWeight: 600, color: "var(--accent)",
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.5px", textTransform: "uppercase" as const,
        }}>稀有</div>
        <div style={{
          position: "absolute", top: 12, left: 12,
          padding: "3px 8px", borderRadius: 4,
          background: "rgba(0,0,0,0.6)", border: "var(--border-faint)",
          fontSize: 10, fontWeight: 500, color: "var(--text-quaternary)",
          fontFamily: "'JetBrains Mono', monospace",
        }}>Gen 1</div>
      </div>
      <div style={{ height: 1, background: "linear-gradient(90deg, rgba(99,102,241,0.3), transparent)" }} />
      <div style={{ padding: "16px 16px 14px" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>融合体Alpha</h3>
        <p style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.6, marginBottom: 12 }}>继承了小毒舌和温暖先生的融合灵魂</p>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
          {["毒舌", "温柔", "理性"].map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border-faint)" }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--text-quaternary)", marginBottom: 2 }}>Price</div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>0.012 ETH</span>
          </div>
          <span className="pill-accent" style={{ cursor: "pointer" }}>购买</span>
        </div>
      </div>
    </div>
  );
}
