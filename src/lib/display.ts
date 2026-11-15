import { formatEther } from "viem";
import type { OnChainAgent } from "./contract";

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatEth(value: bigint) {
  const raw = formatEther(value);
  if (!raw.includes(".")) return raw;
  return raw.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
}

export function agentBlurb(agent: OnChainAgent) {
  const brief = agent.personalityHash?.trim() ?? "";
  if (brief && !brief.startsWith("你是") && brief.length <= 80) return brief;
  const line = (agent.personalitySummary ?? "")
    .split("\n")
    .map((item) => item.trim())
    .find(Boolean);
  if (!line) return "这枚灵魂还没有写下简介";
  return line.length > 80 ? `${line.slice(0, 80)}…` : line;
}

export function portraitTraits(traits: string[]) {
  const seen = new Set<string>();
  const clean: string[] = [];
  for (const trait of traits) {
    const value = trait.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    clean.push(value);
  }
  return clean;
}

/** Keep the trait list inside the stored prompt so later reads rebuild the same portrait. */
export function promptWithTraits(prompt: string, traits: string[]) {
  const clean = portraitTraits(traits);
  const base = prompt.replace(/\n?性格标签[:：][^\n]*/g, "").trim();
  if (clean.length === 0) return base;
  return `${base}\n性格标签：${clean.join("、")}`;
}

export function agentTraits(agent: OnChainAgent) {
  const source = `${agent.personalitySummary ?? ""}\n${agent.personalityHash ?? ""}`;
  const matched = source.match(/性格标签[:：]\s*([^\n]+)/);
  if (!matched) return [];
  return portraitTraits(matched[1].split(/[、,，]/));
}

export function generationLabel(gen: number) {
  return gen <= 0 ? "初代" : `第 ${gen} 代`;
}

export function isLiveAgent(agent: OnChainAgent | undefined | null): agent is OnChainAgent {
  return Boolean(agent && agent.name && Number(agent.createdAt) > 0);
}
