// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./ChainlinkSpotifyListeners.sol";
import "./ChainlinkMetadataRequest.sol";
import "./ChainlinkYoutubeSubscribers.sol";

contract BondNFT is ERC721, Ownable {
    using Strings for string;
    using Strings for uint256;

    uint256 public totalSupply;

    string public artistName;
    string public artistId;
    string public channelId;
    uint256 public fundingAmount;
    uint256 public numberOfYears;
    uint256 public numberOfBonds; // Same as Max Supply
    address public issuerAddress;
    uint256 public faceValue;
    uint256 public spotifyListeners;
    uint256 public youtubeSubscribers;

    // URI to be used before Reveal
    string public defaultURI = "ipfs://QmUNYMorLY9y15eYYZDXxTbdQPAXWqC3MwMm4Jtuz7SsxA";
    string public baseURI;

    ChainlinkSpotifyListeners private chainlinkSpotifyListeners;
    ChainlinkMetadataRequest private chainlinkMetadataRequest;
    ChainlinkYoutubeSubscribers private chainlinkYoutubeSubscribers;
    bytes32 private metadataRequestId;
    bytes32 private spotifyListenersRequestId;
    bytes32 private youtubeSubscribersRequestId;
    
    constructor(string memory _name, string memory _symbol, address _chainlinkSpotifyListenersAddress, address _chainlinkYoutubeSubscribersAddress, address _chainlinkMetadataRequestAddress) ERC721(_name, _symbol) {
        chainlinkSpotifyListeners = ChainlinkSpotifyListeners(_chainlinkSpotifyListenersAddress);
        chainlinkYoutubeSubscribers = ChainlinkYoutubeSubscribers(_chainlinkYoutubeSubscribersAddress);
        chainlinkMetadataRequest = ChainlinkMetadataRequest(_chainlinkMetadataRequestAddress);
    }

    // funding amount means amount issuer will deposit at start
    function initialize(string memory _artistName, string memory _artistId, string memory _channelId, 
                uint256 _fundingAmount, uint256 _numberOfYears, uint256 _numberOfBonds, 
                uint256 _facevalue, uint256 _spotifyListeners, uint256 _youtubeSubscribers) public {
        artistName = _artistName;
        artistId = _artistId;
        channelId = _channelId;
        fundingAmount = _fundingAmount;
        numberOfYears = _numberOfYears;
        numberOfBonds = _numberOfBonds;
        issuerAddress = msg.sender;
        faceValue = _facevalue;
        spotifyListeners = _spotifyListeners;
        youtubeSubscribers = _youtubeSubscribers;

        requestLatestSpotifyListeners();
        requestLatestYoutubeSubscribers();
        requestMetadataURI();
    }

    function mintBonds(address to) public {
        for(uint16 i=0; i<numberOfBonds; i++) {
            _safeMint(to, totalSupply);
            totalSupply++;
        }
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory uri) public {
        baseURI = uri;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exists");
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(),".json")) : defaultURI;
    }

    // For Spotify Listeners Request
    function requestLatestSpotifyListeners() public {
        spotifyListenersRequestId = chainlinkSpotifyListeners.getLatestListeners(address(this));
    }
    
    // For Spotify Listeners Request FulFill
    function requestLatestSpotifyListenersFulFill(bytes32 _requestId, uint256 _listeners) public {
        require(spotifyListenersRequestId == _requestId, "Spotify Listeners Request Not Matched");
        spotifyListeners = _listeners;
    }

    // For Youtube Subscribers Request
    function requestLatestYoutubeSubscribers() public {
        youtubeSubscribersRequestId = chainlinkYoutubeSubscribers.getLatestSubscribers(address(this));
    }

    // For Youtube Subscribers Request Fulfill
    function requestLatestYoutubeSubscribersFulFill(bytes32 _requestId, uint256 _youtubeSubscribers) public {
        require(youtubeSubscribersRequestId == _requestId, "Youtube Subscribers Request Not Matched");
        youtubeSubscribers = _youtubeSubscribers;
    }

    // For Meatadata URI Request
    function requestMetadataURI() public {
        metadataRequestId = chainlinkMetadataRequest.getMetadataURI(address(this));
    }
    
    // For Meatadata URI Request
    function requestMetadataURIFulFill(bytes32 _requestId, string memory _metadataURI) public {
        require(metadataRequestId == _requestId, "Metadata Request Not Matched");
        baseURI = _metadataURI;
    }

}
