// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./DynamicNFT.sol";
import "./RatingEngine.sol";

contract NFTManager is ChainlinkClient, Ownable {

    using Strings for string;
    using Chainlink for Chainlink.Request;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    mapping(bytes32 => address) requestToSender;
    mapping(bytes32 => string) requestToChannelId;
    mapping(bytes32 => string) requestToEndpoint;

    string private defaultEndpont = "channel";
    RatingEngine private ratingEngine;

    event ListenerRequestInitiated(bytes32 indexed _requestId);
    event RequestListenerFulfilled(bytes32 indexed _requestId, uint256 indexed _listeners, address indexed nftAddress);

    struct BondConfig {
        string artistName;
        string artistId;
        string channelId;
        string endpint;
        uint256 fundingAmount;
        uint256 averageQuarterlyIncome;
        uint256 numberOfYears;
        address issuerAddress;
        bytes32 requestId;
        uint256 listeners;
        uint256 faceValue;
    }

    mapping(bytes32 => BondConfig) private bondConfigs;


    constructor(address _oracle, string memory _jobId, address _ratingEngine) {   
        setPublicChainlinkToken();
        oracle = _oracle;
        jobId = stringToBytes32(_jobId);
        fee = 1 * 10 ** 18; // (Varies by network and job)
        ratingEngine = RatingEngine(_ratingEngine);
    }

    function issueBond(string memory _artistName, string memory _artistId, string memory _channelId, uint256 _fundingAmount, uint256 _averageQuarterlyIncome, uint256 _numberOfYears) public {
        bytes32 requestId = requestChannelListeners(_channelId, defaultEndpont);
        BondConfig memory _config = BondConfig(_artistName,_artistId,_channelId,defaultEndpont,_fundingAmount, _averageQuarterlyIncome, _numberOfYears, msg.sender,requestId,0,0);
        bondConfigs[requestId] = _config;
        requestToSender[requestId] = msg.sender;
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
        //totalListeners = _listeners;
        //apidata.push(APIData(_listeners,"Youtube",requestToChannelId[_requestId],requestToEndpoint[_requestId]));
        bondConfigs[_requestId].listeners = _listeners;
        calculateFacevalue(_requestId);
        BondConfig memory _bondConfig = bondConfigs[_requestId];
        DynamicNFT nft = new DynamicNFT(100,_bondConfig.channelId,_bondConfig.endpint, _bondConfig.listeners);
        emit RequestListenerFulfilled(_requestId, _listeners, address(nft));
    }

    function calculateFacevalue(bytes32 _requestId) private {
        BondConfig memory _bondConfig = bondConfigs[_requestId];
        uint256 _faceValue = _bondConfig.averageQuarterlyIncome * (_bondConfig.numberOfYears * 4) * ratingEngine.riskPremium();
        _bondConfig.faceValue = _faceValue;
    }

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