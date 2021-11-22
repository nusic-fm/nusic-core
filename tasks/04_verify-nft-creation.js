task("verify-nft-creation")
  .addParam("bondContractAddress","Contract Address")
  .addParam("nftIndex","Bond NFT Index")
  .setAction(async taskArgs=>{
    const [owner] = await ethers.getSigners();
    const bondNFTManagerAddress = taskArgs.bondContractAddress;
    const nftIndex = parseInt(taskArgs.nftIndex);
    const BondNFTManager = await ethers.getContractFactory("BondNFTManager");
    const bondNFTManager = await BondNFTManager.attach(bondNFTManagerAddress);


    const bondNFTAddress = await bondNFTManager.allBondNfts(parseInt(nftIndex));
    console.log("bondNFTAddress = ",bondNFTAddress);

    const bondNFTInfo = await bondNFTManager.userBondConfigs(await owner.getAddress(),nftIndex);
    console.log("bondNFTInfo = ",bondNFTInfo.toString());
});
