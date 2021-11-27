/*
* Task to read spotifyListeners,youtubeSubscribers and baseURI of particular NFT
* which will be updated by chianlink requests
*/
task("verify-nft-bond")
  .addParam("nftContractAddress","Contract Address")
  .setAction(async taskArgs=>{
    const bondNFTAddress = taskArgs.nftContractAddress;
    const BondNFT = await ethers.getContractFactory("BondNFT");

    const bondNFT = await BondNFT.attach(bondNFTAddress);
    
    const spotifyListeners = (await bondNFT.spotifyListeners()).toString();
    console.log("spotifyListeners = ",spotifyListeners);

    const youtubeSubscribers = (await bondNFT.youtubeSubscribers()).toString();
    console.log("youtubeSubscribers = ",youtubeSubscribers);
    
    const baseURI = await bondNFT.baseURI();
    console.log("baseURI = ",baseURI);
});
