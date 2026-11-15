"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@/components/ConnectButton";
import { Icons } from "@/components/Icons";
import { BASESCAN_CONTRACT } from "@/lib/contract";

const LINKS = [
  { href: "/mint", label: "铸造", icon: Icons.mint },
  { href: "/fuse", label: "融合", icon: Icons.dna },
  { href: "/market", label: "市场", icon: Icons.market },
  { href: "/my-agents", label: "我的", icon: Icons.user },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <div className="nav-left">
            <Link href="/" className="brand" aria-label="SoulAgent 首页">
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="7" />
                  <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
                </svg>
              </span>
              SoulAgent
            </Link>
            <nav className="nav-links" aria-label="主导航">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link"
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="nav-right">
            <a className="chain" href={BASESCAN_CONTRACT()} target="_blank" rel="noopener noreferrer">
              <span className="live" aria-hidden="true" />
              <span className="label">Base Sepolia</span>
            </a>
            <ConnectButton />
          </div>
        </div>
      </header>
      <nav className="tabbar" aria-label="页面">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="tab-link"
            aria-current={pathname === link.href ? "page" : undefined}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
