// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title GovernanceContract
 * @notice Decentralized governance for the flight compensation system
 */
contract GovernanceContract is Ownable, ReentrancyGuard {
    
    IERC20 public flyToken;
    
    // Proposal status
    enum ProposalStatus {
        PENDING,
        ACTIVE,
        PASSED,
        FAILED,
        EXECUTED
    }
    
    // Proposal structure
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        ProposalStatus status;
        bool executed;
    }
    
    // Vote record
    struct Vote {
        bool hasVoted;
        bool voteFor;
        uint256 votingPower;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(address => uint256[]) public userProposals;
    
    uint256 public proposalCount = 0;
    uint256 public votingPeriod = 3 days;
    uint256 public minProposalThreshold = 100 * 10**18; // 100 FLY tokens
    uint256 public quorumPercentage = 25; // 25%
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title
    );
    
    event VoteCasted(
        uint256 indexed proposalId,
        address indexed voter,
        bool voteFor,
        uint256 votingPower
    );
    
    event ProposalClosed(
        uint256 indexed proposalId,
        bool passed,
        uint256 votesFor,
        uint256 votesAgainst
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    event GovernanceParametersUpdated(uint256 votingPeriod, uint256 quorum);
    
    constructor(address _flyToken) {
        require(_flyToken != address(0), "Invalid token address");
        flyToken = IERC20(_flyToken);
    }
    
    /**
     * @notice Create a new governance proposal
     * @param title Proposal title
     * @param description Proposal description
     */
    function createProposal(string calldata title, string calldata description) 
        external 
        returns (uint256) 
    {
        // Check minimum token requirement
        require(
            flyToken.balanceOf(msg.sender) >= minProposalThreshold,
            "Insufficient tokens to propose"
        );
        
        uint256 proposalId = proposalCount;
        proposalCount++;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.title = title;
        proposal.description = description;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + votingPeriod;
        proposal.status = ProposalStatus.ACTIVE;
        proposal.executed = false;
        
        userProposals[msg.sender].push(proposalId);
        
        emit ProposalCreated(proposalId, msg.sender, title);
        
        return proposalId;
    }
    
    /**
     * @notice Vote on a proposal
     * @param proposalId Proposal ID
     * @param voteFor True for yes, false for no
     * @param votingPower Voting power (FLY tokens locked for voting)
     */
    function vote(
        uint256 proposalId,
        bool voteFor,
        uint256 votingPower
    ) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id == proposalId, "Proposal not found");
        require(proposal.status == ProposalStatus.ACTIVE, "Voting not active");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        
        Vote storage userVote = votes[proposalId][msg.sender];
        require(!userVote.hasVoted, "Already voted");
        
        // Verify user has enough tokens
        require(
            flyToken.balanceOf(msg.sender) >= votingPower,
            "Insufficient tokens"
        );
        
        // Lock tokens for voting (transfer to contract)
        require(
            flyToken.transferFrom(msg.sender, address(this), votingPower),
            "Token transfer failed"
        );
        
        // Record vote
        userVote.hasVoted = true;
        userVote.voteFor = voteFor;
        userVote.votingPower = votingPower;
        
        // Update vote counts
        if (voteFor) {
            proposal.votesFor += votingPower;
        } else {
            proposal.votesAgainst += votingPower;
        }
        
        emit VoteCasted(proposalId, msg.sender, voteFor, votingPower);
    }
    
    /**
     * @notice Close voting and finalize proposal
     * @param proposalId Proposal ID
     */
    function closeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id == proposalId, "Proposal not found");
        require(proposal.status == ProposalStatus.ACTIVE, "Already closed");
        require(block.timestamp > proposal.endTime, "Voting still active");
        
        // Determine if proposal passed
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        bool passed = proposal.votesFor > proposal.votesAgainst && totalVotes > 0;
        
        proposal.status = passed ? ProposalStatus.PASSED : ProposalStatus.FAILED;
        
        emit ProposalClosed(proposalId, passed, proposal.votesFor, proposal.votesAgainst);
    }
    
    /**
     * @notice Execute a passed proposal
     * @param proposalId Proposal ID
     */
    function executeProposal(uint256 proposalId) external onlyOwner {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id == proposalId, "Proposal not found");
        require(proposal.status == ProposalStatus.PASSED, "Not passed");
        require(!proposal.executed, "Already executed");
        
        proposal.executed = true;
        proposal.status = ProposalStatus.EXECUTED;
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @notice Retrieve voting tokens after voting ends
     * @param proposalId Proposal ID
     */
    function retrieveVotingTokens(uint256 proposalId) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.endTime, "Voting still active");
        
        Vote storage userVote = votes[proposalId][msg.sender];
        require(userVote.hasVoted, "No vote found");
        require(userVote.votingPower > 0, "No tokens to retrieve");
        
        uint256 tokensToReturn = userVote.votingPower;
        userVote.votingPower = 0;
        
        require(flyToken.transfer(msg.sender, tokensToReturn), "Transfer failed");
    }
    
    /**
     * @notice Update governance parameters (owner only)
     * @param newVotingPeriod New voting period in seconds
     * @param newQuorum New quorum percentage
     */
    function updateGovernanceParameters(
        uint256 newVotingPeriod,
        uint256 newQuorum
    ) external onlyOwner {
        require(newVotingPeriod > 0, "Invalid voting period");
        require(newQuorum > 0 && newQuorum <= 100, "Invalid quorum");
        
        votingPeriod = newVotingPeriod;
        quorumPercentage = newQuorum;
        
        emit GovernanceParametersUpdated(newVotingPeriod, newQuorum);
    }
    
    /**
     * @notice Get proposal details
     * @param proposalId Proposal ID
     */
    function getProposal(uint256 proposalId) 
        external 
        view 
        returns (Proposal memory) 
    {
        return proposals[proposalId];
    }
    
    /**
     * @notice Get user's proposed proposals
     * @param user User address
     */
    function getUserProposals(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userProposals[user];
    }
    
    /**
     * @notice Check if proposal is active
     * @param proposalId Proposal ID
     */
    function isProposalActive(uint256 proposalId) external view returns (bool) {
        return proposals[proposalId].status == ProposalStatus.ACTIVE &&
               block.timestamp <= proposals[proposalId].endTime;
    }
    
    /**
     * @notice Emergency token withdrawal (owner only)
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(flyToken.transfer(owner(), amount), "Transfer failed");
    }
}
