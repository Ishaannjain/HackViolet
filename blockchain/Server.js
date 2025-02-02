require("dotenv").config();
const express = require("express");
const fs = require("fs");
const { ethers } = require("ethers");
const axios = require("axios");

const app = express();
app.use(express.json());

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const signer = new ethers.Wallet(
  "df57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e",
  provider
);

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
  try {
    const txHash = ethers.keccak256(
      solidityPack(["address", "address", "uint256"], [signer.address, receiver, amount])
    );
    const exists = await contract.callStatic.transactionHashes(txHash);
    return exists;
  } catch (err) {
    console.log("🚨 [No Duplicate]");
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
    const isDuplicate = await checkIfTransactionExists(sender, receiver, amount);
    if (isDuplicate) {
      console.log("🚫 [BLOCKED] Duplicate transaction!");
      return res.json({ success: false, message: "🚨 Duplicate transaction!" });
    }

    const isFraud = await checkFraud(transactionData);
    if (isFraud) {
      console.log("🚫 [BLOCKED] Fraudulent transaction!");
      return res.json({ success: false, message: "🚨 Fraud detected! Transaction blocked." });
    }

    console.log("🔗 Storing on blockchain...");
    const tx = await contract.storeTransaction(receiver, amount);
    await tx.wait();
    console.log("✅ Transaction confirmed!");

    res.json({ success: true, message: "✅ Transaction stored on blockchain!" });
  } catch (err) {
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
