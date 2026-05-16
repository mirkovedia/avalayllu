"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useCreateAyllu } from "@/hooks/useAylluPool";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet, Users, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const frequencyOptions = [
  { value: 3600, label: "1 hora (demo)", description: "Para probar rapido" },
  { value: 86400, label: "1 dia", description: "Rondas diarias" },
  { value: 604800, label: "1 semana", description: "Rondas semanales" },
  { value: 2592000, label: "1 mes", description: "Rondas mensuales" },
];

export default function CrearAylluPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { createAyllu, isPending, isConfirming, isSuccess, hash, error } = useCreateAyllu();

  const [name, setName] = useState("");
  const [maxMembers, setMaxMembers] = useState(4);
  const [contribution, setContribution] = useState(100);
  const [roundDuration, setRoundDuration] = useState(3600);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full text-center">
            <Wallet className="h-16 w-16 text-ayllu-sun mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold mb-2">Conecta tu wallet</h2>
            <p className="text-white/50 mb-6">Conecta tu wallet para crear un Ayllu.</p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold mb-2">Ayllu creado!</h2>
            <p className="text-white/50 mb-6">
              Tu grupo de ahorro &quot;{name}&quot; fue creado exitosamente.
              Comparte el enlace para que otros se unan.
            </p>
            {hash && (
              <a
                href={`https://testnet.snowscan.xyz/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ayllu-sun hover:underline block mb-4"
              >
                Ver transaccion en Snowscan
              </a>
            )}
            <Button onClick={() => router.push("/dashboard")}>
              Ir al Dashboard
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createAyllu(name.trim(), maxMembers, contribution, roundDuration);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4" />
          Volver al Dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-ayllu-sun" />
              Crear nuevo Ayllu
            </CardTitle>
            <CardDescription>
              Configura tu grupo de ahorro rotativo. Todos los miembros aportan USDC cada ronda.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Nombre del Ayllu
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Familia Quispe, Amigos del barrio..."
                maxLength={64}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-ayllu-sun/50 transition-colors"
                required
              />
            </div>

            {/* Miembros */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Numero de miembros: <span className="text-ayllu-sun font-bold">{maxMembers}</span>
              </label>
              <input
                type="range"
                min={2}
                max={20}
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                className="w-full accent-ayllu-sun"
              />
              <div className="flex justify-between text-xs text-white/30 mt-1">
                <span>2</span>
                <span>20</span>
              </div>
            </div>

            {/* Contribucion */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Aporte por ronda (USDC)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">$</span>
                <input
                  type="number"
                  min={5}
                  max={10000}
                  value={contribution}
                  onChange={(e) => setContribution(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-16 py-3 text-white focus:outline-none focus:border-ayllu-sun/50 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">USDC</span>
              </div>
              <p className="text-xs text-white/30 mt-1">
                Pozo total por ronda: ${(contribution * maxMembers).toLocaleString()} USDC
              </p>
            </div>

            {/* Frecuencia */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Duracion de cada ronda
              </label>
              <div className="grid grid-cols-2 gap-2">
                {frequencyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRoundDuration(opt.value)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all",
                      roundDuration === opt.value
                        ? "border-ayllu-sun/50 bg-ayllu-sun/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="block text-xs text-white/40">{opt.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-white/5 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-medium text-white/60">Resumen</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-white/40">Miembros:</span>
                <span className="text-right font-medium">{maxMembers}</span>
                <span className="text-white/40">Aporte por ronda:</span>
                <span className="text-right font-medium">${contribution} USDC</span>
                <span className="text-white/40">Pozo total:</span>
                <span className="text-right font-medium text-ayllu-sun">${(contribution * maxMembers).toLocaleString()} USDC</span>
                <span className="text-white/40">Total de rondas:</span>
                <span className="text-right font-medium">{maxMembers}</span>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 px-4 py-2 rounded-lg">
                Error: {error.message.slice(0, 200)}
              </p>
            )}

            <Button
              type="submit"
              isLoading={isPending || isConfirming}
              className="w-full"
              size="lg"
            >
              {isPending ? "Confirmando en wallet..." : isConfirming ? "Esperando confirmacion..." : "Crear Ayllu"}
            </Button>
          </form>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
