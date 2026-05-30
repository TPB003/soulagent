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
      background: "rgba(3,3,3,0.85)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
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
          gap: 10,
          textDecoration: "none",
          color: "#fff",
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "-0.3px",
        }}>
          <span style={{ color: "rgba(255,255,255,0.8)" }}>{Icons.soul}</span>
          <span>SoulAgent</span>
        </Link>

        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <NavLink href="/mint" label="铸造" icon={Icons.mint} />
          <NavLink href="/market" label="市场" icon={Icons.market} />
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        textDecoration: "none",
        color: "rgba(255,255,255,0.5)",
        fontSize: 13,
        fontWeight: 500,
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#fff";
        e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "rgba(255,255,255,0.5)";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <span style={{ display: "flex", opacity: 0.7 }}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
