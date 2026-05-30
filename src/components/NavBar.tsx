"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { Icons } from "./Icons";
import { BASESCAN_CONTRACT } from "@/lib/contract";

export default function NavBar() {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(8,9,10,0.85)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 10,
          textDecoration: "none", color: "var(--text-primary)",
          fontSize: 15, fontWeight: 510, letterSpacing: "-0.3px",
        }}>
          <span style={{ color: "var(--accent)" }}>{Icons.soul}</span>
          <span>SoulAgent</span>
        </Link>

        {/* Center — Network + Contract */}
        <a href={BASESCAN_CONTRACT()} target="_blank" rel="noopener noreferrer" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "5px 12px", borderRadius: 9999,
          border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)",
          fontSize: 11, color: "var(--text-tertiary)", letterSpacing: "0.5px",
          textDecoration: "none", transition: "all 0.2s",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(94,106,210,0.3)"; e.currentTarget.style.color = "var(--accent)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-tertiary)"; }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px rgba(16,185,129,0.4)" }} />
          <span>Base Sepolia · Contract ↗</span>
        </a>

        {/* Right — Nav + Wallet */}
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <NavLink href="/mint" label="铸造" />
          <NavLink href="/market" label="市场" />
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} style={{
      fontSize: 13, fontWeight: 510, textDecoration: "none",
      color: "var(--text-secondary)", transition: "color 0.2s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; }}
    >
      {label}
    </Link>
  );
}
