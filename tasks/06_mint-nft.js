/*
* Task to mint BondNFTs through BondNFT Manager
*/
task("mint-nft")
  .addParam("nftManagerAddress","NFT Manager Contract Address")
  .addParam("nftBondAddress","NFT Bond Contract Address")
  .setAction(async taskArgs=>{
    const [owner] = await ethers.getSigners();
    const nftManagerAddress = taskArgs.nftManagerAddress;
    const nftBondAddress = taskArgs.nftBondAddress;

    const BondNFTManager = await ethers.getContractFactory("BondNFTManager");
    const bondNFTManager = await BondNFTManager.attach(nftManagerAddress);
    const txt = await bondNFTManager.mintNFTBond(nftBondAddress);
    console.log("txt.hash = ",txt.hash);
    console.log("txt = ",txt);
});
