"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, injected, WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";

// Injected + EIP-6963 only. WalletConnect, MetaMask SDK, Coinbase, and Base
// Account stay optional peers of wagmi and are not imported, so their
// vulnerable trees are not installed.
export const config = createConfig({
  chains: [baseSepolia],
  connectors: [injected()],
  multiInjectedProviderDiscovery: true,
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
  ssr: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 2, staleTime: 30_000 } },
  }));

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
