import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "AvalAyllu — Ahorro Rotativo Descentralizado",
  description:
    "Plataforma de ahorro rotativo descentralizado en Avalanche, inspirada en el Ayni andino y el Pasanaku boliviano. Construye tu historial crediticio on-chain.",
  keywords: ["avalanche", "defi", "pasanaku", "ayni", "ahorro rotativo", "credito", "blockchain", "latam"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
