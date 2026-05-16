// --- Ayllu Types ---

export type AylluStatus = "FORMING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type AylluFrequency = "weekly" | "monthly";
export type ScoreLevel = "excellent" | "good" | "building";

export interface AylluMember {
  wallet: string;
  hasContributedThisRound: boolean;
  hasReceivedPot: boolean;
  roundToReceive: number;
  totalContributed: bigint;
  latePayments: number;
}

export interface AylluOnChain {
  name: string;
  creator: string;
  contributionAmount: bigint;
  roundDuration: bigint;
  maxMembers: number;
  currentMemberCount: number;
  currentRound: number;
  roundStartedAt: bigint;
  status: number;
}

export interface AylluData {
  id: string;
  name: string;
  description: string | null;
  contractAylluId: number;
  creatorId: string;
  contributionAmount: number;
  maxMembers: number;
  currentMemberCount: number;
  currentRound: number;
  totalRounds: number;
  frequency: AylluFrequency;
  status: AylluStatus;
  contractAddress: string | null;
  createdAt: string;
}

export interface AylluMemberData {
  id: string;
  aylluId: string;
  userId: string;
  walletAddress: string;
  position: number;
  totalContributed: number;
  latePayments: number;
  hasReceivedPot: boolean;
  joinedAt: string;
}

export interface ContributionData {
  id: string;
  aylluId: string;
  userId: string;
  round: number;
  amount: number;
  txHash: string;
  isLate: boolean;
  contributedAt: string;
}

// --- Score Types ---

export interface AyniScoreResult {
  score: number;
  level: ScoreLevel;
  summary: string;
  strengths: string[];
  recommendations: string[];
  creditEligible: boolean;
}

export interface ScoreHistoryEntry {
  id: string;
  userId: string;
  score: number;
  reason: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// --- Wavy Node Types ---

export interface WavyRiskData {
  riskScore: number;
  riskLevel: string;
  flags: string[];
  rawData: Record<string, unknown>;
}

// --- UI Types ---

export interface RoundInfo {
  currentRound: number;
  potAmount: bigint;
  roundEndsAt: bigint;
  roundRecipient: string;
}
