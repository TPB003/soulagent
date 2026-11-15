"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { NFTCard } from "@/components/NFTCard";
import { CardSkeleton, EmptyState, FilterBar } from "@/components/ui/primitives";
import { Icons } from "@/components/Icons";
import { useAgentDirectory, useTotalSupply } from "@/lib/hooks";

const FILTERS = [
  { value: "all", label: "全部" },
  { value: "gen0", label: "初代" },
  { value: "fused", label: "融合代" },
  { value: "listed", label: "在售" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

export default function MarketPage() {
  const supply = useTotalSupply();
  const ready = supply.data !== undefined;
  const total = ready ? Number(supply.data) : 0;
  const directory = useAgentDirectory(ready ? total : 0);
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    return directory.agents.filter(({ agent }) => {
      const gen = Number(agent.generation);
      if (filter === "gen0") return gen === 0;
      if (filter === "fused") return gen >= 1;
      if (filter === "listed") return agent.price > BigInt(0);
      return true;
    });
  }, [directory.agents, filter]);

  const loading = !ready || directory.isLoading;

  return (
    <main className="page">
      <header className="page-head">
        <h1 className="page-title">市场</h1>
        <p className="lede">
          {ready ? `链上共 ${total} 枚灵魂。在售的可以直接买下，没上架的也能点进去对话。` : "正在读取链上的灵魂。"}
        </p>
      </header>

      <FilterBar label="筛选灵魂" value={filter} onChange={setFilter} options={[...FILTERS]} />

      <div style={{ height: 18 }} />

      {supply.isError || directory.isError ? (
        <EmptyState
          icon={Icons.market}
          title="市场暂时读不到"
          body="链上请求失败了。筛选条件还在，数据回来之后会按它显示。"
          action={<button type="button" className="btn btn-secondary" onClick={() => { supply.refetch(); directory.refetch(); }}>重试</button>}
        />
      ) : loading ? (
        <div className="grid-cards" aria-busy="true" aria-label="正在加载市场">
          {Array.from({ length: 4 }, (_, index) => <CardSkeleton key={index} />)}
        </div>
      ) : total === 0 ? (
        <EmptyState
          icon={Icons.sparkle}
          title="还没有人铸造"
          body="市场是空的。第一枚灵魂出现之后，会按世代和是否在售筛选。"
          action={<Link href="/mint" className="btn btn-primary">去铸造</Link>}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Icons.market}
          title="这个条件下没有灵魂"
          body={filter === "listed" ? "现在没有挂单。持有者上架之后会出现在这里。" : "换一个筛选，或者看看全部。"}
          action={<button type="button" className="btn btn-secondary" onClick={() => setFilter("all")}>看全部</button>}
        />
      ) : (
        <div className="grid-cards">
          {visible.map(({ id, agent }) => <NFTCard key={id} id={id} agent={agent} />)}
        </div>
      )}
    </main>
  );
}
