import { NextRequest, NextResponse } from "next/server";
import { generateAyniScore, type ScoreInput } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body as { walletAddress: string };

    if (!walletAddress || !walletAddress.startsWith("0x")) {
      return NextResponse.json(
        { error: "Wallet address invalida" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(generateMockScore(walletAddress));
    }

    let wavyData = { riskScore: 50 };
    try {
      const wavyRes = await fetch(
        new URL("/api/wavy", request.url).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress }),
        }
      );
      if (wavyRes.ok) {
        wavyData = await wavyRes.json();
      }
    } catch {
      // Wavy Node no disponible — continuar sin risk data
    }

    const scoreInput: ScoreInput = {
      walletAddress,
      totalAyllus: 3,
      completedAyllus: 2,
      totalRounds: 12,
      onTimePayments: 10,
      latePayments: 1,
      missedPayments: 0,
      totalContributed: 1200,
      wavyRiskScore: wavyData.riskScore,
    };

    const result = await generateAyniScore(scoreInput);

    return NextResponse.json({
      score: result.score,
      level: result.level,
      summary: result.summary,
      strengths: result.strengths,
      recommendations: result.recommendations,
      creditEligible: result.credit_eligible,
    });
  } catch (error) {
    console.error("Error generando Ayni Score:", error);
    return NextResponse.json(
      { error: "Error interno al generar score" },
      { status: 500 }
    );
  }
}

function generateMockScore(walletAddress: string) {
  const hash = walletAddress.slice(2, 10);
  const seed = parseInt(hash, 16) % 1000;
  const score = Math.min(1000, 400 + seed % 600);
  const level = score >= 800 ? "excellent" : score >= 600 ? "good" : "building";

  return {
    score,
    level,
    summary: `Tu Ayni Score es ${score}/1000. ${score >= 800
      ? "Excelente historial de pagos y participacion comunitaria."
      : score >= 600
      ? "Buen historial, sigue participando para mejorar."
      : "Estas construyendo tu reputacion. Participa en mas Ayllus."}`,
    strengths: [
      "Participacion activa en multiples Ayllus",
      "Historial de pagos consistente",
    ],
    recommendations: [
      "Completa mas Ayllus para aumentar tu score",
      score < 800 ? "Evita pagos tardios para alcanzar nivel Excelente" : "Manten tu excelente historial",
    ],
    creditEligible: score >= 800,
  };
}
