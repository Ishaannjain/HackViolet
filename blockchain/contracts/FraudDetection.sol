// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FraudDetection {
    mapping(bytes32 => bool) public transactionHashes;
    mapping(bytes32 => bool) public duplicateAttempt;

    event TransactionStored(bytes32 indexed hash);
    event DuplicateDetected(bytes32 indexed hash);

    // Returns true if the transaction is stored successfully,
    // and false if a duplicate was detected.
    function storeTransaction(bytes32 _txHash) public returns (bool) {
        if (transactionHashes[_txHash]) {
            duplicateAttempt[_txHash] = true;
            emit DuplicateDetected(_txHash);
            return false;  // Indicate that a duplicate was detected
        } else {
            transactionHashes[_txHash] = true;
            emit TransactionStored(_txHash);
            return true;
        }
    }

    // Returns true if a duplicate was attempted for this transaction hash
    function isTransactionFraudulent(bytes32 _txHash) public view returns (bool) {
        return duplicateAttempt[_txHash];
    }
}
