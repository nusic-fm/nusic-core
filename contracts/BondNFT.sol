// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./ChainlinkOracleInfo.sol";
import "./ChainlinkMetadataRequest.sol";


contract BondNFT is ERC721URIStorage, Ownable {
    using Strings for string;

    uint256 public totalSupply;

    string public artistName;
    string public artistId;
    string public channelId;
    string public endpoint;
    string public audiusArtistId;
    uint256 public fundingAmount;
    uint256 public numberOfYears;
    uint256 public numberOfBonds; // Same as Max Supply
    address public issuerAddress;
    uint256 public faceValue;
    uint256 public totalListeners;

    // URI to be used before Reveal
    string public defaultURI;
    string public baseURI;

    ChainlinkOracleInfo private chainlinkOracleInfo;
    ChainlinkMetadataRequest private chainlinkMetadataRequest;
    bytes32 private metadataRequestId;
    bytes32 private listenersRequestId;
    
    constructor(string memory _name, string memory _symbol, address _chainlinkMetadataRequestAddress) ERC721(_name, _symbol) {
        chainlinkMetadataRequest = ChainlinkMetadataRequest(_chainlinkMetadataRequestAddress);
    }

    function initialize(string memory _artistName, string memory _artistId, string memory _channelId, 
                string memory _endpoint, string memory _audiusArtistId, uint256 _fundingAmount, 
                uint256 _numberOfYears, uint256 _numberOfBonds, uint256 _facevalue, address _chainlinkOracleInfoAddress) public {
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
        chainlinkOracleInfo = ChainlinkOracleInfo(_chainlinkOracleInfoAddress);
        requestLatestListeners();
        requestMetadataURI(); // This function call be done any of two places one is here and another one is in 'mindBonds' function, depnding on requirement
    }

    function mintBonds() public onlyOwner {
        for(uint16 i=0; i<numberOfBonds; i++) {
            _safeMint(msg.sender, totalSupply);
            totalSupply++;
        }
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
    
    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        return tokenURI(tokenId);
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) public onlyOwner{
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        _setTokenURI(tokenId, _tokenURI);
    }

    function requestMetadataURI() private {
        metadataRequestId = chainlinkMetadataRequest.getMetadataURI(address(this));
    }
    
    function requestMetadataURIFulFill(bytes32 _requestId, string memory _metadataURI) public {
        require(metadataRequestId == _requestId, "Metadata Request Not Matched");
        baseURI = _metadataURI;
    }

    function requestLatestListeners() private {
        listenersRequestId = chainlinkOracleInfo.getLatestListeners(address(this));
    }
    
    function requestLatestListenersFulFill(bytes32 _requestId, uint256 _listeners) public {
        require(listenersRequestId == _requestId, "Listeners Request Not Matched");
        totalListeners = _listeners;
    }
    
}
