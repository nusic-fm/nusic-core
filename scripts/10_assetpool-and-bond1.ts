import { BigNumber } from '@ethersproject/bignumber';
import { ethers, run } from 'hardhat';
import { AssetPool, AssetPool__factory, BondNFT, BondNFT__factory } from '../typechain';

/*
* Script AssetPool and BondNFT deployment, initialization and deposit funding
*/
async function main() {

  const [owner] = await ethers.getSigners();
  const AssetPool:AssetPool__factory = await ethers.getContractFactory("AssetPool");
  
  const assetPool:AssetPool = await AssetPool.deploy();
  await assetPool.deployed();
  console.log("AssetPool deployed to:", assetPool.address);

  const bondValue:BigNumber = ethers.utils.parseEther("0.2");
  const numberOfYears:BigNumber = BigNumber.from(2);
  const initialFundingProvided = bondValue.div(numberOfYears.mul(4));

  const txt = await assetPool.initialize(await owner.getAddress(),bondValue);
  console.log("AssetPool Initialized");
  console.log("AssetPool txt.hash =",txt.hash);
  //console.log("AssetPool txt = ",txt);
  
  // Uncomment only to attach existing AssetPool
  //const assetPool:AssetPool = await AssetPool.attach("0x610178dA211FEF7D417bC0e6FeD39F05609AD788");
  const BondNFT:BondNFT__factory = await ethers.getContractFactory("BondNFT");
  const bondNFT:BondNFT = await BondNFT.deploy("BondNFT","BFT","0xEaD5c52F471857C33b5Dd787309A7B9d9C5703f1","0x10d0ad0968Bd1DB01e3f8B5E45a36977BdF24fA9","0xaEAB9115b8792643a94d91F601105af5Fa1c6769");
  await bondNFT.deployed();
  
  // Uncomment only to attach existing BondNFT
  //const bondNFT:BondNFT = await BondNFT.attach("0x8D69700DFD6C9eCfC773fdaCa456ec6e5Bf6A5b8");
  console.log("BondNFT deployed to:", bondNFT.address);

  
  const txt1 = await bondNFT.initialize("Howie B","1DAJPl1Q9bNwPGUqL08nzG",
                "https://www.youtube.com/user/HowieBVEVO",initialFundingProvided,
                BigNumber.from("2"),BigNumber.from("2"),bondValue, 
                BigNumber.from("1550000"),BigNumber.from("6524"), assetPool.address);
  console.log("BondNFT Initialized");
  console.log("BondNFT txt.hash =",txt1.hash);
  console.log("BondNFT txt = ",txt1);

                                                // Number of Years and NFT Address
  const txt2 = await assetPool.initializeBondInfo(BigNumber.from("2"),bondNFT.address);
  console.log("AssetPool initializeBondInfo");
  console.log("AssetPool initializeBondInfo txt1.hash =",txt2.hash);

  
  const txt3 = await owner.sendTransaction({
    to: assetPool.address,
    value: initialFundingProvided
  });
  await txt3.wait();
  console.log("AssetPool Payment Received");
  console.log("AssetPool txt3.hash =",txt3.hash);
  //console.log("AssetPool txt1 = ",txt1);
  
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
