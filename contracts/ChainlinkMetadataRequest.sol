// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "./BondNFT.sol";

contract ChainlinkMetadataRequest is ChainlinkClient, Ownable {
    using Strings for string;
    using Chainlink for Chainlink.Request;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    mapping(bytes32=>address) requestToSender;
    mapping(bytes32=>address) requestToNFTAddress;

    event MetadataURIRequestInitiated(bytes32 indexed _requestId, address indexed nftAddress);
    event MetadataURIRequestFulfilled(bytes32 indexed _requestId, address indexed nftAddress, string indexed metadataURI);

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

    function getMetadataURI(address _nftAddress) public returns (bytes32) {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        BondNFT _bondNFT = BondNFT(_nftAddress);
        request.add("id", _bondNFT.channelId());
        request.add("endpoint", _bondNFT.endpoint());
        request.add("nftaddress", toString(_nftAddress));

        bytes32 requestId = sendChainlinkRequestTo(oracle, request, fee);
        requestToSender[requestId] = msg.sender;
        requestToNFTAddress[requestId] = _nftAddress;

        emit MetadataURIRequestInitiated(requestId, _nftAddress); 
        return requestId; 
    }

    function fulfill(bytes32 _requestId, string memory _metadataURI) public recordChainlinkFulfillment(_requestId) {
        address _nftAddress = requestToNFTAddress[_requestId];
        BondNFT _bondNFT = BondNFT(_nftAddress);
        _bondNFT.requestMetadataURIFulFill(_requestId, _metadataURI);
        emit MetadataURIRequestFulfilled(_requestId, _nftAddress ,_metadataURI);
    }

    function toString(address account) internal pure returns(string memory) {
        return toString(abi.encodePacked(account));
    }
  
    function toString(bytes memory data) internal pure returns(string memory) {
        bytes memory alphabet = "0123456789abcdef";
    
        bytes memory str = new bytes(2 + data.length * 2);
        str[0] = "0";
        str[1] = "x";
        for (uint i = 0; i < data.length; i++) {
            str[2+i*2] = alphabet[uint(uint8(data[i] >> 4))];
            str[3+i*2] = alphabet[uint(uint8(data[i] & 0x0f))];
        }
        return string(str);
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
