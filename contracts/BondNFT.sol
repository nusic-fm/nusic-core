// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract BondNFT is ERC721URIStorage, Ownable {
    using Strings for string;

    uint256 public totalSupply;

    string public artistName;
    string public artistId;
    string public channelId;
    string endpoint;
    string public audiusArtistId;
    uint256 public fundingAmount;
    uint256 public numberOfYears;
    uint256 public immutable numberOfBonds; // Same as Max Supply
    address public issuerAddress;
    uint256 public faceValue;
    uint256 public totalListeners;
    //string memory _artistName, string memory _artistId, string memory _channelId, string memory _audiusArtistId, uint256 _fundingAmount, uint256 _numberOfYears, uint256 _numberOfBonds, uint256 _facevalue
    constructor(string memory _artistName, string memory _artistId, string memory _channelId, 
                string memory _endpoint, string memory _audiusArtistId, uint256 _fundingAmount, 
                uint256 _numberOfYears, uint256 _numberOfBonds, uint256 _facevalue) 
                ERC721("BondNFT", "BNFT") {
        artistName = _artistName;
        artistId = _artistId;
        channelId = _channelId;
        endpoint = _endpoint;
        audiusArtistId = _audiusArtistId;
        fundingAmount = _fundingAmount;
        numberOfYears = _numberOfYears;
        numberOfBonds = _numberOfBonds;
        issuerAddress = msg.sender;
        faceValue = _facevalue;
        
        //totalListeners // this will be updated later stage 
        /*
        for(uint16 i=0; i<_maxSupply; i++) {
            _safeMint(msg.sender, totalSupply);
            totalSupply++;
        }*/
    }


    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        return tokenURI(tokenId);
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        _setTokenURI(tokenId, _tokenURI);
    }


    function getAPIOverView()
        public view returns (uint256,string memory,string memory) {
        return (totalListeners,channelId,endpoint);
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
