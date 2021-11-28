import { ethers, run } from 'hardhat';
import { BondNFTManager, BondNFTManager__factory, } from '../typechain';

// 
/*
* Only used when we want to deploy BondNFTManager separately and initialize with existing 
* contracts (RatingEngine, BondNFTGenerator, ChainlinkSpotifyListeners, ChainlinkYoutubeSubscribers, ChainlinkMetadataRequest)
*/
async function main() {

  const BondNFTManager:BondNFTManager__factory = await ethers.getContractFactory("BondNFTManager");
  const bondNFTManager:BondNFTManager = await BondNFTManager.deploy();
  await bondNFTManager.deployed();
  console.log("BondNFTManager deployed to:", bondNFTManager.address);

  // Need to replace address of RatingEngine,BondNFTGenerator, ChainlinkSpotifyListeners, ChainlinkYoutubeSubscribers, ChainlinkMetadataRequest in this same order
  await bondNFTManager.initialize("0xA7d66A42314878824570AE14EA98312af8eCF799", "0x94F1Da34Dc54661Cd534F5e8197Fe2839f52b603", "0xcD8D700b292BD437B85e903ECDe9c026a62CFA3f", "0x3c734BF02b428bdC22ADD2F1b20E16156Bc53dDf", "0xF58CCda92BF87C5eFD4b48894901a13e017F672F");
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
