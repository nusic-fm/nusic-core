import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { Nusic, Nusic__factory } from '../typechain';
/*
* Main deployment script to deploy all the relevent contracts
*/
async function main() {
  const [owner, add1] = await ethers.getSigners();
  const Nusic:Nusic__factory = await ethers.getContractFactory("Nusic");
  const nusic:Nusic = await Nusic.attach("0x92C2F0Eb4dc5f8E69C3AaB64c6B7c2030A64082D");
  await nusic.deployed();
  console.log("Nusic Address:", nusic.address);

  const amount = (await nusic.connect(owner).price()).mul(2);

  const txt1 = await nusic.stage1Mint(2, {value: amount});
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