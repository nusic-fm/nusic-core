task("read-asset-pool")
  .addParam("contract","Contract Address")
  .setAction(async taskArgs=>{
    const [owner] = await ethers.getSigners();
    const contractAddress = taskArgs.contract;
    const BondNFTManager = await ethers.getContractFactory("BondNFTManager");

    const bondNFTManager = await BondNFTManager.attach(contractAddress);
    const assetPoolAddress = await bondNFTManager.allAssetPools(0);
    console.log("assetPoolAddress = ",assetPoolAddress);

    const assetPool = await bondNFTManager.userAssetPools(await owner.getAddress(),0);
    console.log("assetPool = ",assetPool);
    
});
