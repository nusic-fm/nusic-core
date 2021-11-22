// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./RatingEngine.sol";
import "./BondNFTGenerator.sol";
import "./ChainlinkOracleInfo.sol";
import "./BondNFT.sol";
import "./AssetPool.sol";
import "./ChainlinkMetadataRequest.sol";
import "hardhat/console.sol";

contract BondNFTManager is Ownable {

    using Strings for string;

    string private defaultEndpont = "channel";
    RatingEngine private ratingEngine;
    BondNFTGenerator private bondNFTGenerator;
    ChainlinkOracleInfo private chainlinkOracleInfo;
    ChainlinkMetadataRequest private chainlinkMetadataRequest;

    struct BondConfig {
        string artistName;
        string artistId;
        string channelId;
        string endpoint;
        string audiusArtistId;
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
        address indexed issuerAddress,
        address indexed bondNftAddress,
        string indexed artistId,
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

    function initialize(address _ratingEngine, address _bondNftGenerator, address _chainlinkOracleInfoAddress, address _chainlinkMetadataRequestAddress) public onlyOwner {
        ratingEngine = RatingEngine(_ratingEngine);
        bondNFTGenerator = BondNFTGenerator(_bondNftGenerator);
        chainlinkOracleInfo = ChainlinkOracleInfo(_chainlinkOracleInfoAddress);
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
                        string memory _audiusArtistId, uint256 _fundingAmount, uint256 _numberOfYears,
                        uint256 _numberOfBonds, uint256 _facevalue, string memory _bondName, 
                        string memory _bondSymbol, address _assetPoolAddress) public returns(address nftAddress) {
        console.log("Issue Bond Started");
        
        nftAddress = bondNFTGenerator.generateNFT(_bondName, _bondSymbol, address(chainlinkOracleInfo), address(chainlinkMetadataRequest));
        console.log("bondNFTGenerator.generateNFT done = ",nftAddress);
        
        BondNFT bondNFT = BondNFT(nftAddress);
        bondNFT.initialize(_artistName, _artistId, _channelId, defaultEndpont,
                            _audiusArtistId, _fundingAmount, _numberOfYears, _numberOfBonds,
                            _facevalue);
        console.log("bondNFT.initialize done");
        
        BondConfig memory _config = BondConfig(_artistName,_artistId,_channelId,defaultEndpont,
                                                _audiusArtistId,_fundingAmount, _numberOfYears,
                                                _numberOfBonds, msg.sender,_facevalue,0,nftAddress);
        console.log("BondConfig done"); 
        userBondConfigs[msg.sender].push(_config);
        console.log("userBondConfigs pushed BondConfig done"); 
        allBondNfts.push(nftAddress);
        console.log("allBondNfts pushed nftAddress done"); 
        
        AssetPoolInfo memory assetPoolInfo = getAssetPoolInfo(msg.sender,_assetPoolAddress);
        console.log("AssetPoolInfo accessed ",assetPoolInfo.assetPoolAddress); 
        assetPoolInfo.bondNftAddress = nftAddress;
        emit BondNFTCreated(msg.sender,nftAddress,_artistId,_bondName,_bondSymbol);
        console.log("BondNFTCreated event emitted done"); 
        
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
        bondNFT.mintBonds();
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


    // Seems to be not need now 
    /*
    function calculateFacevalue(bytes32 _requestId) private {
        BondConfig memory _bondConfig = bondConfigs[_requestId];
        uint256 _faceValue = _bondConfig.fundingAmount * (_bondConfig.numberOfYears * 4) * ratingEngine.riskPremium();
        _bondConfig.faceValue = _faceValue;
    }*/

}