import { ethers, run } from 'hardhat';
import { BondNFTGenerator, BondNFTGenerator__factory, BondNFTManager, BondNFTManager__factory, ChainlinkClient__factory, ChainlinkOracleInfo, ChainlinkOracleInfo__factory, RatingEngine, RatingEngine__factory } from '../typechain';

async function main() {
  
  const oracleAddress = "0xcE4452C43390842bE32B45964945276A78985E88";
  const jobId = "a90ac9049d3b4f5abcb315ff1a3a367a";
  const fee = "1000000000000000000"; // 1 Link token

  const RatingEngine:RatingEngine__factory = await ethers.getContractFactory("RatingEngine");
  const ratingEngine:RatingEngine = await RatingEngine.deploy();
  await ratingEngine.deployed();

  const ChainlinkOracleInfo:ChainlinkOracleInfo__factory = await ethers.getContractFactory("ChainlinkOracleInfo");
  const chainlinkOracleInfo:ChainlinkOracleInfo = await ChainlinkOracleInfo.deploy();
  await chainlinkOracleInfo.deployed();
  await chainlinkOracleInfo.initialize(oracleAddress,jobId,fee);

  const BondNFTGenerator:BondNFTGenerator__factory = await ethers.getContractFactory("BondNFTGenerator");
  const bondNFTGenerator:BondNFTGenerator = await BondNFTGenerator.deploy();
  await bondNFTGenerator.deployed();

  const BondNFTManager:BondNFTManager__factory = await ethers.getContractFactory("BondNFTManager");
  const bondNFTManager:BondNFTManager = await BondNFTManager.deploy();
  await bondNFTManager.deployed();

  await bondNFTManager.initialize(ratingEngine.address, bondNFTGenerator.address, chainlinkOracleInfo.address);

  console.log("RatingEngine deployed to:", ratingEngine.address);
  console.log("ChainlinkOracleInfo deployed to:", chainlinkOracleInfo.address);
  console.log("BondNFTGenerator deployed to:", bondNFTGenerator.address);
  console.log("BondNFTManager deployed to:", bondNFTManager.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
