"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="text-8xl mb-6">🧬</div>
      <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        SoulAgent
      </h1>
      <p className="text-xl text-gray-400 mb-8 max-w-2xl">
        铸造你专属的 AI Agent 人格 NFT
        <br />
        两个灵魂可以融合，诞生全新的数字生命
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl">
        <FeatureCard
          icon="🎨"
          title="铸造灵魂"
          desc="描述你想要的 AI 性格，铸造为独一无二的 NFT"
        />
        <FeatureCard
          icon="🧬"
          title="融合生命"
          desc="两个 Agent NFT 融合，继承双方特质并产生突变"
        />
        <FeatureCard
          icon="💬"
          title="对话体验"
          desc="和你的 Agent 对话，感受它独特的性格魅力"
        />
      </div>

      <div className="flex gap-4">
        <Link
          href="/mint"
          className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-semibold transition"
        >
          开始铸造
        </Link>
        <Link
          href="/market"
          className="border border-purple-600 hover:bg-purple-900/30 px-8 py-3 rounded-lg font-semibold transition"
        >
          浏览市场
        </Link>
      </div>

      <div className="mt-16 text-sm text-gray-600">
        <p>Built on Base Sepolia | Powered by AI + Web3</p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-600 transition">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}
