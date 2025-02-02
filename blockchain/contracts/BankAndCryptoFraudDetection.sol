// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BankAndCryptoFraudDetection {
    // ------------------------  STRUCTS  ------------------------
    struct Transaction {
        address sender;
        address receiver;
        uint256 amount;
        uint256 timestamp;
        bool isFraudulent;
    }

    struct User {
        bytes32 identityHash; // Stores hashed KYC data
        bool isVerified;
    }

    struct LoanApplication {
        bytes32 identityHash; // Link loan request to verified user (not used now)
        uint256 loanAmount;
        bool isApproved;
    }

    // --------------------  MAPPINGS (DATA STORAGE)  --------------------
    mapping(bytes32 => Transaction) public transactions; // Track transactions
    mapping(address => User) public users;                 // KYC-verified users (no longer used)
    mapping(bytes32 => bool) public identityHashes;        // Prevent duplicate identities (not used)
    mapping(bytes32 => LoanApplication) public loanApplications; // Track loans
    mapping(bytes32 => bool) public transactionHashes;     // Store transaction hashes
    mapping(bytes32 => bool) public duplicateAttempt;      // Track duplicate transactions
    mapping(address => bool) public hasActiveLoanApplication; // Prevent duplicate loan applications

    // -----------------------  EVENTS  -----------------------
    event IdentityVerified(address indexed user, bytes32 identityHash);
    event IdentityFraudAttempt(address indexed user, bytes32 attemptedIdentityHash);
    event TransactionStored(bytes32 indexed txHash, address sender, address receiver, uint256 amount);
    event DuplicateTransactionDetected(bytes32 indexed txHash);
    event LoanApplicationSubmitted(bytes32 indexed appHash, bytes32 identityHash, uint256 loanAmount, bool isApproved);
    event LoanApproved(bytes32 indexed appHash, bool isApproved);

    // -----------------------  BANK/CRYPTO TRANSACTIONS  -----------------------

    // Store Transaction with Duplicate Detection  
    // (Compute the hash from sender, receiver, and amount so that duplicate calls are caught)
    function storeTransaction(address _receiver, uint256 _amount) public {
        // Removed user verification requirement.
        bytes32 txHash = keccak256(abi.encodePacked(msg.sender, _receiver, _amount));
        require(!transactionHashes[txHash], "Duplicate transaction detected!");
        
        transactionHashes[txHash] = true;
        transactions[txHash] = Transaction(msg.sender, _receiver, _amount, block.timestamp, false);

        emit TransactionStored(txHash, msg.sender, _receiver, _amount);
    }

    // (This view function is provided for completeness.)
    function checkTransaction(bytes32 _txHash) public view returns (bool) {
        return transactions[_txHash].isFraudulent;
    }

    // -----------------------  CRYPTO TRANSACTIONS (Double Spending Prevention)  -----------------------

    // Alternative method for crypto transactions if you want the caller to supply a hash.
    function storeCryptoTransaction(bytes32 _txHash) public returns (bool) {
        if (transactionHashes[_txHash]) {
            duplicateAttempt[_txHash] = true;
            emit DuplicateTransactionDetected(_txHash);
            return false;  // Fraud detected – duplicate transaction
        } else {
            transactionHashes[_txHash] = true;
            emit TransactionStored(_txHash, msg.sender, address(0), 0); // Mark transaction
            return true;
        }
    }

    function isCryptoTransactionFraudulent(bytes32 _txHash) public view returns (bool) {
        return duplicateAttempt[_txHash];
    }

    // -----------------------  LOAN SYSTEM (Bank Loans & Credit Fraud Prevention)  -----------------------

    // Submit Loan Application  
    // (Compute the application hash deterministically using sender and loan amount and record that a user has an active application)
    function submitLoanApplication(uint256 _loanAmount) public {
        // Removed user verification requirement.
        require(!hasActiveLoanApplication[msg.sender], "Duplicate loan application detected!");

        bytes32 appHash = keccak256(abi.encodePacked(msg.sender, _loanAmount));
        // Since user verification is removed, we use a default identity hash (zero value)
        bytes32 identityHash = bytes32(0);

        loanApplications[appHash] = LoanApplication(identityHash, _loanAmount, false);
        hasActiveLoanApplication[msg.sender] = true;
        emit LoanApplicationSubmitted(appHash, identityHash, _loanAmount, false);
    }

    // Approve or Reject Loan Application (Bank Admin Only)
    function approveLoan(bytes32 _appHash, bool _approval) public {
        require(loanApplications[_appHash].identityHash != 0, "Loan application does not exist!");
        loanApplications[_appHash].isApproved = _approval;
        emit LoanApproved(_appHash, _approval);
    }
}
