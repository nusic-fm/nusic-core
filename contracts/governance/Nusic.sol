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
    uint256 public constant MINT_PER_ADDR = 100; // Mint per Address
    uint256 public constant MAX_PRE_SEED_SUPPLY = 25;

    address public tresuryAddress = address(0);

    uint256 public price = 1 ether;

    // URI to be used before Reveal
    string public defaultURI;
    string public baseURI;

    uint256 public preSeedMinted;
    uint256 public totalMinted = 25;
    
    event Stage1Minted(address indexed to, uint256 tokenQuantity, uint256 amountTransfered, uint256 round);
    event Minted(address indexed to, uint256 tokenQuantity, uint256 amountTransfered, uint256 stage);
    event PreSeedMinted(address indexed to, uint256 tokenQuantity);
    event TreasuryClaim(address indexed to, uint256 tokenQuantity);

    struct FundingStage {
        uint256 stageNumber; // 1=Stage1 , 2=Stage2, 3=Stage3, 4=Stage4
        uint256 totalSupplyBeforeCurrentStage;
        uint256 maxSupplyForStage;
        uint256 minted;
        uint256 maxTreasuryShare;
        uint256 treasuryClaimed;
        bool isActive;
    }

    struct Stage1Round {
        uint256 roundNumber; // 1=Seed, 2=Private, 3=Public
        uint256 totalSupplyBeforeCurrentRound;
        uint256 maxSupplyForRound;
        uint256 minted;
        uint256 maxTreasuryShare;
        uint256 treasuryClaimed;
        bool isActive;
    }

    mapping(uint256 => FundingStage) public fundingStages;
    mapping(uint256 => Stage1Round) public stage1Rounds;
    uint256 currentStage;
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

        fundingStages[1] = FundingStage(1,0, 500, 0,  500,0, false);
        fundingStages[2] = FundingStage(2,1000, 750, 0, 750, 0, false);
        fundingStages[3] = FundingStage(3,2500, 1250, 0, 1250, 0, false);
        fundingStages[4] = FundingStage(4,5000, 2500, 0, 2500, 0, false);

        stage1Rounds[1] = Stage1Round(1, 0, 100, 0, 125, 0, false);
        stage1Rounds[2] = Stage1Round(2, 250, 125, 0, 125, 0, false);
        stage1Rounds[3] = Stage1Round(3, 500, 250, 0, 500, 0, false);
    }

    modifier mintPerTxtNotExceed(uint256 tokenQuantity) {
		require(tokenQuantity <= MINT_PER_TXT, 'Exceed Per Txt limit');
		_;
	}

    modifier mintPerAddressNotExceed(uint256 tokenQuantity) {
		require(balanceOf(msg.sender) + tokenQuantity <= MINT_PER_ADDR, 'Exceed Per Address limit');
		_;
	}

    function activateStage(uint256 stageNumber) public onlyOwner {
        require(stageNumber > 0 && stageNumber <= 4, "Invalid Stage");
        require(totalSupply() >= fundingStages[stageNumber].totalSupplyBeforeCurrentStage, "Previous Stage incomplete");
        if(stageNumber > 1) {
            fundingStages[stageNumber-1].isActive = false;
        }
        fundingStages[stageNumber].isActive = true;
        currentStage = stageNumber;
    }

    function deactivateCurrentStage() public onlyOwner {
        fundingStages[currentStage].isActive = false;
    }

    function activateRound(uint256 roundNumber) public onlyOwner {
        require(roundNumber > 0 && roundNumber <= 3, "Invalid Round");
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

    function stage1Mint(uint256 tokenQuantity) public payable mintPerTxtNotExceed(tokenQuantity) mintPerAddressNotExceed(tokenQuantity){
        require(currentStage == 1 && fundingStages[1].isActive, "Stage 1 completed or Incative");
        require(stage1Rounds[currentRound].isActive, "Funding Round not active");
        require(stage1Rounds[currentRound].minted < stage1Rounds[currentRound].maxSupplyForRound, "All minted for current round");
        require(stage1Rounds[currentRound].minted + tokenQuantity <= stage1Rounds[currentRound].maxSupplyForRound, "Minting would exceed supply for round");
        require(totalSupply() + tokenQuantity <= fundingStages[1].maxSupplyForStage + fundingStages[1].maxTreasuryShare, "Minting would exceed stage1's max supply");
        require(totalSupply() + tokenQuantity <= MAX_SUPPLY, "Minting would exceed max supply");
        require((price * tokenQuantity) == msg.value, "Insufficient Funds Sent" ); // Amount sent should be equal to price to quantity being minted
        
        for(uint16 i=0; i<tokenQuantity; i++) {
            stage1Rounds[currentRound].minted++;
            fundingStages[currentStage].minted++;
            totalMinted++;
            _safeMint(msg.sender, totalMinted);
        }
        emit Stage1Minted(msg.sender, tokenQuantity, msg.value, currentRound);
    }

    function mint(uint256 tokenQuantity) public payable mintPerTxtNotExceed(tokenQuantity) mintPerAddressNotExceed(tokenQuantity){
        require(currentStage > 1 && currentStage <= 4, "Invalid Funding Stage");
        require(fundingStages[currentStage].isActive, "Funding Stage not active");
        require(fundingStages[currentStage].minted < fundingStages[currentStage].maxSupplyForStage, "All minted for current stage");
        require(fundingStages[currentStage].minted + tokenQuantity <= fundingStages[currentStage].maxSupplyForStage, "Minting would exceed supply for stage");
        require(totalSupply() + tokenQuantity <= MAX_SUPPLY, "Minting would exceed max supply");
        require((price * tokenQuantity) == msg.value, "Insufficient Funds Sent" ); // Amount sent should be equal to price to quantity being minted

        for(uint16 i=0; i<tokenQuantity; i++) {
            fundingStages[currentStage].minted++;
            totalMinted++;
            _safeMint(msg.sender, totalMinted);
        }
        emit Minted(msg.sender, tokenQuantity, msg.value, currentStage);
    }

    function preSeedMint(uint256 tokenQuantity, address to) public onlyOwner mintPerTxtNotExceed(tokenQuantity) {
        require(to != address(0),"NULL Address Provided");
        require((preSeedMinted + tokenQuantity) <= MAX_PRE_SEED_SUPPLY,"Minting will exceed PreSeed supply");
                
        for(uint16 i=0; i<tokenQuantity; i++) {
            _safeMint(to, preSeedMinted+1);
            preSeedMinted++;
        }
        emit PreSeedMinted(to, tokenQuantity);
    }

    function treasuryClaim(uint256 tokenQuantity) public onlyOwner{
        if(currentStage == 1) {
            require(stage1Rounds[currentRound].treasuryClaimed < stage1Rounds[currentRound].maxTreasuryShare, "All Claimed for current round");
            require(stage1Rounds[currentRound].treasuryClaimed + tokenQuantity <= stage1Rounds[currentRound].maxTreasuryShare, "Claim would exceed supply for round");
        }
        else {
            require(fundingStages[currentStage].treasuryClaimed < fundingStages[currentStage].maxTreasuryShare, "All Claimed for current stage");
            require(fundingStages[currentStage].treasuryClaimed + tokenQuantity <= fundingStages[currentStage].maxTreasuryShare, "Claim would exceed supply for stage");
        }
        require(totalSupply() + tokenQuantity <= MAX_SUPPLY, "Minting would exceed max supply");
        for(uint16 i=0; i<tokenQuantity; i++) {
            stage1Rounds[currentRound].treasuryClaimed++;
            fundingStages[currentStage].treasuryClaimed++;
            totalMinted++;
            _safeMint(tresuryAddress, totalMinted);
        }
        emit TreasuryClaim(tresuryAddress, tokenQuantity);
    }

    function setTreasuryAddress(address newTreasuryAddress) public onlyOwner {
        require(newTreasuryAddress != address(0),"NULL Address Provided");
        tresuryAddress = newTreasuryAddress;
    }

    function withdraw() public onlyOwner {
        (bool sent, bytes memory data) = tresuryAddress.call{value: address(this).balance}("");
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
