import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: ".env.local" });

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const SNOWSCAN_API_KEY = process.env.SNOWSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./contracts/test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    hardhat: {
      chainId: 43113,
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: [PRIVATE_KEY],
    },
    mainnet: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      avalancheFujiTestnet: SNOWSCAN_API_KEY,
    },
    customChains: [
      {
        network: "avalancheFujiTestnet",
        chainId: 43113,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/testnet/evm/43113/etherscan",
          browserURL: "https://testnet.snowscan.xyz",
        },
      },
    ],
  },
};

export default config;
