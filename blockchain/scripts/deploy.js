const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying smart contracts...");

    // Deploy BankFraudDetection contract
    const BankFraudDetection = await hre.ethers.getContractFactory("BankFraudDetection");
    const bankFraudDetection = await BankFraudDetection.deploy();
    await bankFraudDetection.waitForDeployment();
    const bankFraudAddress = await bankFraudDetection.getAddress();
    console.log(`✅ BankFraudDetection deployed at: ${bankFraudAddress}\n`);

    // Deploy CryptoFraudDetection contract
    const CryptoFraudDetection = await hre.ethers.getContractFactory("FraudDetection");
    const cryptoFraudDetection = await CryptoFraudDetection.deploy();
    await cryptoFraudDetection.waitForDeployment();
    const cryptoFraudAddress = await cryptoFraudDetection.getAddress();
    console.log(`✅ CryptoFraudDetection deployed at: ${cryptoFraudAddress}\n`);

    console.log("🎯 Both contracts deployed successfully!");
}

// Run the deployment script
main().catch((error) => {
    console.error("❌ Error deploying contracts:", error);
    process.exit(1);
});
