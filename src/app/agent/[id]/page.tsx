"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import Link from "next/link";

const DEMO_AGENTS: Record<string, {
  id: number; name: string; summary: string; fullPrompt: string;
  traits: string[]; avatar: string; generation: number; price: string;
  parent1?: number; parent2?: number;
}> = {
  "1": { id: 1, name: "小毒舌", summary: "毒舌但内心温暖的程序员", fullPrompt: "...", traits: ["毒舌", "技术宅", "理性"], avatar: "🐍", generation: 0, price: "0.005" },
  "2": { id: 2, name: "温暖先生", summary: "永远温柔的治愈系 AI", fullPrompt: "...", traits: ["温柔", "耐心", "感性"], avatar: "🌸", generation: 0, price: "0.003" },
  "5": { id: 5, name: "融合体Alpha", summary: '融合了"小毒舌"和"温暖先生"', fullPrompt: "...", traits: ["毒舌", "温柔", "理性"], avatar: "🧬", generation: 1, price: "0.012", parent1: 1, parent2: 2 },
};

interface Message { role: "user" | "agent"; content: string; }

export default function AgentDetailPage() {
  const params = useParams();
  const { isConnected } = useAccount();
  const id = params.id as string;
  const agent = DEMO_AGENTS[id];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (!agent) {
    return (
      <div style={{ textAlign: "center", padding: "120px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🔍</div>
        <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 16 }}>Agent 未找到</h2>
        <Link href="/market" style={{ color: "var(--accent-bright)", fontSize: 13 }}>返回市场</Link>
      </div>
    );
  }

  const getAgentReply = (): string => {
    const replies: Record<string, string[]> = {
      "小毒舌": ["呵，你这个问题问得...还挺有水平的", "让我想想怎么用你能听懂的话解释", "说实话，你这个想法有点天真，但我喜欢"],
      "温暖先生": ["没关系，我在这里陪你", "你的想法很棒呢，我支持你", "慢慢来，不着急，我们一起想办法"],
      "融合体Alpha": ["我体内两个灵魂正在争论...", "有时候犀利的真话比温柔的假话更有用", "我能感受到你的困惑，让我从不同角度分析"],
    };
    const r = replies[agent.name] || ["让我想想...", "好问题！"];
    return r[Math.floor(Math.random() * r.length)];
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 2000));
    setMessages((prev) => [...prev, { role: "agent", content: getAgentReply() }]);
    setIsTyping(false);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
      {/* Left: Info */}
      <div>
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
        }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>{agent.avatar}</div>
            <h1 style={{ fontSize: 20, fontWeight: 590, letterSpacing: "-0.24px" }}>{agent.name}</h1>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
              Gen {agent.generation}
            </span>
          </div>

          <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 16, lineHeight: 1.6 }}>
            {agent.summary}
          </p>

          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
            {agent.traits.map((t) => (
              <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 9999, border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                {t}
              </span>
            ))}
          </div>

          {/* Radar */}
          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 12, border: "1px solid var(--border-subtle)", marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 8, fontWeight: 510, letterSpacing: "0.5px" }}>PERSONALITY</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[{ l: "幽默", v: 65 }, { l: "温柔", v: 45 }, { l: "智慧", v: 80 }, { l: "创意", v: 55 }, { l: "直接", v: 90 }, { l: "耐心", v: 35 }].map((r) => (
                <div key={r.l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{r.l}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "var(--accent-bright)" }}>{r.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bloodline */}
          {agent.parent1 && agent.parent2 && (
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 12, border: "1px solid var(--border-subtle)", marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 8, fontWeight: 510 }}>BLOODLINE</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13 }}>
                <Link href={`/agent/${agent.parent1}`} style={{ color: "var(--accent-bright)", textDecoration: "none" }}>
                  {DEMO_AGENTS[String(agent.parent1)]?.avatar} {DEMO_AGENTS[String(agent.parent1)]?.name}
                </Link>
                <span style={{ color: "var(--text-muted)" }}>+</span>
                <Link href={`/agent/${agent.parent2}`} style={{ color: "var(--accent-bright)", textDecoration: "none" }}>
                  {DEMO_AGENTS[String(agent.parent2)]?.avatar} {DEMO_AGENTS[String(agent.parent2)]?.name}
                </Link>
              </div>
            </div>
          )}

          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 500, color: "var(--accent-bright)", textAlign: "center", marginBottom: 12 }}>
            {agent.price} ETH
          </div>
          <button style={{
            width: "100%", background: "var(--accent)", color: "#fff",
            padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 510,
            border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif",
          }}>
            购买
          </button>
        </div>
      </div>

      {/* Right: Chat */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 140px)",
      }}>
        {/* Header */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: 13, fontWeight: 510 }}>和 {agent.name} 对话</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>体验独特性格</span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
          {messages.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>{agent.avatar}</div>
              <p style={{ fontSize: 13 }}>和 {agent.name} 打个招呼吧</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
              <div style={{
                maxWidth: "75%",
                padding: "8px 14px",
                borderRadius: 12,
                fontSize: 14,
                lineHeight: 1.5,
                ...(msg.role === "user" ? {
                  background: "var(--accent)",
                  color: "#fff",
                  borderBottomRightRadius: 4,
                } : {
                  background: "rgba(255,255,255,0.05)",
                  color: "var(--text-secondary)",
                  borderBottomLeftRadius: 4,
                }),
              }}>
                {msg.role === "agent" && <span style={{ marginRight: 4 }}>{agent.avatar}</span>}
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
              <div style={{ padding: "8px 14px", borderRadius: 12, borderBottomLeftRadius: 4, background: "rgba(255,255,255,0.05)", fontSize: 13, color: "var(--text-muted)" }}>
                {agent.avatar} 输入中...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: 12, borderTop: "1px solid var(--border-subtle)", display: "flex", gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="说点什么..."
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "8px 12px",
              color: "var(--text-primary)",
              fontSize: 14,
              outline: "none",
              fontFamily: "'Inter', sans-serif",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            style={{
              background: "var(--accent)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 510,
              border: "none",
              cursor: !input.trim() || isTyping ? "not-allowed" : "pointer",
              opacity: !input.trim() || isTyping ? 0.4 : 1,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
