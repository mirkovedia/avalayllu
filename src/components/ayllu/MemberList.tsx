"use client";

import { Check, Clock, Crown, Gift } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { shortenAddress, formatUSDC, cn } from "@/lib/utils";

interface Member {
  wallet: string;
  hasContributedThisRound: boolean;
  hasReceivedPot: boolean;
  roundToReceive: number;
  totalContributed: bigint;
  latePayments: number;
}

interface MemberListProps {
  members: Member[];
  currentRound: number;
  creator: string;
  currentUser?: string;
}

export const MemberList = ({ members, currentRound, creator, currentUser }: MemberListProps) => {
  return (
    <div className="space-y-2">
      {members.map((member, i) => {
        const isRecipient = member.roundToReceive === currentRound;
        const isCreator = member.wallet.toLowerCase() === creator.toLowerCase();
        const isCurrentUser = currentUser && member.wallet.toLowerCase() === currentUser.toLowerCase();

        return (
          <div
            key={member.wallet}
            className={cn(
              "flex items-center justify-between p-3 rounded-xl transition-all",
              isRecipient ? "bg-ayllu-sun/10 border border-ayllu-sun/20" : "bg-white/5",
              isCurrentUser && "ring-1 ring-ayllu-sun/40"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                member.hasContributedThisRound ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"
              )}>
                {member.hasContributedThisRound ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {isCurrentUser ? "Tu" : shortenAddress(member.wallet)}
                  </span>
                  {isCreator && (
                    <Crown className="h-3 w-3 text-ayllu-sun" />
                  )}
                  {isRecipient && (
                    <Badge variant="warning" className="text-[10px]">
                      <Gift className="h-3 w-3 mr-1" />
                      Recibe esta ronda
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-white/40">
                  Turno {member.roundToReceive + 1} | Contribuido: ${formatUSDC(member.totalContributed)}
                </span>
              </div>
            </div>

            {member.latePayments > 0 && (
              <Badge variant="danger" className="text-[10px]">
                {member.latePayments} tardio{member.latePayments > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
};
