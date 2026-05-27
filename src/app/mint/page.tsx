"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { generatePersonality, AgentPersonality, generateRadarFromDescription } from "@/lib/ai";
import { SOUL_AGENT_ABI, SOUL_AGENT_ADDRESS } from "@/lib/contract";

export default function MintPage() {
  const { isConnected } = useAccount();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [personality, setPersonality] = useState<AgentPersonality | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<"input" | "preview" | "minting" | "done">("input");

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleGenerate = async () => {
    if (!name || !description) return;
    setIsGenerating(true);
    const result = await generatePersonality(name, description);
    setPersonality(result);
    setStep("preview");
    setIsGenerating(false);
  };

  const handleMint = async () => {
    if (!personality) return;
    setStep("minting");

    try {
      writeContract({
        address: SOUL_AGENT_ADDRESS,
        abi: SOUL_AGENT_ABI,
        functionName: "mint",
        args: [
          personality.name,
          personality.summary, // 简单场景直接存 summary
          personality.fullPrompt,
        ],
        value: parseEther("0.001"),
      });
    } catch (err) {
      console.error("Mint failed:", err);
      setStep("preview");
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-8xl mb-6">{personality?.avatar || "🧬"}</div>
        <h2 className="text-3xl font-bold mb-4 text-green-400">
          铸造成功！
        </h2>
        <p className="text-gray-400 mb-2">{personality?.name} 已诞生</p>
        <p className="text-sm text-gray-500 mb-8">
          Transaction: {hash?.slice(0, 10)}...
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setStep("input");
              setName("");
              setDescription("");
              setPersonality(null);
            }}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition"
          >
            再铸造一个
          </button>
          <a
            href="/market"
            className="border border-gray-600 hover:bg-gray-800 px-6 py-2 rounded-lg transition"
          >
            去市场看看
          </a>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-6xl mb-6">🔐</div>
        <h2 className="text-2xl font-bold mb-4">请先连接钱包</h2>
        <p className="text-gray-400 mb-8">铸造 Agent NFT 需要连接钱包</p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🎨 铸造你的 AI 灵魂
      </h1>

      {step === "input" && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Agent 名字
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：小毒舌、温暖先生、代码之神"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-purple-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              性格描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述你想要的 AI 性格，越详细越好...&#10;例如：一个毒舌但内心温暖的程序员，说话犀利但从不恶意伤人"
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-purple-500 focus:outline-none transition resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!name || !description || isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition"
          >
            {isGenerating ? "🔮 生成中..." : "✨ 生成人格预览"}
          </button>
        </div>
      )}

      {step === "preview" && personality && (
        <div className="space-y-6">
          {/* 预览卡片 */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-6xl">{personality.avatar}</div>
              <div>
                <h2 className="text-2xl font-bold">{personality.name}</h2>
                <p className="text-gray-400">{personality.summary}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {personality.traits.map((trait) => (
                <span
                  key={trait}
                  className="bg-purple-900/50 border border-purple-600 px-3 py-1 rounded-full text-sm"
                >
                  {trait}
                </span>
              ))}
            </div>

            {/* 雷达图占位 */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">性格雷达</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                {Object.entries(generateRadarFromDescription(description)).map(
                  ([key, value]) => (
                    <div key={key} className="text-xs">
                      <div className="text-gray-400">
                        {key === "humor"
                          ? "幽默"
                          : key === "kindness"
                          ? "温柔"
                          : key === "intelligence"
                          ? "智慧"
                          : key === "creativity"
                          ? "创意"
                          : key === "directness"
                          ? "直接"
                          : "耐心"}
                      </div>
                      <div className="text-purple-400 font-bold">{value}</div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <h3 className="text-sm font-medium mb-2">系统 Prompt 预览</h3>
            <pre className="text-xs text-gray-400 whitespace-pre-wrap overflow-auto max-h-40">
              {personality.fullPrompt}
            </pre>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep("input")}
              className="flex-1 border border-gray-600 hover:bg-gray-800 py-3 rounded-lg transition"
            >
              返回修改
            </button>
            <button
              onClick={handleMint}
              disabled={isPending || isConfirming}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 py-3 rounded-lg font-semibold transition"
            >
              {isPending || isConfirming
                ? "⏳ 铸造中..."
                : "🧬 铸造 NFT (0.001 ETH)"}
            </button>
          </div>
        </div>
      )}

      {step === "minting" && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4 animate-pulse">🧬</div>
          <h2 className="text-xl font-semibold mb-2">灵魂铸造中...</h2>
          <p className="text-gray-400">请在钱包中确认交易</p>
        </div>
      )}
    </div>
  );
}
