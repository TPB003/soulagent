"use client";

import Link from "next/link";
import { GenerativeAvatar } from "@/components/GenerativeAvatar";
import { agentBlurb, agentTraits, formatEth, generationLabel } from "@/lib/display";
import type { OnChainAgent } from "@/lib/contract";

export function NFTCard({ id, agent }: { id: number; agent: OnChainAgent }) {
  const listed = agent.price > BigInt(0);
  const gen = Number(agent.generation);
  const traits = agentTraits(agent);
  const blurb = agentBlurb(agent);

  return (
    <Link href={`/agent/${id}`} className="card card-link">
      <div className="nft-art">
        <GenerativeAvatar name={agent.name} traits={traits} fluid />
      </div>
      <div className="nft-body">
        <div className="cluster" style={{ gap: 6 }}>
          <span className="badge">{generationLabel(gen)}</span>
          <span className="num" style={{ color: "var(--dim)", fontSize: 12 }}>#{id}</span>
        </div>
        <h3>{agent.name}</h3>
        <p>{blurb}</p>
        {traits.length > 0 && (
          <div className="tags">
            {traits.map((trait) => (
              <span key={trait} className="tag">{trait}</span>
            ))}
          </div>
        )}
        <div className="nft-meta">
          {listed ? (
            <b className="num">{formatEth(agent.price)} ETH</b>
          ) : (
            <b style={{ color: "var(--faint)", fontWeight: 500 }}>未上架</b>
          )}
          <span className={listed ? "badge badge-live" : "badge"}>{listed ? "在售" : "查看"}</span>
        </div>
      </div>
    </Link>
  );
}
