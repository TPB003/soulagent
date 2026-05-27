import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";
import "@rainbow-me/rainbowkit/styles.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "SoulAgent - AI 人格 NFT",
  description: "铸造你的 AI Agent 人格 NFT，两个灵魂可以融合诞生新生命",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-950 text-white min-h-screen">
        <Providers>
          <NavBar />
          <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
