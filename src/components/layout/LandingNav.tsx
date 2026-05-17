"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export const WalletButton = () => (
  <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
);
