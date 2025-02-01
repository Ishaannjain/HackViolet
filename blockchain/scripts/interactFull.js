const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    // Replace with deployed contract address
    const contractAddress = "YOUR_CONTRACT_ADDRESS";

    // Get signers (bank admin + users + fraudster)
    const [bankAdmin, user1, user2, fraudster] = await ethers.getSigners();

    // Attach contract with signer
    const bankFraudDetection = (await ethers.getContractFactory("BankFraudDetection"))
        .attach(contractAddress)
        .connect(bankAdmin);

    console.log(`✅ Interacting with BankFraudDetection at: ${contractAddress}`);

    // 🔹 Step 1: Verify Legitimate Users (KYC)
    console.log(`🟢 Verifying User 1...`);
    const identityHashUser1 = ethers.keccak256(ethers.toUtf8Bytes("User1's Passport + SSN"));
    await bankFraudDetection.connect(user1).verifyUserIdentity(identityHashUser1);
    console.log("✅ User 1 verified!\n");

    console.log(`🟢 Verifying User 2...`);
    const identityHashUser2 = ethers.keccak256(ethers.toUtf8Bytes("User2's Passport + SSN"));
    await bankFraudDetection.connect(user2).verifyUserIdentity(identityHashUser2);
    console.log("✅ User 2 verified!\n");

    // 🔹 Step 2: Fraud Case - Duplicate Identity Registration
    console.log(`🚨 Testing Fraud Case: Duplicate Identity Registration...`);
    try {
        await bankFraudDetection.connect(fraudster).verifyUserIdentity(identityHashUser1);
        console.log("❌ ERROR: Fraudulent identity registration was accepted!");
    } catch (error) {
        console.log("✅ Fraud detected! Duplicate identity was blocked!\n");
    }

    // 🔹 Step 3: Checking Identity Verification Status
    console.log(`🔍 Checking identity verification...\n`);
    console.log(`🔹 Is User 1 verified? ${await bankFraudDetection.isIdentityVerified(identityHashUser1)}`);
    console.log(`🔹 Is User 2 verified? ${await bankFraudDetection.isIdentityVerified(identityHashUser2)}`);
    console.log(`🔹 Is Fraudster verified? ${await bankFraudDetection.isIdentityVerified(
        ethers.keccak256(ethers.toUtf8Bytes("Fake Identity"))
    )}\n`);

    // 🔹 Step 4: Store Crypto Transactions (Legitimate Transactions)
    console.log(`🟢 Storing legitimate crypto transactions...`);
    await bankFraudDetection.connect(user1).storeTransaction(user2.address, ethers.parseEther("1.5"));
    await bankFraudDetection.connect(user2).storeTransaction(user1.address, ethers.parseEther("2.0"));
    console.log("✅ Crypto transactions stored successfully!\n");

    // 🔹 Step 5: Fraud Case - Double Spending (Same Transaction Twice)
    console.log(`🚨 Testing Fraud Case: Double Spending...`);
    try {
        await bankFraudDetection.connect(user1).storeTransaction(user2.address, ethers.parseEther("1.5"));
        console.log("❌ ERROR: Fraudulent transaction was accepted!");
    } catch (error) {
        console.log("✅ Fraud detected! Double-spending was blocked!\n");
    }

    // 🔹 Step 6: Fraud Case - Unverified User Sending Crypto
    console.log(`🚨 Testing Fraud Case: Unverified User Trying to Send Crypto...`);
    try {
        await bankFraudDetection.connect(fraudster).storeTransaction(user1.address, ethers.parseEther("0.5"));
        console.log("❌ ERROR: Unverified user was allowed to send crypto!");
    } catch (error) {
        console.log("✅ Fraud detected! Unverified user was blocked from sending crypto!\n");
    }

    // 🔹 Step 7: Loan Applications
    console.log(`🟢 User 1 Applying for a Loan...`);
    await bankFraudDetection.connect(user1).submitLoanApplication(ethers.parseEther("5000"));
    console.log("✅ User 1 loan application submitted!\n");

    console.log(`🟢 User 2 Applying for a Loan...`);
    await bankFraudDetection.connect(user2).submitLoanApplication(ethers.parseEther("10000"));
    console.log("✅ User 2 loan application submitted!\n");

    // 🔹 Step 8: Fraud Case - Multiple Loan Applications from Same User
    console.log(`🚨 Testing Fraud Case: Multiple Loan Applications from Same User...`);
    try {
        await bankFraudDetection.connect(user1).submitLoanApplication(ethers.parseEther("5000"));
        console.log("❌ ERROR: Duplicate loan application was accepted!");
    } catch (error) {
        console.log("✅ Fraud detected! Duplicate loan application was blocked!\n");
    }

    // 🔹 Step 9: Fraud Case - Loan Application Without KYC
    console.log(`🚨 Testing Fraud Case: Loan Application Without KYC...`);
    try {
        await bankFraudDetection.connect(fraudster).submitLoanApplication(ethers.parseEther("10000"));
        console.log("❌ ERROR: Fraudster's loan application was accepted!");
    } catch (error) {
        console.log("✅ Fraud detected! Unverified user was blocked from applying for a loan!\n");
    }

    // 🔹 Step 10: Approving/Rejecting Loans
    console.log(`🔹 Bank Admin approving User 1's loan...`);
    const appHash1 = ethers.keccak256(ethers.toUtf8Bytes("User1's Loan"));
    await bankFraudDetection.approveLoan(appHash1, true);
    console.log("✅ User 1's loan approved!\n");

    console.log(`🔹 Bank Admin rejecting User 2's loan...`);
    const appHash2 = ethers.keccak256(ethers.toUtf8Bytes("User2's Loan"));
    await bankFraudDetection.approveLoan(appHash2, false);
    console.log("✅ User 2's loan rejected!\n");

    console.log("🎯 All test cases completed successfully!");
}

// Run the script
main().catch((error) => {
    console.error("❌ Error in testing:", error);
    process.exit(1);
});
