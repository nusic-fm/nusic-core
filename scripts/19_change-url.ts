import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { Nusic, Nusic__factory } from '../typechain';
/*
* Main deployment script to deploy all the relevent contracts
*/
async function main() {
  const [owner, add1] = await ethers.getSigners();
  const Nusic:Nusic__factory = await ethers.getContractFactory("Nusic");

  const nusic:Nusic = await Nusic.attach("0x7526eD99db24EeD482ca472E1802A17c9B5f0195");
  await nusic.deployed();
  console.log("Nusic Address:", nusic.address);

  const txt1 = await nusic.setBaseURI("https://gateway.pinata.cloud/ipfs/QmWWHz8ZkphVT5vUnjtrNkHCwctwES7bzS3eBS6GvKtNnh/");
  console.log("Trasaction Hash = ",txt1.hash);
  const receipt = await txt1.wait();
  console.log("Round activated Receipt = ",receipt);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });