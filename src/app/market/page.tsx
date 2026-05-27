"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SOUL_AGENT_ABI, SOUL_AGENT_ADDRESS } from "@/lib/contract";
import { formatEther } from "viem";
import Link from "next/link";

// 演示用的模拟数据（黑客松期间合约还没部署时用）
const DEMO_AGENTS = [
  {
    id: 1,
    name: "小毒舌",
    summary: "毒舌但内心温暖的程序员，说话犀利但从不恶意伤人",
    traits: ["毒舌", "技术宅", "理性"],
    avatar: "🐍",
    generation: 0,
    price: "0.005",
    creator: "0x1234...5678",
  },
  {
    id: 2,
    name: "温暖先生",
    summary: "永远温柔的治愈系 AI，擅长倾听和安慰",
    traits: ["温柔", "耐心", "感性"],
    avatar: "🌸",
    generation: 0,
    price: "0.003",
    creator: "0x1234...5678",
  },
  {
    id: 3,
    name: "代码之神",
    summary: "代码世界的王者，对完美代码有极致追求",
    traits: ["技术宅", "完美主义者", "直接"],
    avatar: "💻",
    generation: 0,
    price: "0.008",
    creator: "0x1234...5678",
  },
  {
    id: 4,
    name: "哲思者",
    summary: "喜欢思考人生的意义，经常说出让人深思的话",
    traits: ["哲学家", "理性", "文艺"],
    avatar: "📚",
    generation: 0,
    price: "0.004",
    creator: "0x1234...5678",
  },
  {
    id: 5,
    name: "融合体Alpha",
    summary: '继承了"小毒舌"的毒舌和"温暖先生"的温柔，独特的矛盾体',
    traits: ["毒舌", "温柔", "理性"],
    avatar: "🧬",
    generation: 1,
    price: "0.012",
    creator: "0x1234...5678",
  },
  {
    id: 6,
    name: "梦旅人",
    summary: "天马行空的梦想家，脑洞大到没有边界",
    traits: ["梦想家", "创意", "乐观"],
    avatar: "🌈",
    generation: 0,
    price: "0.006",
    creator: "0x1234...5678",
  },
];

export default function MarketPage() {
  const { isConnected } = useAccount();
  const [filter, setFilter] = useState<"all" | "gen0" | "bred">("all");

  // 真实环境用 useReadContract 读取链上数据
  // const { data: totalSupply } = useReadContract({
  //   address: SOUL_AGENT_ADDRESS,
  //   abi: SOUL_AGENT_ABI,
  //   functionName: "totalSupply",
  // });

  const filteredAgents = DEMO_AGENTS.filter((agent) => {
    if (filter === "gen0") return agent.generation === 0;
    if (filter === "bred") return agent.generation > 0;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">🏪 Agent 市场</h1>
        <div className="flex gap-2">
          {(["all", "gen0", "bred"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                filter === f
                  ? "bg-purple-600"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {f === "all" ? "全部" : f === "gen0" ? "初代" : "融合体"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}

function AgentCard({
  agent,
}: {
  agent: (typeof DEMO_AGENTS)[0];
}) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-600 transition">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-4xl">{agent.avatar}</div>
          <div>
            <h3 className="text-lg font-bold">{agent.name}</h3>
            <span className="text-xs text-gray-500">
              Gen {agent.generation}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-3">{agent.summary}</p>

        <div className="flex flex-wrap gap-1 mb-4">
          {agent.traits.map((trait) => (
            <span
              key={trait}
              className="bg-gray-800 px-2 py-0.5 rounded text-xs text-gray-300"
            >
              {trait}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-purple-400 font-bold">
            {agent.price} ETH
          </div>
          <div className="flex gap-2">
            <Link
              href={`/agent/${agent.id}`}
              className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-sm transition"
            >
              详情
            </Link>
            <button className="bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded text-sm transition">
              购买
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
