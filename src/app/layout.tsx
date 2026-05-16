import type { Metadata } from "next";
import { Providers } from "./providers";
import { MobileNavWrapper } from "./MobileNavWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "AvalAyllu — Ahorro Rotativo Descentralizado",
  description:
    "Plataforma de ahorro rotativo descentralizado en Avalanche, inspirada en el Ayni andino y el Pasanaku boliviano. Construye tu historial crediticio on-chain.",
  keywords: ["avalanche", "defi", "pasanaku", "ayni", "ahorro rotativo", "credito", "blockchain", "latam"],
  openGraph: {
    title: "AvalAyllu — El Pasanaku en Blockchain",
    description: "Ahorro rotativo descentralizado en Avalanche. 400M+ de latinoamericanos sin acceso bancario ahora pueden construir historial crediticio on-chain.",
    type: "website",
    locale: "es_LA",
    siteName: "AvalAyllu",
  },
  twitter: {
    card: "summary_large_image",
    title: "AvalAyllu — El Pasanaku en Blockchain",
    description: "Ahorro rotativo descentralizado en Avalanche para LatAm.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen antialiased pb-16 md:pb-0">
        <Providers>
          {children}
          <MobileNavWrapper />
        </Providers>
      </body>
    </html>
  );
}
