import { ethers } from "hardhat";

const USDC_ADDRESS = process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS!;
const AYNI_SCORE_ADDRESS = process.env.NEXT_PUBLIC_AYNI_SCORE_ADDRESS!;
const AYLLU_POOL_ADDRESS = process.env.NEXT_PUBLIC_AYLLU_POOL_ADDRESS!;

const MOCK_USDC_ABI = [
  "function mint(address to, uint256 amount) external",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

const AYLLU_POOL_ABI = [
  "function createAyllu(string name, uint8 maxMembers_, uint256 contributionAmount_, uint256 roundDuration_) external returns (uint256)",
  "function joinAyllu(uint256 aylluId) external",
  "function contribute(uint256 aylluId) external",
  "function getAyllu(uint256 aylluId) external view returns (tuple(string name, address creator, uint256 contributionAmount, uint256 roundDuration, uint8 maxMembers, uint8 currentMemberCount, uint8 currentRound, uint256 roundStartedAt, uint8 status))",
  "function getMembers(uint256 aylluId) external view returns (tuple(address wallet, bool hasContributedThisRound, bool hasReceivedPot, uint8 roundToReceive, uint256 totalContributed, uint256 latePayments)[])",
  "function getRoundInfo(uint256 aylluId) external view returns (uint8 currentRound, uint256 potAmount, uint256 roundEndsAt, address roundRecipient)",
  "function nextAylluId() external view returns (uint256)",
];

const AYNI_SCORE_ABI = [
  "function getScore(address user) external view returns (uint256)",
  "function getFullRecord(address user) external view returns (tuple(uint256 score, uint256 roundsCompleted, uint256 ayllisCompleted, uint256 totalLatePayments, uint256 totalContributed, uint256 lastUpdated))",
];

const STATUS = ["FORMING", "ACTIVE", "COMPLETED", "CANCELLED"];

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("╔══════════════════════════════════════════════╗");
  console.log("║   E2E TEST — AvalAyllu en Fuji Testnet      ║");
  console.log("╚══════════════════════════════════════════════╝\n");
  console.log(`Wallet:  ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} AVAX`);
  console.log(`USDC:    ${USDC_ADDRESS}`);
  console.log(`AyniScore: ${AYNI_SCORE_ADDRESS}`);
  console.log(`AylluPool: ${AYLLU_POOL_ADDRESS}\n`);

  const usdc = new ethers.Contract(USDC_ADDRESS, MOCK_USDC_ABI, deployer);
  const pool = new ethers.Contract(AYLLU_POOL_ADDRESS, AYLLU_POOL_ABI, deployer);
  const score = new ethers.Contract(AYNI_SCORE_ADDRESS, AYNI_SCORE_ABI, deployer);

  let passed = 0;
  let failed = 0;

  const test = (name: string, ok: boolean) => {
    if (ok) {
      console.log(`  ✅ ${name}`);
      passed++;
    } else {
      console.log(`  ❌ ${name}`);
      failed++;
    }
  };

  // ── Test 1: Lectura de contratos ──
  console.log("\n── 1. Verificando contratos desplegados ──");

  const decimals = await usdc.decimals();
  test("MockUSDC.decimals() == 6", Number(decimals) === 6);

  const nextId = await pool.nextAylluId();
  test(`AylluPool.nextAylluId() es valido (${nextId})`, nextId >= 0n);

  const userScore = await score.getScore(deployer.address);
  test(`AyniScore.getScore() retorna valor (${userScore})`, userScore >= 0n);

  // ── Test 2: Mint USDC ──
  console.log("\n── 2. Mint USDC de prueba ──");

  const balanceBefore = await usdc.balanceOf(deployer.address);
  console.log(`  Balance antes: ${ethers.formatUnits(balanceBefore, 6)} USDC`);

  const mintAmount = ethers.parseUnits("500", 6);
  const mintTx = await usdc.mint(deployer.address, mintAmount);
  const mintReceipt = await mintTx.wait();
  test(`Mint 500 USDC exitoso (tx: ${mintReceipt.hash.slice(0, 14)}...)`, mintReceipt.status === 1);

  const balanceAfter = await usdc.balanceOf(deployer.address);
  console.log(`  Balance despues: ${ethers.formatUnits(balanceAfter, 6)} USDC`);
  test("Balance incremento correctamente", balanceAfter === balanceBefore + mintAmount);

  // ── Test 3: Crear Ayllu ──
  console.log("\n── 3. Crear nuevo Ayllu ──");

  const aylluName = `E2E-Test-${Date.now().toString(36)}`;
  const contribution = ethers.parseUnits("10", 6);
  const roundDuration = 3600n;
  const maxMembers = 2;

  const createTx = await pool.createAyllu(aylluName, maxMembers, contribution, roundDuration);
  const createReceipt = await createTx.wait();
  test(`Ayllu "${aylluName}" creado (tx: ${createReceipt.hash.slice(0, 14)}...)`, createReceipt.status === 1);

  const newNextId = await pool.nextAylluId();
  const createdAylluId = newNextId - 1n;
  console.log(`  Ayllu ID: ${createdAylluId}`);

  // ── Test 4: Leer Ayllu creado ──
  console.log("\n── 4. Leer datos del Ayllu ──");

  const ayllu = await pool.getAyllu(createdAylluId);
  test(`Nombre correcto: "${ayllu.name}"`, ayllu.name === aylluName);
  test(`Status FORMING (0)`, Number(ayllu.status) === 0);
  test(`MaxMembers == ${maxMembers}`, Number(ayllu.maxMembers) === maxMembers);
  test(`Contribution == 10 USDC`, ayllu.contributionAmount === contribution);
  test(`Creator es deployer`, ayllu.creator.toLowerCase() === deployer.address.toLowerCase());

  // ── Test 5: Leer miembros ──
  console.log("\n── 5. Verificar miembros ──");

  const members = await pool.getMembers(createdAylluId);
  test(`Creator es primer miembro`, members.length >= 1 && members[0].wallet.toLowerCase() === deployer.address.toLowerCase());

  // ── Test 6: Aprobar USDC para el pool ──
  console.log("\n── 6. Aprobar USDC para contribuciones ──");

  const approveAmount = ethers.parseUnits("1000", 6);
  const approveTx = await usdc.approve(AYLLU_POOL_ADDRESS, approveAmount);
  const approveReceipt = await approveTx.wait();
  test(`Approve 1000 USDC exitoso (tx: ${approveReceipt.hash.slice(0, 14)}...)`, approveReceipt.status === 1);

  const allowance = await usdc.allowance(deployer.address, AYLLU_POOL_ADDRESS);
  test(`Allowance == 1000 USDC`, allowance === approveAmount);

  // ── Test 7: AyniScore lectura completa ──
  console.log("\n── 7. AyniScore - Registro completo ──");

  const record = await score.getFullRecord(deployer.address);
  console.log(`  Score: ${record.score}`);
  console.log(`  Rondas completadas: ${record.roundsCompleted}`);
  console.log(`  Ayllus completados: ${record.ayllisCompleted}`);
  console.log(`  Pagos tardios: ${record.totalLatePayments}`);
  console.log(`  Total contribuido: ${ethers.formatUnits(record.totalContributed, 6)} USDC`);
  test("getFullRecord() retorna datos validos", record.score >= 0n);

  // ── Test 8: Verificar todos los Ayllus existentes ──
  console.log("\n── 8. Estado de todos los Ayllus ──");

  const totalAyllus = Number(newNextId);
  for (let i = 0; i < totalAyllus; i++) {
    const a = await pool.getAyllu(BigInt(i));
    const m = await pool.getMembers(BigInt(i));
    console.log(`  [${i}] ${a.name} | ${STATUS[a.status]} | ${a.currentMemberCount}/${a.maxMembers} miembros | Ronda ${a.currentRound} | ${ethers.formatUnits(a.contributionAmount, 6)} USDC`);
  }
  test(`Se leyeron ${totalAyllus} Ayllus correctamente`, totalAyllus > 0);

  // ── Resumen ──
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log(`║  RESULTADO: ${passed} passed, ${failed} failed               ║`);
  console.log("╚══════════════════════════════════════════════╝");
  console.log(`\n🔗 Ver contrato: https://testnet.snowscan.xyz/address/${AYLLU_POOL_ADDRESS}`);
  console.log(`🔗 Ultimo tx: https://testnet.snowscan.xyz/tx/${createReceipt.hash}`);

  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error("\n❌ ERROR FATAL:", error.message);
  process.exitCode = 1;
});
