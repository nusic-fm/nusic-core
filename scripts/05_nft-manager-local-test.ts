import { BigNumber } from '@ethersproject/bignumber';
import { ethers, run } from 'hardhat';
import { BondNFTManager, BondNFTManager__factory } from '../typechain';

// Test NFTManager locally without calling initialize function of it 
async function main() {

  const [owner] = await ethers.getSigners();

  const bondValue:BigNumber = ethers.utils.parseEther("0.012");
  const numberOfYears:BigNumber = BigNumber.from("3");
  const initialFundingProvided = ethers.utils.parseEther("0.001") //bondValue.div(numberOfYears.mul(4));
  const numberOfBonds:BigNumber = BigNumber.from("1");

  const BondNFTManager:BondNFTManager__factory = await ethers.getContractFactory("BondNFTManager");
  //const bondNFTManager:BondNFTManager = await BondNFTManager.deploy();
  //await bondNFTManager.deployed();
  const bondNFTManager:BondNFTManager = await BondNFTManager.attach("0x89dBffB9342b113B0bd4CBCBD128A807af846a6E");

  console.log("BondNFTManager deployed to:", bondNFTManager.address);
  /*
  const assetPoolTxt = await bondNFTManager.createAssetPool(bondValue);
  console.log("Asset pool txt.hash = ",assetPoolTxt.hash);
  console.log("Asset pool txt = ",assetPoolTxt);
  const aReciept = await assetPoolTxt.wait();
  console.log("Asset pool receipt = ", aReciept);
  */
  //const assetPoolAddress = await bondNFTManager.allAssetPools(0);
  //console.log("assetPoolAddress = ",assetPoolAddress);

  //const assetPool = await bondNFTManager.userAssetPools(await owner.getAddress(),0);
  //console.log("assetPool = ",assetPool); 
  

  const txt = await bondNFTManager.issueBond("Howie B","howie_b","UCOmHUn--16B90oW2L6FRR3Ab",
                            initialFundingProvided,numberOfYears,
                            numberOfBonds,bondValue,"HowieBNFT","HNFT",
                            {
                              spotifyListeners: BigNumber.from("55000"),
                              youtubeSubscribers: BigNumber.from("540"),
                              assetPoolAddress: "0x1b172041137e7c404903ea2ee28898abab93c83f"
                            }, {
                              gasLimit: 12500000,
                              gasPrice: 3000000000,
                            });

  console.log("BondNFTManager issueBond done ");
  console.log("issueBond txt hash = ",txt.hash);
  const recipt = await txt.wait();
  console.log("Recipt = ",recipt);
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
