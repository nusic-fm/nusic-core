/*
* Task to to set Base URI of NFT for specific NFT address
*/
task("set-token-uri")
  .addParam("nftBondAddress","Contract Address")
  .addParam("uri","URI")     // forward slash (/) at the end of uri is mandatory 
  .setAction(async taskArgs=>{
    const bondNFTAddress = taskArgs.nftBondAddress;
    const uri = taskArgs.uri;
    const BondNFT = await ethers.getContractFactory("BondNFT");

    const bondNFT = await BondNFT.attach(bondNFTAddress);
    
    console.log("Before Base URI = ",(await bondNFT.baseURI()));
    
    const txt1 = await bondNFT.setBaseURI(uri);
    const recipt = await txt1.wait();
    console.log("After Base URI = ",(await bondNFT.baseURI()));


});
