"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useAyniScore, useAyniScoreRecord, useAyniScoreHistory } from "@/hooks/useAyniScore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScoreGauge } from "@/components/score/ScoreGauge";
import { ScoreHistory } from "@/components/score/ScoreHistory";
import { ScoreInsights } from "@/components/score/ScoreInsights";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet, RefreshCw, Award, Target, Clock, Coins } from "lucide-react";
import { formatUSDC } from "@/lib/utils";
import type { AyniScoreResult } from "@/types";

export default function ScorePage() {
  const { address, isConnected } = useAccount();
  const { data: score } = useAyniScore(address);
  const { data: record } = useAyniScoreRecord(address);
  const { data: history } = useAyniScoreHistory(address);
  const [insights, setInsights] = useState<AyniScoreResult | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const handleUpdateScore = async () => {
    if (!address) return;
    setIsLoadingInsights(true);
    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });
      if (!response.ok) throw new Error("Error al calcular score");
      const data = await response.json();
      setInsights(data);
    } catch (err) {
      console.error("Error actualizando score:", err);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full text-center">
            <Wallet className="h-16 w-16 text-ayllu-sun mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold mb-2">Conecta tu wallet</h2>
            <p className="text-white/50 mb-6">
              Conecta tu wallet para ver tu Ayni Score.
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const scoreValue = score !== undefined ? Number(score) : 0;

  const historyData = history?.map((h) => ({
    score: Number(h.score),
    timestamp: Number(h.timestamp),
    reason: h.reason,
  })) ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Mi Ayni Score</h1>
          <p className="text-white/50 mt-1">
            Tu reputacion financiera on-chain basada en el principio del Ayni
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score Gauge */}
            <Card className="flex flex-col items-center py-10">
              <ScoreGauge score={scoreValue} size="lg" />
              <Button
                onClick={handleUpdateScore}
                isLoading={isLoadingInsights}
                variant="secondary"
                className="mt-6 gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Actualizar mi score con IA
              </Button>
            </Card>

            {/* Insights de Claude */}
            <ScoreInsights insights={insights} isLoading={isLoadingInsights} />

            {/* Historial */}
            <ScoreHistory history={historyData} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metricas */}
            <Card>
              <CardHeader>
                <CardTitle>Metricas</CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40 flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Rondas completadas
                  </span>
                  <span className="font-bold">
                    {record ? Number(record.roundsCompleted) : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40 flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Ayllus completados
                  </span>
                  <span className="font-bold">
                    {record ? Number(record.ayllisCompleted) : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Pagos tardios
                  </span>
                  <span className="font-bold text-red-400">
                    {record ? Number(record.totalLatePayments) : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40 flex items-center gap-1">
                    <Coins className="h-4 w-4" />
                    Total contribuido
                  </span>
                  <span className="font-bold text-ayllu-sun">
                    ${record ? formatUSDC(record.totalContributed) : "0.00"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Como mejorar */}
            <Card>
              <CardHeader>
                <CardTitle>Como mejorar tu score</CardTitle>
              </CardHeader>
              <ul className="space-y-3 text-sm text-white/60">
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                  Paga a tiempo cada ronda (+50 pts)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                  Completa Ayllus enteros (+100 pts)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                  Participa en multiples Ayllus (+30 pts c/u)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  Evita pagos tardios (-25 pts)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-ayllu-sun flex-shrink-0" />
                  Score 800+ = elegible para credito
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
