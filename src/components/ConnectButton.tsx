"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { baseSepolia } from "wagmi/chains";

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);

  if (isConnected && address) {
    return (
      <button
        type="button"
        onClick={() => disconnect()}
        className="btn-ghost"
        title="断开钱包"
        style={{ fontSize: 13, padding: "8px 14px" }}
      >
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

  const errorName = error ? String(error.name) : "";
  const message = !error
    ? null
    : errorName === "ProviderNotFoundError"
      ? "未检测到浏览器钱包。请安装 MetaMask 或 Rabby。"
      : "shortMessage" in error && typeof error.shortMessage === "string"
        ? error.shortMessage
        : error.message;

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className="btn-primary"
        disabled={isPending || choices.length === 0}
        onClick={() => {
          if (choices.length <= 1 && choices[0]) connectWith(choices[0]);
          else setOpen((value) => !value);
        }}
        style={{ fontSize: 13, padding: "8px 14px" }}
      >
        {isPending ? "连接中..." : "连接钱包"}
      </button>
      {open && choices.length > 1 && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            minWidth: 180,
            zIndex: 60,
            background: "rgba(12,12,16,0.96)",
            border: "1px solid var(--border-default)",
            borderRadius: 8,
            padding: 6,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {choices.map((connector) => (
            <button
              key={connector.uid}
              type="button"
              onClick={() => connectWith(connector)}
              style={{
                textAlign: "left",
                background: "transparent",
                color: "var(--text-primary)",
                border: "none",
                borderRadius: 6,
                padding: "8px 10px",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {connector.name}
            </button>
          ))}
        </div>
      )}
      {message && (
        <p role="alert" style={{
          position: "absolute",
          right: 0,
          top: "calc(100% + 8px)",
          width: 240,
          margin: 0,
          fontSize: 12,
          lineHeight: 1.4,
          color: "var(--red)",
          background: "rgba(12,12,16,0.96)",
          border: "1px solid rgba(248,113,113,0.25)",
          borderRadius: 8,
          padding: "8px 10px",
          zIndex: 60,
        }}>
          {message}
        </p>
      )}
    </div>
  );
}
