import { ethers } from "hardhat";

const USDC_ADDRESS = process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS!;
const AYLLU_POOL_ADDRESS = process.env.NEXT_PUBLIC_AYLLU_POOL_ADDRESS!;

const POOL_ABI = [
  "function getAyllu(uint256) view returns(tuple(string name,address creator,uint256 contributionAmount,uint256 roundDuration,uint8 maxMembers,uint8 currentMemberCount,uint8 currentRound,uint256 roundStartedAt,uint8 status))",
  "function getMembers(uint256) view returns(tuple(address wallet,bool hasContributedThisRound,bool hasReceivedPot,uint8 roundToReceive,uint256 totalContributed,uint256 latePayments)[])",
  "function getRoundInfo(uint256) view returns(uint8 currentRound,uint256 potAmount,uint256 roundEndsAt,address roundRecipient)",
  "function contribute(uint256) external",
];

const USDC_ABI = [
  "function approve(address,uint256) external returns(bool)",
  "function allowance(address,address) view returns(uint256)",
  "function balanceOf(address) view returns(uint256)",
];

const AYLLU_ID = 3;

async function main() {
  const [deployer] = await ethers.getSigners();
  const pool = new ethers.Contract(AYLLU_POOL_ADDRESS, POOL_ABI, deployer);
  const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, deployer);

  const ayllu = await pool.getAyllu(AYLLU_ID);
  const members = await pool.getMembers(AYLLU_ID);
  const roundInfo = await pool.getRoundInfo(AYLLU_ID);

  console.log(`\n=== "${ayllu.name}" — Ronda ${Number(roundInfo.currentRound) + 1}/${ayllu.maxMembers} ===`);
  console.log(`  Recipiente del pozo: ${roundInfo.roundRecipient}`);
  console.log(`  Pozo acumulado: ${ethers.formatUnits(roundInfo.potAmount, 6)} USDC\n`);

  // Encontrar miembros que no han contribuido (excluyendo deployer)
  const pending = members.filter(
    (m: { hasContributedThisRound: boolean; wallet: string }) =>
      !m.hasContributedThisRound && m.wallet.toLowerCase() !== deployer.address.toLowerCase()
  );

  if (pending.length === 0) {
    console.log("  Todos los miembros ya contribuyeron esta ronda!");
    return;
  }

  console.log(`  ${pending.length} miembros pendientes de contribuir:\n`);

  for (const member of pending) {
    const wallet = new ethers.Wallet(
      ethers.Wallet.createRandom().privateKey,
      ethers.provider
    );

    // Necesitamos la private key de cada wallet temporal
    // Como no las guardamos, vamos a enviar AVAX y hacer que el deployer contribuya en nombre
    // Pero el contrato require msg.sender == member...
    // Solución: recrear la wallet no es posible, pero podemos usar el deployer para fondear
    // y luego firmar desde la wallet original.

    // El problema: no tenemos las private keys de las wallets temporales.
    // Solución alternativa: usar ecrecover o simplemente fondear nuevas wallets y...
    // En realidad, las wallets originales ya tienen USDC y allowance.
    // Pero no tenemos sus private keys.

    console.log(`  ⚠ ${member.wallet.slice(0, 10)}... — no tenemos su private key`);
  }

  // Plan B: Las wallets temporales se perdieron. Necesitamos que el deployer
  // haga las contribuciones. Pero el contrato valida que msg.sender sea miembro.
  // Solución real: cancelar y recrear con wallets deterministas.

  console.log(`\n  Las private keys de las wallets temporales no se guardaron.`);
  console.log(`  Generando nuevas wallets deterministas y recreando el escenario...\n`);

  // No podemos contribuir con wallets perdidas.
  // Vamos a usar wallets derivadas del deployer para que sean reproducibles.
  console.log("  Abortando — ejecutando plan alternativo...\n");
}

main().catch(console.error);
