import { BigNumber } from '@ethersproject/bignumber';
import { ethers, run } from 'hardhat';
import { BondNFT, BondNFT__factory} from '../typechain';

// To Check BondNFT Deployment Separately
async function main() {

  const BondNFT:BondNFT__factory = await ethers.getContractFactory("BondNFT");
  
  // Uncomment below two lines to deploy new Bond NFT
  const bondNFT:BondNFT = await BondNFT.deploy("BondNFT","BFT","0x6a6De4970ddbD35C0b8cFFc529687Ef3b6B0Be64","0x89dBffB9342b113B0bd4CBCBD128A807af846a6E","0xF1Ff48cE1027a132F5Daf942ffC040a366b906C8");
  await bondNFT.deployed();
  
  // Uncomment only to attach existing BondNFT
  //const bondNFT:BondNFT = await BondNFT.attach("0x8D69700DFD6C9eCfC773fdaCa456ec6e5Bf6A5b8");

  console.log("BondNFT deployed to:", bondNFT.address);

  
  const txt = await bondNFT.initialize("Howie B","howie_b","UCOmHUn--16B90oW2L6FRR3Ab",
                                  BigNumber.from("1000"),BigNumber.from("3"),
                                  BigNumber.from("10"),BigNumber.from("2000"), 
                                  BigNumber.from("55000"),BigNumber.from("5600"));
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
