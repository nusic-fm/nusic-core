// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract gNusic  is ERC1155Supply {
    using Strings for uint256;

    uint256 public constant MAX_TOKENS = 10000;
    uint256 public constant MAX_FRACTION_PER_TOKEN = 1000;
    uint256 public currentTokenId;

    uint256[] public partialMintedList;
    string private _name;

    event TokenMinted(address account, uint256 tokenId, uint256 amount);

    // Typical URI "https://game.example/api/item/{id}.json"
    constructor(string memory name_, string memory _uri) ERC1155(_uri){
        _name = name_;
    }

    modifier idAllowed(uint256 id){
        require(id >= 0 && id <= MAX_TOKENS, "Id Not Allowed");
        _;
    }

    // OpenSea require proper implementation of URI function just like it is for ERC721
    function uri(uint256 tokenId) public view override returns (string memory) {
        require(exists(tokenId), "Token does not exists");
        string memory _tokenURI = super.uri(tokenId);
        return bytes(_tokenURI).length > 0 ? string(abi.encodePacked(_tokenURI, tokenId.toString(),".json")) : "";
    }

    /*
    function mintToken(uint256 _id, uint256 _amount) public idAllowed(_id) {
        require((totalSupply(_id) + _amount) <= MAX_FRACTION_PER_TOKEN, "Not enough supply for this Token");
        _mintToken(_id, _amount);
    }
    */

    function mintFullToken() public {
        uint256 _tokenSupply = totalSupply(_id); 
        require(_tokenSupply + _amount <= MAX_FRACTION_PER_TOKEN, "Not enough supply");
        _mint(msg.sender, _id, _amount, "");
        emit TokenMinted(msg.sender, _id, _amount);
    }

    

    function mintToken(uint256 _amount) public {
        require(_amount <= MAX_FRACTION_PER_TOKEN, "Cannot mint too much");
        uint256 _tokenSupply = totalSupply(currentTokenId); 
        uint256 tokenIdToBeMinted = currentTokenId;
        uint256 firstPortion = MAX_FRACTION_PER_TOKEN - _tokenSupply;
        if((_tokenSupply + _amount) > MAX_FRACTION_PER_TOKEN) {
            _mint(msg.sender, currentTokenId, firstPortion, "");
            currentTokenId++;
            _mint(msg.sender, currentTokenId, _amount - firstPortion, "");
        }
        else {
            _mint(msg.sender, currentTokenId, _amount, "");
        }

        if((totalSupply(currentTokenId) + _amount) == MAX_FRACTION_PER_TOKEN) {
            currentTokenId++;
        }
    }

    /*
    function mintToken(uint256 _amount) public {
        uint256 _tokenSupply = totalSupply(currentTokenId); 
        uint256 tokenIdToBeMinted = currentTokenId;
        if((_tokenSupply + _amount) > MAX_FRACTION_PER_TOKEN) {
            tokenIdToBeMinted = findAvailableSupplyInSingleToken(_amount);
        }
        _mintToken(tokenIdToBeMinted, _amount);
    }
    */
    function _mintToken(uint256 _id, uint256 _amount) private {
        _mint(msg.sender, _id, _amount, "");
        if((_tokenSupply + _amount) == MAX_FRACTION_PER_TOKEN) {
            currentTokenId++;
        }
        emit TokenMinted(msg.sender, _id, _amount);
    }

    /*
    // Not needed now
    function findAvailableSupplyInSingleToken(uint256 _amount) private returns (uint256) {
        for(uint256 i=currentTokenId+1; i<MAX_TOKENS; i++) {
            uint256 _supply = totalSupply(i);
            if((_supply + _amount) <= MAX_FRACTION_PER_TOKEN) {
                return i;
            }
        }
        require(false, "Not enough supply in Single Token");
    }
    */
    

    function name() public view returns (string memory) {
        return _name;
    }
}
