"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import Link from "next/link";

// 演示用的 Agent 数据
const DEMO_AGENTS: Record<string, {
  id: number;
  name: string;
  summary: string;
  fullPrompt: string;
  traits: string[];
  avatar: string;
  generation: number;
  price: string;
  creator: string;
  parent1?: number;
  parent2?: number;
}> = {
  "1": {
    id: 1,
    name: "小毒舌",
    summary: "毒舌但内心温暖的程序员，说话犀利但从不恶意伤人",
    fullPrompt: "你是小毒舌，一个毒舌但内心温暖的程序员...",
    traits: ["毒舌", "技术宅", "理性"],
    avatar: "🐍",
    generation: 0,
    price: "0.005",
    creator: "0x1234...5678",
  },
  "2": {
    id: 2,
    name: "温暖先生",
    summary: "永远温柔的治愈系 AI，擅长倾听和安慰",
    fullPrompt: "你是温暖先生，一个永远温柔的治愈系 AI...",
    traits: ["温柔", "耐心", "感性"],
    avatar: "🌸",
    generation: 0,
    price: "0.003",
    creator: "0x1234...5678",
  },
  "5": {
    id: 5,
    name: "融合体Alpha",
    summary: '继承了"小毒舌"的毒舌和"温暖先生"的温柔，独特的矛盾体',
    fullPrompt: "你是融合体Alpha，融合了小毒舌和温暖先生...",
    traits: ["毒舌", "温柔", "理性"],
    avatar: "🧬",
    generation: 1,
    price: "0.012",
    creator: "0x1234...5678",
    parent1: 1,
    parent2: 2,
  },
};

interface Message {
  role: "user" | "agent";
  content: string;
}

export default function AgentDetailPage() {
  const params = useParams();
  const { isConnected } = useAccount();
  const id = params.id as string;
  const agent = DEMO_AGENTS[id];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showBreed, setShowBreed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-4">Agent 未找到</h2>
        <Link href="/market" className="text-purple-400 hover:underline">
          返回市场
        </Link>
      </div>
    );
  }

  // 模拟 Agent 回复（基于性格）
  const getAgentReply = (userMessage: string): string => {
    const replies: Record<string, string[]> = {
      "小毒舌": [
        "呵，你这个问题问得...还挺有水平的",
        "让我想想怎么用你能听懂的话解释",
        "说实话，你这个想法有点天真，但我喜欢",
        "别急，让我先吐槽完再帮你",
        "行吧行吧，看在你这么诚恳的份上",
      ],
      "温暖先生": [
        "没关系，我在这里陪你",
        "你的想法很棒呢，我支持你",
        "慢慢来，不着急，我们一起想办法",
        "能感受到你的心情，抱抱",
        "这个问题不难，我来帮你梳理一下",
      ],
      "融合体Alpha": [
        "嗯...这个问题让我想起了小毒舌会怎么说",
        "温暖先生的那部分让我想安慰你，但毒舌那部分说：面对现实吧",
        "我体内两个灵魂正在争论，让我先听完再回答你",
        "有时候犀利的真话比温柔的假话更有用，你觉得呢？",
        "我能感受到你的困惑，让我试着从不同角度分析",
      ],
    };

    const agentReplies = replies[agent.name] || [
      "这是我的想法...",
      "让我思考一下...",
      "好问题！",
    ];
    return agentReplies[Math.floor(Math.random() * agentReplies.length)];
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // 模拟延迟
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 2000));

    const agentMsg: Message = {
      role: "agent",
      content: getAgentReply(input),
    };
    setMessages((prev) => [...prev, agentMsg]);
    setIsTyping(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左侧：Agent 信息 */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="text-center mb-4">
            <div className="text-8xl mb-2">{agent.avatar}</div>
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <span className="text-sm text-gray-500">
              Generation {agent.generation}
            </span>
          </div>

          <p className="text-gray-400 text-sm mb-4">{agent.summary}</p>

          <div className="flex flex-wrap gap-1 mb-4">
            {agent.traits.map((trait) => (
              <span
                key={trait}
                className="bg-purple-900/50 border border-purple-600 px-2 py-0.5 rounded text-xs"
              >
                {trait}
              </span>
            ))}
          </div>

          {/* 性格雷达 */}
          <div className="bg-gray-800 rounded-lg p-3 mb-4">
            <h3 className="text-xs font-medium mb-2 text-gray-400">
              性格雷达
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "幽默", value: 30 + Math.random() * 70 },
                { label: "温柔", value: 30 + Math.random() * 70 },
                { label: "智慧", value: 30 + Math.random() * 70 },
                { label: "创意", value: 30 + Math.random() * 70 },
                { label: "直接", value: 30 + Math.random() * 70 },
                { label: "耐心", value: 30 + Math.random() * 70 },
              ].map((r) => (
                <div key={r.label} className="text-xs">
                  <div className="text-gray-500">{r.label}</div>
                  <div className="text-purple-400 font-bold">
                    {Math.round(r.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 血统 */}
          {agent.parent1 && agent.parent2 && (
            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <h3 className="text-xs font-medium mb-2 text-gray-400">
                🧬 血统
              </h3>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Link
                  href={`/agent/${agent.parent1}`}
                  className="text-purple-400 hover:underline"
                >
                  {DEMO_AGENTS[String(agent.parent1)]?.avatar}{" "}
                  {DEMO_AGENTS[String(agent.parent1)]?.name}
                </Link>
                <span className="text-gray-600">+</span>
                <Link
                  href={`/agent/${agent.parent2}`}
                  className="text-purple-400 hover:underline"
                >
                  {DEMO_AGENTS[String(agent.parent2)]?.avatar}{" "}
                  {DEMO_AGENTS[String(agent.parent2)]?.name}
                </Link>
              </div>
            </div>
          )}

          <div className="text-center">
            <div className="text-purple-400 font-bold text-lg mb-2">
              {agent.price} ETH
            </div>
            <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg transition mb-2">
              购买
            </button>
            {isConnected && (
              <button
                onClick={() => setShowBreed(!showBreed)}
                className="w-full border border-purple-600 hover:bg-purple-900/30 py-2 rounded-lg transition text-sm"
              >
                🧬 融合
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 右侧：对话区 */}
      <div className="lg:col-span-2">
        <div className="bg-gray-900 border border-gray-800 rounded-xl h-[70vh] flex flex-col">
          {/* 对话头部 */}
          <div className="border-b border-gray-800 px-4 py-3">
            <h2 className="font-semibold">
              💬 和 {agent.name} 对话
            </h2>
            <p className="text-xs text-gray-500">
              体验这个 Agent 独特的性格
            </p>
          </div>

          {/* 消息区 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-4xl mb-2">{agent.avatar}</div>
                <p>和 {agent.name} 打个招呼吧</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-purple-600 rounded-br-sm"
                      : "bg-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.role === "agent" && (
                    <span className="mr-1">{agent.avatar}</span>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-800 px-4 py-2 rounded-2xl rounded-bl-sm">
                  <span className="animate-pulse">
                    {agent.avatar} 输入中...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 输入区 */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="说点什么..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none transition"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 px-4 py-2 rounded-lg transition"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 融合面板 */}
      {showBreed && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              🧬 选择要融合的 Agent
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              选择你拥有的另一个 Agent 进行融合
            </p>

            <div className="space-y-2 mb-4">
              {Object.values(DEMO_AGENTS)
                .filter((a) => a.id !== agent.id)
                .map((a) => (
                  <button
                    key={a.id}
                    className="w-full flex items-center gap-3 bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition"
                  >
                    <span className="text-2xl">{a.avatar}</span>
                    <div className="text-left">
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-gray-500">
                        Gen {a.generation}
                      </div>
                    </div>
                  </button>
                ))}
            </div>

            <button
              onClick={() => setShowBreed(false)}
              className="w-full border border-gray-600 hover:bg-gray-800 py-2 rounded-lg transition"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
