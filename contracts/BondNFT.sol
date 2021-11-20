// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./ChainlinkOracleInfo.sol";
import "./ChainlinkMetadataRequest.sol";

contract BondNFT is ERC721, Ownable {
    using Strings for string;
    using Strings for uint256;

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
    string public defaultURI = "ipfs://QmUNYMorLY9y15eYYZDXxTbdQPAXWqC3MwMm4Jtuz7SsxA";
    string public baseURI;

    ChainlinkOracleInfo private chainlinkOracleInfo;
    ChainlinkMetadataRequest private chainlinkMetadataRequest;
    bytes32 private metadataRequestId;
    bytes32 private listenersRequestId;
    
    constructor(string memory _name, string memory _symbol, address _chainlinkOracleInfoAddress, address _chainlinkMetadataRequestAddress) ERC721(_name, _symbol) {
        chainlinkOracleInfo = ChainlinkOracleInfo(_chainlinkOracleInfoAddress);
        chainlinkMetadataRequest = ChainlinkMetadataRequest(_chainlinkMetadataRequestAddress);
    }

    function initialize(string memory _artistName, string memory _artistId, string memory _channelId, 
                string memory _endpoint, string memory _audiusArtistId, uint256 _fundingAmount, 
                uint256 _numberOfYears, uint256 _numberOfBonds, uint256 _facevalue) public {
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

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exists");
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(),".json")) : defaultURI;
    }

    function requestLatestListeners() private {
        listenersRequestId = chainlinkOracleInfo.getLatestListeners(address(this));
    }
    
    function requestLatestListenersFulFill(bytes32 _requestId, uint256 _listeners) public {
        require(listenersRequestId == _requestId, "Listeners Request Not Matched");
        totalListeners = _listeners;
    }

    function requestMetadataURI() private {
        metadataRequestId = chainlinkMetadataRequest.getMetadataURI(address(this));
    }
    
    function requestMetadataURIFulFill(bytes32 _requestId, string memory _metadataURI) public {
        require(metadataRequestId == _requestId, "Metadata Request Not Matched");
        baseURI = _metadataURI;
    }

}
