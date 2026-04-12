// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CompensationContract
 * @notice Handles flight compensation claims and automatic payouts in ETH
 */
contract CompensationContract is Ownable, ReentrancyGuard {
    
    // Compensation status
    enum ClaimStatus {
        PENDING,
        APPROVED,
        REJECTED,
        PAID
    }
    
    // Compensation claim structure
    struct Claim {
        address claimant;
        string flightNumber;
        uint256 delayMinutes;
        uint256 compensationAmount;
        ClaimStatus status;
        uint256 timestamp;
        uint256 paidAt;
        bytes32 requestId;
    }
    
    // Compensation rates (in wei)
    struct CompensationRates {
        uint256 food;
        uint256 hotel;
        uint256 transport;
        uint256 refund;
    }
    
    mapping(bytes32 => Claim) public claims;
    mapping(address => bytes32[]) public userClaims;
    mapping(string => mapping(address => bool)) public claimExists;
    
    CompensationRates public rates;
    uint256 public minDelayForCompensation = 180 minutes; // 3 hours
    uint256 public totalPaid = 0;
    uint256 public totalClaims = 0;
    
    // Oracle address (Chainlink)
    address public oracleAddress;
    
    // Events
    event ClaimFiled(
        bytes32 indexed claimId,
        address indexed claimant,
        string flightNumber,
        uint256 delayMinutes
    );
    
    event ClaimApproved(bytes32 indexed claimId, uint256 amount);
    event ClaimRejected(bytes32 indexed claimId, string reason);
    event CompensationPaid(bytes32 indexed claimId, address indexed claimant, uint256 amount);
    event OracleUpdated(address indexed newOracle);
    event RatesUpdated(uint256 food, uint256 hotel, uint256 transport, uint256 refund);
    
    constructor() {
        // Initialize default rates (in Wei - ETH with 18 decimals)
        rates.food = 0.05 * 10**18; // 0.05 ETH for food
        rates.hotel = 0.3 * 10**18; // 0.3 ETH for hotel
        rates.transport = 0.1 * 10**18; // 0.1 ETH for transport
        rates.refund = 0.4 * 10**18; // 0.4 ETH for refund
    }
    
    /**
     * @notice Set oracle address (Chainlink)
     * @param _oracle New oracle address
     */
    function setOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "Invalid oracle address");
        oracleAddress = _oracle;
        emit OracleUpdated(_oracle);
    }
    
    /**
     * @notice Update compensation rates
     * @param food Food compensation rate
     * @param hotel Hotel compensation rate
     * @param transport Transport compensation rate
     * @param refund Refund compensation rate
     */
    function setCompensationRates(
        uint256 food,
        uint256 hotel,
        uint256 transport,
        uint256 refund
    ) external onlyOwner {
        rates.food = food;
        rates.hotel = hotel;
        rates.transport = transport;
        rates.refund = refund;
        emit RatesUpdated(food, hotel, transport, refund);
    }
    
    /**
     * @notice File a compensation claim
     * @param flightNumber Flight number
     * @param delayMinutes Flight delay in minutes
     * @param claimType Type of claim (0=food, 1=hotel, 2=transport, 3=refund)
     * @param routeId Route ID (for future use)
     */
    function fileClaim(
        string calldata flightNumber,
        uint256 delayMinutes,
        uint8 claimType,
        uint256 routeId
    ) external nonReentrant returns (bytes32) {
        require(!claimExists[flightNumber][msg.sender], "Claim already exists");
        require(delayMinutes >= minDelayForCompensation, "Delay too short");
        require(claimType <= 3, "Invalid claim type");
        
        // Calculate compensation amount
        uint256 compensationAmount;
        if (claimType == 0) {
            compensationAmount = rates.food;
        } else if (claimType == 1) {
            compensationAmount = rates.hotel;
        } else if (claimType == 2) {
            compensationAmount = rates.transport;
        } else {
            compensationAmount = rates.refund;
        }
        
        // Create claim ID
        bytes32 claimId = keccak256(
            abi.encodePacked(msg.sender, flightNumber, block.timestamp)
        );
        
        // Store claim
        claims[claimId] = Claim({
            claimant: msg.sender,
            flightNumber: flightNumber,
            delayMinutes: delayMinutes,
            compensationAmount: compensationAmount,
            status: ClaimStatus.APPROVED,
            timestamp: block.timestamp,
            paidAt: 0,
            requestId: bytes32(0)
        });
        
        userClaims[msg.sender].push(claimId);
        claimExists[flightNumber][msg.sender] = true;
        totalClaims++;
        
        emit ClaimFiled(claimId, msg.sender, flightNumber, delayMinutes);
        emit ClaimApproved(claimId, compensationAmount);
        
        // Auto-pay compensation
        _payCompensation(claimId);
        
        return claimId;
    }
    
    /**
     * @notice Approve a compensation claim (oracle/owner only)
     * @param claimId Claim ID
     */
    function approveClaim(bytes32 claimId) external onlyOwner {
        Claim storage claim = claims[claimId];
        require(claim.claimant != address(0), "Claim not found");
        require(claim.status == ClaimStatus.PENDING, "Claim not pending");
        
        claim.status = ClaimStatus.APPROVED;
        emit ClaimApproved(claimId, claim.compensationAmount);
        
        _payCompensation(claimId);
    }
    
    /**
     * @notice Reject a compensation claim (oracle/owner only)
     * @param claimId Claim ID
     * @param reason Rejection reason
     */
    function rejectClaim(bytes32 claimId, string calldata reason) 
        external 
        onlyOwner 
    {
        Claim storage claim = claims[claimId];
        require(claim.claimant != address(0), "Claim not found");
        require(claim.status != ClaimStatus.PAID, "Already paid");
        
        claim.status = ClaimStatus.REJECTED;
        emit ClaimRejected(claimId, reason);
    }
    
    /**
     * @notice Internal function to pay compensation
     */
    function _payCompensation(bytes32 claimId) internal nonReentrant {
        Claim storage claim = claims[claimId];
        
        require(claim.status == ClaimStatus.APPROVED, "Not approved");
        require(claim.claimant != address(0), "Invalid claim");
        
        claim.status = ClaimStatus.PAID;
        claim.paidAt = block.timestamp;
        
        // Transfer ETH compensation
        (bool success, ) = claim.claimant.call{value: claim.compensationAmount}("");
        require(success, "ETH transfer failed");
        
        totalPaid += claim.compensationAmount;
        
        emit CompensationPaid(claimId, claim.claimant, claim.compensationAmount);
    }
    
    /**
     * @notice Get user's claims
     * @param user User address
     */
    function getUserClaims(address user) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return userClaims[user];
    }
    
    /**
     * @notice Get claim details
     * @param claimId Claim ID
     */
    function getClaim(bytes32 claimId) 
        external 
        view 
        returns (Claim memory) 
    {
        return claims[claimId];
    }
    
    /**
     * @notice Get total number of claims
     */
    function getTotalClaims() external view returns (uint256) {
        return totalClaims;
    }
    
    /**
     * @notice Get total compensation paid
     */
    function getTotalPaid() external view returns (uint256) {
        return totalPaid;
    }
    
    /**
     * @notice Emergency ETH withdrawal (owner only)
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner nonReentrant {
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @notice Allow contract to receive ETH
     */
    receive() external payable {}
}
