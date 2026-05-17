import { ethers } from "hardhat";

const USDC_ADDRESS = process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS!;
const AYLLU_POOL_ADDRESS = process.env.NEXT_PUBLIC_AYLLU_POOL_ADDRESS!;

const POOL_ABI = [
  "function nextAylluId() view returns(uint256)",
  "function getAyllu(uint256) view returns(tuple(string name,address creator,uint256 contributionAmount,uint256 roundDuration,uint8 maxMembers,uint8 currentMemberCount,uint8 currentRound,uint256 roundStartedAt,uint8 status))",
  "function getMembers(uint256) view returns(tuple(address wallet,bool hasContributedThisRound,bool hasReceivedPot,uint8 roundToReceive,uint256 totalContributed,uint256 latePayments)[])",
  "function joinAyllu(uint256) external",
  "function contribute(uint256) external",
];

const USDC_ABI = [
  "function mint(address,uint256) external",
  "function approve(address,uint256) external returns(bool)",
  "function balanceOf(address) view returns(uint256)",
];

const STATUS = ["FORMING", "ACTIVE", "COMPLETED", "CANCELLED"];

async function main() {
  const [deployer] = await ethers.getSigners();
  const pool = new ethers.Contract(AYLLU_POOL_ADDRESS, POOL_ABI, deployer);
  const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, deployer);

  // Listar todos los ayllus
  const nextId = Number(await pool.nextAylluId());
  console.log(`\n=== ${nextId} Ayllus en Fuji ===\n`);

  for (let i = 0; i < nextId; i++) {
    const a = await pool.getAyllu(i);
    console.log(`  [${i}] "${a.name}" | ${STATUS[a.status]} | ${a.currentMemberCount}/${a.maxMembers} miembros | ${ethers.formatUnits(a.contributionAmount, 6)} USDC`);
  }

  // Buscar el ayllu objetivo (el argumento o el último en FORMING)
  const targetArg = process.env.AYLLU_ID;
  let targetId: number;

  if (targetArg !== undefined) {
    targetId = parseInt(targetArg);
  } else {
    // Buscar el último ayllu en FORMING
    targetId = -1;
    for (let i = nextId - 1; i >= 0; i--) {
      const a = await pool.getAyllu(i);
      if (Number(a.status) === 0) { targetId = i; break; }
    }
    if (targetId === -1) {
      console.log("\nNo hay ayllus en estado FORMING.");
      return;
    }
  }

  const ayllu = await pool.getAyllu(targetId);
  const spotsNeeded = Number(ayllu.maxMembers) - Number(ayllu.currentMemberCount);

  console.log(`\n=== Uniendo miembros a [${targetId}] "${ayllu.name}" ===`);
  console.log(`  Necesita ${spotsNeeded} miembros mas para activarse\n`);

  if (spotsNeeded === 0) {
    console.log("  Ayllu ya esta lleno!");

    // Si está ACTIVE, intentar contribuir
    if (Number(ayllu.status) === 1) {
      console.log("\n=== Ayllu ACTIVO — contribuyendo con wallets existentes ===\n");
      const members = await pool.getMembers(targetId);
      for (const m of members) {
        if (!m.hasContributedThisRound && m.wallet.toLowerCase() !== deployer.address.toLowerCase()) {
          console.log(`  Wallet ${m.wallet.slice(0, 10)}... no ha contribuido esta ronda`);
        }
      }
    }
    return;
  }

  // Generar wallets temporales y unirlas
  for (let i = 0; i < spotsNeeded; i++) {
    const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
    console.log(`  [Miembro ${i + 1}] ${wallet.address}`);

    // Enviar AVAX para gas
    const gasTx = await deployer.sendTransaction({
      to: wallet.address,
      value: ethers.parseEther("0.05"),
    });
    await gasTx.wait();
    console.log(`    ✅ 0.05 AVAX enviado para gas`);

    // Mint USDC
    const mintAmount = ayllu.contributionAmount * 10n;
    const mintTx = await usdc.mint(wallet.address, mintAmount);
    await mintTx.wait();
    console.log(`    ✅ ${ethers.formatUnits(mintAmount, 6)} USDC minteado`);

    // Join ayllu
    const poolWithWallet = pool.connect(wallet);
    const joinTx = await poolWithWallet.joinAyllu(targetId);
    await joinTx.wait();
    console.log(`    ✅ Se unio al ayllu`);

    // Approve USDC para contribuciones futuras
    const usdcWithWallet = usdc.connect(wallet);
    const approveTx = await usdcWithWallet.approve(AYLLU_POOL_ADDRESS, mintAmount);
    await approveTx.wait();
    console.log(`    ✅ USDC aprobado para contribuciones`);
  }

  // Verificar estado final
  const updated = await pool.getAyllu(targetId);
  const members = await pool.getMembers(targetId);
  console.log(`\n=== Estado final ===`);
  console.log(`  "${updated.name}" | ${STATUS[updated.status]} | ${updated.currentMemberCount}/${updated.maxMembers} miembros`);
  console.log(`\n  Miembros:`);
  for (const m of members) {
    console.log(`    ${m.wallet} | Ronda para recibir: ${m.roundToReceive}`);
  }

  if (Number(updated.status) === 1) {
    console.log(`\n  🎉 El ayllu esta ACTIVO! Ya pueden contribuir.`);
    console.log(`  Abrí localhost:3000/ayllu/${targetId} para ver el detalle y contribuir.`);
  }
}

main().catch((error) => {
  console.error("\n❌ Error:", error.message);
  process.exitCode = 1;
});
