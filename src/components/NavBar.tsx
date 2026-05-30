"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { Icons } from "./Icons";
import { BASESCAN_CONTRACT } from "@/lib/contract";

export default function NavBar() {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(3,3,3,0.7)",
      backdropFilter: "blur(20px) saturate(1.2)",
      WebkitBackdropFilter: "blur(20px) saturate(1.2)",
      borderBottom: "1px solid var(--border-faint)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 10,
          textDecoration: "none", color: "var(--text-primary)",
          fontSize: 15, fontWeight: 600, letterSpacing: "-0.4px",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: "linear-gradient(135deg, var(--brand) 0%, var(--cyan) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(99,102,241,0.3)",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <span>SoulAgent</span>
        </Link>

        {/* Center — Chain badge */}
        <a href={BASESCAN_CONTRACT()} target="_blank" rel="noopener noreferrer"
          className="pill"
          style={{ textDecoration: "none", transition: "all 0.2s", cursor: "pointer" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border-accent)";
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(99,102,241,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-subtle)";
            e.currentTarget.style.color = "var(--text-tertiary)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--green)",
            boxShadow: "0 0 8px rgba(52,211,153,0.5)",
            animation: "glow-pulse 2s ease-in-out infinite",
          }} />
          <span>Base Sepolia</span>
          <span style={{ opacity: 0.5 }}>↗</span>
        </a>

        {/* Right — Nav + Wallet */}
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <NavLink href="/mint" label="铸造" />
          <NavLink href="/fuse" label="融合" />
          <NavLink href="/market" label="市场" />
          <NavLink href="/my-agents" label="我的" />
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} style={{
      fontSize: 13, fontWeight: 500, textDecoration: "none",
      color: "var(--text-tertiary)", transition: "all 0.2s",
      padding: "4px 0", position: "relative",
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-tertiary)";
      }}
    >
      {label}
    </Link>
  );
}
