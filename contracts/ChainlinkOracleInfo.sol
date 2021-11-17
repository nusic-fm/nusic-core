// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ChainlinkOracleInfo is Ownable {

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

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
