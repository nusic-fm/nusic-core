import { BigNumber } from '@ethersproject/bignumber';
import { ethers, run } from 'hardhat';
import { BondNFTGenerator, BondNFTGenerator__factory, BondNFTManager, BondNFTManager__factory, ChainlinkMetadataRequest, ChainlinkMetadataRequest__factory, ChainlinkOracleInfo, ChainlinkOracleInfo__factory, RatingEngine, RatingEngine__factory } from '../typechain';

async function main() {
  
  const oracleAddress = "0xcE4452C43390842bE32B45964945276A78985E88";
  const listenersJobId = "a90ac9049d3b4f5abcb315ff1a3a367a";
  const fee = "1000000000000000000"; // 1 Link token
  const metadataJobId = "b8ec9aad02804ce098397a731b26c7c3"; // This needs to be changed for right api access

  
  const RatingEngine:RatingEngine__factory = await ethers.getContractFactory("RatingEngine");
  const ratingEngine:RatingEngine = await RatingEngine.deploy();
  await ratingEngine.deployed();
  console.log("RatingEngine deployed to:", ratingEngine.address);

  const ChainlinkOracleInfo:ChainlinkOracleInfo__factory = await ethers.getContractFactory("ChainlinkOracleInfo");
  const chainlinkOracleInfo:ChainlinkOracleInfo = await ChainlinkOracleInfo.deploy();
  await chainlinkOracleInfo.deployed();
  console.log("ChainlinkOracleInfo deployed to:", chainlinkOracleInfo.address);
  await chainlinkOracleInfo.initialize(oracleAddress,listenersJobId,fee);
  console.log("ChainlinkOracleInfo Initialized");

  const ChainlinkMetadataRequest:ChainlinkMetadataRequest__factory = await ethers.getContractFactory("ChainlinkMetadataRequest");
  const chainlinkMetadataRequest:ChainlinkMetadataRequest = await ChainlinkMetadataRequest.deploy();
  await chainlinkMetadataRequest.deployed();
  console.log("ChainlinkMetadataRequest deployed to:", chainlinkMetadataRequest.address);
  await chainlinkMetadataRequest.initialize(oracleAddress,metadataJobId,fee);
  console.log("ChainlinkMetadataRequest Initialized");

  const BondNFTGenerator:BondNFTGenerator__factory = await ethers.getContractFactory("BondNFTGenerator");
  const bondNFTGenerator:BondNFTGenerator = await BondNFTGenerator.deploy();
  await bondNFTGenerator.deployed();
  console.log("BondNFTGenerator deployed to:", bondNFTGenerator.address);

  const BondNFTManager:BondNFTManager__factory = await ethers.getContractFactory("BondNFTManager");
  const bondNFTManager:BondNFTManager = await BondNFTManager.deploy();
  await bondNFTManager.deployed();
  console.log("BondNFTManager deployed to:", bondNFTManager.address);

  
  await bondNFTManager.initialize(ratingEngine.address, bondNFTGenerator.address, chainlinkOracleInfo.address, chainlinkMetadataRequest.address);
  console.log("BondNFTManager Initialized");

  //bondNFTManager.issueBond("Howie B","howie_b","channelid_howieb","audiusArtistId",BigNumber.from("1000"),BigNumber.from("3"),BigNumber.from("10"),BigNumber.from("2000"),"HowieBNFT","HNFT","");
  console.log("RatingEngine deployed to:", ratingEngine.address);
  console.log("ChainlinkOracleInfo deployed to:", chainlinkOracleInfo.address);
  console.log("ChainlinkMetadataRequest deployed to:", chainlinkMetadataRequest.address);
  console.log("BondNFTGenerator deployed to:",bondNFTGenerator.address);
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
