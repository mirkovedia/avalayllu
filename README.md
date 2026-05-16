# AvalAyllu 🏔️

**Ahorro rotativo descentralizado en Avalanche — Digitalizando el Pasanaku para LatAm**

> Hackathon: Avalanche LatAm Institucional 2026  
> Tracks: Financial Inclusion + Credit Scoring Analytics

---

## El Problema

En Latinoamérica, +70% de la población está sub-bancarizada. Sin embargo, millones participan en **sistemas de ahorro rotativo informales** (Pasanaku en Bolivia, Tanda en México, Vaca en Colombia). Estos sistemas funcionan basados en **confianza social**, pero:

- No generan historial crediticio
- No tienen protección contra incumplimiento
- Son invisibles para el sistema financiero formal

## La Solución

**AvalAyllu** digitaliza el Pasanaku usando smart contracts en Avalanche, creando:

1. **Pools de ahorro rotativo** con USDC — transparentes y auto-ejecutables
2. **Ayni Score** — scoring crediticio on-chain basado en comportamiento real de pago
3. **Análisis AI** — Claude evalúa la confiabilidad de cada participante

### ¿Por qué Avalanche?

- ⚡ Finalidad sub-segundo en C-Chain (~2s)
- 💰 Fees extremadamente bajos (<$0.01 por tx)
- 🏛️ Ecosistema institucional (Securitize, Fireblocks, Circle USDC nativo)
- 🌎 Presencia creciente en LatAm

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                │
│  Dashboard │ Score │ Crear Ayllu │ Contribuir       │
├─────────────────────────────────────────────────────┤
│           wagmi + viem + RainbowKit                  │
├──────────────┬──────────────┬───────────────────────┤
│  AylluPool   │  AyniScore   │    MockUSDC           │
│  (C-Chain)   │  (C-Chain)   │    (C-Chain)          │
├──────────────┴──────────────┴───────────────────────┤
│              Avalanche Fuji Testnet                  │
└─────────────────────────────────────────────────────┘
        │                              │
   Supabase (cache)              Claude AI + Wavy Node
   off-chain data                (risk scoring)
```

### Smart Contracts

| Contrato | Función |
|----------|---------|
| `AylluPool.sol` | Gestión de pools rotativos: crear, unirse, contribuir, distribuir pot automáticamente |
| `AyniScore.sol` | Scoring crediticio on-chain: +50 pts por ronda puntual, -25 por atraso, +100 por completar |
| `MockUSDC.sol` | Token ERC20 de 6 decimales para testnet |

### Flujo del Protocolo

```
1. Crear Ayllu (definir: miembros, monto, duración)
2. Miembros se unen hasta completar cupo → Estado: ACTIVE
3. Cada ronda: todos contribuyen USDC → Pot va al miembro de turno
4. Score se actualiza automáticamente por cada acción
5. Al completar todas las rondas → todos recibieron, Score aumenta
```

---

## Demo Rápida (Local)

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar contratos
npm run compile

# 3. Iniciar nodo local Hardhat (en terminal separada)
npm run node

# 4. Deployar contratos + crear datos de demo
npm run demo:seed

# 5. Copiar las direcciones del output al .env.local
#    NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x...
#    NEXT_PUBLIC_AYNI_SCORE_ADDRESS=0x...
#    NEXT_PUBLIC_AYLLU_POOL_ADDRESS=0x...

# 6. Iniciar frontend
npm run dev
```

### Conectar MetaMask al demo local
- **RPC URL:** http://127.0.0.1:8545
- **Chain ID:** 43113
- **Importar cuenta:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

---

## Deploy a Fuji Testnet

```bash
# 1. Obtener AVAX de testnet
# https://build.avax.network/console/primary-network/faucet

# 2. Configurar .env
cp .env.example .env.local
# Agregar PRIVATE_KEY con AVAX

# 3. Deployar
npm run deploy:fuji

# 4. Verificar en Snowscan
npm run verify:fuji
```

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Smart Contracts | Solidity 0.8.24, OpenZeppelin 5.x, Hardhat |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Wallet | wagmi v2, viem, RainbowKit |
| Base de Datos | Supabase (PostgreSQL + RLS + Realtime) |
| AI/Scoring | Claude API (análisis crediticio), Wavy Node (risk scoring) |
| Blockchain | Avalanche C-Chain (Fuji testnet) |

---

## Modelo de Negocio

1. **Fee por pool (0.5-1%)** — Comisión sobre cada distribución de pot
2. **Score-as-a-Service** — Vender Ayni Score como servicio a fintech/bancos
3. **Partnerships institucionales** — Integración con bancos para créditos basados en score on-chain
4. **Premium features** — Pools privados, montos mayores, insurance pools

### Mercado Objetivo

- 🇧🇴 Bolivia: 3M+ participantes en Pasanaku
- 🇲🇽 México: 15M+ en Tandas
- 🇨🇴 Colombia: 5M+ en Natilleras/Vacas
- 🇵🇪 Perú: 4M+ en Juntas

**TAM LatAm:** $50B+ en ahorro rotativo informal anual

---

## Integraciones de Partners

### Wavy Node
Risk scoring complementario al Ayni Score on-chain. Evalúa patrones de comportamiento y señala wallets de alto riesgo antes de que se unan a un Ayllu.

### Claude AI (Anthropic)
Análisis predictivo del Ayni Score: genera insights personalizados sobre confiabilidad crediticia, recomendaciones de mejora, y alertas de comportamiento atípico.

---

## Tests

```bash
# Tests de smart contracts (11 tests)
npm run test:contracts

# Cobertura
npx hardhat coverage
```

---

## Equipo

- **Mirko Baron Vedia** — Full-stack + Web3 Developer (Bolivia)

---

## Licencia

MIT

---

*Construido con ❤️ desde Bolivia para LatAm, sobre Avalanche.*
