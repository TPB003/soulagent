"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { generatePersonality, AgentPersonality, generateRadarFromDescription } from "@/lib/ai";
import { SOUL_AGENT_ABI, SOUL_AGENT_ADDRESS } from "@/lib/contract";

const styles = {
  container: { maxWidth: 560, margin: "0 auto", padding: "40px 24px" },
  title: {
    fontSize: 32,
    fontWeight: 400,
    letterSpacing: "-0.704px",
    marginBottom: 8,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: 15,
    color: "var(--text-tertiary)",
    textAlign: "center" as const,
    marginBottom: 48,
    letterSpacing: "-0.165px",
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 510,
    color: "var(--text-secondary)",
    marginBottom: 8,
    letterSpacing: "-0.13px",
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    padding: "10px 14px",
    color: "var(--text-primary)",
    fontSize: 15,
    fontFamily: "'Inter', sans-serif",
    fontFeatureSettings: "'cv01', 'ss03'",
    outline: "none",
    transition: "border-color 0.15s",
  },
  textarea: {
    width: "100%",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    padding: "10px 14px",
    color: "var(--text-primary)",
    fontSize: 15,
    fontFamily: "'Inter', sans-serif",
    fontFeatureSettings: "'cv01', 'ss03'",
    outline: "none",
    resize: "none" as const,
    transition: "border-color 0.15s",
  },
  btnPrimary: {
    width: "100%",
    background: "var(--accent)",
    color: "#fff",
    padding: "10px 24px",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 510,
    border: "none",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "'Inter', sans-serif",
  },
  btnGhost: {
    flex: 1,
    background: "rgba(255,255,255,0.02)",
    color: "var(--text-secondary)",
    padding: "10px 24px",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 510,
    border: "1px solid var(--border)",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 24,
  },
};

export default function MintPage() {
  const { isConnected } = useAccount();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [personality, setPersonality] = useState<AgentPersonality | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<"input" | "preview" | "minting" | "done">("input");

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleGenerate = async () => {
    if (!name || !description) return;
    setIsGenerating(true);
    const result = await generatePersonality(name, description);
    setPersonality(result);
    setStep("preview");
    setIsGenerating(false);
  };

  const handleMint = async () => {
    if (!personality) return;
    setStep("minting");
    try {
      writeContract({
        address: SOUL_AGENT_ADDRESS,
        abi: SOUL_AGENT_ABI,
        functionName: "mint",
        args: [personality.name, personality.summary, personality.fullPrompt],
        value: parseEther("0.001"),
      });
    } catch {
      setStep("preview");
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "var(--accent-bright)";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "var(--border)";
  };

  if (isSuccess) {
    return (
      <div style={{ ...styles.container, textAlign: "center", paddingTop: 120 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{personality?.avatar || "🧬"}</div>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 400,
            letterSpacing: "-0.288px",
            marginBottom: 8,
            color: "var(--success)",
          }}
        >
          铸造成功
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-tertiary)", marginBottom: 8 }}>
          {personality?.name} 已诞生
        </p>
        <p
          style={{
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            color: "var(--text-muted)",
            marginBottom: 32,
          }}
        >
          {hash?.slice(0, 16)}...
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={() => { setStep("input"); setName(""); setDescription(""); setPersonality(null); }}
            style={{ ...styles.btnPrimary, width: "auto" }}
          >
            再铸造一个
          </button>
          <a href="/market" style={{ ...styles.btnGhost, width: "auto", textDecoration: "none", display: "inline-block" }}>
            去市场看看
          </a>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div style={{ ...styles.container, textAlign: "center", paddingTop: 120 }}>
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🔐</div>
        <h2 style={{ ...styles.title, marginBottom: 16 }}>请先连接钱包</h2>
        <p style={{ fontSize: 15, color: "var(--text-tertiary)", marginBottom: 32 }}>
          铸造 Agent NFT 需要连接钱包
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>铸造你的 AI 灵魂</h1>
      <p style={styles.subtitle}>描述性格 → 预览生成 → 铸造上链</p>

      {step === "input" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={styles.label}>Agent 名字</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="例如：小毒舌、温暖先生、代码之神"
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>性格描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="描述你想要的 AI 性格，越详细越好..."
              rows={4}
              style={styles.textarea}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={!name || !description || isGenerating}
            style={{
              ...styles.btnPrimary,
              opacity: !name || !description || isGenerating ? 0.4 : 1,
              cursor: !name || !description || isGenerating ? "not-allowed" : "pointer",
            }}
          >
            {isGenerating ? "生成中..." : "✨ 生成人格预览"}
          </button>
        </div>
      )}

      {step === "preview" && personality && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Preview Card */}
          <div style={styles.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 48 }}>{personality.avatar}</div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 590, letterSpacing: "-0.24px" }}>
                  {personality.name}
                </h2>
                <p style={{ fontSize: 14, color: "var(--text-tertiary)", marginTop: 4 }}>
                  {personality.summary}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {personality.traits.map((trait) => (
                <span
                  key={trait}
                  style={{
                    padding: "2px 10px",
                    borderRadius: 9999,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                    fontWeight: 510,
                    color: "var(--text-secondary)",
                  }}
                >
                  {trait}
                </span>
              ))}
            </div>
            {/* Radar */}
            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                borderRadius: 8,
                padding: 16,
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, fontWeight: 510 }}>
                PERSONALITY RADAR
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {Object.entries(generateRadarFromDescription(description)).map(([key, value]) => (
                  <div key={key} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
                      {key === "humor" ? "幽默" : key === "kindness" ? "温柔" : key === "intelligence" ? "智慧" : key === "creativity" ? "创意" : key === "directness" ? "直接" : "耐心"}
                    </div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 16,
                        fontWeight: 500,
                        color: "var(--accent-bright)",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Prompt Preview */}
          <details>
            <summary
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "8px 0",
                fontWeight: 510,
              }}
            >
              查看系统 Prompt
            </summary>
            <pre
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: "var(--text-tertiary)",
                background: "rgba(0,0,0,0.3)",
                padding: 16,
                borderRadius: 6,
                border: "1px solid var(--border-subtle)",
                overflow: "auto",
                maxHeight: 160,
                whiteSpace: "pre-wrap",
                marginTop: 8,
              }}
            >
              {personality.fullPrompt}
            </pre>
          </details>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button onClick={() => setStep("input")} style={styles.btnGhost}>
              返回修改
            </button>
            <button
              onClick={handleMint}
              disabled={isPending || isConfirming}
              style={{
                ...styles.btnPrimary,
                flex: 1,
                opacity: isPending || isConfirming ? 0.4 : 1,
              }}
            >
              {isPending || isConfirming ? "铸造中..." : "🧬 铸造 NFT (0.001 ETH)"}
            </button>
          </div>
        </div>
      )}

      {step === "minting" && (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>🧬</div>
          <h2 style={{ fontSize: 18, fontWeight: 510, color: "var(--text-secondary)", marginBottom: 8 }}>
            灵魂铸造中...
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>请在钱包中确认交易</p>
        </div>
      )}
    </div>
  );
}
