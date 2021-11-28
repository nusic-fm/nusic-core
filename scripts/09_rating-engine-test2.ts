import { BigNumber } from '@ethersproject/bignumber';
import { ethers, run } from 'hardhat';
import { BondNFT, BondNFT__factory, RatingEngine, RatingEngine__factory } from '../typechain';

/*
* Script Calculate BondNFT Rating
*/
async function main() {

  const RatingEngine:RatingEngine__factory = await ethers.getContractFactory("RatingEngine");

  const ratingEngine:RatingEngine = await RatingEngine.deploy();
  await ratingEngine.deployed();
  //const ratingEngine:RatingEngine = await RatingEngine.attach("0x45fe7d107C8c768d9AD0e8eBC0ac62F010ae1577")
  console.log("RatingEngine deployed to:", ratingEngine.address);

  const BondNFT:BondNFT__factory = await ethers.getContractFactory("BondNFT");
  const bondNFT:BondNFT = await BondNFT.attach("0x1b3c151198Acff6d2d2dCb063FABf3ec2E989cEc");

  const rating:string = await ratingEngine.allocateRatingByAssetPoolAddress("0x1C5053dC2e3447E1cbD63Db758002B0964432D1a", ethers.utils.parseEther("2")); 
  console.log("Rating = ",rating);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
