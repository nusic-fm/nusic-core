// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Nusic is ERC721Enumerable, Ownable {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MINT_PER_TXT = 5; // Mint per Transaction
    uint256 public constant MINT_PER_ADDR = 10; // Mint per Address
    uint256 public constant MAX_PRE_SEED_SUPPLY = 25;
    uint256 public constant STAGE1_MAX_SUPPLY = 1000;

    address public treasuryAddress = address(0);

    uint256 public price = 0.04 ether;

    // URI to be used before Reveal
    string public defaultURI;
    string public baseURI;

    uint256 public preSeedMinted;
    uint256 public totalMinted = 25;

    bool public publicMintingAllowed = false;
    bool public verifyWhitelist = false;
    mapping(address => bool) public publicSaleWhitelist;
    
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

    // Properties and Events related to voting power delegation -- Start
    // @notice A record of states for signing / validating signatures
    mapping (address => uint) private nonces;
    mapping (address => address) public delegates;
    mapping (address => mapping (uint32 => Checkpoint)) public checkpoints;
    mapping (address => uint32) public numCheckpoints;

    // The EIP-712 typehash for the contract's domain
    bytes32 public constant DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)");

    // The EIP-712 typehash for the delegation struct used by the contract
    bytes32 public constant DELEGATION_TYPEHASH = keccak256("Delegation(address delegatee,uint256 nonce,uint256 expiry)");

    struct Checkpoint {
        uint256 fromBlock;
        uint256 votes;
    }

    event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);
    event DelegateVotesChanged(address indexed delegate, uint previousBalance, uint newBalance);

    // Properties and Events related to voting power delegation -- End

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

    function addToWhitelist(address[] memory addressList) public onlyOwner {
        for (uint256 i = 0; i < addressList.length; i++) {
            require(addressList[i] != address(0),"NULL Address Provided");
            publicSaleWhitelist[addressList[i]] = true;
        }
    }

    function removeFromWhitelist(address[] memory addressList) public onlyOwner{
        for (uint256 i = 0; i < addressList.length; i++) {
            require(addressList[i] != address(0),"NULL Address Provided");
            delete publicSaleWhitelist[addressList[i]];
        }
    }

    function togglePublicMinting() public onlyOwner{
        publicMintingAllowed = !publicMintingAllowed;
    }

    function toggleVerifyWhitelist() public onlyOwner{
        verifyWhitelist = !verifyWhitelist;
    }

    function mintInternal(uint256 tokenQuantity, address to) private {
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

    function stage1Mint(uint256 tokenQuantity) public payable mintPerTxtNotExceed(tokenQuantity) mintPerAddressNotExceed(tokenQuantity){
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

    function withdraw() public onlyOwner {
        require(treasuryAddress != address(0),"NULL Address Provided");
        (bool sent, bytes memory data) = treasuryAddress.call{value: address(this).balance}("");
        require(sent, "Failed to withdraw Ether");
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override {
        super._beforeTokenTransfer(from, to, tokenId);
        _moveDelegates(delegates[from], delegates[to], 1);
    }

    // Functions related to voting power delegation -- Start

    function delegate(address delegatee) public {
        return _delegate(msg.sender, delegatee);
    }

    /**
     * @notice Delegates votes from signatory to `delegatee`
     * @param delegatee The address to delegate votes to
     * @param nonce The contract state required to match the signature
     * @param expiry The time at which to expire the signature
     * @param v The recovery byte of the signature
     * @param r Half of the ECDSA signature pair
     * @param s Half of the ECDSA signature pair
     */
    function delegateBySig(address delegatee, uint nonce, uint expiry, uint8 v, bytes32 r, bytes32 s) public {
        bytes32 domainSeparator = keccak256(abi.encode(DOMAIN_TYPEHASH, keccak256(bytes(name())), getChainId(), address(this)));
        bytes32 structHash = keccak256(abi.encode(DELEGATION_TYPEHASH, delegatee, nonce, expiry));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        address signatory = ecrecover(digest, v, r, s);
        require(signatory != address(0), "gNusic::delegateBySig: invalid signature");
        require(nonce == nonces[signatory]++, "gNusic::delegateBySig: invalid nonce");
        require(block.timestamp <= expiry, "gNusic::delegateBySig: signature expired");
        return _delegate(signatory, delegatee);
    }

    function getCurrentVotes(address account) external view returns (uint256) {
        uint32 nCheckpoints = numCheckpoints[account];
        return nCheckpoints > 0 ? checkpoints[account][nCheckpoints - 1].votes : 0;
    }

    /**
     * @notice Determine the prior number of votes for an account as of a block number
     * @dev Block number must be a finalized block or else this function will revert to prevent misinformation.
     * @param account The address of the account to check
     * @param blockNumber The block number to get the vote balance at
     * @return The number of votes the account had as of the given block
     */
     function getPriorVotes(address account, uint blockNumber) public view returns (uint256) {
        require(blockNumber < block.number, "gNusic::getPriorVotes: not yet determined");

        uint32 nCheckpoints = numCheckpoints[account];
        if (nCheckpoints == 0) {
            return 0;
        }

        // First check most recent balance
        if (checkpoints[account][nCheckpoints - 1].fromBlock <= blockNumber) {
            return checkpoints[account][nCheckpoints - 1].votes;
        }

        // Next check implicit zero balance
        if (checkpoints[account][0].fromBlock > blockNumber) {
            return 0;
        }

        uint32 lower = 0;
        uint32 upper = nCheckpoints - 1;
        while (upper > lower) {
            uint32 center = upper - (upper - lower) / 2; // ceil, avoiding overflow
            Checkpoint memory cp = checkpoints[account][center];
            if (cp.fromBlock == blockNumber) {
                return cp.votes;
            } else if (cp.fromBlock < blockNumber) {
                lower = center;
            } else {
                upper = center - 1;
            }
        }
        return checkpoints[account][lower].votes;
    }

    function _delegate(address delegator, address delegatee) internal {
        address currentDelegate = delegates[delegator];
        uint256 delegatorBalance = balanceOf(delegator);
        delegates[delegator] = delegatee;

        emit DelegateChanged(delegator, currentDelegate, delegatee);

        _moveDelegates(currentDelegate, delegatee, delegatorBalance);
    }

    function _moveDelegates(address srcRep, address dstRep, uint256 amount) internal {
        if (srcRep != dstRep && amount > 0) {
            if (srcRep != address(0)) {
                uint32 srcRepNum = numCheckpoints[srcRep];
                uint256 srcRepOld = srcRepNum > 0 ? checkpoints[srcRep][srcRepNum - 1].votes : 0;
                uint256 srcRepNew = srcRepOld - amount;
                _writeCheckpoint(srcRep, srcRepNum, srcRepOld, srcRepNew);
            }

            if (dstRep != address(0)) {
                uint32 dstRepNum = numCheckpoints[dstRep];
                uint256 dstRepOld = dstRepNum > 0 ? checkpoints[dstRep][dstRepNum - 1].votes : 0;
                uint256 dstRepNew = dstRepOld + amount;
                _writeCheckpoint(dstRep, dstRepNum, dstRepOld, dstRepNew);
            }
        }
    }

    function _writeCheckpoint(address delegatee, uint32 nCheckpoints, uint256 oldVotes, uint256 newVotes) internal {
      if (nCheckpoints > 0 && checkpoints[delegatee][nCheckpoints - 1].fromBlock == block.number) {
          checkpoints[delegatee][nCheckpoints - 1].votes = newVotes;
      } else {
          checkpoints[delegatee][nCheckpoints] = Checkpoint(block.number, newVotes);
          numCheckpoints[delegatee] = nCheckpoints + 1;
      }

      emit DelegateVotesChanged(delegatee, oldVotes, newVotes);
    }

    // Functions related to voting power delegation -- End

    function getChainId() internal view returns (uint) {
        uint256 chainId;
        assembly { chainId := chainid() }
        return chainId;
    }
}