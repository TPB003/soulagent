"use client";

import Link from "next/link";
import { NFTCard } from "@/components/NFTCard";
import { GenerativeAvatar } from "@/components/GenerativeAvatar";
import { CardSkeleton, EmptyState } from "@/components/ui/primitives";
import { Icons } from "@/components/Icons";
import { formatEth } from "@/lib/display";
import { useAgentDirectory, useBreedFee, useMintFee, useTotalSupply } from "@/lib/hooks";
import { parseEther } from "viem";

const STEPS = [
  { n: "01", title: "连接钱包", body: "用浏览器钱包切到 Base Sepolia。铸造和融合都会在这条测试网上完成。" },
  { n: "02", title: "写下性格", body: "贴一个 GitHub 或 X 链接，让模型读出性格；也可以自己描述。" },
  { n: "03", title: "铸成 NFT", body: "确认交易后，名字、人格和世代写进合约，头像由这些内容确定生成。" },
  { n: "04", title: "对话或融合", body: "和它对谈，或拿出两枚你持有的灵魂，融出下一枚。" },
];

export default function Home() {
  const supply = useTotalSupply();
  const mintFee = useMintFee();
  const breedFee = useBreedFee();
  const ready = supply.data !== undefined;
  const total = ready ? Number(supply.data) : 0;
  const directory = useAgentDirectory(ready ? total : 0);
  const preview = directory.agents.slice(0, 4);
  const mintLabel = formatEth((mintFee.data as bigint | undefined) ?? parseEther("0.001"));
  const breedLabel = formatEth((breedFee.data as bigint | undefined) ?? parseEther("0.002"));

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="live" aria-hidden="true" />
            Base Sepolia 测试网
          </p>
          <h1 className="display">
            铸造一枚
            <br />
            <em>会说话的灵魂</em>
          </h1>
          <p className="lede">
            每个 Agent 都是链上唯一的人格。描述一种性格，把它铸成 NFT，然后直接对话。两枚灵魂还可以融合成下一代。
          </p>
          <div className="statbar" aria-label="链上数据">
            <div className="stat">
              <span>已铸造</span>
              <strong>{ready ? total : "—"}</strong>
            </div>
            <div className="stat">
              <span>铸造费</span>
              <strong>{mintFee.isLoading ? "—" : `${mintLabel} ETH`}</strong>
            </div>
            <div className="stat">
              <span>融合费</span>
              <strong>{breedFee.isLoading ? "—" : `${breedLabel} ETH`}</strong>
            </div>
          </div>
          <div className="cluster">
            <Link href="/mint" className="btn btn-primary btn-lg">
              {Icons.sparkle}
              开始铸造
            </Link>
            <Link href="/market" className="btn btn-secondary btn-lg">
              去市场看看
              {Icons.arrow}
            </Link>
          </div>
        </div>

        <figure className="card hero-panel">
          <GenerativeAvatar name="SoulAgent" traits={["理性", "温柔", "感性"]} size={520} />
          <figcaption>
            <h2>头像随性格生成</h2>
            <p>同一段描述永远得到同一张脸。颜色来自性格，不来自一套库存图。这张是示意，不是在售的 NFT。</p>
          </figcaption>
        </figure>
      </section>

      <section className="section" aria-labelledby="how">
        <div className="section-head">
          <div>
            <h2 id="how">怎么开始</h2>
            <p>四步，从一句话到一枚可以对话的 NFT。</p>
          </div>
        </div>
        <div className="steps">
          {STEPS.map((step) => (
            <article key={step.n} className="card step">
              <span className="num">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="live">
        <div className="section-head">
          <div>
            <h2 id="live">链上的灵魂</h2>
            <p>只显示合约里真实铸出的 Agent。</p>
          </div>
          <Link href="/market" className="linkish">查看全部</Link>
        </div>

        {supply.isError ? (
          <EmptyState
            icon={Icons.market}
            title="链上数据暂时读不到"
            body="和 Base Sepolia 的连接中断了。刷新后再试一次。"
            action={<button type="button" className="btn btn-secondary" onClick={() => supply.refetch()}>重试</button>}
          />
        ) : !ready || directory.isLoading ? (
          <div className="grid-cards" aria-busy="true" aria-label="正在读取链上灵魂">
            {Array.from({ length: 2 }, (_, index) => <CardSkeleton key={index} />)}
          </div>
        ) : total === 0 ? (
          <EmptyState
            icon={Icons.sparkle}
            title="链上还是空的"
            body="第一枚灵魂还没出现。铸造之后，它会显示在这里。"
            action={<Link href="/mint" className="btn btn-primary">铸造第一枚</Link>}
          />
        ) : preview.length === 0 ? (
          <EmptyState
            icon={Icons.market}
            title="有铸造记录，但详情没读到"
            body="合约计数已经回来了，单枚数据暂时失败。"
            action={<button type="button" className="btn btn-secondary" onClick={() => directory.refetch()}>重试</button>}
          />
        ) : (
          <div className="grid-cards">
            {preview.map(({ id, agent }) => <NFTCard key={id} id={id} agent={agent} />)}
          </div>
        )}
      </section>
    </main>
  );
}
