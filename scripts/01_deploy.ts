import { ethers } from 'hardhat';
import { BondNFTGenerator, BondNFTGenerator__factory, BondNFTManager, BondNFTManager__factory,
         ChainlinkMetadataRequest, ChainlinkMetadataRequest__factory, ChainlinkSpotifyListeners, 
         ChainlinkSpotifyListeners__factory, ChainlinkYoutubeSubscribers, ChainlinkYoutubeSubscribers__factory,
        RatingEngine, RatingEngine__factory 
      } from '../typechain';

/*
* Main deployment script to deploy all the relevent contracts
*/
async function main() {
  
  /*
    youtubeSubscribers: a90ac904-9d3b-4f5a-bcb3-15ff1a3a367a
    spotifyListeners: 9e7106b9-8d48-422b-b82c-392acf4a331a
    ipfs metadata: b8ec9aad-0280-4ce0-9839-7a731b26c7c3
  */
  const oracleAddress = "0xcE4452C43390842bE32B45964945276A78985E88";
  const youtubeSubscribersJobId = "a90ac9049d3b4f5abcb315ff1a3a367a";
  const spotifyListenersJobId = "9e7106b98d48422bb82c392acf4a331a";
  const metadataJobId = "b8ec9aad02804ce098397a731b26c7c3";
  const fee = "1000000000000000000"; // 1 Link token

  const RatingEngine:RatingEngine__factory = await ethers.getContractFactory("RatingEngine");
  const ratingEngine:RatingEngine = await RatingEngine.deploy();
  await ratingEngine.deployed();
  console.log("RatingEngine deployed to:", ratingEngine.address);

  const ChainlinkSpotifyListeners:ChainlinkSpotifyListeners__factory = await ethers.getContractFactory("ChainlinkSpotifyListeners");
  const chainlinkSpotifyListeners:ChainlinkSpotifyListeners = await ChainlinkSpotifyListeners.deploy();
  await chainlinkSpotifyListeners.deployed();
  console.log("ChainlinkSpotifyListeners deployed to:", chainlinkSpotifyListeners.address);
  await chainlinkSpotifyListeners.initialize(oracleAddress,spotifyListenersJobId,fee);
  console.log("ChainlinkSpotifyListeners Initialized");

  const ChainlinkYoutubeSubscribers:ChainlinkYoutubeSubscribers__factory = await ethers.getContractFactory("ChainlinkYoutubeSubscribers");
  const chainlinkYoutubeSubscribers:ChainlinkYoutubeSubscribers = await ChainlinkYoutubeSubscribers.deploy();
  await chainlinkYoutubeSubscribers.deployed();
  console.log("ChainlinkYoutubeSubscribers deployed to:", chainlinkYoutubeSubscribers.address);
  await chainlinkYoutubeSubscribers.initialize(oracleAddress,youtubeSubscribersJobId,fee);
  console.log("ChainlinkYoutubeSubscribers Initialized");

  const ChainlinkMetadataRequest:ChainlinkMetadataRequest__factory = await ethers.getContractFactory("ChainlinkMetadataRequest");
  const chainlinkMetadataRequest:ChainlinkMetadataRequest = await ChainlinkMetadataRequest.deploy();
  await chainlinkMetadataRequest.deployed();
  console.log("ChainlinkMetadataRequest deployed to:", chainlinkMetadataRequest.address);
  await chainlinkMetadataRequest.initialize(oracleAddress,metadataJobId,fee);
  console.log("ChainlinkMetadataRequest Initialized");

  const BondNFTGenerator:BondNFTGenerator__factory = await ethers.getContractFactory("BondNFTGenerator");
  const bondNFTGenerator:BondNFTGenerator = await BondNFTGenerator.deploy();
  await bondNFTGenerator.deployed();
  console.log("BondNFTGenerator deployed to:", bondNFTGenerator.address);

  const BondNFTManager:BondNFTManager__factory = await ethers.getContractFactory("BondNFTManager");
  const bondNFTManager:BondNFTManager = await BondNFTManager.deploy();
  await bondNFTManager.deployed();
  console.log("BondNFTManager deployed to:", bondNFTManager.address);

  await bondNFTManager.initialize(ratingEngine.address, bondNFTGenerator.address, chainlinkSpotifyListeners.address, chainlinkYoutubeSubscribers.address, chainlinkMetadataRequest.address);
  console.log("BondNFTManager Initialized");
  
  console.log("RatingEngine deployed to:", ratingEngine.address);
  console.log("ChainlinkYoutubeSubscribers deployed to:", chainlinkYoutubeSubscribers.address);
  console.log("ChainlinkSpotifyListeners deployed to:", chainlinkSpotifyListeners.address);
  console.log("ChainlinkMetadataRequest deployed to:", chainlinkMetadataRequest.address);
  console.log("BondNFTGenerator deployed to:",bondNFTGenerator.address);
  console.log("BondNFTManager deployed to:", bondNFTManager.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
