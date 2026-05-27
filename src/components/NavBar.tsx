"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useState } from "react";

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: "rgba(3,3,3,0.9)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Desktop */}
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Link href="/" style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
          color: "#fff",
          fontSize: 15,
          fontWeight: 600,
        }}>
          <span>🧬</span>
          <span>SoulAgent</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <NavLink href="/mint" label="铸造" icon="🎨" />
          <NavLink href="/market" label="市场" icon="🏪" />
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      textDecoration: "none",
      color: "rgba(255,255,255,0.6)",
      fontSize: 13,
      fontWeight: 500,
      transition: "all 0.2s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "scale(1.05)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.transform = "scale(1)"; }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
