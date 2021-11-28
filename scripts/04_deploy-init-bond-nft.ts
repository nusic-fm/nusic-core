import { BigNumber } from '@ethersproject/bignumber';
import { ethers, run } from 'hardhat';
import { BondNFT, BondNFT__factory} from '../typechain';

// To Check BondNFT Deployment Separately
async function main() {

  const BondNFT:BondNFT__factory = await ethers.getContractFactory("BondNFT");
  
  // Uncomment below two lines to deploy new Bond NFT
  const bondNFT:BondNFT = await BondNFT.deploy("BondNFT","BFT","0xcD8D700b292BD437B85e903ECDe9c026a62CFA3f","0x3c734BF02b428bdC22ADD2F1b20E16156Bc53dDf","0xF58CCda92BF87C5eFD4b48894901a13e017F672F");
  await bondNFT.deployed();
  
  // Uncomment only to attach existing BondNFT
  //const bondNFT:BondNFT = await BondNFT.attach("0x8D69700DFD6C9eCfC773fdaCa456ec6e5Bf6A5b8");

  console.log("BondNFT deployed to:", bondNFT.address);

  
  const txt = await bondNFT.initialize("Howie B","1DAJPl1Q9bNwPGUqL08nzG","https://www.youtube.com/user/HowieBVEVO",
                                  BigNumber.from("1000"),BigNumber.from("3"),
                                  BigNumber.from("10"),BigNumber.from("2000"), 
                                  BigNumber.from("55000"),BigNumber.from("5600"), 
                                  "0x8D69700DFD6C9eCfC773fdaCa456ec6e5Bf6A5b8"); // Dummy Asset Pool Address
  console.log("BondNFT Initialized");
  console.log("BondNFT txt.hash =",txt.hash);
  console.log("BondNFT txt = ",txt);
  /*

  const txt1 = await bondNFT.mintBonds();
  console.log("txt1.hash = ",txt1.hash);
  console.log("txt1 = ",txt1);
  */
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
