/*
* Task to read details of all AssetPools created by particular address
*/
task("read-asset-pool")
  .addParam("contract","Contract Address")
  .addParam("assetPoolCreatorAddress","Asset Pool creator Address")
  .setAction(async taskArgs=>{
    const [owner] = await ethers.getSigners();
    const contractAddress = taskArgs.contract;
    const assetPoolCreatorAddress = taskArgs.assetPoolCreatorAddress;
    const BondNFTManager = await ethers.getContractFactory("BondNFTManager");
    const bondNFTManager = await BondNFTManager.attach(contractAddress);

    const assetPoolCount = (await bondNFTManager.assetPoolsLengthForUser(assetPoolCreatorAddress)).toNumber();
    console.log(`AssetPoolCount is ${assetPoolCount} for user ${assetPoolCreatorAddress}`);
    for(let i=0;i<assetPoolCount;i++){
      const assetPool = await bondNFTManager.userAssetPools(assetPoolCreatorAddress,i);
      console.log("Counter = ",i);
      console.log("AssetPool.toString = ",assetPool.toString());
      console.log("AssetPool = ",assetPool);
      console.log("==========");
    }
    
});
