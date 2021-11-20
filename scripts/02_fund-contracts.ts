import { BigNumber } from '@ethersproject/bignumber';
import { ethers, fundLink, run } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ChainlinkMetadataRequest, ChainlinkMetadataRequest__factory, ChainlinkOracleInfo, ChainlinkOracleInfo__factory, LinkTokenInterface__factory } from '../typechain';
const hre:HardhatRuntimeEnvironment = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();
  const linkAddress:string = "0xa36085F69e2889c224210F603D836748e7dC0088"; // Kovan
  const linkToken = LinkTokenInterface__factory.connect(linkAddress,accounts[0]);


  const ChainlinkOracleInfo:ChainlinkOracleInfo__factory = await ethers.getContractFactory("ChainlinkOracleInfo");
  const chainlinkOracleInfo:ChainlinkOracleInfo = await ChainlinkOracleInfo.attach("0xDAccf5a4636c745c796182dCA912546f15C80133");
  
  const ChainlinkMetadataRequest:ChainlinkMetadataRequest__factory = await ethers.getContractFactory("ChainlinkMetadataRequest");
  const chainlinkMetadataRequest:ChainlinkMetadataRequest = await ChainlinkMetadataRequest.attach("0xEDBbe0A5f876aF88b26B1f0BD06A43dC33EaDf81");

  await fundLink(hre,chainlinkOracleInfo.address, "10000000000000000000"); // 10 link token
  console.log("ChainlinkOracleInfo funded!!");
  console.log("ChainlinkOracleInfo LinkToken Balance ", (await linkToken.balanceOf(chainlinkOracleInfo.address)).toString());
  
  await fundLink(hre,chainlinkMetadataRequest.address, "10000000000000000000"); // 10 link token
  console.log("ChainlinkMetadataRequest funded!!");
  console.log("ChainlinkMetadataRequest LinkToken Balance ", (await linkToken.balanceOf(chainlinkMetadataRequest.address)).toString());
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
