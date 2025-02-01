const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const contractAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
    const FraudDetection = await ethers.getContractFactory("FraudDetection");
    const signer = (await ethers.getSigners())[0];
    const fraudDetection = FraudDetection.attach(contractAddress).connect(signer);

    console.log(`✅ Interacting with FraudDetection at: ${contractAddress}\n`);

    // Sample transaction data
    const transactions = [
        "tx1001",
        "tx1002",
        "tx1003",
        "tx1001"  // Duplicate (should be detected as fraud)
    ];

    for (let i = 0; i < transactions.length; i++) {
        const txHash = ethers.keccak256(ethers.toUtf8Bytes(transactions[i]));
        console.log(`🟢 Attempting to store transaction: ${transactions[i]} (Hash: ${txHash})`);

        // Call storeTransaction and get the boolean result
        const txResponse = await fraudDetection.storeTransaction(txHash);
        if (txResponse) {
            console.log(`✅ Transaction ${transactions[i]} stored successfully!\n`);
        } else {
            console.log(`❌ Fraud detected! Transaction ${transactions[i]} was already recorded.\n`);
        }
    }

    console.log(`🔍 Checking stored transactions for fraud:\n`);
    for (let i = 0; i < transactions.length; i++) {
        const txHash = ethers.keccak256(ethers.toUtf8Bytes(transactions[i]));
        const isFraud = await fraudDetection.isTransactionFraudulent(txHash);
        console.log(`🔹 Transaction ${transactions[i]} is fraudulent: ${isFraud}\n`);
    }

    console.log("🎯 Testing completed!\n");
}

main().catch((error) => {
    console.error("❌ Error in testing:", error);
    process.exit(1);
});
