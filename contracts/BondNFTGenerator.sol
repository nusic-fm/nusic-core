// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BondNFT.sol";

contract BondNFTGenerator is Ownable {
    function generateNFT(string memory _artistName, string memory _artistId, string memory _channelId, 
                string memory _endpoint, string memory _audiusArtistId, uint256 _fundingAmount, 
                uint256 _numberOfYears, uint256 _numberOfBonds, uint256 _facevalue) public returns(address) {
        BondNFT nft = new BondNFT(_artistName, _artistId, _channelId, _endpoint, _audiusArtistId,
                        _fundingAmount, _numberOfYears, _numberOfBonds, _facevalue);
        return address(nft);
    }
}
