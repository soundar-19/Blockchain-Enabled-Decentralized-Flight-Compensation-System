const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Flight Compensation Contracts", function () {
    let flyToken, stakingPool, compensation, governance;
    let owner, user1, user2;
    
    before(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        
        // Deploy FlightToken
        const FlightToken = await ethers.getContractFactory("FlightToken");
        flyToken = await FlightToken.deploy(1000000);
        await flyToken.waitForDeployment();
        
        // Deploy StakingPool
        const StakingPool = await ethers.getContractFactory("StakingPool");
        const tokenAddress = await flyToken.getAddress();
        stakingPool = await StakingPool.deploy(tokenAddress);
        await stakingPool.waitForDeployment();
        
        // Deploy CompensationContract
        const CompensationContract = await ethers.getContractFactory("CompensationContract");
        compensation = await CompensationContract.deploy(tokenAddress);
        await compensation.waitForDeployment();
        
        // Deploy GovernanceContract
        const GovernanceContract = await ethers.getContractFactory("GovernanceContract");
        governance = await GovernanceContract.deploy(tokenAddress);
        await governance.waitForDeployment();
        
        // Transfer tokens to users
        await flyToken.transfer(user1.address, ethers.parseEther("10000"));
        await flyToken.transfer(user2.address, ethers.parseEther("10000"));
    });
    
    describe("FlightToken", function () {
        it("Should have correct initial supply", async function () {
            const totalSupply = await flyToken.totalSupply();
            expect(totalSupply).to.equal(ethers.parseEther("1000000"));
        });
        
        it("Should transfer tokens", async function () {
            const transferAmount = ethers.parseEther("100");
            await flyToken.transfer(user1.address, transferAmount);
            const balance = await flyToken.balanceOf(user1.address);
            expect(balance).to.be.gte(transferAmount);
        });
    });
    
    describe("StakingPool", function () {
        it("Should create a route", async function () {
            await stakingPool.createRoute(1, 1200);
            const route = await stakingPool.getRouteInfo(1);
            expect(route.active).to.be.true;
            expect(route.rewardRate).to.equal(1200);
        });
        
        it("Should allow staking", async function () {
            const stakeAmount = ethers.parseEther("100");
            
            // Approve tokens
            await flyToken.connect(user1).approve(
                await stakingPool.getAddress(),
                stakeAmount
            );
            
            // Stake
            await stakingPool.connect(user1).stake(1, stakeAmount);
            
            // Check stake
            const stake = await stakingPool.stakes(1, user1.address);
            expect(stake.amount).to.equal(stakeAmount);
        });
        
        it("Should calculate rewards", async function () {
            const rewards = await stakingPool.calculateRewards(1, user1.address);
            expect(rewards).to.be.gte(0);
        });
    });
    
    describe("CompensationContract", function () {
        it("Should file a compensation claim", async function () {
            const claimTx = await compensation.connect(user2).fileClaim(
                "AI101",
                240,  // 4 hours delay
                3,    // refund
                1
            );
            
            await expect(claimTx).to.emit(compensation, "ClaimFiled");
        });
        
        it("Should track user claims", async function () {
            const claims = await compensation.getUserClaims(user2.address);
            expect(claims.length).to.be.gt(0);
        });
    });
    
    describe("GovernanceContract", function () {
        it("Should create a proposal", async function () {
            const proposeTx = await governance.connect(user1).createProposal(
                "Test Proposal",
                "This is a test proposal"
            );
            
            await expect(proposeTx).to.emit(governance, "ProposalCreated");
        });
        
        it("Should allow voting", async function () {
            const approveAmount = ethers.parseEther("500");
            await flyToken.connect(user1).approve(
                await governance.getAddress(),
                approveAmount
            );
            
            const voteTx = await governance.connect(user1).vote(
                0,
                true,
                ethers.parseEther("100")
            );
            
            await expect(voteTx).to.emit(governance, "VoteCasted");
        });
    });
});
