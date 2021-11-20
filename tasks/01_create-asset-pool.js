task("create-asset-pool")
  .addParam("contract","Contract Address")
  .setAction(async taskArgs=>{
    const contractAddress = taskArgs.contract;
    const BondNFTManager = await ethers.getContractFactory("BondNFTManager");

    const bondNFTManager = await BondNFTManager.attach(contractAddress);
    const txt = await bondNFTManager.createAssetPool(15000);
    
    console.log("createAssetPool hash = ",txt.hash);
    console.log("createAssetPool = ",txt);
});
