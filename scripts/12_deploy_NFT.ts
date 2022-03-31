import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { Nusic, Nusic__factory } from '../typechain';
/*
* Main deployment script to deploy all the relevent contracts
*/
async function main() {
  const [owner, add1] = await ethers.getSigners();
  const Nusic:Nusic__factory = await ethers.getContractFactory("Nusic");
  
  //const nusic:Nusic = await Nusic.deploy("NUSICTest","NUSIC","ipfs://QmXsMLpKjznF3z1KsVm5tNs3E94vj4BFAyAHvD5RTWgQ1J");
  //const nusic:Nusic = await Nusic.deploy("MNUSICTest","MNUSIC","https://gateway.pinata.cloud/ipfs/QmVDAScf9vuE2XbSHWuVWkdxe3kuhpGE8pfXdzD9gQXs5Z/");
  const nusic:Nusic = await Nusic.deploy("NUSICTest","NUSIC","0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b","ipfs://QmXsMLpKjznF3z1KsVm5tNs3E94vj4BFAyAHvD5RTWgQ1J");
  await nusic.deployed();

  console.log("Nusic deployed to:", nusic.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
