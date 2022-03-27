import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { Nusic, Nusic__factory } from '../typechain';
/*
* Main deployment script to deploy all the relevent contracts
*/
async function main() {
  const [owner, add1] = await ethers.getSigners();
  const Nusic:Nusic__factory = await ethers.getContractFactory("Nusic");
  // Previous deployment address
  // 0xc4B9A48176e352A62457C0f1BCd70b425D8451E8 
  const nusic:Nusic = await Nusic.attach("0xB0DE5Af76595c05e88138550CA2A911D78075743");
  await nusic.deployed();
  console.log("Nusic Address:", nusic.address);

  const amount = (await nusic.connect(owner).price()).mul(2);

  const txt1 = await nusic.mint(2, {value: amount});
  console.log("Trasaction Hash = ",txt1.hash);
  const receipt = await txt1.wait();
  console.log("Receipt = ",receipt);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });