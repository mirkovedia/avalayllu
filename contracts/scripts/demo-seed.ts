import { ethers } from "hardhat";

async function main() {
  const [deployer, alice, bob, carol] = await ethers.getSigners();
  console.log("=== DEMO SEED: Preparando datos de demostracion ===\n");
  console.log("Deployer:", deployer.address);
  console.log("Alice:", alice.address);
  console.log("Bob:", bob.address);
  console.log("Carol:", carol.address);

  // 1. Deploy contratos
  console.log("\n--- Desplegando contratos ---");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();

  const AyniScore = await ethers.getContractFactory("AyniScore");
  const ayniScore = await AyniScore.deploy();
  await ayniScore.waitForDeployment();
  const ayniScoreAddress = await ayniScore.getAddress();

  const AylluPool = await ethers.getContractFactory("AylluPool");
  const aylluPool = await AylluPool.deploy(usdcAddress, ayniScoreAddress);
  await aylluPool.waitForDeployment();
  const aylluPoolAddress = await aylluPool.getAddress();

  // Permisos
  await (await ayniScore.grantScoreUpdater(aylluPoolAddress)).wait();
  await (await ayniScore.grantScoreUpdater(deployer.address)).wait();
  console.log("Contratos desplegados y configurados");

  // 2. Mintear USDC a todos
  const mintAmount = ethers.parseUnits("10000", 6); // 10,000 USDC
  await (await usdc.mint(deployer.address, mintAmount)).wait();
  await (await usdc.mint(alice.address, mintAmount)).wait();
  await (await usdc.mint(bob.address, mintAmount)).wait();
  await (await usdc.mint(carol.address, mintAmount)).wait();
  console.log("Minteados 10,000 USDC a cada participante");

  // 3. Crear un Ayllu de ejemplo
  console.log("\n--- Creando Ayllu de demostracion ---");
  const contribution = ethers.parseUnits("100", 6); // 100 USDC
  const roundDuration = 3600; // 1 hora para demos

  await (await aylluPool.createAyllu("Familia Andina", 3, contribution, roundDuration)).wait();
  console.log("Ayllu 'Familia Andina' creado (3 miembros, 100 USDC/ronda)");

  // 4. Alice y Bob se unen
  await (await aylluPool.connect(alice).joinAyllu(0)).wait();
  console.log("Alice se unio al Ayllu");

  await (await aylluPool.connect(bob).joinAyllu(0)).wait();
  console.log("Bob se unio -> Ayllu ACTIVO (3/3 miembros)");

  // 5. Aprobar USDC para contribuciones
  const approveAmount = ethers.parseUnits("1000", 6);
  await (await usdc.approve(aylluPoolAddress, approveAmount)).wait();
  await (await usdc.connect(alice).approve(aylluPoolAddress, approveAmount)).wait();
  await (await usdc.connect(bob).approve(aylluPoolAddress, approveAmount)).wait();
  console.log("USDC aprobado para contribuciones");

  // 6. Ronda 1: Todos contribuyen -> Deployer recibe el pot
  console.log("\n--- Ronda 1: Contribuciones ---");
  await (await aylluPool.contribute(0)).wait();
  console.log("Deployer contribuyo 100 USDC");
  await (await aylluPool.connect(alice).contribute(0)).wait();
  console.log("Alice contribuyo 100 USDC");
  await (await aylluPool.connect(bob).contribute(0)).wait();
  console.log("Bob contribuyo 100 USDC -> Pot distribuido a Deployer (300 USDC)");

  // 7. Crear un segundo Ayllu en estado FORMING (para demo de unirse)
  await (await aylluPool.connect(alice).createAyllu("Vecinos Crypto", 4, ethers.parseUnits("50", 6), 7200)).wait();
  console.log("\nAyllu 'Vecinos Crypto' creado (4 miembros, 50 USDC/ronda) - FORMING");

  // 8. Set scores para demo
  await (await ayniScore.setScore(deployer.address, 750, "Contribucion puntual Ronda 1")).wait();
  await (await ayniScore.setScore(alice.address, 620, "Primer Ayllu completado")).wait();
  await (await ayniScore.setScore(bob.address, 450, "Nuevo en la plataforma")).wait();
  console.log("Scores iniciales asignados");

  // Resumen final
  console.log("\n========================================");
  console.log("DEMO SEED COMPLETADO");
  console.log("========================================");
  console.log("MockUSDC:    ", usdcAddress);
  console.log("AyniScore:   ", ayniScoreAddress);
  console.log("AylluPool:   ", aylluPoolAddress);
  console.log("========================================");
  console.log("\nAyllus creados:");
  console.log("  [0] Familia Andina - ACTIVE, Ronda 2 (esperando contribuciones)");
  console.log("  [1] Vecinos Crypto - FORMING (esperando 3 miembros mas)");
  console.log("\nScores:");
  console.log("  Deployer: 750 | Alice: 620 | Bob: 450");
  console.log("\nPara conectar MetaMask al nodo local:");
  console.log("  RPC: http://127.0.0.1:8545");
  console.log("  Chain ID: 43113");
  console.log(`  Private Key (Deployer): 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`);
  console.log("\n.env.local:");
  console.log(`NEXT_PUBLIC_MOCK_USDC_ADDRESS=${usdcAddress}`);
  console.log(`NEXT_PUBLIC_AYNI_SCORE_ADDRESS=${ayniScoreAddress}`);
  console.log(`NEXT_PUBLIC_AYLLU_POOL_ADDRESS=${aylluPoolAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
