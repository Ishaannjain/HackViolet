const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    // Replace with deployed contract address
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    // Get signers (accounts for testing)
    const [bankAdmin, user1, user2, fraudster] = await ethers.getSigners();

    // Attach contract with signer
    const bankFraudDetection = (await ethers.getContractFactory("BankFraudDetection"))
        .attach(contractAddress)
        .connect(bankAdmin);

    console.log(`✅ Interacting with BankFraudDetection at: ${contractAddress}`);

    // 🔹 Step 1: Verify Users
    console.log(`🟢 Verifying legitimate users...`);
    const identityHashUser1 = ethers.keccak256(ethers.toUtf8Bytes("User1's KYC Data"));
    await bankFraudDetection.connect(user1).verifyUserIdentity(identityHashUser1);
    console.log("✅ User 1 verified!");

    const identityHashUser2 = ethers.keccak256(ethers.toUtf8Bytes("User2's KYC Data"));
    await bankFraudDetection.connect(user2).verifyUserIdentity(identityHashUser2);
    console.log("✅ User 2 verified!\n");

    // 🔹 Step 2: Store Legitimate Transactions
    console.log(`🟢 Storing legitimate transactions...`);
    await bankFraudDetection.connect(user1).storeTransaction(user2.address, ethers.parseEther("100"));
    await bankFraudDetection.connect(user2).storeTransaction(user1.address, ethers.parseEther("200"));
    console.log("✅ Legitimate transactions stored!\n");

    // 🔹 Step 3: Fraud Case - Double Spending (Duplicate Transactions)
    console.log(`🚨 Testing Fraud Case: Double Spending...`);
    try {
        await bankFraudDetection.connect(user1).storeTransaction(user2.address, ethers.parseEther("100"));
        console.log("❌ ERROR: Fraudulent transaction was accepted!");
    } catch (error) {
        console.log("✅ Fraudulent transaction (double-spending) was detected and blocked!\n");
    }

    // 🔹 Step 4: Loan Application Fraud - Same User Submitting Multiple Applications
    console.log(`🚨 Testing Fraud Case: Multiple Loan Applications from the Same User...`);
    const loanAmount = ethers.parseEther("5000");

    console.log(`🟢 User 1 applies for a loan...`);
    await bankFraudDetection.connect(user1).submitLoanApplication(loanAmount);
    console.log("✅ Loan application submitted!\n");

    console.log(`🔹 User 1 tries to apply for another loan...`);
    try {
        await bankFraudDetection.connect(user1).submitLoanApplication(loanAmount);
        console.log("❌ ERROR: Duplicate loan application was accepted!");
    } catch (error) {
        console.log("✅ Fraud detected! Duplicate loan application was blocked!\n");
    }

    // 🔹 Step 5: Fraudster Trying to Apply for a Loan Without Verification
    console.log(`🚨 Testing Fraud Case: Loan Application Without KYC...`);
    try {
        await bankFraudDetection.connect(fraudster).submitLoanApplication(ethers.parseEther("10000"));
        console.log("❌ ERROR: Fraudster's loan application was accepted!");
    } catch (error) {
        console.log("✅ Fraud detected! Unverified user was blocked from applying for a loan!\n");
    }

    // 🔹 Step 6: Checking Transactions for Fraud
    console.log(`🔍 Checking stored transactions for fraud:\n`);
    console.log(`🔹 Transaction 1 is fraudulent: ${await bankFraudDetection.checkTransaction(
        ethers.keccak256(ethers.toUtf8Bytes("Transaction1"))
    )}`);
    console.log(`🔹 Transaction 2 is fraudulent: ${await bankFraudDetection.checkTransaction(
        ethers.keccak256(ethers.toUtf8Bytes("Transaction2"))
    )}\n`);

    console.log("🎯 All fraud cases tested successfully!");
}

// Run the script
main().catch((error) => {
    console.error("❌ Error in testing:", error);
    process.exit(1);
});
