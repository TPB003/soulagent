"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { shortAddress } from "@/lib/display";
import { useToast } from "@/components/ui/toast";

function Identicon({ address }: { address: string }) {
  const hue = Number.parseInt(address.slice(2, 8), 16) % 360;
  return (
    <span
      className="ident"
      aria-hidden="true"
      style={{
        background: `conic-gradient(from 140deg, hsl(${hue} 70% 62%), hsl(${(hue + 48) % 360} 55% 42%), hsl(${hue} 70% 62%))`,
      }}
    />
  );
}

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    if (!error) return;
    const name = String(error.name);
    const detail = name === "ProviderNotFoundError"
      ? "没有检测到浏览器钱包。请安装 MetaMask 或 Rabby。"
      : "shortMessage" in error && typeof error.shortMessage === "string"
        ? error.shortMessage
        : error.message;
    push({ id: "wallet", tone: "error", title: "钱包没有连上", detail });
  }, [error, push]);

  if (isConnected && address) {
    return (
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        title="断开钱包"
        onClick={() => disconnect()}
      >
        <Identicon address={address} />
        {shortAddress(address)}
      </button>
    );
  }

  const discovered = connectors.filter((connector) => connector.id !== "injected");
  const choices = discovered.length > 0 ? discovered : connectors;

  const connectWith = (connector: (typeof choices)[number]) => {
    connect({ connector, chainId: baseSepolia.id });
    setOpen(false);
  };

  return (
    <div className="wallet">
      <button
        type="button"
        className="btn btn-primary btn-sm"
        disabled={isPending || choices.length === 0}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => {
          if (choices.length <= 1 && choices[0]) connectWith(choices[0]);
          else setOpen((value) => !value);
        }}
      >
        {isPending ? "连接中…" : "连接钱包"}
      </button>
      {open && choices.length > 1 && (
        <div className="menu" role="menu">
          {choices.map((connector) => (
            <button key={connector.uid} type="button" role="menuitem" onClick={() => connectWith(connector)}>
              {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
