"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { SOUL_AGENT_ABI, SOUL_AGENT_ADDRESS, getAgentEmoji, BASESCAN_TX, type OnChainAgent } from "@/lib/contract";
import { useTotalSupply } from "@/lib/hooks";

// 读取单个 Agent 的子组件
function AgentManageCard({ id, ownerAddr }: { id: number; ownerAddr: string }) {
  const { data } = useReadContract({
    address: SOUL_AGENT_ADDRESS, abi: SOUL_AGENT_ABI,
    functionName: "agents", args: [BigInt(id)],
  });
  const { data: nftOwner } = useReadContract({
    address: SOUL_AGENT_ADDRESS, abi: SOUL_AGENT_ABI,
    functionName: "ownerOf", args: [BigInt(id)],
  });

  const { writeContract, data: txData, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txData });

  const [listPrice, setListPrice] = useState("");
  const [showListForm, setShowListForm] = useState(false);

  if (!data) return null;
  const agent = data as OnChainAgent;
  if (!agent.name || Number(agent.createdAt) === 0) return null;
  // 只显示自己拥有的
  if (nftOwner && (nftOwner as string).toLowerCase() !== ownerAddr.toLowerCase()) return null;

  const isListed = agent.price > 0;
  const priceEth = isListed ? formatEther(agent.price) : null;
  const gen = Number(agent.generation);

  const handleList = () => {
    if (!listPrice || parseFloat(listPrice) <= 0) return;
    writeContract({
      address: SOUL_AGENT_ADDRESS, abi: SOUL_AGENT_ABI,
      functionName: "listForSale",
      args: [BigInt(id), parseEther(listPrice)],
    });
    setShowListForm(false);
  };

  const handleDelist = () => {
    writeContract({
      address: SOUL_AGENT_ADDRESS, abi: SOUL_AGENT_ABI,
      functionName: "delist", args: [BigInt(id)],
    });
  };

  return (
    <div className="card" style={{ padding: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
      {/* Avatar */}
      <div style={{
        width: 56, height: 56, borderRadius: "var(--r-md)",
        background: isListed ? "var(--brand-dim)" : "var(--glass-hover)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, flexShrink: 0,
        border: isListed ? "1px solid var(--border-accent)" : "1px solid var(--border-subtle)",
      }}>
        {getAgentEmoji(agent.name)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{agent.name}</h3>
          <span className="mono">Gen {gen}</span>
          {isListed && <span className="pill-accent" style={{ fontSize: 10 }}>在售</span>}
        </div>
        <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 8, lineHeight: 1.5 }}>
          {agent.personalitySummary || "无描述"}
        </p>

        {/* Status & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {isListed ? (
            <>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600,
                color: "var(--accent)",
              }}>{priceEth} ETH</span>
              <button onClick={handleDelist} disabled={isPending || isConfirming}
                style={{
                  padding: "6px 14px", borderRadius: "var(--r-sm)", fontSize: 12, fontWeight: 500,
                  background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)",
                  color: "var(--red)", cursor: "pointer", fontFamily: "'Inter', sans-serif",
                  opacity: isPending || isConfirming ? 0.4 : 1,
                }}>
                {isPending || isConfirming ? "处理中..." : "下架"}
              </button>
            </>
          ) : (
            <>
              {showListForm ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="number" value={listPrice} onChange={(e) => setListPrice(e.target.value)}
                    placeholder="ETH 价格" step="0.001" min="0"
                    className="input" style={{ width: 120, padding: "6px 10px", fontSize: 12 }} />
                  <button onClick={handleList} disabled={isPending || isConfirming || !listPrice}
                    style={{
                      padding: "6px 14px", borderRadius: "var(--r-sm)", fontSize: 12, fontWeight: 500,
                      background: "var(--brand)", border: "none", color: "#fff",
                      cursor: "pointer", fontFamily: "'Inter', sans-serif",
                      opacity: isPending || isConfirming || !listPrice ? 0.4 : 1,
                    }}>
                    确认上架
                  </button>
                  <button onClick={() => setShowListForm(false)}
                    style={{
                      padding: "6px 10px", borderRadius: "var(--r-sm)", fontSize: 12,
                      background: "var(--glass)", border: "1px solid var(--border-subtle)",
                      color: "var(--text-tertiary)", cursor: "pointer", fontFamily: "'Inter', sans-serif",
                    }}>
                    取消
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowListForm(true)}
                  className="btn-primary" style={{ padding: "6px 14px", fontSize: 12 }}>
                  上架出售
                </button>
              )}
            </>
          )}
          <Link href={`/agent/${id}`} style={{
            fontSize: 12, color: "var(--text-quaternary)", textDecoration: "none",
            transition: "color 0.2s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-quaternary)"; }}
          >
            详情 →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MyAgentsPage() {
  const { isConnected, address } = useAccount();
  const { data: totalSupplyRaw } = useTotalSupply();
  const total = totalSupplyRaw ? Number(totalSupplyRaw) : 0;

  if (!isConnected) {
    return (
      <div style={{ textAlign: "center", padding: "120px 24px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
          连接钱包查看你的 Agent
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-tertiary)", marginBottom: 24 }}>
          你可以在这里管理、上架和下架你铸造的 Agent
        </p>
        <ConnectButton />
      </div>
    );
  }

  const allIds = Array.from({ length: Math.max(total, 0) }, (_, i) => i + 1);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "100px 24px 40px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 8 }}>
          我的 Agent
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-tertiary)" }}>
          管理你铸造的 Agent · 上架供其他用户使用
        </p>
      </div>

      {/* Agent list */}
      {total > 0 && address ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {allIds.map((id) => (
            <AgentManageCard key={id} id={id} ownerAddr={address} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-quaternary)" }}>
          <p style={{ fontSize: 14, marginBottom: 16 }}>你还没有铸造 Agent</p>
          <Link href="/mint" className="btn-primary" style={{ textDecoration: "none", fontSize: 13 }}>
            去铸造
          </Link>
        </div>
      )}
    </div>
  );
}


