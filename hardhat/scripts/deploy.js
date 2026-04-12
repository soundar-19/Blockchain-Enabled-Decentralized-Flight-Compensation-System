const hre = require("hardhat");

async function main() {
    console.log("\n" + "=".repeat(60));
    console.log("🚀 SkyGuard DAO - Sepolia Contract Deployment");
    console.log("=".repeat(60));
    
    const [deployer] = await ethers.getSigners();
    console.log(`\n📍 Deployer: ${deployer.address}`);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);
    
    // Deploy FlightToken
    console.log("1️⃣  Deploying FlightToken...");
    const FlightToken = await ethers.getContractFactory("FlightToken");
    const flyToken = await FlightToken.deploy(1000000);
    await flyToken.waitForDeployment();
    const flyTokenAddress = await flyToken.getAddress();
    console.log(`   ✅ Deployed: ${flyTokenAddress}\n`);
    
    // Deploy CompensationContract
    console.log("2️⃣  Deploying CompensationContract...");
    const CompensationContract = await ethers.getContractFactory("CompensationContract");
    const compensationContract = await CompensationContract.deploy(flyTokenAddress);
    await compensationContract.waitForDeployment();
    const compensationAddress = await compensationContract.getAddress();
    console.log(`   ✅ Deployed: ${compensationAddress}\n`);
    
    // Setup: Grant tokens to CompensationContract
    console.log("3️⃣  Setting up initial state...");
    const transferTx = await flyToken.transfer(
        compensationAddress,
        ethers.parseEther("500000")
    );
    await transferTx.wait();
    console.log(`   ✅ Transferred 500,000 FLY to CompensationContract\n`);
    
    // Output results
    console.log("=".repeat(60));
    console.log("✅ DEPLOYMENT COMPLETE");
    console.log("=".repeat(60));
    console.log(`\nFLY Token Address: ${flyTokenAddress}`);
    console.log(`Compensation Contract Address: ${compensationAddress}`);
    console.log("\n📝 Update your .env file with:");
    console.log(`FLY_TOKEN_ADDRESS=${flyTokenAddress}`);
    console.log(`COMPENSATION_CONTRACT_ADDRESS=${compensationAddress}`);
    console.log("\n" + "=".repeat(60) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
