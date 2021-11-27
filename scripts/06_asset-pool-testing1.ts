import { BigNumber } from '@ethersproject/bignumber';
import { ethers, run } from 'hardhat';
import { AssetPool, AssetPool__factory } from '../typechain';

/*
* Script deploy AssetPool separately and fund with ether
*/
async function main() {

  const [owner] = await ethers.getSigners();
  const AssetPool:AssetPool__factory = await ethers.getContractFactory("AssetPool");
  
  // Uncomment below two lines to deploy new AssetPool
  const assetPool:AssetPool = await AssetPool.deploy();
  await assetPool.deployed();
  console.log("AssetPool deployed to:", assetPool.address);

  const txt = await assetPool.initialize(await owner.getAddress(),BigNumber.from("2000"));
  console.log("AssetPool Initialized");
  console.log("AssetPool txt.hash =",txt.hash);

  // Uncomment only to attach existing AssetPool
  //const assetPool:AssetPool = await AssetPool.attach("0x610178dA211FEF7D417bC0e6FeD39F05609AD788");

  const txt1 = await owner.sendTransaction({
    to: assetPool.address,
    value: ethers.utils.parseEther("0.0001")
  });
  await txt1.wait();
  console.log("AssetPool Payment Received");
  console.log("AssetPool txt1.hash =",txt1.hash);
  
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
