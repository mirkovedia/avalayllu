"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface PlatformStats {
  total_users: number;
  total_ayllus: number;
  active_ayllus: number;
  completed_ayllus: number;
  total_contributed: number;
  total_distributions: number;
}

interface ActivityEntry {
  id: number;
  type: "contribution" | "distribution" | "join" | "create";
  wallet_address: string;
  amount?: number;
  ayllu_name?: string;
  created_at: string;
}

const MOCK_STATS: PlatformStats = {
  total_users: 142,
  total_ayllus: 38,
  active_ayllus: 12,
  completed_ayllus: 23,
  total_contributed: 45200000000,
  total_distributions: 38700000000,
};

const MOCK_ACTIVITY: ActivityEntry[] = [
  { id: 1, type: "contribution", wallet_address: "0x1234...abcd", amount: 100000000, ayllu_name: "Pachamama", created_at: new Date(Date.now() - 300000).toISOString() },
  { id: 2, type: "distribution", wallet_address: "0x5678...efgh", amount: 500000000, ayllu_name: "Condores", created_at: new Date(Date.now() - 900000).toISOString() },
  { id: 3, type: "join", wallet_address: "0x9abc...ijkl", ayllu_name: "Inti Raymi", created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 4, type: "create", wallet_address: "0xdef0...mnop", ayllu_name: "Titicaca", created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 5, type: "contribution", wallet_address: "0x1357...qrst", amount: 200000000, ayllu_name: "Cusco", created_at: new Date(Date.now() - 7200000).toISOString() },
];

export const usePlatformStats = () => {
  const [stats, setStats] = useState<PlatformStats>(MOCK_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase.rpc("get_platform_stats");
        if (data) setStats(data);
      } catch {
        // usa mock data
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { stats, loading };
};

export const useRecentActivity = () => {
  const [activity, setActivity] = useState<ActivityEntry[]>(MOCK_ACTIVITY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase
          .from("contributions")
          .select("id, wallet_address, amount, created_at, ayllu_id")
          .order("created_at", { ascending: false })
          .limit(10);

        if (data && data.length > 0) {
          setActivity(data.map((d) => ({
            id: d.id,
            type: "contribution" as const,
            wallet_address: d.wallet_address,
            amount: d.amount,
            created_at: d.created_at,
          })));
        }
      } catch {
        // usa mock data
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { activity, loading };
};

export const useUserProfile = (walletAddress: string | undefined) => {
  const [profile, setProfile] = useState<{ display_name: string | null; ayni_score: number; ayllus_completed: number } | null>(null);

  useEffect(() => {
    if (!walletAddress) return;

    const fetch = async () => {
      try {
        const { data } = await supabase
          .from("users")
          .select("display_name, ayni_score, ayllus_completed")
          .eq("wallet_address", walletAddress)
          .single();

        if (data) setProfile(data);
      } catch {
        // sin perfil aun
      }
    };
    fetch();
  }, [walletAddress]);

  return profile;
};
