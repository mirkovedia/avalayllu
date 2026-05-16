"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { ADDRESSES, AYLLU_POOL_ABI } from "@/lib/contracts";

export const useAyllu = (aylluId: bigint) => {
  return useReadContract({
    address: ADDRESSES.AYLLU_POOL,
    abi: AYLLU_POOL_ABI,
    functionName: "getAyllu",
    args: [aylluId],
  });
};

export const useAylluMembers = (aylluId: bigint) => {
  return useReadContract({
    address: ADDRESSES.AYLLU_POOL,
    abi: AYLLU_POOL_ABI,
    functionName: "getMembers",
    args: [aylluId],
  });
};

export const useRoundInfo = (aylluId: bigint) => {
  return useReadContract({
    address: ADDRESSES.AYLLU_POOL,
    abi: AYLLU_POOL_ABI,
    functionName: "getRoundInfo",
    args: [aylluId],
  });
};

export const useNextAylluId = () => {
  return useReadContract({
    address: ADDRESSES.AYLLU_POOL,
    abi: AYLLU_POOL_ABI,
    functionName: "nextAylluId",
  });
};

export const useCreateAyllu = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createAyllu = (
    name: string,
    maxMembers: number,
    contributionUsdc: number,
    roundDurationSeconds: number
  ) => {
    writeContract({
      address: ADDRESSES.AYLLU_POOL,
      abi: AYLLU_POOL_ABI,
      functionName: "createAyllu",
      args: [
        name,
        maxMembers,
        parseUnits(contributionUsdc.toString(), 6),
        BigInt(roundDurationSeconds),
      ],
    });
  };

  return { createAyllu, isPending, isConfirming, isSuccess, hash, error };
};

export const useJoinAyllu = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const joinAyllu = (aylluId: bigint) => {
    writeContract({
      address: ADDRESSES.AYLLU_POOL,
      abi: AYLLU_POOL_ABI,
      functionName: "joinAyllu",
      args: [aylluId],
    });
  };

  return { joinAyllu, isPending, isConfirming, isSuccess, hash, error };
};

export const useContribute = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const contribute = (aylluId: bigint) => {
    writeContract({
      address: ADDRESSES.AYLLU_POOL,
      abi: AYLLU_POOL_ABI,
      functionName: "contribute",
      args: [aylluId],
    });
  };

  return { contribute, isPending, isConfirming, isSuccess, hash, error };
};
