const { BigNumber } = require("@ethersproject/bignumber");

task("issue-nft-bond")
  .addParam("contract","Contract Address")
  .addParam("assetPoolAddress","AssetPoolAddress")
  .setAction(async taskArgs=>{
    const bondNFTManagerAddress = taskArgs.contract;
    const assetPoolAddress = taskArgs.assetPoolAddress;
    const BondNFTManager = await ethers.getContractFactory("BondNFTManager");

    const bondNFTManager = await BondNFTManager.attach(bondNFTManagerAddress);
    const issueBondTxt = await bondNFTManager.issueBond("Howie B","howie_b","UCOmHUn--16B90oW2L6FRR3Ab",
                              "audiusArtistId",BigNumber.from("1000"),BigNumber.from("3"),
                              BigNumber.from("10"),BigNumber.from("2000"),"HowieBNFT","HNFT",
                              assetPoolAddress);
    
    console.log("issueBondTxt hash = ",issueBondTxt.hash);
    console.log("issueBondTxt = ",issueBondTxt);
});

//module.exports = {}