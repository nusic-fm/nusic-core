task("read-token-details")
  .addParam("nftBondAddress","Contract Address")
  .setAction(async taskArgs=>{
    const bondNFTAddress = taskArgs.nftBondAddress;
    const BondNFT = await ethers.getContractFactory("BondNFT");

    const bondNFT = await BondNFT.attach(bondNFTAddress);
    
    console.log("Base URI = ",(await bondNFT.baseURI()));
    console.log("DefaultURI = ",(await bondNFT.defaultURI()));
    console.log("ArtistName = ",(await bondNFT.artistName()));
    console.log("ChannelId = ",(await bondNFT.channelId()));
    console.log("FundingAmount = ",(await bondNFT.fundingAmount()).toString());
    console.log("NumberOfYears = ",(await bondNFT.numberOfYears()).toString());
    console.log("MumberOfBonds = ",(await bondNFT.numberOfBonds()).toString());
    console.log("FaceValue = ",(await bondNFT.faceValue()).toString());
 
    const totlaSupply = await bondNFT.totalSupply();
    for(let i=0;i<totlaSupply; i++) {
      console.log(`Token Id ${i} -- Token URI = ${await bondNFT.tokenURI(i)}`);
    }
});
