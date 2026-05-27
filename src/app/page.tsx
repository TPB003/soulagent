"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          textAlign: "center",
          padding: "80px 24px",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 12px",
            borderRadius: 9999,
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.02)",
            fontSize: 12,
            color: "var(--text-tertiary)",
            marginBottom: 32,
          }}
        >
          <span style={{ color: "var(--success)", fontSize: 8 }}>●</span>
          Base Sepolia Testnet
        </div>

        {/* Title */}
        <div style={{ fontSize: 72, marginBottom: 16 }}>🧬</div>
        <h1
          style={{
            fontSize: 64,
            fontWeight: 510,
            letterSpacing: "-1.408px",
            lineHeight: 1,
            marginBottom: 20,
            background: "linear-gradient(135deg, var(--accent-bright) 0%, #a78bfa 50%, #c084fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          SoulAgent
        </h1>
        <p
          style={{
            fontSize: 18,
            color: "var(--text-tertiary)",
            maxWidth: 520,
            lineHeight: 1.6,
            letterSpacing: "-0.165px",
            marginBottom: 48,
          }}
        >
          铸造你专属的 AI Agent 人格 NFT
          <br />
          两个灵魂可以融合，诞生全新的数字生命
        </p>

        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <Link
            href="/mint"
            style={{
              background: "var(--accent)",
              color: "#fff",
              padding: "10px 24px",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 510,
              textDecoration: "none",
              transition: "all 0.15s",
              border: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent-bright)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(113,112,255,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            开始铸造 →
          </Link>
          <Link
            href="/market"
            style={{
              background: "rgba(255,255,255,0.02)",
              color: "var(--text-secondary)",
              padding: "10px 24px",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 510,
              textDecoration: "none",
              border: "1px solid var(--border)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            浏览市场
          </Link>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          <FeatureCard
            icon="🎨"
            title="铸造灵魂"
            desc="描述你想要的 AI 性格，铸造为独一无二的 NFT"
          />
          <FeatureCard
            icon="🧬"
            title="融合生命"
            desc="两个 Agent NFT 融合，继承双方特质并产生突变"
          />
          <FeatureCard
            icon="💬"
            title="对话体验"
            desc="和你的 Agent 对话，感受它独特的性格魅力"
          />
        </div>
      </section>

      {/* How it works */}
      <section
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "0 24px 100px",
        }}
      >
        <h2
          style={{
            fontSize: 24,
            fontWeight: 400,
            letterSpacing: "-0.288px",
            marginBottom: 40,
            color: "var(--text-secondary)",
          }}
        >
          How it works
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {[
            { step: "01", text: "连接钱包，描述你想要的 AI 性格" },
            { step: "02", text: "AI 生成专属人格 Prompt 和头像" },
            { step: "03", text: "铸造为链上 NFT，永久存储" },
            { step: "04", text: "选择两个 Agent 融合，诞生新灵魂" },
          ].map((item) => (
            <div
              key={item.step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "16px 20px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: "var(--accent-bright)",
                  fontWeight: 500,
                  minWidth: 28,
                }}
              >
                {item.step}
              </span>
              <span
                style={{
                  fontSize: 15,
                  color: "var(--text-secondary)",
                  letterSpacing: "-0.165px",
                }}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Built on Base Sepolia · Powered by AI + Web3
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 28,
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(113,112,255,0.3)";
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 16 }}>{icon}</div>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 590,
          letterSpacing: "-0.24px",
          marginBottom: 8,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "var(--text-tertiary)",
          lineHeight: 1.6,
          letterSpacing: "-0.165px",
        }}
      >
        {desc}
      </p>
    </div>
  );
}
