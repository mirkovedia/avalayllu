"use client";

import { use } from "react";
import { useAccount } from "wagmi";
import { useAyllu, useAylluMembers, useRoundInfo, useJoinAyllu } from "@/hooks/useAylluPool";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AylluRound } from "@/components/ayllu/AylluRound";
import { MemberList } from "@/components/ayllu/MemberList";
import { ContributeButton } from "@/components/ayllu/ContributeButton";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatUSDC, getStatusLabel, shortenAddress, snowscanTxUrl } from "@/lib/utils";
import { ArrowLeft, Users, Coins, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

const statusNames = ["FORMING", "ACTIVE", "COMPLETED", "CANCELLED"];

export default function AylluDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const aylluId = /^\d+$/.test(id) ? BigInt(id) : BigInt(0);
  const { address, isConnected } = useAccount();

  const { data: ayllu, isLoading: aylluLoading } = useAyllu(aylluId);
  const { data: members, isLoading: membersLoading } = useAylluMembers(aylluId);
  const { data: roundInfo } = useRoundInfo(aylluId);
  const { joinAyllu, isPending: isJoining, isConfirming: isJoinConfirming, error: joinError } = useJoinAyllu();

  if (aylluLoading || membersLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Cargando Ayllu..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!ayllu) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="text-center max-w-md">
            <h2 className="text-xl font-bold mb-2">Ayllu no encontrado</h2>
            <p className="text-white/50 mb-4">El Ayllu #{id} no existe.</p>
            <Link href="/dashboard"><Button>Ir al Dashboard</Button></Link>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const statusName = statusNames[ayllu.status] ?? "UNKNOWN";
  const isActive = ayllu.status === 1;
  const isForming = ayllu.status === 0;
  const isCompleted = ayllu.status === 2;

  const isMember = members?.some(
    (m) => m.wallet.toLowerCase() === address?.toLowerCase()
  );
  const currentMember = members?.find(
    (m) => m.wallet.toLowerCase() === address?.toLowerCase()
  );

  const paidCount = members?.filter((m) => m.hasContributedThisRound).length ?? 0;

  const memberData = members?.map((m) => ({
    wallet: m.wallet,
    hasContributedThisRound: m.hasContributedThisRound,
    hasReceivedPot: m.hasReceivedPot,
    roundToReceive: m.roundToReceive,
    totalContributed: m.totalContributed,
    latePayments: Number(m.latePayments),
  })) ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4" />
          Volver al Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">{ayllu.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant={isActive ? "success" : isForming ? "info" : isCompleted ? "default" : "danger"}>
                {getStatusLabel(statusName)}
              </Badge>
              <span className="text-sm text-white/40">
                Creado por {shortenAddress(ayllu.creator)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ronda actual */}
            {isActive && roundInfo && (
              <AylluRound
                currentRound={roundInfo[0]}
                totalRounds={ayllu.maxMembers}
                potAmount={roundInfo[1]}
                roundEndsAt={roundInfo[2]}
                roundRecipient={roundInfo[3]}
                contributionAmount={ayllu.contributionAmount}
                paidCount={paidCount}
                totalMembers={ayllu.currentMemberCount}
              />
            )}

            {/* Accion: Contribuir o Unirse */}
            {isConnected && address && (
              <Card>
                {isActive && isMember && currentMember && (
                  <ContributeButton
                    aylluId={aylluId}
                    contributionAmount={ayllu.contributionAmount}
                    userAddress={address}
                    hasContributed={currentMember.hasContributedThisRound}
                    isActive={isActive}
                  />
                )}

                {isForming && !isMember && (
                  <div className="text-center">
                    <p className="text-white/60 mb-4">
                      Este Ayllu busca miembros. Aporte por ronda: <span className="text-ayllu-sun font-bold">${formatUSDC(ayllu.contributionAmount)} USDC</span>
                    </p>
                    <Button
                      onClick={() => joinAyllu(aylluId)}
                      isLoading={isJoining || isJoinConfirming}
                      className="gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Unirme a este Ayllu
                    </Button>
                    {joinError && (
                      <p className="text-sm text-red-400 mt-2">{joinError.message.slice(0, 150)}</p>
                    )}
                  </div>
                )}

                {isCompleted && (
                  <div className="text-center py-4">
                    <h3 className="text-lg font-semibold text-green-400 mb-1">Ayllu Completado</h3>
                    <p className="text-sm text-white/50">Todos los miembros recibieron su pozo.</p>
                  </div>
                )}
              </Card>
            )}

            {/* Lista de miembros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  Miembros ({ayllu.currentMemberCount}/{ayllu.maxMembers})
                </CardTitle>
              </CardHeader>
              <MemberList
                members={memberData}
                currentRound={ayllu.currentRound}
                creator={ayllu.creator}
                currentUser={address}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalles</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40 flex items-center gap-1">
                    <Coins className="h-4 w-4" /> Aporte
                  </span>
                  <span className="text-sm font-medium">${formatUSDC(ayllu.contributionAmount)} USDC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40 flex items-center gap-1">
                    <Users className="h-4 w-4" /> Miembros
                  </span>
                  <span className="text-sm font-medium">{ayllu.currentMemberCount}/{ayllu.maxMembers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40 flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Rondas
                  </span>
                  <span className="text-sm font-medium">{ayllu.currentRound + (isActive ? 1 : 0)}/{ayllu.maxMembers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40">Pozo total</span>
                  <span className="text-sm font-bold text-ayllu-sun">
                    ${formatUSDC(ayllu.contributionAmount * BigInt(ayllu.maxMembers))} USDC
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
