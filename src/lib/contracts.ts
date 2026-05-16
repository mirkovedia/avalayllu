export const ADDRESSES = {
  AYLLU_POOL: (process.env.NEXT_PUBLIC_AYLLU_POOL_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
  AYNI_SCORE: (process.env.NEXT_PUBLIC_AYNI_SCORE_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
  MOCK_USDC: (process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
} as const;

export const MOCK_USDC_ABI = [
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
] as const;

export const AYLLU_POOL_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "_paymentToken", type: "address" },
      { name: "_ayniScore", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createAyllu",
    inputs: [
      { name: "name", type: "string" },
      { name: "maxMembers_", type: "uint8" },
      { name: "contributionAmount_", type: "uint256" },
      { name: "roundDuration_", type: "uint256" },
    ],
    outputs: [{ name: "aylluId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "joinAyllu",
    inputs: [{ name: "aylluId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "contribute",
    inputs: [{ name: "aylluId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAyllu",
    inputs: [{ name: "aylluId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "name", type: "string" },
          { name: "creator", type: "address" },
          { name: "contributionAmount", type: "uint256" },
          { name: "roundDuration", type: "uint256" },
          { name: "maxMembers", type: "uint8" },
          { name: "currentMemberCount", type: "uint8" },
          { name: "currentRound", type: "uint8" },
          { name: "roundStartedAt", type: "uint256" },
          { name: "status", type: "uint8" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMembers",
    inputs: [{ name: "aylluId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "wallet", type: "address" },
          { name: "hasContributedThisRound", type: "bool" },
          { name: "hasReceivedPot", type: "bool" },
          { name: "roundToReceive", type: "uint8" },
          { name: "totalContributed", type: "uint256" },
          { name: "latePayments", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRoundInfo",
    inputs: [{ name: "aylluId", type: "uint256" }],
    outputs: [
      { name: "currentRound", type: "uint8" },
      { name: "potAmount", type: "uint256" },
      { name: "roundEndsAt", type: "uint256" },
      { name: "roundRecipient", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nextAylluId",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AylluCreated",
    inputs: [
      { name: "aylluId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "contribution", type: "uint256", indexed: false },
      { name: "maxMembers", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "MemberJoined",
    inputs: [
      { name: "aylluId", type: "uint256", indexed: true },
      { name: "member", type: "address", indexed: true },
      { name: "position", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "ContributionMade",
    inputs: [
      { name: "aylluId", type: "uint256", indexed: true },
      { name: "member", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "round", type: "uint8", indexed: false },
      { name: "isLate", type: "bool", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PotDistributed",
    inputs: [
      { name: "aylluId", type: "uint256", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "round", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AylluCompleted",
    inputs: [
      { name: "aylluId", type: "uint256", indexed: true },
    ],
  },
] as const;

export const AYNI_SCORE_ABI = [
  {
    type: "function",
    name: "getScore",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getFullRecord",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "score", type: "uint256" },
          { name: "roundsCompleted", type: "uint256" },
          { name: "ayllisCompleted", type: "uint256" },
          { name: "totalLatePayments", type: "uint256" },
          { name: "totalContributed", type: "uint256" },
          { name: "lastUpdated", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getHistory",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "score", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "reason", type: "string" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setScore",
    inputs: [
      { name: "user", type: "address" },
      { name: "newScore", type: "uint256" },
      { name: "reason", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "ScoreUpdated",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "oldScore", type: "uint256", indexed: false },
      { name: "newScore", type: "uint256", indexed: false },
      { name: "reason", type: "string", indexed: false },
    ],
  },
] as const;
