import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "AvalAyllu API",
    version: "1.0.0",
    endpoints: {
      "POST /api/score": "Genera Ayni Score con Claude AI",
      "POST /api/wavy": "Consulta Wavy Node risk data",
      "GET /api/ayllu": "Info de la API",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body as { action: string };

    switch (action) {
      case "sync":
        return NextResponse.json({
          success: true,
          message: "Sync ejecutado. Los datos on-chain son la fuente de verdad.",
        });

      default:
        return NextResponse.json(
          { error: `Accion '${action}' no reconocida` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error en API ayllu:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
