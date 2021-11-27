// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BondNFT.sol";

contract BondNFTGenerator is Ownable {

    function generateNFT(string memory _bondName, string memory _bondSymbol, address _chainlinkSpotifyListenersAddress, address _chainlinkYoutubeSubscribersAddress, address _chainlinkMetadataRequestAddress) public returns(address) {
        BondNFT nft = new BondNFT(_bondName, _bondSymbol, _chainlinkSpotifyListenersAddress, _chainlinkYoutubeSubscribersAddress, _chainlinkMetadataRequestAddress);
        return address(nft);
    }
}
