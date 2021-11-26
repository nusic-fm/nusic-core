import { BigNumber } from '@ethersproject/bignumber';
import { ethers, run } from 'hardhat';
import { BondNFTManager, BondNFTManager__factory, } from '../typechain';

// This is only needed when we want to deploy BondNFTManager separately
async function main() {

  const BondNFTManager:BondNFTManager__factory = await ethers.getContractFactory("BondNFTManager");
  const bondNFTManager:BondNFTManager = await BondNFTManager.deploy();
  await bondNFTManager.deployed();
  console.log("BondNFTManager deployed to:", bondNFTManager.address);

  // Need to replace address of RatingEngine,BondNFTGenerator, ChainlinkSpotifyListeners, ChainlinkYoutubeSubscribers, ChainlinkMetadataRequest in this same order
  await bondNFTManager.initialize("0x45fe7d107C8c768d9AD0e8eBC0ac62F010ae1577", "0x5C9a98955d6B41285b9fdBee873BE8B28e2B2259", "0x6a6De4970ddbD35C0b8cFFc529687Ef3b6B0Be64", "0x89dBffB9342b113B0bd4CBCBD128A807af846a6E", "0xF1Ff48cE1027a132F5Daf942ffC040a366b906C8");
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
