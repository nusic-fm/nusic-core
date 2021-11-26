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
    /*
    function generateNFT(string memory _artistName, string memory _artistId, string memory _channelId, 
                string memory _endpoint, string memory _audiusArtistId, uint256 _fundingAmount, 
                uint256 _numberOfYears, uint256 _numberOfBonds, uint256 _facevalue, 
                address _chainlinkSpotifyListenersAddress, string memory _bondName, string memory _bondSymbol) public returns(address) {
        
        BondNFT nft = new BondNFT(_artistName, _artistId, _channelId, _endpoint, _audiusArtistId,
                        _fundingAmount, _numberOfYears, _numberOfBonds, _facevalue, _chainlinkSpotifyListenersAddress,_bondName, _bondSymbol);
        return address(nft);
        
    }*/
}
