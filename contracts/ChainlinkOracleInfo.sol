// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "./BondNFT.sol";


contract ChainlinkOracleInfo is ChainlinkClient, Ownable {
    using Strings for string;
    using Chainlink for Chainlink.Request;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    mapping(bytes32=>address) requestToSender;
    mapping(bytes32=>address) requestToNFTAddress;

    event ListenerRequestInitiated(bytes32 indexed _requestId, address indexed nftAddress);
    event RequestListenerFulfilled(bytes32 indexed _requestId, uint256 indexed _listeners, address indexed nftAddress);

    constructor() {
        setPublicChainlinkToken();
    }

    function initialize(address _oracle, string memory _jobId, uint256 _fee) public onlyOwner {
        oracle = _oracle;
        jobId = stringToBytes32(_jobId);
        fee = _fee;
        //fee = 1 * 10 ** 18; // (Varies by network and job)
    }

    function getOracle() public view returns (address) {
        return oracle;
    }

    function getJobId() public view returns (bytes32) {
        return jobId;
    }

    function getFee() public view returns (uint256) {
        return fee;
    }

    function getLatestListeners(address _nftAddress) public returns (bytes32) {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        BondNFT _bondNFT = BondNFT(_nftAddress);
        request.add("id", _bondNFT.channelId());
        request.add("endpoint", _bondNFT.endpoint());

        bytes32 requestId = sendChainlinkRequestTo(oracle, request, fee);
        requestToSender[requestId] = msg.sender;
        requestToNFTAddress[requestId] = _nftAddress;

        emit ListenerRequestInitiated(requestId, address(this)); 
        return requestId; 
    }

    function fulfill(bytes32 _requestId, uint256 _listeners) public recordChainlinkFulfillment(_requestId) {
        address _nftAddress = requestToNFTAddress[_requestId];
        BondNFT _bondNFT = BondNFT(_nftAddress);
        _bondNFT.requestLatestListenersFulFill(_requestId, _listeners);
        emit RequestListenerFulfilled(_requestId, _listeners, address(this));
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
