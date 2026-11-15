"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { GenerativeAvatar } from "@/components/GenerativeAvatar";
import { EmptyState, Meter } from "@/components/ui/primitives";
import { useTxToast } from "@/components/ui/toast";
import { Icons } from "@/components/Icons";
import {
  BASESCAN_ADDR,
  BASESCAN_NFT,
  SOUL_AGENT_ABI,
  SOUL_AGENT_ADDRESS,
  type OnChainAgent,
} from "@/lib/contract";
import { agentBlurb, agentTraits, formatEth, generationLabel, isLiveAgent, shortAddress } from "@/lib/display";
import { useAgent, useChildren, useOwnerOf } from "@/lib/hooks";

interface Message { role: "user" | "agent"; content: string; timestamp: number; }

const historyKey = (id: string) => `soulagent_chat_${id}`;
const evoKey = (id: string) => `soulagent_evo_${id}`;
const PROMPTS = ["你是谁？", "用一句话形容你的性格", "你和别人最不一样的地方是什么？"];

function loadHistory(id: string): Message[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(historyKey(id)) || "[]"); } catch { return []; }
}
function saveHistory(id: string, messages: Message[]) {
  localStorage.setItem(historyKey(id), JSON.stringify(messages.slice(-100)));
}
function loadEvo(id: string) {
  if (typeof window === "undefined") return 0;
  return Number.parseInt(localStorage.getItem(evoKey(id)) || "0", 10) || 0;
}
function saveEvo(id: string, count: number) {
  localStorage.setItem(evoKey(id), String(count));
}

export default function AgentDetailPage() {
  const params = useParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(idParam);
  const { address } = useAccount();

  const agentQuery = useAgent(id);
  const ownerQuery = useOwnerOf(id);
  const childrenQuery = useChildren(Number.isFinite(id) ? id : 0);
  const agent = isLiveAgent(agentQuery.data) ? agentQuery.data : undefined;

  const [loadedFor, setLoadedFor] = useState(idParam);
  const [messages, setMessages] = useState<Message[]>(() => loadHistory(idParam ?? ""));
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [evoCount, setEvoCount] = useState(() => loadEvo(idParam ?? ""));
  const [listPrice, setListPrice] = useState("");
  const [showList, setShowList] = useState(false);
  const [formError, setFormError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const refetchAgent = useRef(agentQuery.refetch);

  if (idParam !== loadedFor) {
    setLoadedFor(idParam);
    setMessages(loadHistory(idParam ?? ""));
    setEvoCount(loadEvo(idParam ?? ""));
    setInput("");
  }

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    refetchAgent.current = agentQuery.refetch;
  });

  useEffect(() => {
    if (receipt.isSuccess) void refetchAgent.current();
  }, [receipt.isSuccess]);

  const isOwner = Boolean(address && ownerQuery.data && address.toLowerCase() === ownerQuery.data.toLowerCase());
  const listed = Boolean(agent && agent.price > BigInt(0));
  const name = agent?.name ?? "";
  const traits = agent ? agentTraits(agent) : [];
  const blurb = agent ? agentBlurb(agent) : "";
  const prompt = agent?.personalitySummary || blurb;
  const gen = agent ? Number(agent.generation) : 0;
  const evoLevel = evoCount >= 50 ? 3 : evoCount >= 20 ? 2 : evoCount >= 5 ? 1 : 0;
  const evoLabel = ["初始", "觉醒", "进化", "超进化"][evoLevel];
  const nextAt = [5, 20, 50][evoLevel] ?? 50;

  useTxToast({
    id: `detail-${idParam}`,
    isPending,
    isConfirming: receipt.isLoading,
    isSuccess: receipt.isSuccess,
    error: error ?? receipt.error,
    hash,
    success: listed && !showList ? "交易已确认" : "交易已确认",
  });

  const handleSend = useCallback(async (preset?: string) => {
    const content = (preset ?? input).trim();
    if (!content || isTyping || !agent) return;
    const userMsg: Message = { role: "user", content, timestamp: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName: name,
          systemPrompt: `你是${name}，性格描述：${prompt}。保持角色，回复简洁有力。`,
          messages: next.slice(-10).map((message) => ({
            role: message.role === "agent" ? "assistant" : "user",
            content: message.content,
          })),
        }),
      });
      const data = await res.json();
      const reply: Message = { role: "agent", content: data.reply || data.error || "…", timestamp: Date.now() };
      const updated = [...next, reply];
      setMessages(updated);
      saveHistory(String(idParam), updated);
      const grown = evoCount + 1;
      setEvoCount(grown);
      saveEvo(String(idParam), grown);
    } catch {
      const reply: Message = { role: "agent", content: "网络中断了，过一会儿再试。", timestamp: Date.now() };
      const updated = [...next, reply];
      setMessages(updated);
      saveHistory(String(idParam), updated);
    }
    setIsTyping(false);
  }, [input, isTyping, messages, agent, name, prompt, idParam, evoCount]);

  const list = () => {
    setFormError("");
    try {
      const value = parseEther(listPrice);
      if (value <= BigInt(0)) throw new Error("bad");
      writeContract({
        address: SOUL_AGENT_ADDRESS,
        abi: SOUL_AGENT_ABI,
        functionName: "listForSale",
        args: [BigInt(id), value],
      });
      setShowList(false);
    } catch {
      setFormError("请输入大于 0 的 ETH 价格");
    }
  };

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <main className="page page-narrow">
        <EmptyState icon={Icons.sparkle} title="编号不对" body="灵魂编号是从 1 开始的整数。" action={<Link className="btn btn-secondary" href="/market">回市场</Link>} />
      </main>
    );
  }

  if (agentQuery.isLoading) {
    return (
      <main className="page">
        <div className="agent-layout" aria-busy="true" aria-label="正在读取灵魂">
          <div className="card skel-card">
            <div className="skeleton skel-art" />
            <div className="skel-body">
              <div className="skeleton skel-line" />
              <div className="skeleton skel-line short" />
            </div>
          </div>
          <div className="card" style={{ minHeight: 420 }} />
        </div>
      </main>
    );
  }

  if (agentQuery.isError || !agent) {
    return (
      <main className="page page-narrow">
        <EmptyState
          icon={Icons.sparkle}
          title="没有这枚灵魂"
          body={agentQuery.isError ? "链上暂时读不到。可能是网络中断。" : `编号 #${id} 在合约里不存在。`}
          action={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => agentQuery.refetch()}>重试</button>
              <Link className="btn btn-primary" href="/market">回市场</Link>
            </>
          }
        />
      </main>
    );
  }

  return (
    <main className="page">
      <div className="agent-layout">
        <aside className="card profile">
          <GenerativeAvatar name={name} traits={traits} fluid />
          <div className="profile-body">
            <div>
              <div className="cluster" style={{ marginBottom: 8 }}>
                <span className="badge">{generationLabel(gen)}</span>
                <span className="badge">{evoLabel}</span>
                <span className="num" style={{ color: "var(--dim)", fontSize: 12 }}>#{id}</span>
              </div>
              <h1>{name}</h1>
              <p className="blurb">{blurb}</p>
            </div>

            {traits.length > 0 && (
              <div className="tags">
                {traits.map((trait) => <span key={trait} className="tag">{trait}</span>)}
              </div>
            )}

            <Meter label={`成长 · 已对话 ${evoCount} 次`} value={Math.min(100, (evoCount / 50) * 100)} showValue={false} />
            <p className="hint">
              {evoLevel < 3 ? `再对话 ${Math.max(0, nextAt - evoCount)} 次，进入下一阶段。` : "已经到目前的最高阶段。"}
            </p>

            {Number(agent.parent1) > 0 && (
              <div>
                <div className="kv-label">亲代</div>
                <div className="cluster" style={{ marginTop: 6 }}>
                  <Link className="linkish" href={`/agent/${Number(agent.parent1)}`}>#{Number(agent.parent1)}</Link>
                  <span style={{ color: "var(--dim)" }}>+</span>
                  <Link className="linkish" href={`/agent/${Number(agent.parent2)}`}>#{Number(agent.parent2)}</Link>
                </div>
              </div>
            )}

            {childrenQuery.data && childrenQuery.data.length > 0 && (
              <div>
                <div className="kv-label">子代 · {childrenQuery.data.length}</div>
                <div className="tags" style={{ marginTop: 6 }}>
                  {childrenQuery.data.map((childId) => (
                    <Link key={String(childId)} href={`/agent/${Number(childId)}`} className="tag">
                      #{Number(childId)}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <TradePanel
              agent={agent}
              isOwner={isOwner}
              listed={listed}
              busy={isPending || receipt.isLoading}
              showList={showList}
              listPrice={listPrice}
              formError={formError}
              onShowList={setShowList}
              onPrice={setListPrice}
              onList={list}
              onDelist={() => writeContract({
                address: SOUL_AGENT_ADDRESS,
                abi: SOUL_AGENT_ABI,
                functionName: "delist",
                args: [BigInt(id)],
              })}
              onBuy={() => writeContract({
                address: SOUL_AGENT_ADDRESS,
                abi: SOUL_AGENT_ABI,
                functionName: "buyAgent",
                args: [BigInt(id)],
                value: agent.price,
              })}
            />

            <div className="kv">
              <span className="kv-label">链上</span>
              <a href={BASESCAN_NFT(id)} target="_blank" rel="noopener noreferrer">NFT #{id}</a>
              {ownerQuery.data && (
                <a href={BASESCAN_ADDR(ownerQuery.data)} target="_blank" rel="noopener noreferrer">
                  持有者 {shortAddress(ownerQuery.data)}
                </a>
              )}
              <a href={BASESCAN_ADDR(agent.creator)} target="_blank" rel="noopener noreferrer">
                创造者 {shortAddress(agent.creator)}
              </a>
              <span>铸造于 {new Date(Number(agent.createdAt) * 1000).toLocaleDateString("zh-CN")}</span>
            </div>
          </div>
        </aside>

        <section className="card chat" aria-label={`和 ${name} 对话`}>
          <header className="chat-head">
            <div className="mini-avatar">
              <GenerativeAvatar name={name} traits={traits} fluid />
            </div>
            <div className="who">
              <strong>和 {name} 说话</strong>
              <span>由链上人格驱动</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: "auto" }}
              onClick={() => { setMessages([]); saveHistory(String(idParam), []); }}
            >
              清空记录
            </button>
          </header>

          <div className="thread">
            {messages.length === 0 && (
              <div className="chat-empty">
                <h2>可以从一句问候开始</h2>
                <p className="hint">对话只保存在这台浏览器里，最近一百条。</p>
                <div className="suggest">
                  {PROMPTS.map((promptText) => (
                    <button key={promptText} type="button" className="chip" onClick={() => handleSend(promptText)}>
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={`${message.timestamp}-${index}`} className={`bubble ${message.role}`}>
                {message.content}
              </div>
            ))}
            {isTyping && (
              <div className="bubble agent" aria-label="正在回复">
                <span className="dots" aria-hidden="true"><i /><i /><i /></span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form className="composer" onSubmit={(event) => { event.preventDefault(); handleSend(); }}>
            <label className="sr-only" htmlFor="chat-input">
              写给 {name}
            </label>
            <input
              id="chat-input"
              className="input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={`写给 ${name}…`}
            />
            <button type="submit" className="btn btn-primary btn-icon" disabled={!input.trim() || isTyping} aria-label="发送">
              {Icons.send}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function TradePanel({
  agent,
  isOwner,
  listed,
  busy,
  showList,
  listPrice,
  formError,
  onShowList,
  onPrice,
  onList,
  onDelist,
  onBuy,
}: {
  agent: OnChainAgent;
  isOwner: boolean;
  listed: boolean;
  busy: boolean;
  showList: boolean;
  listPrice: string;
  formError: string;
  onShowList: (value: boolean) => void;
  onPrice: (value: string) => void;
  onList: () => void;
  onDelist: () => void;
  onBuy: () => void;
}) {
  if (isOwner && listed) {
    return (
      <div className="stack">
        <strong className="num">{formatEth(agent.price)} ETH</strong>
        <button type="button" className="btn btn-danger" disabled={busy} onClick={onDelist}>
          {busy ? "处理中…" : "下架"}
        </button>
      </div>
    );
  }
  if (isOwner) {
    return showList ? (
      <div className="stack">
        <label className="field">
          <span className="field-label">价格，单位 ETH</span>
          <input className="input" inputMode="decimal" value={listPrice} onChange={(event) => onPrice(event.target.value)} placeholder="0.01" />
        </label>
        {formError && <p className="hint" style={{ color: "var(--bad)" }}>{formError}</p>}
        <div className="cluster">
          <button type="button" className="btn btn-primary" disabled={busy || !listPrice} onClick={onList}>
            {busy ? "处理中…" : "确认上架"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => onShowList(false)}>取消</button>
        </div>
      </div>
    ) : (
      <button type="button" className="btn btn-primary" onClick={() => onShowList(true)}>上架出售</button>
    );
  }
  if (listed) {
    return (
      <div className="stack">
        <strong className="num">{formatEth(agent.price)} ETH</strong>
        <button type="button" className="btn btn-primary" disabled={busy} onClick={onBuy}>
          {busy ? "处理中…" : "购买"}
        </button>
      </div>
    );
  }
  return <p className="hint">持有者还没有上架。你仍然可以在这里和它对话。</p>;
}
