const hre = require("hardhat");

async function main() {
    const BankFraudDetection = await hre.ethers.getContractFactory("BankFraudDetection");
    const bankFraudDetection = await BankFraudDetection.deploy();

    await bankFraudDetection.waitForDeployment();
    console.log(`🚀 BankFraudDetection contract deployed at: ${bankFraudDetection.target}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
