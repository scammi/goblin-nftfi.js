import dotenv from 'dotenv';
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      chainId: 4,
      forking: {
        url: process.env.NFTFI_SDK_ETHEREUM_PROVIDER_URL ?? '',
        blockNumber: 11283080,
      }
    }
  }
};

export default config;