// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Nusic is ERC721, Ownable {
    bool public saleIsActive;
    uint256 public maxByMint;
    uint256 public maxSupply;
    uint256 public maxPreSeedSupply;
    uint256 public maxPublicSupply;
    uint256 public maxReservedSupply;
    uint256 public totalPreSeedSupply;
    uint256 public totalPublicSupply;
    uint256 public totalReservedSupply;
    uint256 public price;
    address public daoAddress;
    string internal baseTokenURI;
    
    // Values assigned variables
    enum SaleType { SEED, PRIVATE, PUBLIC }
    SaleType currentSaleType = SaleType.SEED;
    struct MaxPublicSupplyForRounds {
        uint256 SEED;
        uint256 PRIVATE;
        uint256 PUBLIC;
    }
    struct MaxReserveSupplyForRounds {
        uint256 SEED;
        uint256 PRIVATE;
        uint256 PUBLIC;
    }
    // 25 of public seed is minted from mintReserved for pre-seed.
    // Max public supply for seed is 100 (i.e: 125 - 25)
    MaxPublicSupplyForRounds maxPublicSupplyForRounds = MaxPublicSupplyForRounds(100, 225, 475);
    MaxPublicSupplyForRounds maxReserveSupplyForRounds = MaxPublicSupplyForRounds(125, 250, 500);

    
    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        maxByMint = 10;
        maxSupply = 1000;
        maxReservedSupply = 500;
        maxPreSeedSupply = 25;
        maxPublicSupply = maxSupply - maxReservedSupply - maxPreSeedSupply;
        price = 6.25 ether;
        daoAddress = 0x923F3096c1B9bb34B41F1496d751cc38a6BEE052;
        baseTokenURI = '';

    }

    function tokenURI(uint256 _tokenId) override public view returns (string memory) {
        return string(abi.encodePacked(baseTokenURI, Strings.toString(_tokenId)));
    }

    function mintPreSeed(uint _numberOfTokens, address to) external onlyOwner {
        require(totalPreSeedSupply + _numberOfTokens <= maxPreSeedSupply, "Exceeds max pre-seed supply");
        for (uint i=0; i< _numberOfTokens; i++) {
            // TODO: Decide on token ids. Currently 1 ... 25
            _mint(to, totalPreSeedSupply + 1);
            totalPreSeedSupply++;
        }
    }

    function mintPublic(uint _numberOfTokens) external payable {
        require(saleIsActive, "Sale not active");
        require(_numberOfTokens <= maxByMint, "Max mint exceeded");
        require(totalPublicSupply + _numberOfTokens <= maxPublicSupply, "Max supply reached");
        require(price * _numberOfTokens <= msg.value, "Eth val incorrect");

        if (currentSaleType == SaleType.SEED) {
            require(totalPublicSupply + _numberOfTokens <= maxPublicSupplyForRounds.SEED, "Exceeds max public supply for SEED");
        } else if (currentSaleType == SaleType.PRIVATE) {
            require(totalPublicSupply + _numberOfTokens <= maxPublicSupplyForRounds.PRIVATE, "Exceeds max public supply for PRIVATE");
        }
        for(uint i = 0; i < _numberOfTokens; i++) {
            _mint(msg.sender, maxPreSeedSupply + totalPublicSupply + 1); // 25 + ~ + 1
            totalPublicSupply++;
        }
        if (currentSaleType == SaleType.SEED && totalPublicSupply == maxPublicSupplyForRounds.SEED) {
            saleIsActive = false;
        } else if (currentSaleType == SaleType.PRIVATE && totalPublicSupply == maxPublicSupplyForRounds.PRIVATE) {
            saleIsActive = false;
        }
    }

    function mintReserved(uint _numberOfTokens, address _to) external onlyOwner {
        require(totalReservedSupply + _numberOfTokens <= maxReservedSupply, "Exceeds max pre reserved supply");
        for (uint i=0; i< _numberOfTokens; i++) {
            _mint(_to, maxPreSeedSupply + maxPublicSupply + totalReservedSupply + 1); // 500 + ~ + 1
            totalReservedSupply++;
        }
    }

    function setPrice(uint256 _newPrice) external onlyOwner {
        price = _newPrice;
    }

    function flipSaleStatus() external onlyOwner {
        saleIsActive = !saleIsActive;
    }

    function setDaoAddress(address _daoAddress) external onlyOwner {
        daoAddress = _daoAddress;
    }

    function setBaseTokenURI(string memory _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function withdraw() external onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0);
        _withdraw(daoAddress, balance);
    }

    function _withdraw(address _address, uint256 _amount) private {
        (bool success, ) = _address.call{value: _amount}("");
        require(success, "Tx failed");
    }

}
