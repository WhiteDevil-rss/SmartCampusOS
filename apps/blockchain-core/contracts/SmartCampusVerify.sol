// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SmartCampusVerify is Ownable {
    
    struct StudentRecord {
        bytes32 resultHash;
        string admissionStatus;
        uint256 lastUpdated;
    }

    // Mapping from Enrollment Number to student records
    mapping(string => StudentRecord) private records;

    // Events for real-time tracking
    event ResultPublished(string indexed enrollmentNo, bytes32 resultHash, uint256 timestamp);
    event StatusUpdated(string indexed enrollmentNo, string status, uint256 timestamp);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Publish or update a student's result hash.
     * @param enrollmentNo The unique identifier for the student.
     * @param resultHash The SHA-256 hash of the student's results.
     */
    function publishResult(string calldata enrollmentNo, bytes32 resultHash) external onlyOwner {
        records[enrollmentNo].resultHash = resultHash;
        records[enrollmentNo].lastUpdated = block.timestamp;
        
        emit ResultPublished(enrollmentNo, resultHash, block.timestamp);
    }

    /**
     * @dev Update the admission status for a student.
     * @param enrollmentNo The unique identifier for the student.
     * @param status The current status (e.g., "ADMITTED", "PENDING", "REJECTED").
     */
    function updateApplicationStatus(string calldata enrollmentNo, string calldata status) external onlyOwner {
        records[enrollmentNo].admissionStatus = status;
        records[enrollmentNo].lastUpdated = block.timestamp;
        
        emit StatusUpdated(enrollmentNo, status, block.timestamp);
    }

    /**
     * @dev Verify if a given result hash matches the immutable record.
     * @param enrollmentNo The student's enrollment number.
     * @param resultHash The hash to verify.
     */
    function verifyResult(string calldata enrollmentNo, bytes32 resultHash) external view returns (bool) {
        return records[enrollmentNo].resultHash == resultHash && resultHash != bytes32(0);
    }

    /**
     * @dev Retrieve the current admission status for a student.
     */
    function getApplicationStatus(string calldata enrollmentNo) external view returns (string memory) {
        return records[enrollmentNo].admissionStatus;
    }

    /**
     * @dev Get the full record for a student.
     */
    function getStudentRecord(string calldata enrollmentNo) external view returns (bytes32, string memory, uint256) {
        StudentRecord memory record = records[enrollmentNo];
        return (record.resultHash, record.admissionStatus, record.lastUpdated);
    }
}
