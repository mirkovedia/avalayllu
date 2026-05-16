import { run } from "hardhat";

interface DeployedContracts {
  mockUsdc: string;
  ayniScore: string;
  aylluPool: string;
}

async function main() {
  const contracts: DeployedContracts = {
    mockUsdc: process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS ?? "",
    ayniScore: process.env.NEXT_PUBLIC_AYNI_SCORE_ADDRESS ?? "",
    aylluPool: process.env.NEXT_PUBLIC_AYLLU_POOL_ADDRESS ?? "",
  };

  if (!contracts.mockUsdc || !contracts.ayniScore || !contracts.aylluPool) {
    console.error("Falta configurar las direcciones en .env.local");
    console.error("Ejecuta primero: npm run deploy:fuji");
    process.exit(1);
  }

  console.log("Verificando contratos en Snowscan...\n");

  // MockUSDC (sin constructor args)
  try {
    console.log("--- Verificando MockUSDC ---");
    await run("verify:verify", {
      address: contracts.mockUsdc,
      constructorArguments: [],
    });
    console.log("MockUSDC verificado!");
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("Already Verified")) {
      console.log("MockUSDC ya estaba verificado");
    } else {
      console.error("Error verificando MockUSDC:", msg);
    }
  }

  // AyniScore (sin constructor args)
  try {
    console.log("\n--- Verificando AyniScore ---");
    await run("verify:verify", {
      address: contracts.ayniScore,
      constructorArguments: [],
    });
    console.log("AyniScore verificado!");
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("Already Verified")) {
      console.log("AyniScore ya estaba verificado");
    } else {
      console.error("Error verificando AyniScore:", msg);
    }
  }

  // AylluPool (constructor args: mockUsdc, ayniScore)
  try {
    console.log("\n--- Verificando AylluPool ---");
    await run("verify:verify", {
      address: contracts.aylluPool,
      constructorArguments: [contracts.mockUsdc, contracts.ayniScore],
    });
    console.log("AylluPool verificado!");
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("Already Verified")) {
      console.log("AylluPool ya estaba verificado");
    } else {
      console.error("Error verificando AylluPool:", msg);
    }
  }

  console.log("\n========================================");
  console.log("VERIFICACION COMPLETADA");
  console.log("========================================");
  console.log(`Explorer: https://testnet.snowscan.xyz/address/${contracts.aylluPool}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
