import type { NextConfig } from "next";

// @coinbase/cdp-sdk (pulled in by wagmi's Base Account connector) dynamically
// imports optional @x402/* peers that this app never installs. Next's bundler
// still resolves those specifiers at build time. Point them at nothing so
// `next build` succeeds; the SDK only loads them when signing x402 payments.
const optionalX402Aliases = {
  "@x402/core/client": false,
  "@x402/evm": false,
  "@x402/evm/exact/client": false,
  "@x402/evm/upto/client": false,
  "@x402/svm/exact/client": false,
} as const;

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: { ...optionalX402Aliases },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...optionalX402Aliases,
    };
    return config;
  },
};

export default nextConfig;
