import { NextRequest, NextResponse } from "next/server";

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

    const apiKey = process.env.WAVY_NODE_API_KEY;
    const baseUrl = process.env.WAVY_NODE_BASE_URL;

    if (apiKey && baseUrl) {
      try {
        const response = await fetch(`${baseUrl}/v1/risk/address/${walletAddress}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            riskScore: data.risk_score ?? 50,
            riskLevel: data.risk_level ?? "medium",
            flags: data.flags ?? [],
            rawData: data,
          });
        }
      } catch {
        // Wavy Node no disponible — retornar mock
      }
    }

    return NextResponse.json(generateMockRiskData(walletAddress));
  } catch (error) {
    console.error("Error consultando Wavy Node:", error);
    return NextResponse.json(
      { error: "Error interno al consultar risk data" },
      { status: 500 }
    );
  }
}

function generateMockRiskData(walletAddress: string) {
  const hash = walletAddress.slice(2, 10);
  const seed = parseInt(hash, 16);
  const riskScore = 20 + (seed % 60);

  return {
    riskScore,
    riskLevel: riskScore < 30 ? "low" : riskScore < 60 ? "medium" : "high",
    flags: riskScore > 50 ? ["actividad_inusual"] : [],
    rawData: {
      source: "mock",
      walletAddress,
      analyzedAt: new Date().toISOString(),
      transactionCount: 10 + (seed % 100),
      avgTransactionValue: 50 + (seed % 500),
    },
  };
}
