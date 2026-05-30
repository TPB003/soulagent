"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useAgent } from "@/lib/hooks";
import { SOUL_AGENT_ABI, SOUL_AGENT_ADDRESS, getAgentEmoji, BASESCAN_TX, type OnChainAgent } from "@/lib/contract";

type Step = "select" | "preview" | "minting" | "done";

export default function FusePage() {
  const { isConnected } = useAccount();
  const [parent1Id, setParent1Id] = useState("");
  const [parent2Id, setParent2Id] = useState("");
  const [childName, setChildName] = useState("");
  const [step, setStep] = useState<Step>("select");
  const [childPersonality, setChildPersonality] = useState<{ summary: string; fullPrompt: string; traits: string[] } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // 读取链上数据
  const { data: p1Data, isLoading: p1Loading } = useAgent(parent1Id ? Number(parent1Id) : 0);
  const { data: p2Data, isLoading: p2Loading } = useAgent(parent2Id ? Number(parent2Id) : 0);

  const p1 = p1Data as OnChainAgent | undefined;
  const p2 = p2Data as OnChainAgent | undefined;

  const { writeContract, data: writeData, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: writeData });

  // 交易确认后
  useEffect(() => {
    if (isConfirmed && writeData) {
      setTxHash(writeData);
      setStep("done");
    }
  }, [isConfirmed, writeData]);

  const canProceed = p1 && p2 && p1.name && p2.name && Number(p1.creator) !== 0 && Number(p2.creator) !== 0;

  const handleGenerate = async () => {
    if (!canProceed || !childName) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: childName,
          mode: "breed",
          parent1: { name: p1.name, summary: p1.personalitySummary, traits: [] },
          parent2: { name: p2.name, summary: p2.personalitySummary, traits: [] },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setChildPersonality({
        summary: data.summary || `继承了${p1.name}和${p2.name}的融合灵魂`,
        fullPrompt: data.fullPrompt || "",
        traits: data.traits || [],
      });
      setStep("preview");
    } catch (err) {
      console.error("Generate failed:", err);
      // Fallback
      setChildPersonality({
        summary: `继承了${p1.name}和${p2.name}的融合灵魂`,
        fullPrompt: `你是${childName}，融合了${p1.name}和${p2.name}的灵魂。`,
        traits: ["理性", "温柔", "好奇"],
      });
      setStep("preview");
    }
    setIsGenerating(false);
  };

  const handleMint = () => {
    if (!childPersonality || !parent1Id || !parent2Id || !childName) return;
    setStep("minting");
    writeContract({
      address: SOUL_AGENT_ADDRESS,
      abi: SOUL_AGENT_ABI,
      functionName: "breed",
      args: [BigInt(parent1Id), BigInt(parent2Id), childName, childPersonality.summary, childPersonality.summary],
      value: parseEther("0.002"), // breedFee
    });
  };

  if (!isConnected) {
    return (
      <div style={{ textAlign: "center", padding: "120px 24px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 590, color: "var(--text-primary)", marginBottom: 16 }}>连接钱包以融合 Agent</h2>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "100px 24px 40px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 8 }}>融合两个灵魂</h1>
      <p style={{ fontSize: 14, color: "var(--text-tertiary)", marginBottom: 40 }}>
        选择你拥有的两个 Agent，AI 将融合双方特质创造新生命
      </p>

      {/* Step 1: Select Parents */}
      {step === "select" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          {/* Parent 1 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: 20 }}>
            <label style={{ fontSize: 12, color: "var(--text-quaternary)", fontWeight: 510, letterSpacing: "0.5px", display: "block", marginBottom: 8 }}>父代 1</label>
            <input type="number" value={parent1Id} onChange={(e) => setParent1Id(e.target.value)} placeholder="输入 Agent ID" min="1" style={{
              width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6, padding: "10px 12px", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "'Inter', sans-serif",
            }} />
            {p1 && p1.name && (
              <div style={{ marginTop: 12, padding: 12, background: "rgba(0,0,0,0.3)", borderRadius: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 24 }}>{getAgentEmoji(p1.name)}</span>
                  <span style={{ fontSize: 14, fontWeight: 590, color: "var(--text-primary)" }}>{p1.name}</span>
                  <span style={{ fontSize: 10, color: "var(--text-quaternary)" }}>Gen {Number(p1.generation)}</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{p1.personalitySummary}</p>
              </div>
            )}
          </div>

          {/* Parent 2 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: 20 }}>
            <label style={{ fontSize: 12, color: "var(--text-quaternary)", fontWeight: 510, letterSpacing: "0.5px", display: "block", marginBottom: 8 }}>父代 2</label>
            <input type="number" value={parent2Id} onChange={(e) => setParent2Id(e.target.value)} placeholder="输入 Agent ID" min="1" style={{
              width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6, padding: "10px 12px", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "'Inter', sans-serif",
            }} />
            {p2 && p2.name && (
              <div style={{ marginTop: 12, padding: 12, background: "rgba(0,0,0,0.3)", borderRadius: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 24 }}>{getAgentEmoji(p2.name)}</span>
                  <span style={{ fontSize: 14, fontWeight: 590, color: "var(--text-primary)" }}>{p2.name}</span>
                  <span style={{ fontSize: 10, color: "var(--text-quaternary)" }}>Gen {Number(p2.generation)}</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{p2.personalitySummary}</p>
              </div>
            )}
          </div>

          {/* Child Name + Generate */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 12, color: "var(--text-quaternary)", fontWeight: 510, letterSpacing: "0.5px", display: "block", marginBottom: 8 }}>子代名字</label>
            <div style={{ display: "flex", gap: 12 }}>
              <input type="text" value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="给新生命起个名字" style={{
                flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6, padding: "10px 12px", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "'Inter', sans-serif",
              }} />
              <button onClick={handleGenerate} disabled={!canProceed || !childName || isGenerating} style={{
                background: canProceed && childName ? "var(--brand)" : "rgba(255,255,255,0.05)", color: "#fff",
                padding: "10px 24px", borderRadius: 6, fontSize: 14, fontWeight: 510, border: "none",
                cursor: canProceed && childName ? "pointer" : "not-allowed",
                opacity: canProceed && childName ? 1 : 0.4,
                fontFamily: "'Inter', sans-serif",
              }}>
                {isGenerating ? "AI 生成中..." : "AI 生成人格"}
              </button>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-quaternary)", marginTop: 8 }}>
              融合费用: 0.002 ETH · 子代 Gen = max(父代1, 父代2) + 1
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === "preview" && childPersonality && (
        <div style={{ marginBottom: 32 }}>
          {/* Parents */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32 }}>{p1 ? getAgentEmoji(p1.name) : "🤖"}</div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{p1?.name}</div>
            </div>
            <span style={{ fontSize: 24, color: "var(--accent)" }}>+</span>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32 }}>{p2 ? getAgentEmoji(p2.name) : "🤖"}</div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{p2?.name}</div>
            </div>
            <span style={{ fontSize: 24, color: "var(--text-quaternary)" }}>=</span>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32 }}>🧬</div>
              <div style={{ fontSize: 12, fontWeight: 590, color: "var(--text-primary)" }}>{childName}</div>
            </div>
          </div>

          {/* Child Preview */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 8, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 590, color: "var(--text-primary)", marginBottom: 8 }}>{childName}</h3>
            <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 12, lineHeight: 1.6 }}>{childPersonality.summary}</p>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
              {childPersonality.traits.map((t) => (
                <span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(94,106,210,0.15)", border: "1px solid rgba(94,106,210,0.2)", color: "var(--accent-hover)" }}>{t}</span>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "var(--text-quaternary)", fontFamily: "'JetBrains Mono', monospace" }}>
              {childPersonality.fullPrompt}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button onClick={handleMint} disabled={isPending || isConfirming} style={{
              flex: 1, background: "var(--brand)", color: "#fff",
              padding: "14px 24px", borderRadius: 6, fontSize: 14, fontWeight: 590, border: "none",
              cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.4 : 1,
              fontFamily: "'Inter', sans-serif",
            }}>
              {isPending ? "等待钱包确认..." : isConfirming ? "交易确认中..." : "确认融合 · 0.002 ETH"}
            </button>
            <button onClick={() => setStep("select")} style={{
              padding: "14px 24px", borderRadius: 6, fontSize: 14, fontWeight: 510,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--text-secondary)", cursor: "pointer", fontFamily: "'Inter', sans-serif",
            }}>返回</button>
          </div>
        </div>
      )}

      {/* Step 3: Minting */}
      {step === "minting" && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🧬</div>
          <h3 style={{ fontSize: 18, fontWeight: 590, color: "var(--text-primary)", marginBottom: 8 }}>融合中...</h3>
          <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>请在钱包中确认交易</p>
        </div>
      )}

      {/* Step 4: Done */}
      {step === "done" && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h3 style={{ fontSize: 18, fontWeight: 590, color: "var(--text-primary)", marginBottom: 8 }}>融合成功！</h3>
          <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 16 }}>{childName} 已诞生</p>
          {txHash && (
            <a href={BASESCAN_TX(txHash)} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 12, color: "var(--accent-hover)", textDecoration: "none",
            }}>
              查看交易 · BaseScan ↗
            </a>
          )}
          <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/market" style={{
              background: "var(--brand)", color: "#fff", padding: "10px 24px", borderRadius: 6,
              fontSize: 13, fontWeight: 510, textDecoration: "none",
            }}>查看市场</Link>
            <button onClick={() => { setStep("select"); setParent1Id(""); setParent2Id(""); setChildName(""); setChildPersonality(null); }} style={{
              padding: "10px 24px", borderRadius: 6, fontSize: 13, fontWeight: 510,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--text-secondary)", cursor: "pointer", fontFamily: "'Inter', sans-serif",
            }}>再融一次</button>
          </div>
        </div>
      )}
    </div>
  );
}
