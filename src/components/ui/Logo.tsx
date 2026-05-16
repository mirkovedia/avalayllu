interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 72,
};

export const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => {
  const px = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="AvalAyllu Logo"
      >
        {/* Fondo circular - representa el ciclo del Pasanaku */}
        <circle cx="32" cy="32" r="30" fill="#0D1B2A" stroke="#1E3A5F" strokeWidth="2" />

        {/* Montaña central - Avalanche/Andes */}
        <path
          d="M32 12L48 44H16L32 12Z"
          fill="url(#mountain-gradient)"
          opacity="0.9"
        />

        {/* Montaña secundaria izquierda */}
        <path
          d="M22 28L32 44H12L22 28Z"
          fill="#1E3A5F"
          opacity="0.6"
        />

        {/* Sol andino detrás de la montaña */}
        <circle cx="32" cy="20" r="6" fill="#F9AC1B" opacity="0.9" />
        <circle cx="32" cy="20" r="8" fill="none" stroke="#F9AC1B" strokeWidth="1" opacity="0.4" />

        {/* Rayos del sol */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1={32 + 9 * Math.cos((angle * Math.PI) / 180)}
            y1={20 + 9 * Math.sin((angle * Math.PI) / 180)}
            x2={32 + 11 * Math.cos((angle * Math.PI) / 180)}
            y2={20 + 11 * Math.sin((angle * Math.PI) / 180)}
            stroke="#F9AC1B"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        ))}

        {/* Arco inferior - comunidad/rotación */}
        <path
          d="M18 48C18 48 25 52 32 52C39 52 46 48 46 48"
          stroke="#F9AC1B"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Puntos de miembros del ayllu en el arco */}
        <circle cx="20" cy="48" r="2.5" fill="#F9AC1B" />
        <circle cx="27" cy="51" r="2.5" fill="#F9AC1B" opacity="0.8" />
        <circle cx="32" cy="52" r="2.5" fill="#F9AC1B" opacity="0.9" />
        <circle cx="37" cy="51" r="2.5" fill="#F9AC1B" opacity="0.8" />
        <circle cx="44" cy="48" r="2.5" fill="#F9AC1B" />

        {/* Gradientes */}
        <defs>
          <linearGradient id="mountain-gradient" x1="32" y1="12" x2="32" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2D6A4F" />
            <stop offset="100%" stopColor="#1E3A5F" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <span
          className={`font-display font-bold text-white ${
            size === "sm" ? "text-lg" : size === "md" ? "text-xl" : size === "lg" ? "text-2xl" : "text-4xl"
          }`}
        >
          Aval<span className="text-ayllu-sun">Ayllu</span>
        </span>
      )}
    </div>
  );
};

export const LogoIcon = ({ size = 32 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="AvalAyllu"
  >
    <circle cx="32" cy="32" r="30" fill="#0D1B2A" stroke="#F9AC1B" strokeWidth="2" />
    <path d="M32 14L46 42H18L32 14Z" fill="url(#icon-mtn)" />
    <circle cx="32" cy="20" r="5" fill="#F9AC1B" />
    <path
      d="M20 48C20 48 26 52 32 52C38 52 44 48 44 48"
      stroke="#F9AC1B"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <defs>
      <linearGradient id="icon-mtn" x1="32" y1="14" x2="32" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2D6A4F" />
        <stop offset="100%" stopColor="#1E3A5F" />
      </linearGradient>
    </defs>
  </svg>
);
