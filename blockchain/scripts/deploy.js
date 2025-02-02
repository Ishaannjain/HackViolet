const fs = require("fs");
const hre = require("hardhat");

async function main() {
  const BankAndCryptoFraudDetection = await hre.ethers.getContractFactory("BankAndCryptoFraudDetection");
  const contract = await BankAndCryptoFraudDetection.deploy();

  // Wait for the deployment to finish using waitForDeployment()
  await contract.waitForDeployment();
  console.log("🚀 Contract deployed at:", contract.target);

  // Write contract address to file
  fs.writeFileSync("contract-address.json", JSON.stringify({ contractAddress: contract.target }, null, 2));
  console.log("✅ Saved contract address to contract-address.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
