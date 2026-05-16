import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatUnits, parseUnits } from "viem";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const formatUSDC = (amount: bigint): string => {
  return parseFloat(formatUnits(amount, 6)).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const parseUSDC = (amount: number): bigint => {
  return parseUnits(amount.toString(), 6);
};

export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export const getScoreColor = (score: number): string => {
  if (score >= 800) return "text-green-500";
  if (score >= 600) return "text-yellow-500";
  return "text-red-500";
};

export const getScoreBgColor = (score: number): string => {
  if (score >= 800) return "bg-green-500";
  if (score >= 600) return "bg-yellow-500";
  return "bg-red-500";
};

export const getScoreLevel = (score: number): string => {
  if (score >= 800) return "Excelente";
  if (score >= 600) return "Bueno";
  return "En construccion";
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    FORMING: "Formando grupo",
    ACTIVE: "Activo",
    COMPLETED: "Completado",
    CANCELLED: "Cancelado",
  };
  return labels[status] ?? status;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    FORMING: "bg-blue-500/20 text-blue-400",
    ACTIVE: "bg-green-500/20 text-green-400",
    COMPLETED: "bg-gray-500/20 text-gray-400",
    CANCELLED: "bg-red-500/20 text-red-400",
  };
  return colors[status] ?? "bg-gray-500/20 text-gray-400";
};

export const snowscanTxUrl = (txHash: string): string => {
  return `https://testnet.snowscan.xyz/tx/${txHash}`;
};

export const snowscanAddressUrl = (address: string): string => {
  return `https://testnet.snowscan.xyz/address/${address}`;
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} horas`;
  return `${Math.floor(seconds / 86400)} dias`;
};

export const timeRemaining = (endsAt: bigint): string => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (endsAt <= now) return "Vencido";
  const diff = Number(endsAt - now);
  return formatDuration(diff);
};
