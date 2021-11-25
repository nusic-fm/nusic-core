import { BigNumber } from '@ethersproject/bignumber';
import { ethers, run } from 'hardhat';
import { AssetPool, AssetPool__factory, BondNFT, BondNFT__factory } from '../typechain';

// To Check AssetPool Deployment Separately
async function main() {

  const [owner] = await ethers.getSigners();
  const AssetPool:AssetPool__factory = await ethers.getContractFactory("AssetPool");
  
  const assetPool:AssetPool = await AssetPool.deploy();
  await assetPool.deployed();
  console.log("AssetPool deployed to:", assetPool.address);

  //const txt = await assetPool.initialize(await owner.getAddress(),BigNumber.from("2000"));
  const bondValue:BigNumber = ethers.utils.parseEther("1");
  const numberOfYears:BigNumber = BigNumber.from(2);
  const initialFundingProvided = bondValue.div(numberOfYears.mul(4));

  const txt = await assetPool.initialize(await owner.getAddress(),bondValue);
  console.log("AssetPool Initialized");
  console.log("AssetPool txt.hash =",txt.hash);
  //console.log("AssetPool txt = ",txt);
  
  // Uncomment only to attach existing AssetPool
  //const assetPool:AssetPool = await AssetPool.attach("0x610178dA211FEF7D417bC0e6FeD39F05609AD788");
  const BondNFT:BondNFT__factory = await ethers.getContractFactory("BondNFT");
  const bondNFT:BondNFT = await BondNFT.deploy("BondNFT","BFT","0xDAccf5a4636c745c796182dCA912546f15C80133","0xEDBbe0A5f876aF88b26B1f0BD06A43dC33EaDf81");
  await bondNFT.deployed();
  
  // Uncomment only to attach existing BondNFT
  //const bondNFT:BondNFT = await BondNFT.attach("0x8D69700DFD6C9eCfC773fdaCa456ec6e5Bf6A5b8");
  console.log("BondNFT deployed to:", bondNFT.address);

  
  const txt1 = await bondNFT.initialize("Howie B","howie_b","UCOmHUn--16B90oW2L6FRR3Ab","channel","audiusArtistId",initialFundingProvided,BigNumber.from("2"),BigNumber.from("10"),bondValue);
  console.log("BondNFT Initialized");
  console.log("BondNFT txt.hash =",txt1.hash);
  console.log("BondNFT txt = ",txt1);

                                                // Number of Years and NFT Address
  const txt2 = await assetPool.initializeBondInfo(BigNumber.from("2"),bondNFT.address);
  console.log("AssetPool initializeBondInfo");
  console.log("AssetPool initializeBondInfo txt1.hash =",txt2.hash);

  /*
  // This whole calculation is now useless
  const ethValue = 4000 * 6.25/100;
  // For testing
  // 250 quarterly payment and estimated eth price is 4000
  // 250 / 4000 = 6.25
  // 4000 * 6.25/100 = 250;

  // 6.25 / 100 = 0.0625 * 1,000,000,000,000,000,000 = 62,500,000,000,000,000 
  //62500000000000000

  // Now converting eth value to price
  // 62500000000000000 * 4000 = 250,000,000,000,000,000,000 / (10 ** 18) = 250 quarter payment
  
  // 6.25 / 100 = 0.0625
  */
  
  const txt3 = await owner.sendTransaction({
    to: assetPool.address,
    value: initialFundingProvided
  });
  await txt3.wait();
  console.log("AssetPool Payment Received");
  console.log("AssetPool txt3.hash =",txt3.hash);
  //console.log("AssetPool txt1 = ",txt1);
  
  /*
  // Use this just to send addtional payment to asset pool
  const txt3 = await owner.sendTransaction({
    to: "0xA4899D35897033b927acFCf422bc745916139776",
    value: ethers.utils.parseEther("0.875")
  });
  await txt3.wait();
  console.log("AssetPool Payment Received");
  console.log("AssetPool txt3.hash =",txt3.hash);
  */

  const balanceOfAssetPool:BigNumber = await ethers.provider.getBalance(assetPool.address);
  console.log("Asset Pool Balance = ", balanceOfAssetPool.toString());



}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
