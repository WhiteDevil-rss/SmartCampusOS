// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartCampusFinance
 * @dev Tracks student fee payments and institutional payroll milestones.
 */
contract SmartCampusFinance is Ownable {
    struct FeeReceipt {
        string studentEnrollment;
        string feeType; // e.g., "TUITION", "LIBRARY", "HOSTEL"
        uint256 amount;
        string transactionId; // Reference to off-chain transaction
        uint256 timestamp;
    }

    struct PayrollRecord {
        string employeeId;
        string monthYear; // e.g., "03-2025"
        uint256 amount;
        string status; // e.g., "DISBURSED"
        uint256 timestamp;
    }

    // studentEnrollment => FeeReceipt[]
    mapping(string => FeeReceipt[]) public feeHistory;
    
    // employeeId => monthYear => PayrollRecord
    mapping(string => mapping(string => PayrollRecord)) public payrollHistory;

    event FeePaymentRecorded(string indexed studentEnrollment, string feeType, uint256 amount, string transactionId);
    event PayrollDisbursed(string indexed employeeId, string monthYear, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function recordFeePayment(
        string memory _studentEnrollment,
        string memory _feeType,
        uint256 _amount,
        string memory _transactionId
    ) public onlyOwner {
        feeHistory[_studentEnrollment].push(FeeReceipt({
            studentEnrollment: _studentEnrollment,
            feeType: _feeType,
            amount: _amount,
            transactionId: _transactionId,
            timestamp: block.timestamp
        }));
        emit FeePaymentRecorded(_studentEnrollment, _feeType, _amount, _transactionId);
    }

    function recordPayroll(
        string memory _employeeId,
        string memory _monthYear,
        uint256 _amount
    ) public onlyOwner {
        payrollHistory[_employeeId][_monthYear] = PayrollRecord({
            employeeId: _employeeId,
            monthYear: _monthYear,
            amount: _amount,
            status: "DISBURSED",
            timestamp: block.timestamp
        });
        emit PayrollDisbursed(_employeeId, _monthYear, _amount);
    }

    function getFeeHistoryCount(string memory _studentEnrollment) public view returns (uint256) {
        return feeHistory[_studentEnrollment].length;
    }

    function getFeeReceipt(string memory _studentEnrollment, uint256 _index) 
        public view returns (string memory, uint256, string memory, uint256) 
    {
        FeeReceipt memory receipt = feeHistory[_studentEnrollment][_index];
        return (receipt.feeType, receipt.amount, receipt.transactionId, receipt.timestamp);
    }
}
