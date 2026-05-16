"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatUSDC, shortenAddress, timeRemaining } from "@/lib/utils";
import { Clock, Coins, User } from "lucide-react";

interface AylluRoundProps {
  currentRound: number;
  totalRounds: number;
  potAmount: bigint;
  roundEndsAt: bigint;
  roundRecipient: string;
  contributionAmount: bigint;
  paidCount: number;
  totalMembers: number;
}

export const AylluRound = ({
  currentRound,
  totalRounds,
  potAmount,
  roundEndsAt,
  roundRecipient,
  contributionAmount,
  paidCount,
  totalMembers,
}: AylluRoundProps) => {
  const expectedPot = contributionAmount * BigInt(totalMembers);
  const progressPercent = totalMembers > 0 ? (paidCount / totalMembers) * 100 : 0;

  return (
    <Card className="border-ayllu-sun/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Ronda {currentRound + 1} de {totalRounds}</CardTitle>
          <Badge variant="success">Activa</Badge>
        </div>
      </CardHeader>

      <div className="space-y-4">
        {/* Barra de progreso */}
        <div>
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>{paidCount} de {totalMembers} contribuyeron</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-ayllu-sun rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-3 rounded-xl bg-white/5">
            <Coins className="h-5 w-5 text-ayllu-sun mb-1" />
            <span className="text-lg font-bold">${formatUSDC(potAmount)}</span>
            <span className="text-xs text-white/40">de ${formatUSDC(expectedPot)}</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-white/5">
            <User className="h-5 w-5 text-green-400 mb-1" />
            <span className="text-sm font-medium">{shortenAddress(roundRecipient)}</span>
            <span className="text-xs text-white/40">Recibe</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-white/5">
            <Clock className="h-5 w-5 text-blue-400 mb-1" />
            <span className="text-sm font-medium">{timeRemaining(roundEndsAt)}</span>
            <span className="text-xs text-white/40">Restante</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
