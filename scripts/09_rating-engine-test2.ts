import { BigNumber } from '@ethersproject/bignumber';
import { ethers, run } from 'hardhat';
import { BondNFT, BondNFT__factory, RatingEngine, RatingEngine__factory } from '../typechain';

// To Check AssetPool Deployment Separately
async function main() {

  const [owner] = await ethers.getSigners();
  const RatingEngine:RatingEngine__factory = await ethers.getContractFactory("RatingEngine");

  const ratingEngine:RatingEngine = await RatingEngine.deploy();
  await ratingEngine.deployed();
  console.log("RatingEngine deployed to:", ratingEngine.address);

  const BondNFT:BondNFT__factory = await ethers.getContractFactory("BondNFT");
  const bondNFT:BondNFT = await BondNFT.attach("0xAA292E8611aDF267e563f334Ee42320aC96D0463");
  const txt2 = await bondNFT.requestLatestListenersFulFill(ethers.utils.formatBytes32String("0x00000000000"), BigNumber.from("6000000"));
  await txt2.wait();
  console.log("requestLatestListenersFulFill txt2.hash =",txt2.hash);
  
  const rating:string = await ratingEngine.allocateRatingByAssetPoolAddress("0xA4899D35897033b927acFCf422bc745916139776", ethers.utils.parseEther("2")); 
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
