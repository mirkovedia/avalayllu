"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn, getScoreColor } from "@/lib/utils";

interface HistoryEntry {
  score: number;
  timestamp: number;
  reason: string;
}

interface ScoreHistoryProps {
  history: HistoryEntry[];
}

const reasonLabels: Record<string, string> = {
  round_completed: "Ronda completada",
  ayllu_completed: "Ayllu completado",
  ai_adjusted: "Ajuste por IA",
};

export const ScoreHistory = ({ history }: ScoreHistoryProps) => {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Score</CardTitle>
        </CardHeader>
        <p className="text-sm text-white/40 text-center py-8">
          Aun no tienes historial. Participa en un Ayllu para empezar.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Score</CardTitle>
      </CardHeader>
      <div className="space-y-3">
        {[...history].reverse().map((entry, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-2 h-2 rounded-full", entry.score >= 800 ? "bg-green-400" : entry.score >= 600 ? "bg-yellow-400" : "bg-red-400")} />
              <div>
                <p className="text-sm text-white/80">
                  {reasonLabels[entry.reason] ?? entry.reason}
                </p>
                <p className="text-xs text-white/40">
                  {new Date(entry.timestamp * 1000).toLocaleDateString("es-BO")}
                </p>
              </div>
            </div>
            <span className={cn("font-display font-bold text-lg", getScoreColor(entry.score))}>
              {entry.score}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
