"use client";

import { useAccount } from "wagmi";
import { useNextAylluId, useAyllu } from "@/hooks/useAylluPool";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AylluCard } from "@/components/ayllu/AylluCard";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/PageTransition";
import { Search, Users, Zap } from "lucide-react";
import { useState } from "react";

const AylluListItem = ({
  aylluId,
  filter,
}: {
  aylluId: number;
  filter: number | null;
}) => {
  const { data: ayllu, isLoading } = useAyllu(BigInt(aylluId));

  if (isLoading || !ayllu) return null;
  if (filter !== null && Number(ayllu.status) !== filter) return null;

  return (
    <StaggerItem>
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
    </StaggerItem>
  );
};

const filters = [
  { value: null, label: "Todos", icon: Zap },
  { value: 0, label: "Abiertos", icon: Users },
  { value: 1, label: "Activos", icon: Zap },
  { value: 2, label: "Completados", icon: Zap },
];

export default function ExplorarPage() {
  const { data: nextId, isLoading } = useNextAylluId();
  const [filter, setFilter] = useState<number | null>(0);

  const aylluCount = nextId ? Number(nextId) : 0;
  const aylluIds = Array.from({ length: aylluCount }, (_, i) => i);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <PageTransition>
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold">Explorar Ayllus</h1>
            <p className="text-white/50 mt-1">
              Encuentra un grupo de ahorro y unite para comenzar a ahorrar juntos.
            </p>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2 mb-6">
            {filters.map((f) => (
              <button
                key={String(f.value)}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f.value
                    ? "bg-ayllu-sun/20 text-ayllu-sun border border-ayllu-sun/30"
                    : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" text="Cargando ayllus desde la blockchain..." />
            </div>
          ) : aylluCount === 0 ? (
            <Card>
              <EmptyState
                icon={Search}
                title="No hay Ayllus todavia"
                description="Se el primero en crear un grupo de ahorro rotativo."
                actionLabel="Crear Ayllu"
                actionHref="/ayllu/crear"
              />
            </Card>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aylluIds.map((id) => (
                <AylluListItem key={id} aylluId={id} filter={filter} />
              ))}
            </StaggerContainer>
          )}
        </PageTransition>
      </main>

      <Footer />
    </div>
  );
}
