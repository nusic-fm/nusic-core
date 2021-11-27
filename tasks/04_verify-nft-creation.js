/*
* Task to read details of all BondNFT created by particular address
*/
task("verify-nft-creation")
  .addParam("nftManagerContractAddress","Contract Address")
  .addParam("nftCreatorAddress","Bond NFT creator Address")
  .setAction(async taskArgs=>{
    const [owner] = await ethers.getSigners();
    const nftManagerContractAddress = taskArgs.nftManagerContractAddress;
    const nftCreatorAddress = taskArgs.nftCreatorAddress;
    const BondNFTManager = await ethers.getContractFactory("BondNFTManager");
    const bondNFTManager = await BondNFTManager.attach(nftManagerContractAddress);

    //this will not work as expected
    //const bondNFTAddress = await bondNFTManager.allBondNfts(parseInt(nftIndex));
    //console.log("bondNFTAddress = ",bondNFTAddress);
    const BondNFT = await ethers.getContractFactory("BondNFT");
    const bondNftCount = (await bondNFTManager.nftBondLengthForUser(nftCreatorAddress)).toNumber();
    console.log(`BondNFT Count is ${bondNftCount} for user ${nftCreatorAddress}`);
    for(let i=0;i<bondNftCount;i++){
      const bondNFTConfig = await bondNFTManager.userBondConfigs(nftCreatorAddress,i);
      console.log("Counter = ",i);
      console.log("bondNFTConfig.toString = ",bondNFTConfig.toString());
      console.log("bondNFTConfig = ",bondNFTConfig);
      console.log("+++++++++");
      const bondNFT = await BondNFT.attach(bondNFTConfig.nftAddress);
      const owner = (await bondNFT.owner());
      console.log("NFT Bond Owner = ",owner);
      console.log("===================");
    }
});
