"use client";

import { useAccount } from "wagmi";
import { useAyniScore } from "@/hooks/useAyniScore";
import { useUsdcBalance, useMintUsdc } from "@/hooks/useWallet";
import { useNextAylluId, useAyllu } from "@/hooks/useAylluPool";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScoreGauge } from "@/components/score/ScoreGauge";
import { AylluCard } from "@/components/ayllu/AylluCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/PageTransition";
import { useToast } from "@/components/ui/Toast";
import { formatUSDC } from "@/lib/utils";
import { Plus, Users, Wallet, Coins } from "lucide-react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseUnits } from "viem";

const AylluListItem = ({ aylluId }: { aylluId: number }) => {
  const { data: ayllu, isLoading } = useAyllu(BigInt(aylluId));

  if (isLoading || !ayllu) return null;

  return (
    <AylluCard
      id={aylluId}
      name={ayllu.name}
      contributionAmount={ayllu.contributionAmount}
      maxMembers={ayllu.maxMembers}
      currentMemberCount={ayllu.currentMemberCount}
      currentRound={ayllu.currentRound}
      status={ayllu.status}
      roundDuration={ayllu.roundDuration}
    />
  );
};

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { data: score } = useAyniScore(address);
  const { data: balance } = useUsdcBalance(address);
  const { data: nextId } = useNextAylluId();
  const { mint, isPending: isMinting } = useMintUsdc();

  const { addToast } = useToast();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <PageTransition>
            <Card className="max-w-md w-full text-center animate-glow">
              <Wallet className="h-16 w-16 text-ayllu-sun mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold mb-2">Conecta tu wallet</h2>
              <p className="text-white/50 mb-6">
                Necesitas una wallet conectada a Avalanche Fuji para usar AvalAyllu.
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </Card>
          </PageTransition>
        </div>
        <Footer />
      </div>
    );
  }

  const aylluCount = nextId ? Number(nextId) : 0;
  const aylluIds = Array.from({ length: Math.min(aylluCount, 10) }, (_, i) => i);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-white/50 mt-1">Tu centro de control en AvalAyllu</p>
        </div>

        {/* Score + Balance Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-1 flex flex-col items-center justify-center py-8">
            <ScoreGauge score={score !== undefined ? Number(score) : 0} size="md" />
            <Link href="/score" className="mt-4">
              <Button variant="ghost" size="sm">Ver detalle</Button>
            </Link>
          </Card>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardDescription>Balance USDC</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Coins className="h-6 w-6 text-ayllu-sun" />
                  ${balance !== undefined ? formatUSDC(balance) : "0.00"}
                </CardTitle>
              </CardHeader>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (!address) return;
                  addToast({ type: "loading", title: "Minteando USDC...", description: "Confirma en tu wallet" });
                  mint(address, parseUnits("1000", 6));
                }}
                isLoading={isMinting}
              >
                Obtener 1,000 USDC (Testnet)
              </Button>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Mis Ayllus</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-400" />
                  {aylluCount}
                </CardTitle>
              </CardHeader>
              <Link href="/ayllu/crear">
                <Button variant="secondary" size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Crear nuevo
                </Button>
              </Link>
            </Card>
          </div>
        </div>

        {/* Ayllus List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold">Ayllus</h2>
            <Link href="/ayllu/crear">
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Crear Ayllu
              </Button>
            </Link>
          </div>

          {aylluCount === 0 ? (
            <Card>
              <EmptyState
                icon={Users}
                title="No hay Ayllus aun"
                description="Crea el primer grupo de ahorro rotativo o unete a uno existente."
                actionLabel="Crear mi primer Ayllu"
                actionHref="/ayllu/crear"
              />
            </Card>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aylluIds.map((id) => (
                <StaggerItem key={id}>
                  <AylluListItem aylluId={id} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>

        {/* Activity Feed */}
        <div className="mb-8">
          <ActivityFeed />
        </div>
      </main>

      <Footer />
    </div>
  );
}
