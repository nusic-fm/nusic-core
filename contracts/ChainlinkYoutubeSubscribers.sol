// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ChainlinkRequest.sol";
import "./BondNFT.sol";

/*
* ChainlinkYoutubeSubscribers contract is for requesting Youtube Subscribers from Oracle
*/
contract ChainlinkYoutubeSubscribers is ChainlinkRequest{
    using Strings for string;
    using Chainlink for Chainlink.Request;

    event YoutubeSubscribersRequestInitiated(bytes32 indexed _requestId, address indexed nftAddress);
    event YoutubeSubscribersRequestFulfilled(bytes32 indexed _requestId, uint256 indexed _youtubeSubscribers, address indexed nftAddress);

    function getLatestSubscribers(address _nftAddress) public returns (bytes32) {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        BondNFT _bondNFT = BondNFT(_nftAddress);
        request.add("id", _bondNFT.channelId());

        bytes32 requestId = sendChainlinkRequestTo(oracle, request, fee);
        requestToSender[requestId] = msg.sender;
        requestToNFTAddress[requestId] = _nftAddress;

        emit YoutubeSubscribersRequestInitiated(requestId, address(this)); 
        return requestId; 
    }

    function fulfill(bytes32 _requestId, uint256 _listeners) public recordChainlinkFulfillment(_requestId) {
        address _nftAddress = requestToNFTAddress[_requestId];
        BondNFT _bondNFT = BondNFT(_nftAddress);
        _bondNFT.requestLatestYoutubeSubscribersFulFill(_requestId, _listeners);
        emit YoutubeSubscribersRequestFulfilled(_requestId, _listeners, address(this));
    }
}
