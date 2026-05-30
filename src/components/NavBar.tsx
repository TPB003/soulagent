"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { Icons } from "./Icons";

export default function NavBar() {
  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: "rgba(8,9,10,0.85)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
          color: "var(--text-primary)",
          fontSize: 15,
          fontWeight: 510,
          letterSpacing: "-0.3px",
        }}>
          <span style={{ color: "var(--accent)" }}>{Icons.soul}</span>
          <span>SoulAgent</span>
        </Link>

        {/* Nav Links + Wallet */}
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
    <Link
      href={href}
      style={{
        fontSize: 13,
        fontWeight: 510,
        textDecoration: "none",
        color: "var(--text-secondary)",
        transition: "color 0.2s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; }}
    >
      {label}
    </Link>
  );
}
