task("verify-nft-bond")
  .addParam("nftContractAddress","Contract Address")
  .setAction(async taskArgs=>{
    const bondNFTAddress = taskArgs.nftContractAddress;
    const BondNFT = await ethers.getContractFactory("BondNFT");

    const bondNFT = await BondNFT.attach(bondNFTAddress);
    
    const listeners = (await bondNFT.totalListeners()).toString();
    console.log("listeners = ",listeners);
    
    const baseURI = await bondNFT.baseURI();
    console.log("baseURI = ",baseURI);
});
