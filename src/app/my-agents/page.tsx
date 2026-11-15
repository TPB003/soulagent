"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { ConnectButton } from "@/components/ConnectButton";
import { GenerativeAvatar } from "@/components/GenerativeAvatar";
import { EmptyState } from "@/components/ui/primitives";
import { useTxToast } from "@/components/ui/toast";
import { Icons } from "@/components/Icons";
import { SOUL_AGENT_ABI, SOUL_AGENT_ADDRESS, type OnChainAgent } from "@/lib/contract";
import { agentBlurb, agentTraits, formatEth, generationLabel } from "@/lib/display";
import { useAgentDirectory, useOwnerDirectory, useTotalSupply } from "@/lib/hooks";

function ManageCard({
  id,
  agent,
  onChanged,
}: {
  id: number;
  agent: OnChainAgent;
  onChanged: () => void;
}) {
  const [price, setPrice] = useState("");
  const [editing, setEditing] = useState(false);
  const [formError, setFormError] = useState("");
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash });
  const listed = agent.price > BigInt(0);
  const traits = agentTraits(agent);
  const busy = isPending || isConfirming;
  const refreshed = useRef<string | undefined>(undefined);

  useTxToast({
    id: `agent-${id}`,
    isPending,
    isConfirming,
    isSuccess,
    error: error ?? receiptError,
    hash,
    success: listed ? "已从市场下架" : "已挂到市场",
  });

  useEffect(() => {
    if (isSuccess && hash && refreshed.current !== hash) {
      refreshed.current = hash;
      onChanged();
    }
  }, [isSuccess, hash, onChanged]);

  const submitList = () => {
    setFormError("");
    try {
      const value = parseEther(price);
      if (value <= BigInt(0)) throw new Error("价格需要大于 0");
      writeContract({
        address: SOUL_AGENT_ADDRESS,
        abi: SOUL_AGENT_ABI,
        functionName: "listForSale",
        args: [BigInt(id), value],
      });
      setEditing(false);
    } catch {
      setFormError("请输入大于 0 的 ETH 价格");
    }
  };

  return (
    <article className="card manage">
      <div className="manage-art">
        <GenerativeAvatar name={agent.name} traits={traits} fluid />
      </div>
      <div>
        <div className="cluster" style={{ gap: 8 }}>
          <h3>{agent.name}</h3>
          <span className="badge">{generationLabel(Number(agent.generation))}</span>
          {listed && <span className="badge badge-live">在售</span>}
        </div>
        <p>{agentBlurb(agent)}</p>
        <div className="manage-actions">
          {listed ? (
            <>
              <strong className="num">{formatEth(agent.price)} ETH</strong>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={busy}
                onClick={() => writeContract({
                  address: SOUL_AGENT_ADDRESS,
                  abi: SOUL_AGENT_ABI,
                  functionName: "delist",
                  args: [BigInt(id)],
                })}
              >
                {busy ? "处理中…" : "下架"}
              </button>
            </>
          ) : editing ? (
            <>
              <input
                className="input"
                style={{ width: 140, height: 32, padding: "0 10px" }}
                inputMode="decimal"
                placeholder="价格 ETH"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                aria-label={`${agent.name} 的价格`}
              />
              <button type="button" className="btn btn-primary btn-sm" disabled={busy || !price} onClick={submitList}>
                确认上架
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>取消</button>
            </>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>上架出售</button>
          )}
          <Link href={`/agent/${id}`} className="linkish">去对话</Link>
        </div>
        {formError && <p className="hint" style={{ color: "var(--bad)" }}>{formError}</p>}
      </div>
    </article>
  );
}

export default function MyAgentsPage() {
  const { isConnected, address } = useAccount();
  const supply = useTotalSupply();
  const ready = supply.data !== undefined;
  const total = ready ? Number(supply.data) : 0;
  const directory = useAgentDirectory(isConnected && ready ? total : 0);
  const owners = useOwnerDirectory(isConnected && ready ? total : 0);
  const refreshDirectory = directory.refetch;
  const refreshOwners = owners.refetch;
  const refresh = useCallback(() => {
    void refreshDirectory();
    void refreshOwners();
  }, [refreshDirectory, refreshOwners]);

  const owned = address
    ? directory.agents.filter(({ id }) => (owners.owners.get(id) ?? "").toLowerCase() === address.toLowerCase())
    : [];

  const loading = isConnected && (!ready || directory.isLoading || owners.isLoading);

  return (
    <main className="page page-narrow">
      <header className="page-head">
        <h1 className="page-title">我的灵魂</h1>
        <p className="lede">你持有的 Agent。可以上架、下架，或点进去继续对话。</p>
      </header>

      {!isConnected ? (
        <EmptyState
          icon={Icons.wallet}
          title="连接钱包后查看"
          body="这里只列出当前地址持有的灵魂。铸造和买下的都会出现。"
          action={<ConnectButton />}
        />
      ) : loading ? (
        <div className="stack" aria-busy="true">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="card manage">
              <div className="skeleton" style={{ width: 72, height: 72, borderRadius: 12 }} />
              <div className="stack">
                <div className="skeleton skel-line" />
                <div className="skeleton skel-line short" />
              </div>
            </div>
          ))}
        </div>
      ) : owned.length === 0 ? (
        <EmptyState
          icon={Icons.sparkle}
          title="这个地址下还没有灵魂"
          body="去铸造一枚，或者到市场买一枚已经挂出的。"
          action={
            <>
              <Link href="/mint" className="btn btn-primary">去铸造</Link>
              <Link href="/market" className="btn btn-secondary">去市场</Link>
            </>
          }
        />
      ) : (
        <div className="stack">
          {owned.map(({ id, agent }) => (
            <ManageCard key={id} id={id} agent={agent} onChanged={refresh} />
          ))}
        </div>
      )}
    </main>
  );
}
