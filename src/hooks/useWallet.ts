"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ADDRESSES, MOCK_USDC_ABI } from "@/lib/contracts";

export const useWalletInfo = () => {
  const { address, isConnected, chain } = useAccount();
  return { address, isConnected, chain };
};

export const useUsdcBalance = (address: `0x${string}` | undefined) => {
  return useReadContract({
    address: ADDRESSES.MOCK_USDC,
    abi: MOCK_USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
};

export const useUsdcAllowance = (
  owner: `0x${string}` | undefined,
  spender: `0x${string}`
) => {
  return useReadContract({
    address: ADDRESSES.MOCK_USDC,
    abi: MOCK_USDC_ABI,
    functionName: "allowance",
    args: owner ? [owner, spender] : undefined,
    query: {
      enabled: !!owner,
    },
  });
};

export const useApproveUsdc = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = (spender: `0x${string}`, amount: bigint) => {
    writeContract({
      address: ADDRESSES.MOCK_USDC,
      abi: MOCK_USDC_ABI,
      functionName: "approve",
      args: [spender, amount],
    });
  };

  return { approve, isPending, isConfirming, isSuccess, hash, error };
};

export const useMintUsdc = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const mint = (to: `0x${string}`, amount: bigint) => {
    writeContract({
      address: ADDRESSES.MOCK_USDC,
      abi: MOCK_USDC_ABI,
      functionName: "mint",
      args: [to, amount],
    });
  };

  return { mint, isPending, isConfirming, isSuccess, hash, error };
};
