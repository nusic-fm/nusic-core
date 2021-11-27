import { BigNumber } from '@ethersproject/bignumber';
import { ethers, run } from 'hardhat';
import { AssetPool, AssetPool__factory } from '../typechain';

/*
* Script Read AssetPool details and balance
*/
async function main() {

  const [owner] = await ethers.getSigners();
  const AssetPool:AssetPool__factory = await ethers.getContractFactory("AssetPool");
  const assetPool:AssetPool = await AssetPool.attach("0x610178dA211FEF7D417bC0e6FeD39F05609AD788");

  console.log("AssetPool deployed to:", assetPool.address);

  const balanceOfAssetPool:BigNumber = await ethers.provider.getBalance(assetPool.address);
  console.log("Asset Pool Balance = ", balanceOfAssetPool.toString());

  console.log("Deposit check = ", (await assetPool.quarterCheckPoints(0)).toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
