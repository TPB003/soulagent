"use client";

import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import { SOUL_AGENT_ABI, SOUL_AGENT_ADDRESS, type OnChainAgent } from "./contract";
import { isLiveAgent } from "./display";

function safeTokenId(tokenId: number) {
  return Number.isFinite(tokenId) && tokenId > 0 ? Math.floor(tokenId) : 0;
}

// 读取单个 Agent
export function useAgent(tokenId: number) {
  const id = safeTokenId(tokenId);
  return useReadContract({
    address: SOUL_AGENT_ADDRESS,
    abi: SOUL_AGENT_ABI,
    functionName: "getAgent",
    args: [BigInt(id)],
    query: { enabled: id > 0 },
  }) as { data: OnChainAgent | undefined; isLoading: boolean; isError: boolean; error: Error | null; refetch: () => void };
}

// 读取 totalSupply
export function useTotalSupply() {
  return useReadContract({
    address: SOUL_AGENT_ADDRESS,
    abi: SOUL_AGENT_ABI,
    functionName: "totalSupply",
  });
}

export function useMintFee() {
  return useReadContract({
    address: SOUL_AGENT_ADDRESS,
    abi: SOUL_AGENT_ABI,
    functionName: "mintFee",
  });
}

export function useBreedFee() {
  return useReadContract({
    address: SOUL_AGENT_ADDRESS,
    abi: SOUL_AGENT_ABI,
    functionName: "breedFee",
  });
}

// 读取 ownerOf
export function useOwnerOf(tokenId: number) {
  const id = safeTokenId(tokenId);
  return useReadContract({
    address: SOUL_AGENT_ADDRESS,
    abi: SOUL_AGENT_ABI,
    functionName: "ownerOf",
    args: [BigInt(id)],
    query: { enabled: id > 0 },
  }) as { data: string | undefined; isLoading: boolean; isError: boolean };
}

// 读取 children
export function useChildren(tokenId: number) {
  const id = safeTokenId(tokenId);
  return useReadContract({
    address: SOUL_AGENT_ADDRESS,
    abi: SOUL_AGENT_ABI,
    functionName: "getChildren",
    args: [BigInt(id)],
    query: { enabled: id > 0 },
  }) as { data: bigint[] | undefined; isLoading: boolean };
}

export function useAgentDirectory(total: number) {
  const contracts = useMemo(() => {
    return Array.from({ length: Math.max(0, total) }, (_, index) => ({
      address: SOUL_AGENT_ADDRESS,
      abi: SOUL_AGENT_ABI,
      functionName: "getAgent" as const,
      args: [BigInt(index + 1)] as const,
    }));
  }, [total]);

  const query = useReadContracts({
    contracts,
    query: { enabled: total > 0 },
  });

  const agents = useMemo(() => {
    const list: { id: number; agent: OnChainAgent }[] = [];
    query.data?.forEach((item, index) => {
      if (item.status !== "success") return;
      const agent = item.result as unknown as OnChainAgent;
      if (!isLiveAgent(agent)) return;
      list.push({ id: index + 1, agent });
    });
    return list.sort((a, b) => b.id - a.id);
  }, [query.data]);

  return {
    agents,
    isLoading: total > 0 && query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useOwnerDirectory(total: number) {
  const contracts = useMemo(() => {
    return Array.from({ length: Math.max(0, total) }, (_, index) => ({
      address: SOUL_AGENT_ADDRESS,
      abi: SOUL_AGENT_ABI,
      functionName: "ownerOf" as const,
      args: [BigInt(index + 1)] as const,
    }));
  }, [total]);

  const query = useReadContracts({
    contracts,
    query: { enabled: total > 0 },
  });

  const owners = useMemo(() => {
    const map = new Map<number, string>();
    query.data?.forEach((item, index) => {
      if (item.status === "success" && typeof item.result === "string") {
        map.set(index + 1, item.result);
      }
    });
    return map;
  }, [query.data]);

  return {
    owners,
    isLoading: total > 0 && query.isLoading,
    refetch: query.refetch,
  };
}

// BaseScan URL helpers
export const BASESCAN_TX = (hash: string) => `https://sepolia.basescan.org/tx/${hash}`;
export const BASESCAN_ADDR = (addr: string) => `https://sepolia.basescan.org/address/${addr}`;
export const BASESCAN_NFT = (id: number) => `https://sepolia.basescan.org/token/${SOUL_AGENT_ADDRESS}?a=${id}`;
