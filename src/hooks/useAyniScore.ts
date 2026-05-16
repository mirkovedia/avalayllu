"use client";

import { useReadContract } from "wagmi";
import { ADDRESSES, AYNI_SCORE_ABI } from "@/lib/contracts";

export const useAyniScore = (userAddress: `0x${string}` | undefined) => {
  return useReadContract({
    address: ADDRESSES.AYNI_SCORE,
    abi: AYNI_SCORE_ABI,
    functionName: "getScore",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });
};

export const useAyniScoreRecord = (userAddress: `0x${string}` | undefined) => {
  return useReadContract({
    address: ADDRESSES.AYNI_SCORE,
    abi: AYNI_SCORE_ABI,
    functionName: "getFullRecord",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });
};

export const useAyniScoreHistory = (userAddress: `0x${string}` | undefined) => {
  return useReadContract({
    address: ADDRESSES.AYNI_SCORE,
    abi: AYNI_SCORE_ABI,
    functionName: "getHistory",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });
};
