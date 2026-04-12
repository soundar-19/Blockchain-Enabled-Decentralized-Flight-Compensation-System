// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title StakingPool
 * @notice Allows users to stake FLY tokens on flight routes and earn rewards
 */
contract StakingPool is Ownable, ReentrancyGuard {
    
    IERC20 public flyToken;
    
    // Route staking information
    struct RoutePool {
        uint256 totalStaked;
        uint256 rewardRate; // APY in basis points (100 = 1%)
        uint256 createdAt;
        bool active;
    }
    
    // User staking information
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 lastRewardTime;
        uint256 rewards;
    }
    
    mapping(uint256 => RoutePool) public routePools;
    mapping(uint256 => mapping(address => Stake)) public stakes;
    mapping(address => uint256[]) public userRoutes;
    
    uint256 public constant REWARD_PRECISION = 10000; // 100.00%
    uint256 public baseRewardRate = 1200; // 12% APY
    
    // Events
    event RoutePoolCreated(uint256 indexed routeId, uint256 rewardRate);
    event TokensStaked(address indexed user, uint256 indexed routeId, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 indexed routeId, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 indexed routeId, uint256 amount);
    
    constructor(address _flyToken) {
        require(_flyToken != address(0), "Invalid token address");
        flyToken = IERC20(_flyToken);
    }
    
    /**
     * @notice Create a new staking pool for a route
     * @param routeId Flight route ID
     * @param rewardRate Annual reward rate in basis points
     */
    function createRoute(uint256 routeId, uint256 rewardRate) external onlyOwner {
        require(!routePools[routeId].active, "Route already exists");
        
        routePools[routeId] = RoutePool({
            totalStaked: 0,
            rewardRate: rewardRate > 0 ? rewardRate : baseRewardRate,
            createdAt: block.timestamp,
            active: true
        });
        
        emit RoutePoolCreated(routeId, rewardRate);
    }
    
    /**
     * @notice Stake FLY tokens on a route
     * @param routeId Flight route ID
     * @param amount Amount to stake
     */
    function stake(uint256 routeId, uint256 amount) external nonReentrant {
        require(routePools[routeId].active, "Route not active");
        require(amount > 0, "Amount must be > 0");
        
        // Transfer tokens from user to contract
        require(
            flyToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        // Update or create stake
        Stake storage userStake = stakes[routeId][msg.sender];
        
        if (userStake.amount == 0) {
            userRoutes[msg.sender].push(routeId);
        } else {
            // Claim accumulated rewards before adding more stake
            _claimRewards(routeId, msg.sender);
        }
        
        userStake.amount += amount;
        userStake.startTime = block.timestamp;
        userStake.lastRewardTime = block.timestamp;
        
        routePools[routeId].totalStaked += amount;
        
        emit TokensStaked(msg.sender, routeId, amount);
    }
    
    /**
     * @notice Unstake FLY tokens from a route
     * @param routeId Flight route ID
     * @param amount Amount to unstake
     */
    function unstake(uint256 routeId, uint256 amount) external nonReentrant {
        Stake storage userStake = stakes[routeId][msg.sender];
        require(userStake.amount >= amount, "Insufficient staked amount");
        require(amount > 0, "Amount must be > 0");
        
        // Claim rewards first
        _claimRewards(routeId, msg.sender);
        
        userStake.amount -= amount;
        routePools[routeId].totalStaked -= amount;
        
        // Transfer tokens back to user
        require(flyToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit TokensUnstaked(msg.sender, routeId, amount);
    }
    
    /**
     * @notice Claim accumulated rewards
     * @param routeId Flight route ID
     */
    function claimRewards(uint256 routeId) external nonReentrant {
        _claimRewards(routeId, msg.sender);
    }
    
    /**
     * @notice Internal function to calculate and claim rewards
     */
    function _claimRewards(uint256 routeId, address user) internal {
        Stake storage userStake = stakes[routeId][user];
        RoutePool storage pool = routePools[routeId];
        
        require(userStake.amount > 0, "No stake in this route");
        
        uint256 rewards = calculateRewards(routeId, user);
        
        if (rewards > 0) {
            userStake.rewards += rewards;
            userStake.lastRewardTime = block.timestamp;
            
            // Transfer rewards to user
            require(flyToken.transfer(user, rewards), "Reward transfer failed");
            
            emit RewardsClaimed(user, routeId, rewards);
        }
    }
    
    /**
     * @notice Calculate pending rewards for a user
     * @param routeId Flight route ID
     * @param user User address
     * @return Pending rewards amount
     */
    function calculateRewards(uint256 routeId, address user) 
        public 
        view 
        returns (uint256) 
    {
        Stake storage userStake = stakes[routeId][user];
        RoutePool storage pool = routePools[routeId];
        
        if (userStake.amount == 0) {
            return 0;
        }
        
        uint256 timeStaked = block.timestamp - userStake.lastRewardTime;
        uint256 yearlyReward = (userStake.amount * pool.rewardRate) / REWARD_PRECISION;
        uint256 reward = (yearlyReward * timeStaked) / 365 days;
        
        return reward;
    }
    
    /**
     * @notice Get user's total staked amount across all routes
     * @param user User address
     * @return Total staked amount
     */
    function getUserTotalStaked(address user) external view returns (uint256) {
        uint256 total = 0;
        uint256[] memory routes = userRoutes[user];
        
        for (uint256 i = 0; i < routes.length; i++) {
            total += stakes[routes[i]][user].amount;
        }
        
        return total;
    }
    
    /**
     * @notice Get user's pending rewards across all routes
     * @param user User address
     * @return Total pending rewards
     */
    function getUserTotalRewards(address user) external view returns (uint256) {
        uint256 total = 0;
        uint256[] memory routes = userRoutes[user];
        
        for (uint256 i = 0; i < routes.length; i++) {
            total += calculateRewards(routes[i], user);
        }
        
        return total;
    }
    
    /**
     * @notice Get user's routes
     * @param user User address
     * @return Array of route IDs user has staked in
     */
    function getUserRoutes(address user) external view returns (uint256[] memory) {
        return userRoutes[user];
    }
    
    /**
     * @notice Get route pool info
     * @param routeId Flight route ID
     */
    function getRouteInfo(uint256 routeId) 
        external 
        view 
        returns (
            uint256 totalStaked,
            uint256 rewardRate,
            uint256 createdAt,
            bool active
        ) 
    {
        RoutePool storage pool = routePools[routeId];
        return (pool.totalStaked, pool.rewardRate, pool.createdAt, pool.active);
    }
    
    /**
     * @notice Emergency token withdrawal (owner only)
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(flyToken.transfer(owner(), amount), "Transfer failed");
    }
}
