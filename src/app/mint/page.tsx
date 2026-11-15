"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { ConnectButton } from "@/components/ConnectButton";
import { GenerativeAvatar } from "@/components/GenerativeAvatar";
import { Meter, Notice, Segmented } from "@/components/ui/primitives";
import { useTxToast } from "@/components/ui/toast";
import { generatePersonality, generateRadarFromDescription, type AgentPersonality } from "@/lib/ai";
import { SOUL_AGENT_ABI, SOUL_AGENT_ADDRESS, BASESCAN_TX } from "@/lib/contract";
import { formatEth } from "@/lib/display";
import { useMintFee } from "@/lib/hooks";

const TRAIT_HINTS = ["毒舌", "温柔", "理性", "感性", "幽默", "严肃", "乐观", "技术宅", "哲学家", "梦想家"];
const RADAR_LABELS: Record<string, string> = {
  humor: "幽默",
  kindness: "温柔",
  intelligence: "智慧",
  creativity: "创意",
  directness: "直接",
  patience: "耐心",
};

function analyzeUrl(url: string): { name: string; description: string } | null {
  if (url.includes("github.com")) {
    const parts = url.split("/").filter(Boolean);
    const repo = parts[parts.length - 1] || "Unknown";
    const user = parts[parts.length - 2] || "dev";
    return {
      name: repo.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      description: `基于 ${user}/${repo} 的开源气质：在意代码质量，说话直接，做事较真。`,
    };
  }
  if (url.includes("twitter.com") || url.includes("x.com")) {
    return {
      name: "社交达人",
      description: "善于表达，观点鲜明，习惯在公开场合把话说清楚。",
    };
  }
  return null;
}

export default function MintPage() {
  const { isConnected } = useAccount();
  const mintFeeQuery = useMintFee();
  const fee = (mintFeeQuery.data as bigint | undefined) ?? parseEther("0.001");
  const feeLabel = formatEth(fee);

  const [mode, setMode] = useState<"url" | "manual">("url");
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [urlError, setUrlError] = useState("");
  const [personality, setPersonality] = useState<(AgentPersonality & { radar?: ReturnType<typeof generateRadarFromDescription> }) | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<"input" | "preview">("input");
  const [dismissedHash, setDismissedHash] = useState<string | null>(null);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const minted = Boolean(isSuccess && hash && hash !== dismissedHash);

  useTxToast({
    id: "mint",
    isPending,
    isConfirming,
    isSuccess: minted,
    error,
    hash,
    pending: "请在钱包里确认铸造",
    confirming: "铸造交易已提交",
    success: "灵魂已经铸上链",
  });

  const radar = personality?.radar ?? generateRadarFromDescription(description);

  const handleAnalyzeUrl = async () => {
    if (!url.trim()) return;
    setUrlError("");
    setIsGenerating(true);
    const result = analyzeUrl(url.trim());
    if (!result) {
      setUrlError("这个链接还读不懂。换成 GitHub 或 X，或者改用自己描述。");
      setIsGenerating(false);
      return;
    }
    setName(result.name);
    setDescription(result.description);
    const next = await generatePersonality(result.name, result.description);
    setPersonality(next);
    setStep("preview");
    setIsGenerating(false);
  };

  const handleGenerate = async () => {
    if (!name.trim() || !description.trim()) return;
    setIsGenerating(true);
    const next = await generatePersonality(name.trim(), description.trim());
    setPersonality(next);
    setStep("preview");
    setIsGenerating(false);
  };

  const handleMint = () => {
    if (!personality) return;
    writeContract({
      address: SOUL_AGENT_ADDRESS,
      abi: SOUL_AGENT_ABI,
      functionName: "mint",
      args: [personality.name, personality.summary, personality.fullPrompt],
      value: fee,
    });
  };

  const reset = () => {
    if (hash) setDismissedHash(hash);
    setStep("input");
    setName("");
    setDescription("");
    setPersonality(null);
    setUrl("");
    setUrlError("");
  };

  if (minted && personality && hash) {
    return (
      <main className="page page-narrow">
        <div className="card" style={{ padding: 28, display: "grid", justifyItems: "center", textAlign: "center", gap: 12 }}>
          <GenerativeAvatar traits={personality.traits} name={personality.name} size={280} />
          <h1 className="page-title">已经铸上链</h1>
          <p className="lede" style={{ margin: 0 }}>{personality.name} 现在有了自己的编号。</p>
          <a className="linkish" href={BASESCAN_TX(hash)} target="_blank" rel="noopener noreferrer">在 BaseScan 查看交易</a>
          <div className="cluster" style={{ justifyContent: "center", marginTop: 8 }}>
            <button type="button" className="btn btn-primary" onClick={reset}>再铸一枚</button>
            <Link href="/market" className="btn btn-secondary">去市场看看</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="page-head">
        <p className="eyebrow">步骤 {step === "input" ? "1 / 2 · 描述" : "2 / 2 · 确认"}</p>
        <h1 className="page-title">铸造灵魂</h1>
        <p className="lede">用一个链接，或一段自己的话，生成这枚 NFT 的人格。铸造费 {feeLabel} ETH。</p>
      </header>

      {!isConnected && (
        <div style={{ marginBottom: 18 }}>
          <Notice>可以先生成预览。写上链之前需要连接钱包。</Notice>
        </div>
      )}

      {step === "input" && (
        <div className="grid-2">
          <div className="stack">
            <Segmented
              label="铸造方式"
              value={mode}
              onChange={setMode}
              options={[
                { value: "url", label: "从链接生成" },
                { value: "manual", label: "自己描述" },
              ]}
            />

            {mode === "url" ? (
              <form className="card card-pad stack" onSubmit={(event) => { event.preventDefault(); handleAnalyzeUrl(); }}>
                <label className="field">
                  <span className="field-label">项目或主页链接</span>
                  <input
                    className="input num"
                    value={url}
                    onChange={(event) => { setUrl(event.target.value); setUrlError(""); }}
                    placeholder="https://github.com/user/repo"
                    inputMode="url"
                  />
                </label>
                <p className="hint">目前能读懂 GitHub 仓库和 X 主页。其他网站请改用自己描述。</p>
                {urlError && <Notice tone="error">{urlError}</Notice>}
                <button type="submit" className="btn btn-primary" disabled={!url.trim() || isGenerating}>
                  {isGenerating ? "正在分析…" : "分析并生成人格"}
                </button>
              </form>
            ) : (
              <form className="card card-pad stack" onSubmit={(event) => { event.preventDefault(); handleGenerate(); }}>
                <label className="field">
                  <span className="field-label">名字</span>
                  <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：夜航员" />
                </label>
                <label className="field">
                  <span className="field-label">性格</span>
                  <textarea
                    className="textarea"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="它说话的方式、在意什么、会回避什么。越具体，人格越稳。"
                  />
                </label>
                <div className="chip-row" aria-label="性格提示">
                  {TRAIT_HINTS.map((trait) => (
                    <button
                      key={trait}
                      type="button"
                      className="chip"
                      onClick={() => setDescription((prev) => prev ? `${prev}、${trait}` : trait)}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
                <button type="submit" className="btn btn-primary" disabled={!name.trim() || !description.trim() || isGenerating}>
                  {isGenerating ? "正在生成…" : "生成预览"}
                </button>
              </form>
            )}
          </div>

          <aside className="card card-pad stack" style={{ alignItems: "center", textAlign: "center", position: "sticky", top: 84 }}>
            {name.trim() ? (
              <GenerativeAvatar
                name={name.trim()}
                traits={description.split(/[、,，]/).map((item) => item.trim()).filter(Boolean).slice(0, 3)}
                size={280}
              />
            ) : (
              <div className="avatar" style={{ width: "100%", maxWidth: 280, aspectRatio: "1", display: "grid", placeItems: "center", color: "var(--dim)" }}>
                等待描述
              </div>
            )}
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>{name.trim() || "人格会显示在这里"}</h2>
              <p className="hint" style={{ marginTop: 6 }}>
                {description.trim() ? description.trim().slice(0, 72) : "输入链接或性格之后，头像和简介会跟着变。"}
              </p>
            </div>
          </aside>
        </div>
      )}

      {step === "preview" && personality && (
        <div className="grid-2">
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: 20, display: "grid", placeItems: "center", background: "#0c0d10" }}>
              <GenerativeAvatar traits={personality.traits} name={personality.name} size={320} />
            </div>
            <div className="card-pad stack">
              <h2 style={{ margin: 0 }}>{personality.name}</h2>
              <p className="hint">{personality.summary}</p>
              <div className="tags">
                {personality.traits.map((trait) => <span key={trait} className="tag">{trait}</span>)}
              </div>
            </div>
          </div>

          <div className="stack">
            <section className="card card-pad">
              <h2 style={{ margin: "0 0 14px", fontSize: 16 }}>性格轮廓</h2>
              <div className="meter-grid">
                {Object.entries(radar).map(([key, value]) => (
                  <Meter key={key} label={RADAR_LABELS[key] ?? key} value={value} />
                ))}
              </div>
            </section>

            <details className="card card-pad">
              <summary>查看人格提示词</summary>
              <pre className="prompt" style={{ marginTop: 12 }}>{personality.fullPrompt}</pre>
            </details>

            <div className="cluster">
              <button type="button" className="btn btn-secondary" onClick={() => { setStep("input"); setPersonality(null); }}>
                返回修改
              </button>
              {isConnected ? (
                <button type="button" className="btn btn-primary" onClick={handleMint} disabled={isPending || isConfirming}>
                  {isPending ? "等待钱包…" : isConfirming ? "确认中…" : `铸造 · ${feeLabel} ETH`}
                </button>
              ) : (
                <ConnectButton />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
