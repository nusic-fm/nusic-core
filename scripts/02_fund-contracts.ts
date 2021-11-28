import { ethers, fundLink, run } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ChainlinkMetadataRequest, ChainlinkMetadataRequest__factory, ChainlinkSpotifyListeners, 
          ChainlinkSpotifyListeners__factory, ChainlinkYoutubeSubscribers, 
          ChainlinkYoutubeSubscribers__factory, LinkTokenInterface__factory 
        } from '../typechain';
const hre:HardhatRuntimeEnvironment = require("hardhat");

/*
* Script to fund chainlink request contracts
*/
async function main() {
  const accounts = await ethers.getSigners();
  const linkAddress:string = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709"; // Rinkeby
  const linkToken = LinkTokenInterface__factory.connect(linkAddress,accounts[0]);

  const ChainlinkSpotifyListeners:ChainlinkSpotifyListeners__factory = await ethers.getContractFactory("ChainlinkSpotifyListeners");
  const chainlinkSpotifyListeners:ChainlinkSpotifyListeners = await ChainlinkSpotifyListeners.attach("0xcD8D700b292BD437B85e903ECDe9c026a62CFA3f");

  const ChainlinkYoutubeSubscribers:ChainlinkYoutubeSubscribers__factory = await ethers.getContractFactory("ChainlinkYoutubeSubscribers");
  const chainlinkYoutubeSubscribers:ChainlinkYoutubeSubscribers = await ChainlinkYoutubeSubscribers.attach("0x3c734BF02b428bdC22ADD2F1b20E16156Bc53dDf");
  
  const ChainlinkMetadataRequest:ChainlinkMetadataRequest__factory = await ethers.getContractFactory("ChainlinkMetadataRequest");
  const chainlinkMetadataRequest:ChainlinkMetadataRequest = await ChainlinkMetadataRequest.attach("0xF58CCda92BF87C5eFD4b48894901a13e017F672F");

  await fundLink(hre,chainlinkYoutubeSubscribers.address, "5000000000000000000"); // 10 link token
  console.log("ChainlinkYoutubeSubscribers funded!!");
  console.log("ChainlinkYoutubeSubscribers LinkToken Balance ", (await linkToken.balanceOf(chainlinkYoutubeSubscribers.address)).toString());

  await fundLink(hre,chainlinkSpotifyListeners.address, "5000000000000000000"); // 10 link token
  console.log("ChainlinkSpotifyListeners funded!!");
  console.log("ChainlinkSpotifyListeners LinkToken Balance ", (await linkToken.balanceOf(chainlinkSpotifyListeners.address)).toString());

  await fundLink(hre,chainlinkMetadataRequest.address, "5000000000000000000"); // 10 link token
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
