task("mint-nft")
  .addParam("nftManagerAddress","NFT Manager Contract Address")
  .addParam("nftBondAddress","NFT Bond Contract Address")
  .setAction(async taskArgs=>{
    const [owner] = await ethers.getSigners();
    const nftManagerAddress = taskArgs.nftManagerAddress;
    const nftBondAddress = taskArgs.nftBondAddress;

    const BondNFTManager = await ethers.getContractFactory("BondNFTManager");
    const bondNFTManager = await BondNFTManager.attach(nftManagerAddress);
    
    const BondNFT = await ethers.getContractFactory("BondNFT");
    const bondNFT = await BondNFT.attach(nftBondAddress);
    //console.log("Bond NFT = ",bondNFT);
    
    console.log("bond count = ", (await bondNFT.numberOfBonds()).toString())
    
    const txt = await bondNFT.tokenURI(0, {
      from: owner.getAddress(),
      gasLimit: 12500000,
      gasPrice: 1000000000,
    });
    //console.log("txt hash = ",txt.hash);
    console.log("txt = ",txt);
    
    

    /*
    const txt = await bondNFTManager.mintNFTBond(nftBondAddress);
    console.log("txt.hash = ",txt.hash);
    console.log("txt = ",txt);
    */
});
