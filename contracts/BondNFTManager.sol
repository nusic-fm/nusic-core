// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./RatingEngine.sol";
import "./BondNFTGenerator.sol";
import "./ChainlinkSpotifyListeners.sol";
import "./ChainlinkYoutubeSubscribers.sol";
import "./BondNFT.sol";
import "./AssetPool.sol";
import "./ChainlinkMetadataRequest.sol";
import "hardhat/console.sol";

contract BondNFTManager is Ownable {

    using Strings for string;

    RatingEngine private ratingEngine;
    BondNFTGenerator private bondNFTGenerator;
    ChainlinkSpotifyListeners private chainlinkSpotifyListeners;
    ChainlinkMetadataRequest private chainlinkMetadataRequest;
    ChainlinkYoutubeSubscribers private chainlinkYoutubeSubscribers;

    struct BondConfig {
        string artistName;
        string artistId;
        string channelId;
        uint256 fundingAmount;
        uint256 numberOfYears;
        uint256 numberOfBonds;
        address issuerAddress;
        uint256 faceValue;
        uint256 listeners;
        address nftAddress;
    }

    struct AssetPoolInfo {
        address assetPoolAddress;
        address bondNftAddress;
        uint256 bondvalue;
    }

    mapping(address => BondConfig[]) public userBondConfigs;
    mapping(address => AssetPoolInfo[]) public userAssetPools;

    address[] public allBondNfts;
    address[] public allAssetPools;
    
    event BondNFTCreated(
        address issuerAddress,
        address bondNftAddress,
        string name,
        string symbol
    );

    event BondNFTMinted(
        address indexed bondNftAddress,
        uint256 numberOfBonds
    );

    event AssetPoolCreated(
        address artist,
        address assetPool,
        uint256 bondValue
    );

    struct ListenersDetails {
        uint256 spotifyListeners;
        uint256 youtubeSubscribers;
        address assetPoolAddress;
    }

    function initialize(address _ratingEngine, address _bondNftGenerator, address _chainlinkSpotifyListenersAddress, address _chainlinkYoutubeSubscribersAddress, address _chainlinkMetadataRequestAddress) public onlyOwner {
        ratingEngine = RatingEngine(_ratingEngine);
        bondNFTGenerator = BondNFTGenerator(_bondNftGenerator);
        chainlinkSpotifyListeners = ChainlinkSpotifyListeners(_chainlinkSpotifyListenersAddress);
        chainlinkYoutubeSubscribers = ChainlinkYoutubeSubscribers(_chainlinkYoutubeSubscribersAddress);
        chainlinkMetadataRequest = ChainlinkMetadataRequest(_chainlinkMetadataRequestAddress);
    }

    function createAssetPool(uint256 _bondValue) public returns(address assetPoolAddress) {
        require(_bondValue > 0, "Value of the bond cannot be 0");
        AssetPool assetPool = new AssetPool();
        assetPoolAddress = address(assetPool);
        assetPool.initialize(msg.sender, _bondValue);
        userAssetPools[msg.sender].push(AssetPoolInfo(assetPoolAddress,address(0),_bondValue));
        allAssetPools.push(assetPoolAddress);
        emit AssetPoolCreated(msg.sender, assetPoolAddress, _bondValue);
    }

    function issueBond(string memory _artistName, string memory _artistId, string memory _channelId, 
                        uint256 _fundingAmount, uint256 _numberOfYears, uint256 _numberOfBonds, 
                        uint256 _facevalue, string memory _bondName, string memory _bondSymbol, 
                        ListenersDetails memory listenersDetails) public returns(address nftAddress) {
        
        nftAddress = bondNFTGenerator.generateNFT(_bondName, _bondSymbol, 
                                                    address(chainlinkSpotifyListeners), 
                                                    address(chainlinkYoutubeSubscribers), 
                                                    address(chainlinkMetadataRequest));
        BondNFT bondNFT = BondNFT(nftAddress);
        bondNFT.initialize(_artistName, _artistId, _channelId, _fundingAmount, _numberOfYears, 
                            _numberOfBonds, _facevalue, listenersDetails.spotifyListeners, 
                            listenersDetails.youtubeSubscribers);
        
        BondConfig memory _config = BondConfig(_artistName,_artistId,_channelId, _fundingAmount, 
                                    _numberOfYears, _numberOfBonds, msg.sender,_facevalue,0,nftAddress);
        
        userBondConfigs[msg.sender].push(_config);
        allBondNfts.push(nftAddress);
        
        AssetPoolInfo memory assetPoolInfo = getAssetPoolInfo(msg.sender,listenersDetails.assetPoolAddress);
        assetPoolInfo.bondNftAddress = nftAddress;
        AssetPool assetPool = AssetPool(payable(listenersDetails.assetPoolAddress));
        assetPool.initializeBondInfo(_numberOfYears, nftAddress);
        emit BondNFTCreated(msg.sender,nftAddress,_bondName,_bondSymbol);
    }

    function getAssetPoolInfo(address _artist, address _assetPoolAddress) private view returns(AssetPoolInfo memory) {
        AssetPoolInfo[] memory list = userAssetPools[_artist];
        for(uint32 i=0;i<list.length;i++ ) {
            if(list[i].assetPoolAddress == _assetPoolAddress) {
                return list[i];
            }
        }
        require(false, "Asset Pool Not Found");
    }

    function mintNFTBond(address _nftAddress) public {
        BondNFT bondNFT = BondNFT(_nftAddress);
        bondNFT.mintBonds(msg.sender);
        emit BondNFTMinted(_nftAddress,bondNFT.totalSupply());
    }

    function allAssetPoolsLength() external view returns (uint256) {
        return allAssetPools.length;
    }

    function allNftLength() external view returns (uint256) {
        return allBondNfts.length;
    }

    function assetPoolsLengthForUser(address _creatorAddress) external view returns (uint256) {
        return userAssetPools[_creatorAddress].length;
    }

    function nftBondLengthForUser(address _creatorAddress) external view returns (uint256) {
        return userBondConfigs[_creatorAddress].length;
    }
}