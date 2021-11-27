// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

/*
* Abstract parent contract for all chainlink requests
*/
abstract contract ChainlinkRequest is ChainlinkClient, Ownable {
    using Strings for string;
    using Chainlink for Chainlink.Request;

    address internal oracle;
    bytes32 internal jobId;
    uint256 internal fee;

    mapping(bytes32=>address) internal requestToSender;
    mapping(bytes32=>address) internal requestToNFTAddress;

    constructor() {
        setPublicChainlinkToken();
    }

    function initialize(address _oracle, string memory _jobId, uint256 _fee) public virtual onlyOwner {
        oracle = _oracle;
        jobId = stringToBytes32(_jobId);
        fee = _fee;
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

    //Convert string to bytes32
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