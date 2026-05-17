"use client";

import { useRecentActivity } from "@/hooks/useSupabase";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Coins, Users, Plus, Gift } from "lucide-react";

const activityIcons = {
  contribution: { icon: Coins, color: "text-green-400", bg: "bg-green-500/10" },
  distribution: { icon: Gift, color: "text-purple-400", bg: "bg-purple-500/10" },
  join: { icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
  create: { icon: Plus, color: "text-ayllu-sun", bg: "bg-ayllu-sun/10" },
};

const activityLabels = {
  contribution: "aportó",
  distribution: "recibió el pozo",
  join: "se unió a",
  create: "creó",
};

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
};

const formatAddress = (addr: string) => {
  if (addr.includes("...")) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export const ActivityFeed = () => {
  const { activity, loading } = useRecentActivity();

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold">Actividad Reciente</h3>
        <span className="text-xs text-white/30">Tiempo real</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {activity.map((entry, i) => {
            const { icon: Icon, color, bg } = activityIcons[entry.type];
            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/[0.02] transition-colors animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate">
                    <span className="font-mono text-xs text-white/50">{formatAddress(entry.wallet_address)}</span>
                    {" "}{activityLabels[entry.type]}{" "}
                    {entry.amount && (
                      <span className="font-semibold text-ayllu-sun">
                        ${(entry.amount / 1_000_000).toFixed(0)} USDC
                      </span>
                    )}
                    {entry.ayllu_name && (
                      <span className="font-medium">{entry.ayllu_name}</span>
                    )}
                  </p>
                </div>
                <span className="text-[10px] text-white/30 flex-shrink-0">
                  {formatTimeAgo(entry.created_at)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
