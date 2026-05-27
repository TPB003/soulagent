"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="border-b border-gray-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold hover:opacity-80">
          🧬 SoulAgent
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/mint" className="hover:text-purple-400 transition">
            铸造
          </Link>
          <Link href="/market" className="hover:text-purple-400 transition">
            市场
          </Link>
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}
