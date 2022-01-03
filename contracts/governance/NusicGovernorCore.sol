// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// V1 of NusicGovernorCore functionality
contract NusicGovernorCore {

    // Governance Configuration

    // @notice The delay before voting on a proposal may take place, once proposed
    uint public votingDelay = 1; // 1 block

    // @notice The duration of voting on a proposal, in blocks
    uint public votingPeriod = 17280; // ~3 days in blocks (assuming 15s blocks)
    
    // @notice The number of votes required in order for a voter to become a proposer
    uint public proposalThreshold = 1; // 1 Token
    
    // @notice The number of votes in support of a proposal required in order for a quorum to be reached and for a vote to succeed
    uint public quorumVotes = 400; // 4% of 10,000 Token

    // @notice Initial proposal id set at become
    uint public initialProposalId;
    
    // @notice The total number of proposals
    uint public proposalCount;

    // @notice The official record of all proposals ever proposed
    mapping (uint => Proposal) public proposals;

    // @notice The latest proposal for each proposer
    mapping (address => uint) public latestProposalIds;

    // Just for the example if we want to have working around of nested mapping error of struct
    // uint -- Proposal Id
    //mapping(uint=>mapping(address=>Receipt)) receipts;

    address public admin;
    address public pendingAdmin;
    /// @notice Active brains of Governor
    address public implementation;

    /// @notice Stores the expiration of account whitelist status as a timestamp
    mapping (address => uint) public whitelistAccountExpirations;

    /// @notice Address which manages whitelisted proposals and whitelist accounts
    address public whitelistGuardian;

    // Still unable to find how Compound set admin in its governor
    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(admin == msg.sender, "NUSCI Governor: caller is not the Admin");
        _;
    }

    struct Proposal {
        /// @notice Unique id for looking up a proposal
        uint id;

        /// @notice Creator of the proposal
        address proposer;

        /// @notice The timestamp that the proposal will be available for execution, set once the vote succeeds
        uint eta;

        /// @notice the ordered list of target addresses for calls to be made
        address[] targets;

        /// @notice The ordered list of values (i.e. msg.value) to be passed to the calls to be made
        uint[] values;

        /// @notice The ordered list of function signatures to be called
        string[] signatures;

        /// @notice The ordered list of calldata to be passed to each call
        bytes[] calldatas;

        /// @notice The block at which voting begins: holders must delegate their votes prior to this block
        uint startBlock;

        /// @notice The block at which voting ends: votes must be cast prior to this block
        uint endBlock;

        /// @notice Current number of votes in favor of this proposal
        uint forVotes;

        /// @notice Current number of votes in opposition to this proposal
        uint againstVotes;

        /// @notice Current number of votes for abstaining for this proposal
        uint abstainVotes;

        /// @notice Flag marking whether the proposal has been canceled
        bool canceled;

        /// @notice Flag marking whether the proposal has been executed
        bool executed;

        /// @notice Receipts of ballots for the entire set of voters
        mapping (address => Receipt) receipts;
    }

    /// @notice Ballot receipt record for a voter
    struct Receipt {
        /// @notice Whether or not a vote has been cast
        bool hasVoted;

        /// @notice Whether or not the voter supports the proposal or abstains
        uint8 support;

        /// @notice The number of votes the voter had, which were cast
        uint256 votes;
    }

    /// @notice Possible states that a proposal may be in
    enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Expired,
        Executed
    }

}