require("dotenv").config();
const express = require("express");
const fs = require("fs");
const { ethers } = require("ethers");
const axios = require("axios");

const app = express();
app.use(express.json());

// Connect to Hardhat Local Node
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const signer = new ethers.Wallet(
  "df57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e",
  provider
);

// Replace with your freshly deployed contract address
const contractData = JSON.parse(fs.readFileSync("contract-address.json"));
const contractAddress = contractData.contractAddress
const contractJSON = require("./artifacts/contracts/BankAndCryptoFraudDetection.sol/BankAndCryptoFraudDetection.json");
const contractABI = contractJSON.abi;
const contract = new ethers.Contract(contractAddress, contractABI, signer);

/* -------------------------------------------------------------------------- */
/*                         Helper: solidityPack (v6)                          */
/* -------------------------------------------------------------------------- */
function solidityPack(types, values) {
  let packed = "0x";
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    let val = values[i];

    if (type === "address") {
      val = val.toLowerCase().replace(/^0x/, "");
      if (val.length !== 40) {
        throw new Error(`Invalid address length: ${val}`);
      }
      packed += val;
    } else if (type === "uint256") {
      let hex;
      if (typeof val === "string") {
        // Convert string to bigint
        val = BigInt(val);
      }
      hex = val.toString(16).padStart(64, "0");
      packed += hex;
    } else {
      throw new Error(`Unsupported type: ${type}`);
    }
  }
  return packed;
}

/* -------------------------------------------------------------------------- */
/*                      Helper: AI Fraud Check (Axios)                        */
/* -------------------------------------------------------------------------- */
async function checkFraud(transactionData) {
  try {
    console.log("🔍 Checking with AI model...");
    const aiResponse = await axios.post("http://127.0.0.1:5000/predict", { transactionData });
    const isFraud = aiResponse.data.fraudulent;
    console.log(isFraud ? "🚨 [AI] Fraud detected!" : "✅ [AI] Transaction safe.");
    return isFraud;
  } catch (err) {
    console.log("🚨 [AI Error] Assuming safe due to AI failure:", err.message);
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*               Helper: Check If Transaction Already Exists                 */
/* -------------------------------------------------------------------------- */
async function checkIfTransactionExists(sender, receiver, amount) {
  // The contract expects (msg.sender, _receiver, _amount)
  // We use signer.address as `msg.sender`
  try {
    const txHash = ethers.keccak256(
      solidityPack(["address", "address", "uint256"], [signer.address, receiver, amount])
    );
    const exists = await contract.callStatic.transactionHashes(txHash);
    return exists;
  } catch (err) {
    // If the call fails (mismatch ABI?), assume false to not block
    console.log("🚨 [No Duplicates]");
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*               POST /storeTransaction: Main Transaction API                */
/* -------------------------------------------------------------------------- */
app.post("/storeTransaction", async (req, res) => {
  const { sender, receiver, amount, transactionData } = req.body;
  console.log(`\n📩 Incoming transaction: sender=${sender}, receiver=${receiver}, amount=${amount}`);

  try {
    // 1. Duplicate check
    const isDuplicate = await checkIfTransactionExists(sender, receiver, amount);
    if (isDuplicate) {
      console.log("🚫 [BLOCKED] Duplicate transaction!");
      return res.json({ success: false, message: "🚨 Duplicate transaction!" });
    }

    // 2. AI fraud check
    const isFraud = await checkFraud(transactionData);
    if (isFraud) {
      console.log("🚫 [BLOCKED] Fraudulent transaction!");
      return res.json({ success: false, message: "🚨 Fraud detected! Transaction blocked." });
    }

    // 3. If safe, store on-chain
    console.log("🔗 Storing on blockchain...");
    const tx = await contract.storeTransaction(receiver, amount);
    await tx.wait();
    console.log("✅ Transaction confirmed!");

    res.json({ success: true, message: "✅ Transaction stored on blockchain!" });
  } catch (err) {
    // If revert reason = "Duplicate transaction detected!", we catch it here
    console.log("🚨 [TX Error]", err.reason || err.message);
    res.json({ success: false, message: err.reason || "Error processing transaction" });
  }
});

/* -------------------------------------------------------------------------- */
/*                              Start the Server                              */
/* -------------------------------------------------------------------------- */
app.listen(3000, () => {
  console.log("🚀 Backend API running on port 3000");
});
