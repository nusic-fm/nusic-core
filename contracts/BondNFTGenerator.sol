// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DynamicNFT.sol";

contract BondNFTGenerator is Ownable {
    function generateNFT(uint256 _maxSupply,string memory _channelId, string memory _endpoint, uint256 _totalListeners) public returns(address) {
        DynamicNFT nft = new DynamicNFT(_maxSupply,_channelId,_endpoint, _totalListeners);
        return address(nft);
    }
}
