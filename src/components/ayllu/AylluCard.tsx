"use client";

import Link from "next/link";
import { Users, Clock, Coins, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatUSDC, getStatusLabel, getStatusColor, formatDuration } from "@/lib/utils";

interface AylluCardProps {
  id: number;
  name: string;
  contributionAmount: bigint;
  maxMembers: number;
  currentMemberCount: number;
  currentRound: number;
  status: number;
  roundDuration: bigint;
}

const statusNames = ["FORMING", "ACTIVE", "COMPLETED", "CANCELLED"];

export const AylluCard = ({
  id,
  name,
  contributionAmount,
  maxMembers,
  currentMemberCount,
  currentRound,
  status,
  roundDuration,
}: AylluCardProps) => {
  const statusName = statusNames[status] ?? "UNKNOWN";
  const badgeVariant = status === 0 ? "info" : status === 1 ? "success" : status === 2 ? "default" : "danger";

  return (
    <Link href={`/ayllu/${id}`}>
      <Card className="group hover:border-ayllu-sun/30 transition-all duration-300 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-ayllu-sun transition-colors">
              {name}
            </h3>
            <Badge variant={badgeVariant}>{getStatusLabel(statusName)}</Badge>
          </div>
          <ArrowRight className="h-5 w-5 text-white/20 group-hover:text-ayllu-sun group-hover:translate-x-1 transition-all" />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-white/40" />
            <div>
              <p className="text-sm font-medium">{currentMemberCount}/{maxMembers}</p>
              <p className="text-xs text-white/40">Miembros</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-white/40" />
            <div>
              <p className="text-sm font-medium">${formatUSDC(contributionAmount)}</p>
              <p className="text-xs text-white/40">Aporte</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-white/40" />
            <div>
              <p className="text-sm font-medium">
                {status === 1 ? `Ronda ${currentRound + 1}/${maxMembers}` : "-"}
              </p>
              <p className="text-xs text-white/40">{formatDuration(Number(roundDuration))}</p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
