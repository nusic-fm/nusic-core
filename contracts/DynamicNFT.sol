// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DynamicNFT is ERC721URIStorage, Ownable {
    using Strings for string;

    uint256 public totalListeners;
    string public channelId;
    string public endpoint;

    uint256 public immutable maxSupply;
    uint256 public totalSupply;
    
    constructor(uint256 _maxSupply,string memory _channelId, string memory _endpoint, uint256 _totalListeners) ERC721("DynamicNFT", "DYNFT") {
        maxSupply = _maxSupply;
        channelId = _channelId;
        endpoint = _endpoint;
        totalListeners = _totalListeners;

        for(uint16 i=0; i<_maxSupply; i++) {
            _safeMint(msg.sender, totalSupply);
            totalSupply++;
        }
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
