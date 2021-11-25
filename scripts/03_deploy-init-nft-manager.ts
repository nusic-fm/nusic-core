import { BigNumber } from '@ethersproject/bignumber';
import { ethers, run } from 'hardhat';
import { BondNFTManager, BondNFTManager__factory, } from '../typechain';

// This is only needed when we want to deploy BondNFTManager separately
async function main() {

  const BondNFTManager:BondNFTManager__factory = await ethers.getContractFactory("BondNFTManager");
  const bondNFTManager:BondNFTManager = await BondNFTManager.deploy();
  await bondNFTManager.deployed();
  console.log("BondNFTManager deployed to:", bondNFTManager.address);

  // Need to replace address of RatingEngine,BondNFTGenerator,ChainlinkOracleInfo,ChainlinkMetadataRequest in this same order
  await bondNFTManager.initialize("0xd2A3BF5f8B9F9fD1aF81b1BA47A896e562Aa28D1", "0x0F4763d3652aFB7d061909C5080ee9323b292540", "0xDAccf5a4636c745c796182dCA912546f15C80133", "0xEDBbe0A5f876aF88b26B1f0BD06A43dC33EaDf81", "0xEDBbe0A5f876aF88b26B1f0BD06A43dC33EaDf81");
  console.log("BondNFTManager Initialized");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
