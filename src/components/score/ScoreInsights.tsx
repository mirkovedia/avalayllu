"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import type { AyniScoreResult } from "@/types";

interface ScoreInsightsProps {
  insights: AyniScoreResult | null;
  isLoading?: boolean;
}

export const ScoreInsights = ({ insights, isLoading }: ScoreInsightsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-ayllu-sun" />
            Analisis con IA
          </CardTitle>
        </CardHeader>
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
          <div className="h-4 bg-white/10 rounded w-2/3" />
        </div>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-ayllu-sun" />
            Analisis con IA
          </CardTitle>
        </CardHeader>
        <p className="text-sm text-white/40 text-center py-6">
          Actualiza tu score para obtener un analisis personalizado.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-ayllu-sun" />
          Analisis con IA
        </CardTitle>
      </CardHeader>

      <p className="text-sm text-white/70 mb-4">{insights.summary}</p>

      {insights.creditEligible && (
        <Badge variant="success" className="mb-4">
          Elegible para credito institucional
        </Badge>
      )}

      {insights.strengths.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-white/40 uppercase mb-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Fortalezas
          </h4>
          <ul className="space-y-1">
            {insights.strengths.map((s, i) => (
              <li key={i} className="text-sm text-green-400/80 flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-green-400 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {insights.recommendations.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-white/40 uppercase mb-2 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Recomendaciones
          </h4>
          <ul className="space-y-1">
            {insights.recommendations.map((r, i) => (
              <li key={i} className="text-sm text-yellow-400/80 flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-yellow-400 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
