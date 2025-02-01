// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BankFraudDetection {
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
        bytes32 identityHash; // Link loan request to verified user
        uint256 loanAmount;
        bool isApproved;
    }

    mapping(bytes32 => Transaction) public transactions;
    mapping(address => User) public users;
    mapping(bytes32 => bool) public identityHashes; // Prevents duplicate identities
    mapping(bytes32 => LoanApplication) public loanApplications;

    event TransactionStored(bytes32 indexed txHash, address sender, address receiver, uint256 amount);
    event LoanApplicationSubmitted(bytes32 indexed appHash, bytes32 identityHash, uint256 loanAmount, bool isApproved);
    event IdentityVerified(address indexed user, bytes32 identityHash);
    event IdentityFraudAttempt(address indexed user, bytes32 attemptedIdentityHash);

    // ✅ Register & Verify User Identity (KYC)
    function verifyUserIdentity(bytes32 _identityHash) public {
        require(!identityHashes[_identityHash], " Identity already exists! Possible fraud detected.");

        users[msg.sender] = User(_identityHash, true);
        identityHashes[_identityHash] = true; // Store identity hash to prevent duplicates

        emit IdentityVerified(msg.sender, _identityHash);
    }

    // ✅ Check if an identity is already verified
    function isIdentityVerified(bytes32 _identityHash) public view returns (bool) {
        return identityHashes[_identityHash];
    }

    // ✅ Store & Verify Bank Transactions
    function storeTransaction(address _receiver, uint256 _amount) public {
        require(users[msg.sender].isVerified, " User is not verified!");

        bytes32 txHash = keccak256(abi.encodePacked(msg.sender, _receiver, _amount, block.timestamp));
        transactions[txHash] = Transaction(msg.sender, _receiver, _amount, block.timestamp, false);

        emit TransactionStored(txHash, msg.sender, _receiver, _amount);
    }

    // ✅ Check if a transaction is fraudulent
    function checkTransaction(bytes32 _txHash) public view returns (bool) {
        return transactions[_txHash].isFraudulent;
    }

    // ✅ Submit Loan Application
    function submitLoanApplication(uint256 _loanAmount) public {
        require(users[msg.sender].isVerified, " User is not verified!");

        bytes32 appHash = keccak256(abi.encodePacked(msg.sender, _loanAmount, block.timestamp));
        bytes32 identityHash = users[msg.sender].identityHash;

        loanApplications[appHash] = LoanApplication(identityHash, _loanAmount, false);
        emit LoanApplicationSubmitted(appHash, identityHash, _loanAmount, false);
    }

    // ✅ Approve or Reject Loan Application (Bank Admin Only)
    function approveLoan(bytes32 _appHash, bool _approval) public {
        loanApplications[_appHash].isApproved = _approval;
    }
}
