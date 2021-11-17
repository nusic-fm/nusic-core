// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./RatingEngine.sol";
import "./BondNFTGenerator.sol";

contract BondNFTManager is ChainlinkClient, Ownable {

    using Strings for string;
    using Chainlink for Chainlink.Request;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    string private defaultEndpont = "channel";
    RatingEngine private ratingEngine;
    BondNFTGenerator private bondNFTGenerator;

    event ListenerRequestInitiated(bytes32 indexed _requestId);
    event RequestListenerFulfilled(bytes32 indexed _requestId, uint256 indexed _listeners, address indexed nftAddress);

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
        bytes32 requestId;
        uint256 faceValue;
        uint256 listeners;
    }

    mapping(bytes32 => BondConfig) private bondConfigs;
    mapping(bytes32 => address) requestToNFTAddress;
    

    constructor() {   
        setPublicChainlinkToken();
    }

    function initialize(address _oracle, string memory _jobId, address _ratingEngine, address _bondNftGenerator) public onlyOwner {
        oracle = _oracle;
        jobId = stringToBytes32(_jobId);
        fee = 1 * 10 ** 18; // (Varies by network and job)
        ratingEngine = RatingEngine(_ratingEngine);
        bondNFTGenerator = BondNFTGenerator(_bondNftGenerator);
    }

    function issueBond(string memory _artistName, string memory _artistId, string memory _channelId, string memory _audiusArtistId, uint256 _fundingAmount, uint256 _numberOfYears, uint256 _numberOfBonds, uint256 _facevalue) public {
        bytes32 requestId = requestChannelListeners(_channelId, defaultEndpont);
        BondConfig memory _config = BondConfig(_artistName,_artistId,_channelId,defaultEndpont,_audiusArtistId,_fundingAmount, _numberOfYears, _numberOfBonds, msg.sender,requestId,_facevalue,0);
        bondConfigs[requestId] = _config;
        address nftAddress = bondNFTGenerator.generateNFT(
                                _artistName, _artistId, _channelId, defaultEndpont, _audiusArtistId,
                                _fundingAmount, _numberOfYears, _numberOfBonds, _facevalue);
        requestToNFTAddress[requestId] = nftAddress;
        
    }

    function requestChannelListeners(string memory _channelId, string memory _endpoint) public returns (bytes32 requestId)  {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        
        // Set the URL to perform the GET request on
        //request.add("get", "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD");
        //request.add("path", "USD");
        //request.addInt("times", 100);
        
        request.add("id", _channelId);
        request.add("endpoint", _endpoint);

        // Sends the request
        requestId = sendChainlinkRequestTo(oracle, request, fee);
        emit ListenerRequestInitiated(requestId);
        
    }

    function fulfill(bytes32 _requestId, uint256 _listeners) public recordChainlinkFulfillment(_requestId)
    {
        bondConfigs[_requestId].listeners = _listeners;
        //calculateFacevalue(_requestId);
        //BondConfig memory _bondConfig = bondConfigs[_requestId];
        //DynamicNFT nft = new DynamicNFT(100,_bondConfig.channelId,_bondConfig.endpint, _bondConfig.listeners);
        //address nftAddress = bondNFTGenerator.generateNFT(100,_bondConfig.channelId,_bondConfig.endpint, _bondConfig.listeners);
        BondNFT bondNft = BondNFT(requestToNFTAddress[_requestId]);
        bondNft.updateTotalListeners(_listeners);
        emit RequestListenerFulfilled(_requestId, _listeners, requestToNFTAddress[_requestId]);
    }

    // Seems to be not need now 
    /*
    function calculateFacevalue(bytes32 _requestId) private {
        BondConfig memory _bondConfig = bondConfigs[_requestId];
        uint256 _faceValue = _bondConfig.fundingAmount * (_bondConfig.numberOfYears * 4) * ratingEngine.riskPremium();
        _bondConfig.faceValue = _faceValue;
    }*/

    function stringToBytes32(string memory source) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly { // solhint-disable-line no-inline-assembly
            result := mload(add(source, 32))
        }
    }
}