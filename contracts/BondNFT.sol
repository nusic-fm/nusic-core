// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./ChainlinkOracleInfo.sol";

contract BondNFT is ERC721URIStorage, ChainlinkClient, Ownable {
    using Strings for string;
    using Chainlink for Chainlink.Request;

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
    bytes32 private requestId;

    event ListenerRequestInitiated(bytes32 indexed _requestId, address indexed nftAddress);
    event RequestListenerFulfilled(bytes32 indexed _requestId, uint256 indexed _listeners, address indexed nftAddress);

    ChainlinkOracleInfo private chainlinkOracleInfo;
    
    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        setPublicChainlinkToken();
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
    }

    function mintBonds() public onlyOwner {
        for(uint16 i=0; i<numberOfBonds; i++) {
            _safeMint(msg.sender, totalSupply);
            totalSupply++;
        }
    }

    function receiveFunding() public payable {

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

    function updateTotalListeners(uint256 _listeners) public {
        totalListeners = _listeners;
    }


    function getLatestListeners() public returns (bytes32)  {
        Chainlink.Request memory request = buildChainlinkRequest(chainlinkOracleInfo.getJobId(), address(this), this.fulfill.selector);
        
        request.add("id", channelId);
        request.add("endpoint", endpoint);

        requestId = sendChainlinkRequestTo(chainlinkOracleInfo.getOracle(), request, chainlinkOracleInfo.getFee());
        emit ListenerRequestInitiated(requestId, address(this)); 
        return requestId; 
    }

    function fulfill(bytes32 _requestId, uint256 _listeners) public recordChainlinkFulfillment(_requestId)
    {
        totalListeners = _listeners;
        emit RequestListenerFulfilled(_requestId, _listeners, address(this));
    }
    
}
