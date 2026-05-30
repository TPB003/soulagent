"use client";

import { useState, useEffect } from "react";
import { NFTCard } from "@/components/NFTCard";
import { Icons } from "@/components/Icons";
import { useTotalSupply } from "@/lib/hooks";
import { SOUL_AGENT_ABI, SOUL_AGENT_ADDRESS, getAgentEmoji, type OnChainAgent } from "@/lib/contract";
import { useReadContract } from "wagmi";

// 单个链上 Agent 卡片
function OnChainAgentCard({ id }: { id: number }) {
  const { data, isLoading } = useReadContract({
    address: SOUL_AGENT_ADDRESS,
    abi: SOUL_AGENT_ABI,
    functionName: "agents",
    args: [BigInt(id)],
  });

  if (isLoading || !data) return null;
  const agent = data as OnChainAgent;
  if (!agent.name || Number(agent.createdAt) === 0) return null;

  const priceEth = agent.price > 0 ? (Number(agent.price) / 1e18).toFixed(4) : "0.001";
  const gen = Number(agent.generation);
  const rarity = gen >= 2 ? "legendary" : gen >= 1 ? "rare" : "common";

  return (
    <NFTCard
      id={id}
      name={agent.name}
      summary={agent.personalitySummary || "链上灵魂"}
      traits={["AI", gen > 0 ? "融合" : "初代", `Gen ${gen}`]}
      avatar={getAgentEmoji(agent.name)}
      gen={gen}
      price={priceEth}
      rarity={rarity as "common" | "rare" | "legendary"}
    />
  );
}

export default function MarketPage() {
  const { data: totalSupplyRaw } = useTotalSupply();
  const total = totalSupplyRaw ? Number(totalSupplyRaw) : 0;
  const [filter, setFilter] = useState<"all" | "gen0" | "gen1plus">("all");

  // 生成 ID 列表
  const allIds = Array.from({ length: Math.max(total, 6) }, (_, i) => i + 1);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px 40px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 8 }}>
          Agent 市场
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-tertiary)" }}>
          {total > 0 ? `${total} 个 Agent 已铸造` : "连接钱包查看链上 Agent"}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
        {([
          { key: "all" as const, label: "全部" },
          { key: "gen0" as const, label: "Gen 0" },
          { key: "gen1plus" as const, label: "Gen 1+" },
        ]).map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={filter === f.key ? "pill-accent" : "pill"}
            style={{ cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.2s" }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid — 链上数据 */}
      {total > 0 ? (
        <div className="grid-market">
          {allIds.filter(id => {
            if (filter === "all") return true;
            // 无法在列表页预知 gen，显示全部
            return true;
          }).map((id) => (
            <OnChainAgentCard key={id} id={id} />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div style={{
          textAlign: "center", padding: "80px 0",
          color: "var(--text-quaternary)",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>{Icons.market}</div>
          <p style={{ fontSize: 15, color: "var(--text-tertiary)", marginBottom: 8 }}>链上暂无 Agent</p>
          <p style={{ fontSize: 13 }}>成为第一个铸造者吧</p>
        </div>
      )}
    </div>
  );
}
