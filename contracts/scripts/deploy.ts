import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Desplegando contratos con:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "AVAX");

  // 1. Deploy MockUSDC
  console.log("\n--- Desplegando MockUSDC ---");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("MockUSDC desplegado en:", usdcAddress);

  // 2. Deploy AyniScore
  console.log("\n--- Desplegando AyniScore ---");
  const AyniScore = await ethers.getContractFactory("AyniScore");
  const ayniScore = await AyniScore.deploy();
  await ayniScore.waitForDeployment();
  const ayniScoreAddress = await ayniScore.getAddress();
  console.log("AyniScore desplegado en:", ayniScoreAddress);

  // 3. Deploy AylluPool
  console.log("\n--- Desplegando AylluPool ---");
  const AylluPool = await ethers.getContractFactory("AylluPool");
  const aylluPool = await AylluPool.deploy(usdcAddress, ayniScoreAddress);
  await aylluPool.waitForDeployment();
  const aylluPoolAddress = await aylluPool.getAddress();
  console.log("AylluPool desplegado en:", aylluPoolAddress);

  // 4. Otorgar SCORE_UPDATER_ROLE al AylluPool y al deployer
  console.log("\n--- Configurando permisos ---");
  const tx = await ayniScore.grantScoreUpdater(aylluPoolAddress);
  await tx.wait();
  console.log("AylluPool tiene permiso de actualizar scores");

  const tx2 = await ayniScore.grantScoreUpdater(deployer.address);
  await tx2.wait();
  console.log("Deployer tiene permiso de actualizar scores (para API backend)");

  // Resumen
  console.log("\n========================================");
  console.log("DEPLOY COMPLETADO");
  console.log("========================================");
  console.log("MockUSDC:    ", usdcAddress);
  console.log("AyniScore:   ", ayniScoreAddress);
  console.log("AylluPool:   ", aylluPoolAddress);
  console.log("========================================");
  console.log("\nActualizar .env.local con:");
  console.log(`NEXT_PUBLIC_MOCK_USDC_ADDRESS=${usdcAddress}`);
  console.log(`NEXT_PUBLIC_AYNI_SCORE_ADDRESS=${ayniScoreAddress}`);
  console.log(`NEXT_PUBLIC_AYLLU_POOL_ADDRESS=${aylluPoolAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
