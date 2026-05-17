"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { avalancheFuji, type Chain } from "viem/chains";
import { http } from "wagmi";

const hardhatLocal: Chain = {
  id: 31337,
  name: "Hardhat Local",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
  testnet: true,
};

const isDev = process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_USE_FUJI;
const chain = isDev ? hardhatLocal : avalancheFuji;
const rpcUrl = isDev ? "http://127.0.0.1:8545" : "https://api.avax-test.network/ext/bc/C/rpc";

export const config = getDefaultConfig({
  appName: "AvalAyllu",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo",
  chains: [chain],
  transports: {
    [chain.id]: http(rpcUrl),
  },
  ssr: true,
});
