"use client";

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
import { ArrowLeft, Users, Coins, Clock, ExternalLink, Copy, Check, Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const statusNames = ["FORMING", "ACTIVE", "COMPLETED", "CANCELLED"];

const ShareInvite = ({
  aylluId,
  aylluName,
  spotsLeft,
  maxMembers,
  currentMembers,
  contributionAmount,
}: {
  aylluId: string;
  aylluName: string;
  spotsLeft: number;
  maxMembers: number;
  currentMembers: number;
  contributionAmount: bigint;
}) => {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/ayllu/${aylluId}`;
  };

  const getWhatsAppUrl = () => {
    const url = getShareUrl();
    const text = `Unite a mi Ayllu "${aylluName}" en AvalAyllu! Ahorro rotativo de $${formatUSDC(contributionAmount)} USDC por ronda. Faltan ${spotsLeft} lugares. ${url}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="text-center py-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ayllu-sun/10 mb-4">
        <Users className="h-8 w-8 text-ayllu-sun animate-pulse" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Esperando miembros</h3>
      <p className="text-sm text-white/50 mb-4">
        Faltan <span className="text-ayllu-sun font-bold">{spotsLeft}</span> miembros para activar el Ayllu y comenzar las contribuciones.
      </p>
      <div className="flex items-center justify-center gap-1.5 mb-6">
        {Array.from({ length: maxMembers }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${i < currentMembers ? "bg-ayllu-sun" : "bg-white/10"}`}
          />
        ))}
      </div>

      <p className="text-xs text-white/40 mb-3">Invita miembros compartiendo el enlace</p>
      <div className="flex items-center gap-2 max-w-sm mx-auto">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 truncate">
          {getShareUrl()}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          className="shrink-0 gap-1"
        >
          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-3 mt-4">
        <a
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-600/30 transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </a>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `Unite a ${aylluName}`,
                text: `Ahorro rotativo de $${formatUSDC(contributionAmount)} USDC. Faltan ${spotsLeft} lugares.`,
                url: getShareUrl(),
              });
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-white/70 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Compartir
        </button>
      </div>
    </div>
  );
};

export default function AylluDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
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

                {isForming && isMember && (
                  <ShareInvite
                    aylluId={id}
                    aylluName={ayllu.name}
                    spotsLeft={ayllu.maxMembers - ayllu.currentMemberCount}
                    maxMembers={ayllu.maxMembers}
                    currentMembers={ayllu.currentMemberCount}
                    contributionAmount={ayllu.contributionAmount}
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
