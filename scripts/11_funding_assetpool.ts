import { BigNumber } from '@ethersproject/bignumber';
import { ethers } from 'hardhat';
import { AssetPool, AssetPool__factory } from '../typechain';

/*
* Script to deposit fund into AssetPool separately
*/
async function main() {

  const [owner] = await ethers.getSigners();
  const AssetPool:AssetPool__factory = await ethers.getContractFactory("AssetPool");
  
  const assetPool:AssetPool = await AssetPool.attach("0xA4899D35897033b927acFCf422bc745916139776");
  console.log("AssetPool Attached to:", assetPool.address);

  // Use this just to send addtional payment to asset pool
  const txt3 = await owner.sendTransaction({
    to: assetPool.address,
    value: ethers.utils.parseEther("0.04")
  });
  await txt3.wait();
  console.log("AssetPool Payment Received");
  console.log("AssetPool txt3.hash =",txt3.hash);

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
