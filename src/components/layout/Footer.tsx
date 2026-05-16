import { Mountain } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Mountain className="h-6 w-6 text-ayllu-sun" />
              <span className="font-display font-bold text-lg text-white">
                Aval<span className="text-ayllu-sun">Ayllu</span>
              </span>
            </div>
            <p className="text-sm text-white/50 max-w-md">
              Ahorro rotativo descentralizado en Avalanche. Inspirado en el Ayni
              andino y el Pasanaku boliviano. Construye tu historial crediticio
              on-chain para acceder a credito institucional.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Plataforma</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="/ayllu/crear" className="hover:text-white transition-colors">Crear Ayllu</a></li>
              <li><a href="/score" className="hover:text-white transition-colors">Mi Ayni Score</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Partners</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li>Avalanche</li>
              <li>Arkangeles</li>
              <li>Bankaool</li>
              <li>Wavy Node</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            Hackathon LatAm Institucional Avalanche 2026
          </p>
          <p className="text-xs text-white/30">
            Construido en Avalanche C-Chain (Fuji Testnet)
          </p>
        </div>
      </div>
    </footer>
  );
};
