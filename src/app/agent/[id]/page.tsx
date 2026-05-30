"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useAgent, useOwnerOf, useChildren } from "@/lib/hooks";
import { getAgentEmoji, BASESCAN_NFT, BASESCAN_ADDR, SOUL_AGENT_ADDRESS, BASESCAN_CONTRACT, type OnChainAgent } from "@/lib/contract";

interface Message { role: "user" | "agent"; content: string; timestamp: number; }

// 对话历史 localStorage key
const historyKey = (id: string) => `soulagent_chat_${id}`;
const evoKey = (id: string) => `soulagent_evo_${id}`;

function loadHistory(id: string): Message[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(historyKey(id)) || "[]"); } catch { return []; }
}
function saveHistory(id: string, msgs: Message[]) {
  localStorage.setItem(historyKey(id), JSON.stringify(msgs.slice(-100))); // 保留最近100条
}
function loadEvo(id: string): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(evoKey(id)) || "0");
}
function saveEvo(id: string, count: number) {
  localStorage.setItem(evoKey(id), String(count));
}

export default function AgentDetailPage() {
  const params = useParams();
  const { isConnected } = useAccount();
  const id = params.id as string;

  // 链上数据
  const { data: agentData, isLoading: agentLoading } = useAgent(Number(id));
  const { data: ownerAddr } = useOwnerOf(Number(id));
  const { data: childrenIds } = useChildren(Number(id));

  // 对话状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [evoCount, setEvoCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 加载历史
  useEffect(() => {
    setMessages(loadHistory(id));
    setEvoCount(loadEvo(id));
  }, [id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const agent = agentData as OnChainAgent | undefined;
  const agentName = agent?.name || `Agent #${id}`;
  const emoji = getAgentEmoji(agentName);
  const gen = agent ? Number(agent.generation) : 0;
  const priceEth = agent && agent.price > 0 ? (Number(agent.price) / 1e18).toFixed(4) : null;
  const summary = agent?.personalitySummary || "链上暂无描述";
  const creationTime = agent?.createdAt ? new Date(Number(agent.createdAt) * 1000).toLocaleDateString("zh-CN") : "";

  // 进化等级
  const evoLevel = evoCount >= 50 ? 3 : evoCount >= 20 ? 2 : evoCount >= 5 ? 1 : 0;
  const evoLabel = ["初始", "觉醒", "进化", "超进化"][evoLevel];
  const evoColor = ["var(--text-quaternary)", "var(--accent)", "#828fff", "#fbbf24"][evoLevel];

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: "user", content: input.trim(), timestamp: Date.now() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName,
          systemPrompt: `你是${agentName}，性格描述：${summary}。保持角色，回复简洁有力。`,
          messages: newMsgs.slice(-10).map(m => ({ role: m.role === "agent" ? "assistant" : "user", content: m.content })),
        }),
      });

      const data = await res.json();
      const agentMsg: Message = {
        role: "agent",
        content: data.reply || data.error || "...",
        timestamp: Date.now(),
      };

      const updated = [...newMsgs, agentMsg];
      setMessages(updated);
      saveHistory(id, updated);

      // 进化计数
      const newEvo = evoCount + 1;
      setEvoCount(newEvo);
      saveEvo(id, newEvo);
    } catch {
      const errMsg: Message = { role: "agent", content: "网络错误，稍后再试", timestamp: Date.now() };
      const updated = [...newMsgs, errMsg];
      setMessages(updated);
      saveHistory(id, updated);
    }

    setIsTyping(false);
  }, [input, isTyping, messages, agentName, summary, id, evoCount]);

  if (agentLoading) {
    return (
      <div style={{ textAlign: "center", padding: "120px 24px", color: "var(--text-tertiary)" }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>

      {/* Left: Agent Info */}
      <div>
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 8, padding: 24,
        }}>
          {/* Avatar & Name */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>{emoji}</div>
            <h1 style={{ fontSize: 20, fontWeight: 590, letterSpacing: "-0.24px", color: "var(--text-primary)" }}>{agentName}</h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 11, color: "var(--text-quaternary)", fontFamily: "'JetBrains Mono', monospace" }}>Gen {gen}</span>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(94,106,210,0.15)", color: evoColor, fontWeight: 510 }}>{evoLabel}</span>
            </div>
          </div>

          {/* Summary */}
          <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 16, lineHeight: 1.6 }}>{summary}</p>

          {/* Evolution */}
          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: "var(--text-quaternary)", marginBottom: 8, fontWeight: 510, letterSpacing: "0.5px" }}>EVOLUTION</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.05)" }}>
                <div style={{ width: `${Math.min(100, (evoCount / 50) * 100)}%`, height: "100%", borderRadius: 2, background: evoColor, transition: "width 0.3s" }} />
              </div>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>{evoCount}/50</span>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-quaternary)", marginTop: 6 }}>对话 {evoCount} 次 · {evoLevel < 3 ? `再聊 ${[5, 20, 50][evoLevel] - evoCount} 次升级` : "已达最高级"}</p>
          </div>

          {/* Bloodline */}
          {agent && Number(agent.parent1) > 0 && (
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "var(--text-quaternary)", marginBottom: 8, fontWeight: 510 }}>BLOODLINE</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13 }}>
                <Link href={`/agent/${Number(agent.parent1)}`} style={{ color: "var(--accent-hover)", textDecoration: "none" }}>#{Number(agent.parent1)}</Link>
                <span style={{ color: "var(--text-quaternary)" }}>+</span>
                <Link href={`/agent/${Number(agent.parent2)}`} style={{ color: "var(--accent-hover)", textDecoration: "none" }}>#{Number(agent.parent2)}</Link>
              </div>
            </div>
          )}

          {/* Children */}
          {childrenIds && childrenIds.length > 0 && (
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "var(--text-quaternary)", marginBottom: 8, fontWeight: 510 }}>OFFSPRING ({childrenIds.length})</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {childrenIds.map(cid => (
                  <Link key={String(cid)} href={`/agent/${Number(cid)}`} style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.05)", color: "var(--text-tertiary)", textDecoration: "none" }}>
                    #{Number(cid)}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Price + Actions */}
          {priceEth && (
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 500, color: "var(--accent-hover)", textAlign: "center", marginBottom: 12 }}>
              {priceEth} ETH
            </div>
          )}
          <button style={{
            width: "100%", background: "var(--brand)", color: "#fff",
            padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 510,
            border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif",
          }}>
            {priceEth ? "购买" : "未在售"}
          </button>

          {/* BaseScan Links */}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 10, color: "var(--text-quaternary)", marginBottom: 8, fontWeight: 510, letterSpacing: "0.5px" }}>ON-CHAIN</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <a href={BASESCAN_NFT(Number(id))} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--text-tertiary)", textDecoration: "none" }} onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}>
                NFT #{id} · BaseScan ↗
              </a>
              {ownerAddr && (
                <a href={BASESCAN_ADDR(ownerAddr)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--text-tertiary)", textDecoration: "none" }} onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}>
                  持有者: {ownerAddr.slice(0, 6)}...{ownerAddr.slice(-4)} ↗
                </a>
              )}
              {agent && (
                <a href={BASESCAN_ADDR(agent.creator)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--text-tertiary)", textDecoration: "none" }} onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}>
                  创造者: {agent.creator.slice(0, 6)}...{agent.creator.slice(-4)} ↗
                </a>
              )}
              {creationTime && <span style={{ fontSize: 11, color: "var(--text-quaternary)" }}>铸造于 {creationTime}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Chat */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 8,
        display: "flex", flexDirection: "column",
        height: "calc(100vh - 140px)",
      }}>
        {/* Header */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 510, color: "var(--text-primary)" }}>和 {agentName} 对话</span>
            <span style={{ fontSize: 11, color: "var(--text-quaternary)", marginLeft: 8 }}>AI 驱动 · MiMo</span>
          </div>
          <button onClick={() => { setMessages([]); saveHistory(id, []); }} style={{ fontSize: 11, color: "var(--text-quaternary)", background: "none", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>清空</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
          {messages.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-quaternary)" }}>
              <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>{emoji}</div>
              <p style={{ fontSize: 13 }}>和 {agentName} 打个招呼吧</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
              <div style={{
                maxWidth: "75%", padding: "8px 14px", borderRadius: 12, fontSize: 14, lineHeight: 1.5,
                ...(msg.role === "user" ? {
                  background: "var(--brand)", color: "#fff", borderBottomRightRadius: 4,
                } : {
                  background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", borderBottomLeftRadius: 4,
                }),
              }}>
                {msg.role === "agent" && <span style={{ marginRight: 4 }}>{emoji}</span>}
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
              <div style={{ padding: "8px 14px", borderRadius: 12, borderBottomLeftRadius: 4, background: "rgba(255,255,255,0.05)", fontSize: 13, color: "var(--text-quaternary)" }}>
                {emoji} 思考中...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 8 }}>
          <input
            type="text" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="说点什么..."
            style={{
              flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-default)",
              borderRadius: 6, padding: "8px 12px", color: "var(--text-primary)", fontSize: 14, outline: "none",
              fontFamily: "'Inter', sans-serif",
            }}
          />
          <button onClick={handleSend} disabled={!input.trim() || isTyping} style={{
            background: "var(--brand)", color: "#fff", padding: "8px 16px", borderRadius: 6,
            fontSize: 13, fontWeight: 510, border: "none",
            cursor: !input.trim() || isTyping ? "not-allowed" : "pointer",
            opacity: !input.trim() || isTyping ? 0.4 : 1,
            fontFamily: "'Inter', sans-serif",
          }}>发送</button>
        </div>
      </div>
    </div>
  );
}
