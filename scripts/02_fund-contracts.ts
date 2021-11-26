import { BigNumber } from '@ethersproject/bignumber';
import { ethers, fundLink, run } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ChainlinkMetadataRequest, ChainlinkMetadataRequest__factory, ChainlinkSpotifyListeners, ChainlinkSpotifyListeners__factory, ChainlinkYoutubeSubscribers, ChainlinkYoutubeSubscribers__factory, LinkTokenInterface__factory } from '../typechain';
const hre:HardhatRuntimeEnvironment = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();
  const linkAddress:string = "0xa36085F69e2889c224210F603D836748e7dC0088"; // Kovan
  const linkToken = LinkTokenInterface__factory.connect(linkAddress,accounts[0]);


  const ChainlinkYoutubeSubscribers:ChainlinkYoutubeSubscribers__factory = await ethers.getContractFactory("ChainlinkYoutubeSubscribers");
  const chainlinkYoutubeSubscribers:ChainlinkYoutubeSubscribers = await ChainlinkYoutubeSubscribers.attach("0x89dBffB9342b113B0bd4CBCBD128A807af846a6E");
  
  const ChainlinkSpotifyListeners:ChainlinkSpotifyListeners__factory = await ethers.getContractFactory("ChainlinkSpotifyListeners");
  const chainlinkSpotifyListeners:ChainlinkSpotifyListeners = await ChainlinkSpotifyListeners.attach("0x6a6De4970ddbD35C0b8cFFc529687Ef3b6B0Be64");
    
  const ChainlinkMetadataRequest:ChainlinkMetadataRequest__factory = await ethers.getContractFactory("ChainlinkMetadataRequest");
  const chainlinkMetadataRequest:ChainlinkMetadataRequest = await ChainlinkMetadataRequest.attach("0xF1Ff48cE1027a132F5Daf942ffC040a366b906C8");
  /*
  await fundLink(hre,chainlinkYoutubeSubscribers.address, "10000000000000000000"); // 10 link token
  console.log("ChainlinkYoutubeSubscribers funded!!");
  console.log("ChainlinkYoutubeSubscribers LinkToken Balance ", (await linkToken.balanceOf(chainlinkYoutubeSubscribers.address)).toString());
  */
  await fundLink(hre,chainlinkSpotifyListeners.address, "10000000000000000000"); // 10 link token
  console.log("ChainlinkSpotifyListeners funded!!");
  console.log("ChainlinkSpotifyListeners LinkToken Balance ", (await linkToken.balanceOf(chainlinkSpotifyListeners.address)).toString());
  
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
