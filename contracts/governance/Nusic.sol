// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../ERC1404/ERC1404A.sol";

contract Nusic is ERC721Enumerable, ERC1404A, Ownable {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MINT_PER_TXT = 5; // Mint per Transaction
    uint256 public constant MINT_PER_ADDR = 10; // Mint per Address
    uint256 public constant MAX_PRE_SEED_SUPPLY = 25;
    uint256 public constant STAGE1_MAX_SUPPLY = 1000;

    address public treasuryAddress = address(0);
    address public managerAddress;

    uint256 public price = 0.04 ether;

    // URI to be used before Reveal
    string public defaultURI;
    string public baseURI;

    uint256 public preSeedMinted;
    uint256 public totalMinted = 25;

    bool public publicMintingAllowed = false;
    bool public verifyWhitelist = false;
    mapping(address => bool) public publicSaleWhitelist;

    mapping(address => bool) public approvedList;

    event Stage1Minted(address indexed to, uint256 tokenQuantity, uint256 amountTransfered, uint256 round);
    event PreSeedMinted(address indexed to, uint256 tokenQuantity);
    event TreasuryClaimed(address indexed to, uint256 tokenQuantity, uint256 round);
    event PublicTransferMinted(address indexed to, uint256 tokenQuantity, uint256 round);

    struct Stage1Round {
        uint256 roundNumber; // 1=Seed, 2=Private, 3=Public
        uint256 totalSupplyBeforeCurrentRound;
        uint256 maxSupplyForRound;
        uint256 minted;
        uint256 maxTreasuryShare;
        uint256 treasuryClaimed;
        bool isActive;
    }

    mapping(uint256 => Stage1Round) public stage1Rounds;
    uint256 currentRound;

    constructor(string memory _name, string memory _symbol, string memory _defaultURI) ERC721(_name, _symbol) {
        defaultURI = _defaultURI;
        stage1Rounds[1] = Stage1Round(1, 0, 100, 0, 125, 0, false);
        stage1Rounds[2] = Stage1Round(2, 250, 125, 0, 125, 0, false);
        stage1Rounds[3] = Stage1Round(3, 500, 250, 0, 250, 0, false);
    }

    modifier mintPerTxtNotExceed(uint256 tokenQuantity) {
		require(tokenQuantity <= MINT_PER_TXT, 'Exceed Per Txt limit');
		_;
	}

    modifier mintPerAddressNotExceed(uint256 tokenQuantity) {
		require(balanceOf(msg.sender) + tokenQuantity <= MINT_PER_ADDR, 'Exceed Per Address limit');
		_;
	}

    modifier onlyOwnerORManager() {
        require((owner() == _msgSender()) || (managerAddress == _msgSender()), "Caller needs to Owner or Manager");
        _;
    }

    function activateRound(uint256 roundNumber) public onlyOwner {
        require(roundNumber > 0 && roundNumber <= 3, "Invalid Round");
        require(roundNumber != currentRound, "Round Already active");
        require(totalSupply() >= stage1Rounds[roundNumber].totalSupplyBeforeCurrentRound, "Previous Round incomplete");
        if(roundNumber > 1) {
            stage1Rounds[roundNumber-1].isActive = false;
        }
        stage1Rounds[roundNumber].isActive = true;
        currentRound = roundNumber;
    }

    function deactivateCurrentRound() public onlyOwner {
        stage1Rounds[currentRound].isActive = false;
    }

    function activateCurrentRound() public onlyOwner {
        require(currentRound > 0 && currentRound <= 3, "Invalid Round");
        stage1Rounds[currentRound].isActive = true;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory uri) public onlyOwner {
        baseURI = uri;
    }

    function setDefaultRI(string memory _defaultURI) public onlyOwner {
		defaultURI = _defaultURI;
	}

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exists");
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(),".json")) : defaultURI;
    }

    function setPrice(uint256 newPrice) public onlyOwner {
        require(newPrice > 0, "Price can not be zero");
        price = newPrice;
    }

    function addToWhitelist(address[] memory addressList) public onlyOwnerORManager {
        for (uint256 i = 0; i < addressList.length; i++) {
            require(addressList[i] != address(0),"NULL Address Provided");
            publicSaleWhitelist[addressList[i]] = true;
        }
    }

    function removeFromWhitelist(address[] memory addressList) public onlyOwnerORManager{
        for (uint256 i = 0; i < addressList.length; i++) {
            require(addressList[i] != address(0),"NULL Address Provided");
            delete publicSaleWhitelist[addressList[i]];
        }
    }

    function addToApproveList(address[] memory _approveAddressList) public onlyOwnerORManager {
        for (uint256 i = 0; i < _approveAddressList.length; i++) {
            require(_approveAddressList[i] != address(0),"NULL Address Provided");
            approvedList[_approveAddressList[i]] = true;
        }
    }

    function removeFromApproveList(address[] memory addressList) public onlyOwnerORManager {
        for (uint256 i = 0; i < addressList.length; i++) {
            require(addressList[i] != address(0),"NULL Address Provided");
            delete approvedList[addressList[i]];
        }
    }

    function addToRestrictedList(address[] memory _restrictedAddressList) public onlyOwner {
        for (uint256 i = 0; i < _restrictedAddressList.length; i++) {
            require(_restrictedAddressList[i] != address(0),"NULL Address Provided");
            restrictedList[_restrictedAddressList[i]] = true;
        }
    }

    function removeFromRestrictedList(address[] memory _restrictedAddressList) public onlyOwner {
        for (uint256 i = 0; i < _restrictedAddressList.length; i++) {
            require(_restrictedAddressList[i] != address(0),"NULL Address Provided");
            delete restrictedList[_restrictedAddressList[i]];
        }
    }

    function togglePublicMinting() public onlyOwner{
        publicMintingAllowed = !publicMintingAllowed;
    }

    function toggleVerifyWhitelist() public onlyOwner{
        verifyWhitelist = !verifyWhitelist;
    }

    function mintInternal(uint256 tokenQuantity, address to) private {
        require(approvedList[to], "Address Not Approved");
        require(stage1Rounds[currentRound].isActive, "Funding Round not active");
        require(stage1Rounds[currentRound].minted < stage1Rounds[currentRound].maxSupplyForRound, "All minted for current round");
        require(stage1Rounds[currentRound].minted + tokenQuantity <= stage1Rounds[currentRound].maxSupplyForRound, "Minting would exceed supply for round");
        require(totalMinted + tokenQuantity <= STAGE1_MAX_SUPPLY, "Minting would exceed stage1's max supply");
        
        for(uint16 i=0; i<tokenQuantity; i++) {
            stage1Rounds[currentRound].minted++;
            totalMinted++;
            _safeMint(to, totalMinted);
        }
    }

    function mint(uint256 tokenQuantity) public payable mintPerTxtNotExceed(tokenQuantity) mintPerAddressNotExceed(tokenQuantity){
        require((price * tokenQuantity) == msg.value, "Insufficient Funds Sent" ); // Amount sent should be equal to price to quantity being minted
        if(currentRound == 3) {
            require(publicMintingAllowed, "Minting not allowed");    
            if(verifyWhitelist) {
                require(publicSaleWhitelist[msg.sender], "Not Qualified");
            }
        }
        
        mintInternal(tokenQuantity, msg.sender);
        emit Stage1Minted(msg.sender, tokenQuantity, msg.value, currentRound);
    }

    function preSeedMint(uint256 tokenQuantity, address to) public onlyOwner mintPerTxtNotExceed(tokenQuantity) {
        require(to != address(0),"NULL Address Provided");
        require((preSeedMinted + tokenQuantity) <= MAX_PRE_SEED_SUPPLY,"Minting will exceed PreSeed supply");
                
        for(uint16 i=0; i<tokenQuantity; i++) {
            preSeedMinted++;
            _safeMint(to, preSeedMinted);
        }
        emit PreSeedMinted(to, tokenQuantity);
    }

    function publicAuctionTransfer(uint256 tokenQuantity, address to) public onlyOwner mintPerTxtNotExceed(tokenQuantity) {
        require(currentRound == 3, "Not public round");
        mintInternal(tokenQuantity, to);
        emit PublicTransferMinted(to, tokenQuantity, currentRound);
    }

    function treasuryClaim(uint256 tokenQuantity) public onlyOwner{
        require(currentRound > 0 && currentRound <= 3, "Invalid Round");
        require(treasuryAddress != address(0),"NULL Address Provided");
        require(stage1Rounds[currentRound].treasuryClaimed < stage1Rounds[currentRound].maxTreasuryShare, "All Claimed for current round");
        require(stage1Rounds[currentRound].treasuryClaimed + tokenQuantity <= stage1Rounds[currentRound].maxTreasuryShare, "Claim would exceed supply for round");
        require(totalSupply() + tokenQuantity <= MAX_SUPPLY, "Minting would exceed max supply");
        for(uint16 i=0; i<tokenQuantity; i++) {
            stage1Rounds[currentRound].treasuryClaimed++;
            totalMinted++;
            _safeMint(treasuryAddress, totalMinted);
        }
        emit TreasuryClaimed(treasuryAddress, tokenQuantity,currentRound);
    }

    function setTreasuryAddress(address newTreasuryAddress) public onlyOwner {
        require(newTreasuryAddress != address(0),"NULL Address Provided");
        treasuryAddress = newTreasuryAddress;
    }

    function setManagerAddress(address newManagerAddress) public onlyOwner {
        require(newManagerAddress != address(0),"NULL Address Provided");
        managerAddress = newManagerAddress;
    }

    function withdraw() public onlyOwner {
        require(treasuryAddress != address(0),"NULL Address Provided");
        (bool sent, ) = treasuryAddress.call{value: address(this).balance}("");
        require(sent, "Failed to withdraw Ether");
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override notRestricted(from, to, tokenId) {
        super._beforeTokenTransfer(from, to, tokenId);
    }
}