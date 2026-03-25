// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartCampusLibrary
 * @dev Records book loans and returns for tampering-proof fine management.
 */
contract SmartCampusLibrary is Ownable {
    
    struct LoanRecord {
        string loanId;
        string isbn;
        string enrollmentNo;
        uint256 issuedAt;
        uint256 returnedAt;
        uint256 fineAmount;
        bool isReturned;
    }

    mapping(string => LoanRecord) public loans;
    
    event BookIssued(string indexed loanId, string isbn, string enrollmentNo);
    event BookReturned(string indexed loanId, uint256 fineAmount, uint256 timestamp);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Record a book issue.
     */
    function recordLoan(string calldata loanId, string calldata isbn, string calldata enrollmentNo) external onlyOwner {
        require(loans[loanId].issuedAt == 0, "Loan already exists");

        loans[loanId] = LoanRecord({
            loanId: loanId,
            isbn: isbn,
            enrollmentNo: enrollmentNo,
            issuedAt: block.timestamp,
            returnedAt: 0,
            fineAmount: 0,
            isReturned: false
        });

        emit BookIssued(loanId, isbn, enrollmentNo);
    }

    /**
     * @dev Record a book return with optional fine.
     */
    function recordReturn(string calldata loanId, uint256 fineAmount) external onlyOwner {
        require(loans[loanId].issuedAt > 0, "Loan does not exist");
        require(!loans[loanId].isReturned, "Book already returned");

        LoanRecord storage record = loans[loanId];
        record.returnedAt = block.timestamp;
        record.fineAmount = fineAmount;
        record.isReturned = true;

        emit BookReturned(loanId, fineAmount, block.timestamp);
    }
}
