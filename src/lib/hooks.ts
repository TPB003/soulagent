"use client";

import { useReadContract } from "wagmi";
import { SOUL_AGENT_ABI, SOUL_AGENT_ADDRESS, type OnChainAgent } from "./contract";

// 读取单个 Agent
export function useAgent(tokenId: number) {
  return useReadContract({
    address: SOUL_AGENT_ADDRESS,
    abi: SOUL_AGENT_ABI,
    functionName: "agents",
    args: [BigInt(tokenId)],
  }) as { data: OnChainAgent | undefined; isLoading: boolean; error: Error | null; refetch: () => void };
}

// 读取 totalSupply
export function useTotalSupply() {
  return useReadContract({
    address: SOUL_AGENT_ADDRESS,
    abi: SOUL_AGENT_ABI,
    functionName: "totalSupply",
  }) as { data: bigint | undefined; isLoading: boolean };
}

// 读取 ownerOf
export function useOwnerOf(tokenId: number) {
  return useReadContract({
    address: SOUL_AGENT_ADDRESS,
    abi: SOUL_AGENT_ABI,
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
  }) as { data: string | undefined; isLoading: boolean };
}

// 读取 children
export function useChildren(tokenId: number) {
  return useReadContract({
    address: SOUL_AGENT_ADDRESS,
    abi: SOUL_AGENT_ABI,
    functionName: "getChildren",
    args: [BigInt(tokenId)],
  }) as { data: bigint[] | undefined; isLoading: boolean };
}

// 批量读取多个 Agent（用 Promise.all 模式）
export function useAgents(startId: number, count: number) {
  // 构造多个 read 请求
  const reads = Array.from({ length: count }, (_, i) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useReadContract({
      address: SOUL_AGENT_ADDRESS,
      abi: SOUL_AGENT_ABI,
      functionName: "agents",
      args: [BigInt(startId + i)],
    });
  });

  return reads.map((r, i) => ({
    id: startId + i,
    data: r.data as OnChainAgent | undefined,
    isLoading: r.isLoading,
  }));
}

// BaseScan URL helpers
export const BASESCAN_TX = (hash: string) => `https://sepolia.basescan.org/tx/${hash}`;
export const BASESCAN_ADDR = (addr: string) => `https://sepolia.basescan.org/address/${addr}`;
export const BASESCAN_NFT = (id: number) => `https://sepolia.basescan.org/token/${SOUL_AGENT_ADDRESS}?a=${id}`;
