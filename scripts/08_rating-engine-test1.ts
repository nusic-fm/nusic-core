import { BigNumber } from '@ethersproject/bignumber';
import { ethers, run } from 'hardhat';
import { RatingEngine, RatingEngine__factory } from '../typechain';

// To Check AssetPool Deployment Separately
async function main() {

  const [owner] = await ethers.getSigners();
  const RatingEngine:RatingEngine__factory = await ethers.getContractFactory("RatingEngine");

  const ratingEngine:RatingEngine = await RatingEngine.deploy();
  await ratingEngine.deployed();
  console.log("RatingEngine deployed to:", ratingEngine.address);
  
  // Uncomment only to attach existing RatingEngine
  //const ratingEngine:RatingEngine = await RatingEngine.attach("0x0165878A594ca255338adfa4d48449f69242Eb8F");

  const balanceCheck:BigNumber = await ratingEngine.checkAssetPoolBalance("0x610178dA211FEF7D417bC0e6FeD39F05609AD788"); 
  console.log("Balance Check = ",balanceCheck.toString());

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
