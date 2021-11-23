task("set-token-uri")
  .addParam("nftBondAddress","Contract Address")
  .setAction(async taskArgs=>{
    const bondNFTAddress = taskArgs.nftBondAddress;
    const BondNFT = await ethers.getContractFactory("BondNFT");

    const bondNFT = await BondNFT.attach(bondNFTAddress);
    
    console.log("Before Base URI = ",(await bondNFT.baseURI()));
    
    // For now dummy URL
    // forward slash (/) at the end of url is mandatory 
    const txt1 = await bondNFT.setBaseURI("ipfs/QmST7mVJVShNpsxZSHq86RRymshSj8PmSbQkAr4VHvFFrM/");
    const recipt = await txt1.wait();
    console.log("After Base URI = ",(await bondNFT.baseURI()));


});
