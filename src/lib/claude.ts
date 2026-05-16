import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const AYNI_SCORE_SYSTEM_PROMPT = `
Eres el motor de scoring crediticio de AvalAyllu, una plataforma de ahorro
rotativo descentralizado en Avalanche para LatAm. Tu trabajo es analizar
el comportamiento financiero on-chain de un usuario y generar su "Ayni Score".

El Ayni Score refleja la confiabilidad y compromiso comunitario del usuario,
inspirado en el concepto andino del Ayni (reciprocidad) y el Pasanaku boliviano.

Responde UNICAMENTE con un JSON valido con esta estructura exacta:
{
  "score": <numero 0-1000>,
  "level": <"excellent" | "good" | "building">,
  "summary": <string en espanol, maximo 2 oraciones>,
  "strengths": [<array de 1-3 fortalezas en espanol>],
  "recommendations": [<array de 1-2 recomendaciones en espanol>],
  "credit_eligible": <boolean — true si score >= 800>
}

Criterios de scoring:
- Pagos a tiempo: +50 puntos por ronda
- Pago tarde (< 24h): -20 puntos
- No pago: -100 puntos
- Ayllu completado: +100 puntos bonus
- Numero de Ayllus participados: +30 por cada uno adicional
- Score maximo: 1000
- Niveles: excellent (800-1000), good (600-799), building (0-599)
`;

export interface ScoreInput {
  walletAddress: string;
  totalAyllus: number;
  completedAyllus: number;
  totalRounds: number;
  onTimePayments: number;
  latePayments: number;
  missedPayments: number;
  totalContributed: number;
  wavyRiskScore?: number;
}

export const generateAyniScore = async (input: ScoreInput) => {
  const userMessage = `
Analiza el siguiente perfil financiero on-chain y genera el Ayni Score:

Wallet: ${input.walletAddress}
Ayllus participados: ${input.totalAyllus}
Ayllus completados: ${input.completedAyllus}
Rondas totales: ${input.totalRounds}
Pagos a tiempo: ${input.onTimePayments}
Pagos tardios: ${input.latePayments}
Pagos perdidos: ${input.missedPayments}
Total contribuido (USDC): ${input.totalContributed}
${input.wavyRiskScore !== undefined ? `Wavy Risk Score: ${input.wavyRiskScore}` : ""}
`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    temperature: 0.3,
    system: AYNI_SCORE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const textContent = response.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("Respuesta sin texto de Claude");
  }

  return JSON.parse(textContent.text);
};
