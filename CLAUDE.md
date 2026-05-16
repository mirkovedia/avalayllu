# AvalAyllu

Plataforma de ahorro rotativo descentralizado en Avalanche para LatAm.
Inspirada en el Ayni andino y el Pasanaku boliviano.
Hackathon: Avalanche LatAm Institucional 2026.

## Stack
- Next.js 14 App Router + TypeScript + TailwindCSS
- Supabase (auth, db, realtime)
- Solidity + Hardhat en Avalanche Fuji (ChainID 43113)
- wagmi v2 + viem + RainbowKit para wallet
- Claude API para Ayni Score
- Wavy Node para risk scoring

## Contratos en Fuji testnet
- AylluPool: [actualizar tras deploy]
- AyniScore: [actualizar tras deploy]
- MockUSDC: [actualizar tras deploy]

## Comandos clave
- `npm run dev` — inicia el frontend
- `npx hardhat compile` — compila contratos
- `npx hardhat test` — corre tests
- `npx hardhat run contracts/scripts/deploy.ts --network fuji` — deploya en Fuji
- `npx hardhat verify --network fuji <address>` — verifica en Snowscan

## Reglas de desarrollo
- Siempre usar TypeScript estricto, nunca `any`
- Manejo de errores en todas las llamadas async
- Componentes en espanol donde sea UI-facing (labels, textos)
- Codigo y variables en ingles
- USDC tiene 6 decimales — siempre usar parseUnits/formatUnits
- Nunca exponer PRIVATE_KEY ni ANTHROPIC_API_KEY al cliente
- RLS habilitado en todas las tablas de Supabase
- Server Components por defecto, "use client" solo cuando sea necesario
- Fuente de verdad: blockchain. Supabase es cache off-chain.
