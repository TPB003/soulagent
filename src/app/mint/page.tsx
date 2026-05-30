"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { generatePersonality, AgentPersonality, generateRadarFromDescription } from "@/lib/ai";
import { SOUL_AGENT_ABI, SOUL_AGENT_ADDRESS } from "@/lib/contract";
import { GenerativeAvatar } from "@/components/GenerativeAvatar";
import { GlowCard, ShimmerText } from "@/components/ui/effects";
import { Icons } from "@/components/Icons";

// 模拟 URL 分析（实际可接入 GitHub API + LLM）
function analyzeUrl(url: string): { name: string; description: string } | null {
  if (url.includes("github.com")) {
    const parts = url.split("/").filter(Boolean);
    const repo = parts[parts.length - 1] || "Unknown";
    const user = parts[parts.length - 2] || "dev";
    return {
      name: repo.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      description: `基于 ${user}/${repo} 项目的开源精神，一个技术导向、追求代码质量的 Agent`,
    };
  }
  if (url.includes("twitter.com") || url.includes("x.com")) {
    return {
      name: "社交达人",
      description: "善于社交、表达力强、观点鲜明、有影响力的人格",
    };
  }
  return null;
}

export default function MintPage() {
  const { isConnected } = useAccount();
  const [mode, setMode] = useState<"url" | "manual">("url");
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [personality, setPersonality] = useState<AgentPersonality | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<"input" | "preview" | "minting" | "done">("input");

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleAnalyzeUrl = async () => {
    if (!url) return;
    setIsGenerating(true);

    const result = analyzeUrl(url);
    if (result) {
      setName(result.name);
      setDescription(result.description);
      const p = await generatePersonality(result.name, result.description);
      setPersonality(p);
      setStep("preview");
    }
    setIsGenerating(false);
  };

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
    } catch { setStep("preview"); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "12px 16px",
    color: "#fff",
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 8,
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
  };

  // ===== 成功页 =====
  if (isSuccess && personality) {
    return (
      <main style={{ minHeight: "100vh", background: "#030303", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
            <GenerativeAvatar traits={personality.traits} name={personality.name} size={200} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 8 }}>
            <ShimmerText>铸造成功</ShimmerText>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, marginBottom: 8 }}>{personality.name} 已诞生</p>
          <p style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 32 }}>
            {hash?.slice(0, 20)}...
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => { setStep("input"); setName(""); setDescription(""); setPersonality(null); setUrl(""); }}
              style={{ background: "#fff", color: "#000", padding: "10px 24px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
              再铸造一个
            </button>
            <a href="/market" style={{ background: "rgba(255,255,255,0.05)", color: "#fff", padding: "10px 24px", borderRadius: 6, fontSize: 13, fontWeight: 500, textDecoration: "none", border: "1px solid rgba(255,255,255,0.08)" }}>
              去市场看看
            </a>
          </div>
        </div>
      </main>
    );
  }

  // ===== 未连接钱包 =====
  if (!isConnected) {
    return (
      <main style={{ minHeight: "100vh", background: "#030303", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>{Icons.wallet}</div>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>请先连接钱包</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24 }}>铸造 Agent NFT 需要连接钱包</p>
          <ConnectButton />
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#030303", paddingTop: 100 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.7px", marginBottom: 8 }}>铸造 AI 灵魂</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>输入项目链接自动分析，或手动描述性格</p>
        </div>

        {step === "input" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
            {/* 左侧：输入 */}
            <div>
              {/* 模式切换 */}
              <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 4, border: "1px solid rgba(255,255,255,0.06)" }}>
                <button
                  onClick={() => setMode("url")}
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: 6, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer",
                    background: mode === "url" ? "rgba(255,255,255,0.08)" : "transparent",
                    color: mode === "url" ? "#fff" : "rgba(255,255,255,0.4)",
                    fontFamily: "'Inter', sans-serif", transition: "all 0.2s",
                  }}
                >
                  🔗 链接分析
                </button>
                <button
                  onClick={() => setMode("manual")}
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: 6, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer",
                    background: mode === "manual" ? "rgba(255,255,255,0.08)" : "transparent",
                    color: mode === "manual" ? "#fff" : "rgba(255,255,255,0.4)",
                    fontFamily: "'Inter', sans-serif", transition: "all 0.2s",
                  }}
                >
                  ✏️ 手动输入
                </button>
              </div>

              {mode === "url" ? (
                /* URL 模式 */
                <div>
                  <GlowCard glowColor="rgba(94,106,210,0.3)" style={{ padding: 24 }}>
                    <label style={labelStyle}>项目 / GitHub 链接</label>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onFocus={(e) => e.target.style.borderColor = "rgba(113,112,255,0.4)"}
                      onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                      placeholder="https://github.com/user/repo"
                      style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
                    />
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 10, lineHeight: 1.6 }}>
                      粘贴 GitHub 项目链接，AI 会自动分析项目特征并生成对应性格的 Agent
                    </p>
                  </GlowCard>

                  {/* 支持的链接类型 */}
                  <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { icon: "🐙", label: "GitHub 仓库", desc: "分析代码风格和项目特征" },
                      { icon: "🐦", label: "Twitter/X", desc: "分析社交风格和表达特点" },
                      { icon: "🌐", label: "任意网站", desc: "分析内容风格和主题" },
                    ].map((t) => (
                      <div key={t.label} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 14px", borderRadius: 8,
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}>
                        <span style={{ fontSize: 16 }}>{t.icon}</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{t.label}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{t.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleAnalyzeUrl}
                    disabled={!url || isGenerating}
                    style={{
                      width: "100%", marginTop: 20,
                      background: "#fff", color: "#000",
                      padding: "12px 0", borderRadius: 8,
                      fontSize: 14, fontWeight: 600, border: "none",
                      cursor: !url || isGenerating ? "not-allowed" : "pointer",
                      opacity: !url || isGenerating ? 0.3 : 1,
                      fontFamily: "'Inter', sans-serif", transition: "all 0.2s",
                    }}
                  >
                    {isGenerating ? "分析中..." : "🔍 自动分析并生成"}
                  </button>
                </div>
              ) : (
                /* 手动模式 */
                <div>
                  <GlowCard glowColor="rgba(168,85,247,0.3)" style={{ padding: 24 }}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>Agent 名字</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={(e) => e.target.style.borderColor = "rgba(113,112,255,0.4)"}
                        onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                        placeholder="例如：小毒舌、温暖先生、代码之神"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>性格描述</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onFocus={(e) => e.target.style.borderColor = "rgba(113,112,255,0.4)"}
                        onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                        placeholder="描述你想要的 AI 性格，越详细越好...&#10;例如：一个毒舌但内心温暖的程序员，说话犀利但从不恶意伤人，擅长用代码解决问题"
                        rows={5}
                        style={{ ...inputStyle, resize: "none" as const }}
                      />
                    </div>
                  </GlowCard>

                  {/* 性格提示 */}
                  <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {["毒舌", "温柔", "理性", "感性", "幽默", "严肃", "乐观", "技术宅", "哲学家", "梦想家"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setDescription((prev) => prev ? prev + "、" + t : t)}
                        style={{
                          padding: "4px 10px", borderRadius: 6, fontSize: 11,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.4)", cursor: "pointer",
                          fontFamily: "'Inter', sans-serif", transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(113,112,255,0.3)"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                      >
                        + {t}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={!name || !description || isGenerating}
                    style={{
                      width: "100%", marginTop: 20,
                      background: "#fff", color: "#000",
                      padding: "12px 0", borderRadius: 8,
                      fontSize: 14, fontWeight: 600, border: "none",
                      cursor: !name || !description || isGenerating ? "not-allowed" : "pointer",
                      opacity: !name || !description || isGenerating ? 0.3 : 1,
                      fontFamily: "'Inter', sans-serif", transition: "all 0.2s",
                    }}
                  >
                    {isGenerating ? "生成中..." : "✨ 生成人格预览"}
                  </button>
                </div>
              )}
            </div>

            {/* 右侧：预览区域 */}
            <div style={{ position: "sticky", top: 100 }}>
              <GlowCard glowColor="rgba(113,112,255,0.2)" style={{ padding: 32, textAlign: "center" }}>
                <div style={{
                  width: 180, height: 180, margin: "0 auto 20px",
                  borderRadius: 16, overflow: "hidden",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {name && description ? (
                    <GenerativeAvatar traits={description.includes("、") ? description.split("、") : [description.slice(0, 4)]} name={name} size={180} />
                  ) : (
                    <div style={{ color: "rgba(255,255,255,0.1)", fontSize: 48 }}>🧬</div>
                  )}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: name ? "#fff" : "rgba(255,255,255,0.2)", marginBottom: 6 }}>
                  {name || "等待输入..."}
                </h3>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
                  {description ? (description.length > 60 ? description.slice(0, 60) + "..." : description) : "输入链接或描述性格后预览"}
                </p>
                {name && (
                  <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 4, flexWrap: "wrap" }}>
                    {(description.includes("、") ? description.split("、").slice(0, 3) : [description.slice(0, 4)]).map((t) => (
                      <span key={t} style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 4,
                        background: "rgba(113,112,255,0.1)", border: "1px solid rgba(113,112,255,0.2)",
                        color: "rgba(130,143,255,0.8)",
                      }}>{t.trim().slice(0, 6)}</span>
                    ))}
                  </div>
                )}
              </GlowCard>
            </div>
          </div>
        )}

        {/* 预览确认页 */}
        {step === "preview" && personality && (
          <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 32, alignItems: "start" }}>
            {/* 左侧：NFT 预览 */}
            <div style={{ position: "sticky", top: 100 }}>
              <GlowCard glowColor="rgba(113,112,255,0.3)" style={{ overflow: "hidden" }}>
                {/* 生成的头像 */}
                <div style={{
                  height: 300, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(0,0,0,0.2))",
                  position: "relative",
                }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }} />
                  <GenerativeAvatar traits={personality.traits} name={personality.name} size={200} />
                </div>
                <div style={{ padding: 20 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{personality.name}</h2>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>{personality.summary}</p>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {personality.traits.map((t) => (
                      <span key={t} style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 4,
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.35)",
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              </GlowCard>
            </div>

            {/* 右侧：详情 */}
            <div>
              {/* 性格雷达 */}
              <GlowCard glowColor="rgba(94,106,210,0.2)" style={{ padding: 24, marginBottom: 16 }}>
                <h3 style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px", textTransform: "uppercase" as const, marginBottom: 16 }}>性格雷达</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {Object.entries(generateRadarFromDescription(description)).map(([key, value]) => {
                    const labels: Record<string, string> = { humor: "幽默", kindness: "温柔", intelligence: "智慧", creativity: "创意", directness: "直接", patience: "耐心" };
                    return (
                      <div key={key}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{labels[key]}</span>
                          <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(113,112,255,0.8)" }}>{value}</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                          <div style={{ height: "100%", width: value + "%", borderRadius: 2, background: "linear-gradient(90deg, rgba(113,112,255,0.6), rgba(168,85,247,0.6))", transition: "width 0.5s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlowCard>

              {/* 系统 Prompt */}
              <details style={{ marginBottom: 24 }}>
                <summary style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "8px 0", fontWeight: 500 }}>
                  查看系统 Prompt
                </summary>
                <pre style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                  color: "rgba(255,255,255,0.3)", background: "rgba(0,0,0,0.3)",
                  padding: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)",
                  overflow: "auto", maxHeight: 160, whiteSpace: "pre-wrap", marginTop: 8,
                }}>
                  {personality.fullPrompt}
                </pre>
              </details>

              {/* 操作按钮 */}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => { setStep("input"); setPersonality(null); }}
                  style={{
                    padding: "12px 24px", borderRadius: 8,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500,
                    cursor: "pointer", fontFamily: "'Inter', sans-serif",
                  }}
                >
                  返回修改
                </button>
                <button
                  onClick={handleMint}
                  disabled={isPending || isConfirming}
                  style={{
                    flex: 1, padding: "12px 24px", borderRadius: 8,
                    background: "#fff", color: "#000",
                    fontSize: 14, fontWeight: 600, border: "none",
                    cursor: isPending || isConfirming ? "not-allowed" : "pointer",
                    opacity: isPending || isConfirming ? 0.3 : 1,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {isPending || isConfirming ? "铸造中..." : "🧬 铸造 NFT (0.001 ETH)"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 铸造中 */}
        {step === "minting" && (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16, animation: "glow-pulse 2s ease-in-out infinite" }}>🧬</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>灵魂铸造中...</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>请在钱包中确认交易</p>
          </div>
        )}
      </div>
    </main>
  );
}
