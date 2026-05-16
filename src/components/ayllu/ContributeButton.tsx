"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useContribute } from "@/hooks/useAylluPool";
import { useUsdcAllowance, useApproveUsdc } from "@/hooks/useWallet";
import { useToast } from "@/components/ui/Toast";
import { ADDRESSES } from "@/lib/contracts";
import { formatUSDC, snowscanTxUrl } from "@/lib/utils";
import { CheckCircle, ExternalLink, Coins } from "lucide-react";

interface ContributeButtonProps {
  aylluId: bigint;
  contributionAmount: bigint;
  userAddress: `0x${string}`;
  hasContributed: boolean;
  isActive: boolean;
}

type Step = "idle" | "approving" | "contributing" | "success";

export const ContributeButton = ({
  aylluId,
  contributionAmount,
  userAddress,
  hasContributed,
  isActive,
}: ContributeButtonProps) => {
  const [step, setStep] = useState<Step>("idle");
  const { addToast, updateToast } = useToast();

  const { data: allowance, refetch: refetchAllowance } = useUsdcAllowance(userAddress, ADDRESSES.AYLLU_POOL);
  const { approve, isPending: isApproving, isSuccess: approveSuccess } = useApproveUsdc();
  const { contribute, isPending: isContributing, isSuccess: contributeSuccess, hash } = useContribute();

  const needsApproval = allowance !== undefined && allowance < contributionAmount;

  useEffect(() => {
    if (approveSuccess && step === "approving") {
      refetchAllowance();
      setStep("contributing");
      contribute(aylluId);
    }
  }, [approveSuccess, step, refetchAllowance, contribute, aylluId]);

  useEffect(() => {
    if (contributeSuccess && hash) {
      setStep("success");
      addToast({
        type: "success",
        title: "Contribucion exitosa",
        description: `Aportaste $${formatUSDC(contributionAmount)} USDC al Ayllu`,
        txHash: hash,
      });
    }
  }, [contributeSuccess, hash, addToast, contributionAmount]);

  const handleContribute = () => {
    const toastId = addToast({
      type: "loading",
      title: needsApproval ? "Aprobando USDC..." : "Enviando contribucion...",
      description: "Confirma la transaccion en tu wallet",
    });

    if (needsApproval) {
      setStep("approving");
      approve(ADDRESSES.AYLLU_POOL, contributionAmount);
    } else {
      setStep("contributing");
      contribute(aylluId);
    }

    setTimeout(() => updateToast(toastId, { type: "loading", title: "Procesando en blockchain..." }), 3000);
  };

  if (!isActive) {
    return (
      <Button variant="secondary" disabled>
        Ayllu no activo
      </Button>
    );
  }

  if (hasContributed) {
    return (
      <Button variant="secondary" disabled className="gap-2">
        <CheckCircle className="h-4 w-4 text-green-400" />
        Ya contribuiste esta ronda
      </Button>
    );
  }

  if (step === "success" && hash) {
    return (
      <div className="space-y-2">
        <Button variant="secondary" disabled className="gap-2 w-full">
          <CheckCircle className="h-4 w-4 text-green-400" />
          Contribucion exitosa
        </Button>
        <a
          href={snowscanTxUrl(hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 text-xs text-ayllu-sun hover:underline"
        >
          Ver en Snowscan
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }

  return (
    <Button
      onClick={handleContribute}
      isLoading={isApproving || isContributing}
      className="w-full gap-2"
    >
      <Coins className="h-4 w-4" />
      {step === "approving"
        ? "Aprobando USDC..."
        : step === "contributing"
        ? "Contribuyendo..."
        : `Aportar $${formatUSDC(contributionAmount)} USDC`}
    </Button>
  );
};
