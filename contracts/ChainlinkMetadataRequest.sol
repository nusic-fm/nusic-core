// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ChainlinkRequest.sol";
import "./BondNFT.sol";

/*
* ChainlinkMetadataRequest contract is for requesting NFT Metadata from Oracle
*/
contract ChainlinkMetadataRequest is ChainlinkRequest {
    using Strings for string;
    using Chainlink for Chainlink.Request;

    event MetadataURIRequestInitiated(bytes32 indexed _requestId, address indexed nftAddress);
    event MetadataURIRequestFulfilled(bytes32 indexed _requestId, address indexed nftAddress, string metadataURI);

    function getMetadataURI(address _nftAddress) public returns (bytes32) {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        BondNFT _bondNFT = BondNFT(_nftAddress);
        request.add("id", _bondNFT.channelId());
        request.add("nftaddress", toString(_nftAddress));

        bytes32 requestId = sendChainlinkRequestTo(oracle, request, fee);
        requestToSender[requestId] = msg.sender;
        requestToNFTAddress[requestId] = _nftAddress;

        emit MetadataURIRequestInitiated(requestId, _nftAddress); 
        return requestId; 
    }

    function fulfill(bytes32 _requestId, bytes32 _metadataURI) public recordChainlinkFulfillment(_requestId) {
        address _nftAddress = requestToNFTAddress[_requestId];
        string memory _metadataURIStr = bytes32ToString(_metadataURI);
        BondNFT _bondNFT = BondNFT(_nftAddress);
        _bondNFT.requestMetadataURIFulFill(_requestId, _metadataURIStr);
        emit MetadataURIRequestFulfilled(_requestId, _nftAddress ,_metadataURIStr);
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

    function bytes32ToBytes(bytes32 _bytes32) public pure returns (bytes memory){
        bytes memory bytesArray = new bytes(32);
        for (uint256 i; i < 32; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return bytesArray;
    }

    function bytes32ToString(bytes32 _bytes32) public pure returns (string memory){
        bytes memory bytesArray = bytes32ToBytes(_bytes32);
        return string(bytesArray);
    }
}
