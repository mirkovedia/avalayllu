"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const ScoreGauge = ({ score, size = "md", showLabel = true }: ScoreGaugeProps) => {
  const clampedScore = Math.min(1000, Math.max(0, score));
  const percentage = clampedScore / 1000;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - percentage * 0.75);

  const getColor = () => {
    if (clampedScore >= 800) return { stroke: "#22c55e", text: "text-green-400", label: "Excelente" };
    if (clampedScore >= 600) return { stroke: "#eab308", text: "text-yellow-400", label: "Bueno" };
    return { stroke: "#ef4444", text: "text-red-400", label: "En construccion" };
  };

  const { stroke, text, label } = getColor();

  const sizes = {
    xs: { svg: 40, fontSize: "text-xs", labelSize: "text-[10px]" },
    sm: { svg: 120, fontSize: "text-2xl", labelSize: "text-xs" },
    md: { svg: 200, fontSize: "text-5xl", labelSize: "text-sm" },
    lg: { svg: 280, fontSize: "text-7xl", labelSize: "text-base" },
  };

  const s = sizes[size];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: s.svg, height: s.svg * 0.7 }}>
        <svg
          width={s.svg}
          height={s.svg}
          viewBox="0 0 100 100"
          className="transform rotate-[135deg]"
        >
          {/* Fondo del arco */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
          />
          {/* Arco de progreso */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={stroke}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference * 0.75 }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>

        {/* Numero central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: s.svg * 0.08 }}>
          <motion.span
            className={cn("font-display font-bold", s.fontSize, text)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {clampedScore}
          </motion.span>
        </div>
      </div>

      {showLabel && (
        <motion.div
          className="text-center -mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span className={cn("font-medium", s.labelSize, text)}>{label}</span>
          <p className="text-xs text-white/40 mt-1">Ayni Score</p>
        </motion.div>
      )}
    </div>
  );
};
