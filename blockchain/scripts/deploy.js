const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying BankAndCryptoFraudDetection contract...");

    const BankAndCryptoFraudDetection = await hre.ethers.getContractFactory("BankAndCryptoFraudDetection");
    const fraudDetection = await BankAndCryptoFraudDetection.deploy();
    await fraudDetection.waitForDeployment();

    const contractAddress = await fraudDetection.getAddress();
    console.log(`✅ BankAndCryptoFraudDetection deployed at: ${contractAddress}`);
}

// Run deployment script
main().catch((error) => {
    console.error("❌ Error deploying contract:", error);
    process.exit(1);
});
