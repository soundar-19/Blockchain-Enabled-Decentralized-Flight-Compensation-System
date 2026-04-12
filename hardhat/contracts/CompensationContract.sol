// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CompensationContract
 * @notice Handles flight compensation claims and automatic payouts
 */
contract CompensationContract is Ownable, ReentrancyGuard {
    
    IERC20 public flyToken;
    
    enum ClaimStatus {
        PENDING,
        APPROVED,
        REJECTED,
        PAID
    }
    
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
    uint256 public minDelayForCompensation = 180 minutes;
    uint256 public totalPaid = 0;
    uint256 public totalClaims = 0;
    address public oracleAddress;
    
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
    
    constructor(address _flyToken) {
        require(_flyToken != address(0), "Invalid token address");
        flyToken = IERC20(_flyToken);
        
        rates.food = 25 * 10**18;
        rates.hotel = 150 * 10**18;
        rates.transport = 50 * 10**18;
        rates.refund = 200 * 10**18;
    }
    
    function setOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "Invalid oracle address");
        oracleAddress = _oracle;
        emit OracleUpdated(_oracle);
    }
    
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
    
    function fileClaim(
        string calldata flightNumber,
        uint256 delayMinutes,
        uint8 claimType
    ) external nonReentrant returns (bytes32) {
        require(!claimExists[flightNumber][msg.sender], "Claim already exists");
        require(delayMinutes >= minDelayForCompensation, "Delay too short");
        require(claimType <= 3, "Invalid claim type");
        
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
        
        bytes32 claimId = keccak256(
            abi.encodePacked(msg.sender, flightNumber, block.timestamp)
        );
        
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
        
        _payCompensation(claimId);
        
        return claimId;
    }
    
    function approveClaim(bytes32 claimId) external onlyOwner {
        Claim storage claim = claims[claimId];
        require(claim.claimant != address(0), "Claim not found");
        require(claim.status == ClaimStatus.PENDING, "Claim not pending");
        
        claim.status = ClaimStatus.APPROVED;
        emit ClaimApproved(claimId, claim.compensationAmount);
        
        _payCompensation(claimId);
    }
    
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
    
    function _payCompensation(bytes32 claimId) internal {
        Claim storage claim = claims[claimId];
        
        require(claim.status == ClaimStatus.APPROVED, "Not approved");
        require(claim.claimant != address(0), "Invalid claim");
        
        claim.status = ClaimStatus.PAID;
        claim.paidAt = block.timestamp;
        
        require(
            flyToken.transfer(claim.claimant, claim.compensationAmount),
            "Transfer failed"
        );
        
        totalPaid += claim.compensationAmount;
        
        emit CompensationPaid(claimId, claim.claimant, claim.compensationAmount);
    }
    
    function getUserClaims(address user) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return userClaims[user];
    }
    
    function getClaim(bytes32 claimId) 
        external 
        view 
        returns (Claim memory) 
    {
        return claims[claimId];
    }
    
    function getTotalClaims() external view returns (uint256) {
        return totalClaims;
    }
    
    function getTotalPaid() external view returns (uint256) {
        return totalPaid;
    }
    
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(flyToken.transfer(owner(), amount), "Transfer failed");
    }
}
