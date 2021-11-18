// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./RatingEngine.sol";
import "./BondNFTGenerator.sol";
import "./ChainlinkOracleInfo.sol";
import "./BondNFT.sol";
import "./AssetPool.sol";

contract BondNFTManager is Ownable {

    using Strings for string;

    string private defaultEndpont = "channel";
    RatingEngine private ratingEngine;
    BondNFTGenerator private bondNFTGenerator;
    ChainlinkOracleInfo private chainlinkOracleInfo;

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

    mapping(address => BondConfig[]) private userBondConfigs;
    mapping(address => AssetPoolInfo[]) private userAssetPools;
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

    function initialize(address _ratingEngine, address _bondNftGenerator, address _chainlinkOracleInfoAddress) public onlyOwner {
        ratingEngine = RatingEngine(_ratingEngine);
        bondNFTGenerator = BondNFTGenerator(_bondNftGenerator);
        chainlinkOracleInfo = ChainlinkOracleInfo(_chainlinkOracleInfoAddress);
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
                        string memory _bondSymbol) public returns(address nftAddress) {
        
        nftAddress = bondNFTGenerator.generateNFT(_bondName, _bondSymbol);
        BondNFT bondNFT = BondNFT(nftAddress);
        bondNFT.initialize(_artistName, _artistId, _channelId, defaultEndpont,
                            _audiusArtistId, _fundingAmount, _numberOfYears, _numberOfBonds,
                            _facevalue, address(chainlinkOracleInfo));
        
        BondConfig memory _config = BondConfig(_artistName,_artistId,_channelId,defaultEndpont,
                                                _audiusArtistId,_fundingAmount, _numberOfYears,
                                                _numberOfBonds, msg.sender,_facevalue,0,nftAddress);
        userBondConfigs[msg.sender].push(_config);
        allBondNfts.push(nftAddress);
        emit BondNFTCreated(msg.sender,nftAddress,_artistId,_bondName,_bondSymbol);
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


    // Seems to be not need now 
    /*
    function calculateFacevalue(bytes32 _requestId) private {
        BondConfig memory _bondConfig = bondConfigs[_requestId];
        uint256 _faceValue = _bondConfig.fundingAmount * (_bondConfig.numberOfYears * 4) * ratingEngine.riskPremium();
        _bondConfig.faceValue = _faceValue;
    }*/

}