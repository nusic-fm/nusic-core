import { BigNumber } from '@ethersproject/bignumber';
import { ethers, run } from 'hardhat';
import { BondNFTManager, BondNFTManager__factory } from '../typechain';

// Test NFTManager locally without calling initialize function of it 
async function main() {

  const [owner] = await ethers.getSigners();

  const BondNFTManager:BondNFTManager__factory = await ethers.getContractFactory("BondNFTManager");
  const bondNFTManager:BondNFTManager = await BondNFTManager.deploy();
  await bondNFTManager.deployed();
  console.log("BondNFTManager deployed to:", bondNFTManager.address);

  const assetPoolTxt = await bondNFTManager.createAssetPool(BigNumber.from("2000"));
  console.log("Asset pool txt.hash = ",assetPoolTxt.hash);
  console.log("Asset pool txt = ",assetPoolTxt);

  const assetPoolAddress = await bondNFTManager.allAssetPools(0);
  console.log("assetPoolAddress = ",assetPoolAddress);

  const assetPool = await bondNFTManager.userAssetPools(await owner.getAddress(),0);
  console.log("assetPool = ",assetPool); 
  

  const txt = await bondNFTManager.issueBond("Howie B","howie_b","UCOmHUn--16B90oW2L6FRR3Ab",
                            BigNumber.from("1000"),BigNumber.from("3"),
                            BigNumber.from("10"),BigNumber.from("2000"),"HowieBNFT","HNFT",
                            {
                              spotifyListeners: BigNumber.from("55000"),
                              youtubeSubscribers: BigNumber.from("540"),
                              assetPoolAddress: assetPoolAddress
                            });

  console.log("BondNFTManager issueBond done ");
  console.log("issueBond txt hash = ",txt.hash);
  console.log("issueBond txt hash = ",txt);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
