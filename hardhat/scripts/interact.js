const hre = require("hardhat");

async function main() {
    console.log("=".repeat(60));
    console.log("Flight Compensation System - Interaction Examples");
    console.log("=".repeat(60));
    
    // Load deployment addresses (update these with your deployed addresses)
    const FLIGHT_TOKEN = "0x..."; // Replace with deployed address
    const STAKING_POOL = "0x..."; // Replace with deployed address
    const COMPENSATION = "0x..."; // Replace with deployed address
    const GOVERNANCE = "0x..."; // Replace with deployed address
    
    const [signer] = await ethers.getSigners();
    console.log(`\nInteracting as: ${signer.address}`);
    
    // Get contract instances
    const flyToken = await ethers.getContractAt("FlightToken", FLIGHT_TOKEN, signer);
    const stakingPool = await ethers.getContractAt("StakingPool", STAKING_POOL, signer);
    const compensation = await ethers.getContractAt("CompensationContract", COMPENSATION, signer);
    
    console.log("\n1️⃣ Checking FLY Token Balance...");
    const balance = await flyToken.balanceOf(signer.address);
    console.log(`   Balance: ${ethers.formatEther(balance)} FLY`);
    
    console.log("\n2️⃣ Approving tokens for StakingPool...");
    const approveAmount = ethers.parseEther("1000");
    const approveTx = await flyToken.approve(STAKING_POOL, approveAmount);
    await approveTx.wait();
    console.log(`   ✅ Approved ${ethers.formatEther(approveAmount)} FLY for staking`);
    
    console.log("\n3️⃣ Staking tokens...");
    const stakeAmount = ethers.parseEther("100");
    const stakeTx = await stakingPool.stake(1, stakeAmount);
    await stakeTx.wait();
    console.log(`   ✅ Staked ${ethers.formatEther(stakeAmount)} FLY on Route 1`);
    
    console.log("\n4️⃣ Checking stake info...");
    const stakeInfo = await stakingPool.stakes(1, signer.address);
    console.log(`   Amount staked: ${ethers.formatEther(stakeInfo.amount)} FLY`);
    console.log(`   Start time: ${new Date(Number(stakeInfo.startTime) * 1000)}`);
    
    console.log("\n5️⃣ Calculating rewards...");
    const rewards = await stakingPool.calculateRewards(1, signer.address);
    console.log(`   Pending rewards: ${ethers.formatEther(rewards)} FLY`);
    
    console.log("\n6️⃣ Filing compensation claim...");
    // First approve compensation contract
    const compApprove = await flyToken.approve(COMPENSATION, ethers.parseEther("500"));
    await compApprove.wait();
    
    const claimTx = await compensation.fileClaim(
        "AI101",      // Flight number
        240,          // Delay in minutes (4 hours)
        3,            // Claim type: 3 = refund
        1             // Route ID
    );
    await claimTx.wait();
    console.log("   ✅ Compensation claim filed for AI101");
    
    console.log("\n7️⃣ Checking compensation history...");
    const userClaims = await compensation.getUserClaims(signer.address);
    console.log(`   Total claims: ${userClaims.length}`);
    
    if (userClaims.length > 0) {
        const lastClaim = await compensation.getClaim(userClaims[userClaims.length - 1]);
        console.log(`   Flight: ${lastClaim.flightNumber}`);
        console.log(`   Delay: ${lastClaim.delayMinutes} minutes`);
        console.log(`   Compensation: ${ethers.formatEther(lastClaim.compensationAmount)} FLY`);
        console.log(`   Status: ${['PENDING', 'APPROVED', 'REJECTED', 'PAID'][lastClaim.status]}`);
    }
    
    console.log("\n8️⃣ Creating governance proposal...");
    const governance = await ethers.getContractAt("GovernanceContract", GOVERNANCE, signer);
    
    const proposeTx = await governance.createProposal(
        "Increase staking rewards to 15%",
        "This proposal suggests increasing the staking APY from 12% to 15% to incentivize more participation."
    );
    await proposeTx.wait();
    console.log("   ✅ Proposal created");
    
    console.log("\n9️⃣ Voting on proposal...");
    const voteTx = await governance.vote(
        0,                          // Proposal ID
        true,                       // Vote: yes
        ethers.parseEther("50")     // Voting power
    );
    await voteTx.wait();
    console.log("   ✅ Vote submitted");
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ INTERACTION EXAMPLES COMPLETED");
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
