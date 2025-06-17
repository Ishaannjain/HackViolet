const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    // Replace with deployed contract address
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    // Get signers (bank + users)
    const [bankAdmin, user1, user2, fraudster] = await ethers.getSigners();

    // Attach contract with signer
    const bankFraudDetection = (await ethers.getContractFactory("BankFraudDetection"))
        .attach(contractAddress)
        .connect(bankAdmin);

    console.log(`✅ Interacting with BankFraudDetection at: ${contractAddress}`);

    // 🔹 Step 1: Verify Legitimate Users
    console.log(`🟢 Verifying User 1...`);
    const identityHashUser1 = ethers.keccak256(ethers.toUtf8Bytes("User1's Passport + SSN"));
    await bankFraudDetection.connect(user1).verifyUserIdentity(identityHashUser1);
    console.log("✅ User 1 verified!\n");

    console.log(`🟢 Verifying User 2...`);
    const identityHashUser2 = ethers.keccak256(ethers.toUtf8Bytes("User2's Passport + SSN"));
    await bankFraudDetection.connect(user2).verifyUserIdentity(identityHashUser2);
    console.log("✅ User 2 verified!\n");

    // 🔹 Step 2: Fraud Case - Attempt Duplicate Identity Registration
    console.log(`🚨 Testing Fraud Case: Duplicate Identity Registration...`);
    try {
        await bankFraudDetection.connect(fraudster).verifyUserIdentity(identityHashUser1);
        console.log("❌ ERROR: Fraudulent identity registration was accepted!");
    } catch (error) {
        console.log("✅ Fraud detected! Duplicate identity was blocked!\n");
    }

    // 🔹 Step 3: Check Identity Verification
    console.log(`🔍 Checking identity verification...\n`);
    console.log(`🔹 Is User 1 verified? ${await bankFraudDetection.isIdentityVerified(identityHashUser1)}`);
    console.log(`🔹 Is User 2 verified? ${await bankFraudDetection.isIdentityVerified(identityHashUser2)}`);
    console.log(`🔹 Is Fraudster verified? ${await bankFraudDetection.isIdentityVerified(
        ethers.keccak256(ethers.toUtf8Bytes("Fake Identity"))
    )}\n`);

    // 🔹 Step 4: Prevent Unverified User from Transactions
    console.log(`🚨 Testing Fraud Case: Unverified User Trying to Send Money...`);
    try {
        await bankFraudDetection.connect(fraudster).storeTransaction(user1.address, ethers.parseEther("100"));
        console.log("❌ ERROR: Unverified user was allowed to send money!");
    } catch (error) {
        console.log("✅ Fraud detected! Unverified user was blocked from sending money!\n");
    }

    // 🔹 Step 5: Prevent Unverified User from Applying for Loan
    console.log(`🚨 Testing Fraud Case: Unverified User Trying to Apply for a Loan...`);
    try {
        await bankFraudDetection.connect(fraudster).submitLoanApplication(ethers.parseEther("5000"));
        console.log("❌ ERROR: Unverified user was allowed to apply for a loan!");
    } catch (error) {
        console.log("✅ Fraud detected! Unverified user was blocked from applying for a loan!\n");
    }

    console.log("🎯 All identity verification cases tested successfully!");
}

// Run the script
main().catch((error) => {
    console.error("❌ Error in testing:", error);
    process.exit(1);
});
