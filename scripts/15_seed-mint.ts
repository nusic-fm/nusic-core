import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { Nusic, Nusic__factory } from '../typechain';
const UsdcABI = require("./abi/USDCToken.json").abi;
/*
* Main deployment script to deploy all the relevent contracts
*/
async function main() {
  const [owner, add1] = await ethers.getSigners();
  const Nusic:Nusic__factory = await ethers.getContractFactory("Nusic");
  // Previous deployment address
  // 0xc4B9A48176e352A62457C0f1BCd70b425D8451E8 
  const nusic:Nusic = await Nusic.attach("0x7526eD99db24EeD482ca472E1802A17c9B5f0195");
  await nusic.deployed();
  console.log("Nusic Address:", nusic.address);

  /*
  // Minting With ETH
  const amount = (await nusic.connect(owner).price()).mul(2);

  const txt1 = await nusic.mint(2, {value: amount});
  console.log("Trasaction Hash = ",txt1.hash);
  const receipt = await txt1.wait();
  console.log("Receipt = ",receipt);
  */

  // Minting With USDC
  const amount = (await nusic.connect(owner).price()).mul(1);
  const usdcToken = new ethers.Contract("0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b",UsdcABI,owner);
  console.log("usdc token = ",usdcToken);

  const txt1 = await usdcToken.approve(nusic.address, amount);
  console.log("Approval Transaction = ",txt1);
  const receipt = txt1.wait();
  console.log("Approval done");

  const txt2 = await nusic.mintStable(1);
  console.log("Minting Trasaction Hash = ",txt1.hash);
  const receipt2 = await txt2.wait();
  console.log("Minting Receipt = ",receipt2);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });