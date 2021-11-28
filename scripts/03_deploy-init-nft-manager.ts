import { ethers, run } from 'hardhat';
import { BondNFTManager, BondNFTManager__factory, } from '../typechain';

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
  await bondNFTManager.initialize("0x960319ef5663148bd03AbEeaf0EaB00A9C89bc1b", "0x9e51efE23277Ed2547c16F502463105db318bdaF", "0x05cA3e08c871D6CE41AaffdEB59d71088dFD76F0", "0xc24b4940D52B97F6D2754F51CE40b38e64E81d9B", "0x681Ffe5CCfA0576017e82ab87efBDe130C5930AF");
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
