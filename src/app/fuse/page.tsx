"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { ConnectButton } from "@/components/ConnectButton";
import { GenerativeAvatar } from "@/components/GenerativeAvatar";
import { Notice } from "@/components/ui/primitives";
import { useTxToast } from "@/components/ui/toast";
import { SOUL_AGENT_ABI, SOUL_AGENT_ADDRESS, BASESCAN_TX } from "@/lib/contract";
import { agentBlurb, formatEth, generationLabel, isLiveAgent } from "@/lib/display";
import { useAgent, useBreedFee, useOwnerOf } from "@/lib/hooks";

type ChildPersonality = { summary: string; fullPrompt: string; traits: string[] };

function ParentField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = value ? Number(value) : 0;
  const query = useAgent(Number.isFinite(id) ? id : 0);
  const agent = isLiveAgent(query.data) ? query.data : undefined;

  return (
    <div className="card parent">
      <label className="field">
        <span className="field-label">{label}</span>
        <input
          className="input num"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ""))}
          placeholder="输入编号"
        />
      </label>
      {value && query.isLoading && <p className="hint">正在读取 #{value}</p>}
      {value && !query.isLoading && !agent && <Notice tone="error">没有 #{value} 这枚灵魂</Notice>}
      {agent && (
        <div className="parent-preview">
          <GenerativeAvatar name={agent.name} traits={[]} size={64} />
          <div>
            <strong>{agent.name}</strong>
            <div className="hint">{generationLabel(Number(agent.generation))} · {agentBlurb(agent)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FusePage() {
  const { isConnected, address } = useAccount();
  const breedFeeQuery = useBreedFee();
  const fee = (breedFeeQuery.data as bigint | undefined) ?? parseEther("0.002");
  const feeLabel = formatEth(fee);

  const [parent1Id, setParent1Id] = useState("");
  const [parent2Id, setParent2Id] = useState("");
  const [childName, setChildName] = useState("");
  const [step, setStep] = useState<"select" | "preview">("select");
  const [child, setChild] = useState<ChildPersonality | null>(null);
  const [note, setNote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [ackedHash, setAckedHash] = useState<string | null>(null);

  const id1 = parent1Id ? Number(parent1Id) : 0;
  const id2 = parent2Id ? Number(parent2Id) : 0;
  const parent1 = useAgent(id1);
  const parent2 = useAgent(id2);
  const owner1 = useOwnerOf(id1);
  const owner2 = useOwnerOf(id2);
  const p1 = isLiveAgent(parent1.data) ? parent1.data : undefined;
  const p2 = isLiveAgent(parent2.data) ? parent2.data : undefined;
  const same = id1 > 0 && id1 === id2;
  const ownsBoth = Boolean(
    address && owner1.data && owner2.data
    && address.toLowerCase() === owner1.data.toLowerCase()
    && address.toLowerCase() === owner2.data.toLowerCase(),
  );

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const confirmed = Boolean(isSuccess && hash && hash !== ackedHash);

  useTxToast({
    id: "fuse",
    isPending,
    isConfirming,
    isSuccess: confirmed,
    error,
    hash,
    pending: "请在钱包里确认融合",
    confirming: "融合交易已提交",
    success: childName ? `${childName} 诞生了` : "融合已经完成",
  });

  const canPreview = Boolean(p1 && p2 && !same && childName.trim());

  const handleGenerate = async () => {
    if (!p1 || !p2 || !childName.trim()) return;
    setIsGenerating(true);
    setNote("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: childName.trim(),
          mode: "breed",
          parent1: { name: p1.name, summary: p1.personalitySummary, traits: [] },
          parent2: { name: p2.name, summary: p2.personalitySummary, traits: [] },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setChild({
        summary: data.summary || `继承了${p1.name}和${p2.name}的性格`,
        fullPrompt: data.fullPrompt || "",
        traits: data.traits || [],
      });
    } catch {
      setChild({
        summary: `继承了${p1.name}和${p2.name}的性格`,
        fullPrompt: `你是${childName.trim()}，融合了${p1.name}和${p2.name}的灵魂。`,
        traits: ["理性", "温柔", "好奇"],
      });
      setNote("模型暂时没有回应，已根据两位亲代写了一版初稿。");
    }
    setStep("preview");
    setIsGenerating(false);
  };

  const handleMint = () => {
    if (!child || !id1 || !id2 || !childName.trim()) return;
    writeContract({
      address: SOUL_AGENT_ADDRESS,
      abi: SOUL_AGENT_ABI,
      functionName: "breed",
      args: [BigInt(id1), BigInt(id2), childName.trim(), child.summary, child.summary],
      value: fee,
    });
  };

  const showDone = confirmed && Boolean(child);

  return (
    <main className="page page-narrow">
      <header className="page-head">
        <h1 className="page-title">融合</h1>
        <p className="lede">
          选出两枚你持有的灵魂。模型会继承双方的性格，再长出一点新的东西。融合费 {feeLabel} ETH，世代取较高的一位再加一。
        </p>
      </header>

      {step === "select" && (
        <div className="stack">
          <div className="fuse-grid">
            <ParentField label="亲代一" value={parent1Id} onChange={setParent1Id} />
            <div className="fuse-op" aria-hidden="true">+</div>
            <ParentField label="亲代二" value={parent2Id} onChange={setParent2Id} />
          </div>
          {same && <Notice tone="error">请选择两枚不同的灵魂。</Notice>}
          <label className="field">
            <span className="field-label">新灵魂的名字</span>
            <input className="input" value={childName} onChange={(event) => setChildName(event.target.value)} placeholder="给下一枚起个名字" />
          </label>
          <div className="cluster">
            <button type="button" className="btn btn-primary" disabled={!canPreview || isGenerating} onClick={handleGenerate}>
              {isGenerating ? "正在生成…" : "生成融合人格"}
            </button>
          </div>
        </div>
      )}

      {step === "preview" && !showDone && child && p1 && p2 && (
        <div className="stack">
          <div className="card card-pad lineage">
            <ParentMark name={p1.name} caption="亲代一" />
            <span className="fuse-op">+</span>
            <ParentMark name={p2.name} caption="亲代二" />
            <span className="fuse-op">=</span>
            <ParentMark name={childName.trim()} caption="新灵魂" traits={child.traits} />
          </div>
          <section className="card card-pad stack">
            <h2 style={{ margin: 0 }}>{childName.trim()}</h2>
            <p className="hint">{child.summary}</p>
            <div className="tags">
              {child.traits.map((trait) => <span key={trait} className="tag">{trait}</span>)}
            </div>
            {child.fullPrompt && <pre className="prompt">{child.fullPrompt}</pre>}
          </section>
          {note && <Notice>{note}</Notice>}
          {isConnected && owner1.data && owner2.data && !ownsBoth && (
            <Notice tone="error">融合需要你同时持有这两枚灵魂。</Notice>
          )}
          {!isConnected && <Notice>生成已经完成。写上链之前请连接持有这两枚 NFT 的钱包。</Notice>}
          <div className="cluster">
            {isConnected ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={isPending || isConfirming || (Boolean(owner1.data && owner2.data) && !ownsBoth)}
                onClick={handleMint}
              >
                {isPending ? "等待钱包…" : isConfirming ? "确认中…" : `确认融合 · ${feeLabel} ETH`}
              </button>
            ) : (
              <ConnectButton />
            )}
            <button type="button" className="btn btn-secondary" onClick={() => setStep("select")}>返回</button>
          </div>
        </div>
      )}

      {showDone && (
        <div className="card card-pad stack" style={{ alignItems: "center", textAlign: "center" }}>
          <GenerativeAvatar name={childName.trim() || "child"} traits={child?.traits ?? []} size={240} />
          <h2 style={{ margin: 0 }}>{childName.trim()} 诞生了</h2>
          <p className="hint">新的编号会在交易确认后出现在市场里。</p>
          {hash && <a className="linkish" href={BASESCAN_TX(hash)} target="_blank" rel="noopener noreferrer">在 BaseScan 查看交易</a>}
          <div className="cluster">
            <Link href="/market" className="btn btn-primary">去市场看看</Link>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                if (hash) setAckedHash(hash);
                setStep("select");
                setParent1Id("");
                setParent2Id("");
                setChildName("");
                setChild(null);
                setNote("");
              }}
            >
              再融一次
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function ParentMark({ name, caption, traits = [] }: { name: string; caption: string; traits?: string[] }) {
  return (
    <div className="stack" style={{ alignItems: "center", gap: 8 }}>
      <GenerativeAvatar name={name} traits={traits} size={96} />
      <div>
        <div style={{ fontWeight: 600 }}>{name}</div>
        <div className="hint">{caption}</div>
      </div>
    </div>
  );
}
