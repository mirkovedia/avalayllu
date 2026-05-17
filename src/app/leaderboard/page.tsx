"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { ScoreGauge } from "@/components/score/ScoreGauge";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Trophy, Medal, Crown, Users, TrendingUp, Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface LeaderEntry {
  wallet_address: string;
  display_name: string | null;
  ayni_score: number;
  ayllus_completed: number;
}

interface PlatformStats {
  total_users: number;
  total_ayllus: number;
  active_ayllus: number;
  completed_ayllus: number;
  total_contributed: number;
  total_distributions: number;
}

const rankIcons = [
  <Crown key="1" className="h-5 w-5 text-yellow-400" />,
  <Medal key="2" className="h-5 w-5 text-gray-300" />,
  <Medal key="3" className="h-5 w-5 text-amber-600" />,
];

const mockLeaderboard: LeaderEntry[] = [
  { wallet_address: "0x1234...abcd", display_name: "Pachamama.avax", ayni_score: 920, ayllus_completed: 8 },
  { wallet_address: "0x5678...efgh", display_name: "Condor.eth", ayni_score: 875, ayllus_completed: 6 },
  { wallet_address: "0x9abc...ijkl", display_name: "Inti.avax", ayni_score: 830, ayllus_completed: 5 },
  { wallet_address: "0xdef0...mnop", display_name: "Wiracocha", ayni_score: 780, ayllus_completed: 4 },
  { wallet_address: "0x1357...qrst", display_name: null, ayni_score: 720, ayllus_completed: 3 },
  { wallet_address: "0x2468...uvwx", display_name: "Cusco.avax", ayni_score: 690, ayllus_completed: 3 },
  { wallet_address: "0x3579...yzab", display_name: null, ayni_score: 650, ayllus_completed: 2 },
  { wallet_address: "0x4680...cdef", display_name: "Titicaca.eth", ayni_score: 610, ayllus_completed: 2 },
];

const mockStats: PlatformStats = {
  total_users: 142,
  total_ayllus: 38,
  active_ayllus: 12,
  completed_ayllus: 23,
  total_contributed: 45200000000,
  total_distributions: 38700000000,
};

const formatAddress = (addr: string) => {
  if (addr.includes("...")) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

const formatUSDC = (amount: number) => {
  return (amount / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 0 });
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: leaders } = await supabase.rpc("get_leaderboard", { limit_count: 10 });
        const { data: platformStats } = await supabase.rpc("get_platform_stats");

        if (leaders && leaders.length > 0) {
          setLeaderboard(leaders);
        } else {
          setLeaderboard(mockLeaderboard);
        }

        if (platformStats) {
          setStats(platformStats);
        } else {
          setStats(mockStats);
        }
      } catch {
        setLeaderboard(mockLeaderboard);
        setStats(mockStats);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Trophy className="h-8 w-8 text-ayllu-sun" />
            Leaderboard
          </h1>
          <p className="text-white/50 mt-1">Los mejores Ayni Scores de la comunidad</p>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Usuarios", value: stats?.total_users ?? 0, icon: Users, color: "text-blue-400" },
            { label: "Ayllus Activos", value: stats?.active_ayllus ?? 0, icon: TrendingUp, color: "text-green-400" },
            { label: "Completados", value: stats?.completed_ayllus ?? 0, icon: Trophy, color: "text-ayllu-sun" },
            { label: "USDC Distribuido", value: stats ? `$${formatUSDC(stats.total_distributions)}` : "$0", icon: Coins, color: "text-purple-400" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <Card className="text-center py-4">
                  <Icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-white/40">{stat.label}</div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Leaderboard Table */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-display font-semibold">Top Contribuidores</h2>
          </div>

          {loading ? (
            <div className="p-4">
              <SkeletonTable rows={8} />
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {leaderboard.map((entry, i) => (
                <div
                  key={entry.wallet_address}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {/* Rank */}
                  <div className="w-8 flex-shrink-0 text-center">
                    {i < 3 ? (
                      rankIcons[i]
                    ) : (
                      <span className="text-sm text-white/40 font-mono">{i + 1}</span>
                    )}
                  </div>

                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-sun flex items-center justify-center text-xs font-bold text-ayllu-night flex-shrink-0">
                      {(entry.display_name ?? entry.wallet_address).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {entry.display_name ?? formatAddress(entry.wallet_address)}
                      </div>
                      {entry.display_name && (
                        <div className="text-xs text-white/30 font-mono">
                          {formatAddress(entry.wallet_address)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-2">
                    <ScoreGauge score={entry.ayni_score} size="xs" />
                    <div className="text-right">
                      <div className="text-sm font-bold text-ayllu-sun">{entry.ayni_score}</div>
                      <div className="text-xs text-white/30">{entry.ayllus_completed} ayllus</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
}
