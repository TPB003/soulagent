import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import NavBar from "@/components/NavBar";
import { ToastProvider } from "@/components/ui/toast";
import { BASESCAN_CONTRACT } from "@/lib/contract";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "SoulAgent — AI 人格 NFT",
  description: "在 Base Sepolia 上铸造一枚 AI 人格 NFT，与它对话，或让两枚灵魂融合成下一代。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <Providers>
          <ToastProvider>
            <a className="skip" href="#content">跳到主要内容</a>
            <NavBar />
            <div id="content">{children}</div>
            <footer className="site-footer">
              <div className="site-footer-inner">
                <span>SoulAgent</span>
                <a href={BASESCAN_CONTRACT()} target="_blank" rel="noopener noreferrer">
                  查看合约
                </a>
                <span>Base Sepolia</span>
              </div>
            </footer>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
