import { ethers } from "hardhat";

const USDC_ADDRESS = process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS!;
const AYNI_SCORE_ADDRESS = process.env.NEXT_PUBLIC_AYNI_SCORE_ADDRESS!;
const AYLLU_POOL_ADDRESS = process.env.NEXT_PUBLIC_AYLLU_POOL_ADDRESS!;

const POOL_ABI = [
  "function nextAylluId() view returns(uint256)",
  "function createAyllu(string,uint8,uint256,uint256) external returns(uint256)",
  "function joinAyllu(uint256) external",
  "function contribute(uint256) external",
  "function getAyllu(uint256) view returns(tuple(string name,address creator,uint256 contributionAmount,uint256 roundDuration,uint8 maxMembers,uint8 currentMemberCount,uint8 currentRound,uint256 roundStartedAt,uint8 status))",
  "function getMembers(uint256) view returns(tuple(address wallet,bool hasContributedThisRound,bool hasReceivedPot,uint8 roundToReceive,uint256 totalContributed,uint256 latePayments)[])",
  "function getRoundInfo(uint256) view returns(uint8 currentRound,uint256 potAmount,uint256 roundEndsAt,address roundRecipient)",
];

const USDC_ABI = [
  "function mint(address,uint256) external",
  "function approve(address,uint256) external returns(bool)",
  "function allowance(address,address) view returns(uint256)",
  "function balanceOf(address) view returns(uint256)",
];

const STATUS = ["FORMING", "ACTIVE", "COMPLETED", "CANCELLED"];

// Wallets deterministas derivadas de seeds fijos (siempre las mismas)
const MEMBER_KEYS = [
  ethers.keccak256(ethers.toUtf8Bytes("avalayllu-demo-alice-2026")),
  ethers.keccak256(ethers.toUtf8Bytes("avalayllu-demo-bob-2026")),
  ethers.keccak256(ethers.toUtf8Bytes("avalayllu-demo-carol-2026")),
];

const NAMES = ["Alice", "Bob", "Carol"];

async function main() {
  const [deployer] = await ethers.getSigners();
  const pool = new ethers.Contract(AYLLU_POOL_ADDRESS, POOL_ABI, deployer);
  const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, deployer);

  // Determinar si ya hay un ayllu activo del deployer pendiente de contribuciones
  const mode = process.env.MODE || "auto";
  const aylluIdEnv = process.env.AYLLU_ID;

  if (aylluIdEnv !== undefined) {
    // Contribuir a un ayllu existente
    await contributeToAyllu(parseInt(aylluIdEnv), pool, usdc, deployer);
    return;
  }

  // Crear demo completa
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║   DEMO COMPLETA — AvalAyllu en Fuji         ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  // Setup wallets
  const members = MEMBER_KEYS.map((key, i) => {
    const wallet = new ethers.Wallet(key, ethers.provider);
    console.log(`  ${NAMES[i]}: ${wallet.address}`);
    return wallet;
  });

  // Fondear wallets
  console.log("\n── Fondeando wallets ──");
  for (let i = 0; i < members.length; i++) {
    const bal = await ethers.provider.getBalance(members[i].address);
    if (bal < ethers.parseEther("0.02")) {
      const tx = await deployer.sendTransaction({
        to: members[i].address,
        value: ethers.parseEther("0.05"),
      });
      await tx.wait();
      console.log(`  ✅ ${NAMES[i]} — 0.05 AVAX enviado`);
    } else {
      console.log(`  ⏭ ${NAMES[i]} — ya tiene AVAX`);
    }

    const usdcBal = await usdc.balanceOf(members[i].address);
    if (usdcBal < ethers.parseUnits("100", 6)) {
      const tx = await usdc.mint(members[i].address, ethers.parseUnits("1000", 6));
      await tx.wait();
      console.log(`  ✅ ${NAMES[i]} — 1000 USDC minteado`);
    } else {
      console.log(`  ⏭ ${NAMES[i]} — ya tiene USDC`);
    }
  }

  // Crear ayllu con deployer
  console.log("\n── Creando Ayllu ──");
  const contribution = ethers.parseUnits("50", 6);
  const createTx = await pool.createAyllu("Comunidad Andina", 4, contribution, 3600);
  await createTx.wait();
  const aylluId = Number(await pool.nextAylluId()) - 1;
  console.log(`  ✅ "Comunidad Andina" creado — ID: ${aylluId}`);

  // Unir miembros
  console.log("\n── Uniendo miembros ──");
  for (let i = 0; i < members.length; i++) {
    const tx = await pool.connect(members[i]).joinAyllu(aylluId);
    await tx.wait();
    console.log(`  ✅ ${NAMES[i]} se unio`);
  }

  // Verificar que está activo
  const ayllu = await pool.getAyllu(aylluId);
  console.log(`\n  Status: ${STATUS[ayllu.status]} (${ayllu.currentMemberCount}/${ayllu.maxMembers})`);

  // Aprobar USDC
  console.log("\n── Aprobando USDC ──");
  const approveAmt = ethers.parseUnits("500", 6);
  const appTx = await usdc.approve(AYLLU_POOL_ADDRESS, approveAmt);
  await appTx.wait();
  console.log(`  ✅ Deployer aprobó USDC`);

  for (let i = 0; i < members.length; i++) {
    const tx = await usdc.connect(members[i]).approve(AYLLU_POOL_ADDRESS, approveAmt);
    await tx.wait();
    console.log(`  ✅ ${NAMES[i]} aprobó USDC`);
  }

  // Contribuir Ronda 1
  await contributeToAyllu(aylluId, pool, usdc, deployer);
}

async function contributeToAyllu(
  aylluId: number,
  pool: ethers.Contract,
  usdc: ethers.Contract,
  deployer: ethers.Signer
) {
  const ayllu = await pool.getAyllu(aylluId);
  const membersList = await pool.getMembers(aylluId);
  const roundInfo = await pool.getRoundInfo(aylluId);

  console.log(`\n══ Contribuciones — "${ayllu.name}" (ID: ${aylluId}) ══`);
  console.log(`  Ronda: ${Number(roundInfo.currentRound) + 1}/${ayllu.maxMembers}`);
  console.log(`  Recipiente: ${roundInfo.roundRecipient}`);
  console.log(`  Pozo: ${ethers.formatUnits(roundInfo.potAmount, 6)} / ${ethers.formatUnits(ayllu.contributionAmount * BigInt(ayllu.maxMembers), 6)} USDC\n`);

  const deployerAddr = await deployer.getAddress();

  // Verificar wallets deterministas
  const wallets = MEMBER_KEYS.map(key => new ethers.Wallet(key, ethers.provider));

  for (const member of membersList) {
    if (member.hasContributedThisRound) {
      console.log(`  ⏭ ${member.wallet.slice(0, 10)}... ya contribuyó`);
      continue;
    }

    // Encontrar la wallet que corresponde
    let signer: ethers.Signer | null = null;
    let name = "Unknown";

    if (member.wallet.toLowerCase() === deployerAddr.toLowerCase()) {
      signer = deployer;
      name = "Deployer (tú)";
    } else {
      const idx = wallets.findIndex(w => w.address.toLowerCase() === member.wallet.toLowerCase());
      if (idx >= 0) {
        signer = wallets[idx];
        name = NAMES[idx];
      }
    }

    if (!signer) {
      console.log(`  ⚠ ${member.wallet.slice(0, 10)}... — wallet desconocida, no podemos contribuir`);
      continue;
    }

    // Verificar allowance
    const signerAddr = member.wallet;
    const allowance = await usdc.allowance(signerAddr, AYLLU_POOL_ADDRESS);
    if (allowance < ayllu.contributionAmount) {
      const appTx = await usdc.connect(signer).approve(AYLLU_POOL_ADDRESS, ethers.parseUnits("500", 6));
      await appTx.wait();
      console.log(`  ✅ ${name} — USDC aprobado`);
    }

    const tx = await pool.connect(signer).contribute(aylluId);
    const receipt = await tx.wait();
    console.log(`  ✅ ${name} contribuyó ${ethers.formatUnits(ayllu.contributionAmount, 6)} USDC (tx: ${receipt.hash.slice(0, 14)}...)`);
  }

  // Estado final
  const updated = await pool.getAyllu(aylluId);
  const newRound = await pool.getRoundInfo(aylluId);
  console.log(`\n  Estado: ${STATUS[updated.status]} | Ronda: ${Number(updated.currentRound) + (Number(updated.status) === 1 ? 1 : 0)}/${updated.maxMembers}`);

  if (Number(updated.status) === 2) {
    console.log(`\n  🎉 ¡Ayllu COMPLETADO! Todos recibieron su pozo.`);
  } else if (Number(updated.status) === 1) {
    console.log(`\n  Siguiente ronda — recipiente: ${newRound.roundRecipient}`);
    console.log(`  Abrí localhost:3000/ayllu/${aylluId} para contribuir desde el browser.`);
  }
}

main().catch((error) => {
  console.error("\n❌ Error:", error.message);
  process.exitCode = 1;
});
